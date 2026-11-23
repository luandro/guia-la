#!/usr/bin/env node
// Accessibility check (phase 03, task 8): run axe over every story in the
// built web Storybook and fail on any serious or critical violation.
//
// Failure class it catches: "a primitive ships an accessibility barrier" —
// a control with no accessible name, a contrast failure below the WCAG AA
// floor the phase pins, a focus order that traps or skips, an image without
// a label. The same react-native-web DOM a reviewer sees in the Storybook
// URL is what axe reads here, headlessly, so a regression is caught in CI
// (proposed: a `pnpm a11y` step after `pnpm storybook:build`) instead of by
// a human noticing on a phone.
//
// How it works:
//   1. serves apps/storybook/dist with a tiny static file server (no deps);
//   2. launches the installed Chromium (Playwright), no browser download —
//      uses the binary in the Playwright cache via PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
//      or the first chromium-* build it finds under ~/.cache/ms-playwright;
//   3. loads each story's iframe (index.json -> /iframe.html?id=<storyId>),
//      waits for the canvas, and runs @axe-core/playwright;
//   4. reports every serious/critical violation as <storyId>: <rule>
//      (<nodes> node(s)) — <help>, and exits 1 if any exist.
//
// Usage: a11y-check.mjs [--storybook <dir>] [--grep <regex>]
//   --storybook  built Storybook dir (default apps/storybook/dist)
//   --grep       only run story ids matching this regex (e.g. a planted
//                violation's story, for the red/green demonstration)
//
// The planted-violation demonstration (phase-03.md deliberate failure):
// temporarily add a <img> without alt to a story, run with --grep, see the
// "image-alt" serious violation fail, then revert.

import { createServer } from "node:http";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");

const SERIOUS_IMPACT = new Set(["serious", "critical"]);

function argValue(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && i + 1 < process.argv.length
    ? process.argv[i + 1]
    : fallback;
}

const storybookDir = resolve(
  repoRoot,
  argValue("--storybook", "apps/storybook/dist"),
);
const grepArg = argValue("--grep", null);
const grep = grepArg ? new RegExp(grepArg) : null;

// --- static file server ---------------------------------------------------
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ico": "image/x-icon",
};

function startServer(root) {
  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
    let filePath = join(root, urlPath === "/" ? "index.html" : urlPath);
    if (!filePath.startsWith(root)) {
      res.writeHead(403).end("forbidden");
      return;
    }
    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      filePath = join(filePath, "index.html");
    }
    if (!existsSync(filePath)) {
      res.writeHead(404).end("not found");
      return;
    }
    res.setHeader(
      "Content-Type",
      MIME[extname(filePath)] ?? "application/octet-stream",
    );
    res.end(readFileSync(filePath));
  });
  return new Promise((resolvePromise) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolvePromise({ server, port });
    });
  });
}

// --- chromium discovery (no download) -------------------------------------
function findChromium() {
  const explicit = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  if (explicit && existsSync(explicit)) return explicit;

  const cache = join(homedir(), ".cache", "ms-playwright");
  if (!existsSync(cache)) return undefined;
  const builds = readdirSync(cache)
    .filter((name) => /^chromium-\d+$/.test(name))
    .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
  for (const build of builds) {
    for (const rel of ["chrome-linux64/chrome", "chrome-linux/chrome"]) {
      const candidate = join(cache, build, rel);
      if (existsSync(candidate)) return candidate;
    }
  }
  return undefined;
}

// --- story enumeration ----------------------------------------------------
function storyIds(storybookDir) {
  const indexPath = join(storybookDir, "index.json");
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  return Object.values(index.entries)
    .filter((entry) => entry.type === "story")
    .map((entry) => entry.id);
}

async function run() {
  if (!existsSync(join(storybookDir, "index.json"))) {
    console.error(
      `a11y: FAIL — no built Storybook at ${storybookDir} (run pnpm storybook:build first)`,
    );
    process.exit(2);
  }

  const executablePath = findChromium();
  const ids = storyIds(storybookDir).filter((id) => !grep || grep.test(id));
  if (ids.length === 0) {
    console.error(
      `a11y: FAIL — no stories matched${grepArg ? ` /${grepArg}/` : ""}`,
    );
    process.exit(2);
  }

  const { server, port } = await startServer(storybookDir);
  const origin = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({
    ...(executablePath ? { executablePath } : {}),
    headless: true,
    args: ["--no-sandbox"],
  });

  const findings = [];
  let scanned = 0;
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();
    for (const id of ids) {
      const url = `${origin}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`;
      await page.goto(url, { waitUntil: "networkidle" });
      // Give react-native-web + storybook a moment to paint the canvas.
      await page
        .waitForSelector("#storybook-root", { timeout: 15000 })
        .catch(() => {});
      await page.waitForTimeout(350);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      scanned += 1;
      for (const violation of results.violations) {
        if (!SERIOUS_IMPACT.has(violation.impact)) continue;
        findings.push({ id, violation });
      }
    }
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }

  if (findings.length > 0) {
    console.error(
      `a11y: FAIL — ${findings.length} serious/critical violation(s) across ${scanned} stor${scanned === 1 ? "y" : "ies"}:`,
    );
    for (const { id, violation } of findings) {
      console.error(
        `  ${id}: [${violation.impact}] ${violation.id} (${violation.nodes.length} node(s)) — ${violation.help}`,
      );
      for (const node of violation.nodes.slice(0, 3)) {
        console.error(`      ${node.target.join(" ")}`);
      }
    }
    process.exit(1);
  }

  console.log(
    `a11y: OK — 0 serious/critical violations across ${scanned} stor${scanned === 1 ? "y" : "ies"} (axe wcag2a/2aa/21a/21aa)`,
  );
}

run().catch((error) => {
  console.error("a11y: ERROR —", error?.stack ?? error);
  process.exit(2);
});
