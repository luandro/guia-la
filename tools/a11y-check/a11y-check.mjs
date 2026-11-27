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

import { withAxeBusyRetry } from "./axe-busy-retry.mjs";
import { escapesRoot } from "./static-server-path.mjs";
import { storyRenderFailure } from "./story-render.mjs";

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
    // Containment against a real path boundary, not a string prefix: a
    // sibling such as <root>-other/x starts with the same characters as
    // <root> and used to be served (PR #20 review).
    if (escapesRoot(root, filePath)) {
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
      // A page error is an uncaught exception in the story itself — the
      // story failed to render, so it must fail the gate rather than be
      // scanned as an empty, violation-free canvas (PR #20 review).
      const pageErrors = [];
      const onError = (error) => pageErrors.push(String(error));
      page.on("pageerror", onError);
      await page.goto(url, { waitUntil: "networkidle" });
      // Wait for the *story content*, not the iframe.html shell element:
      // #storybook-root exists in the shell before anything renders, so the
      // old wait proved nothing. Poll until the decorator wrapper inside the
      // root has a child (the story's own root view) or the timeout elapses;
      // a story that never renders leaves the wrapper empty and fails below.
      await page
        .waitForFunction(
          () => {
            const root = document.getElementById("storybook-root");
            const wrapper = root?.firstElementChild;
            return (
              wrapper !== null &&
              wrapper !== undefined &&
              wrapper.childElementCount > 0
            );
          },
          // waitForFunction(fn, arg, options): the options go third, or
          // the timeout is taken as the page-function argument and ignored
          // (codex review on #20).
          undefined,
          { timeout: 15000 },
        )
        .catch(() => {});
      const state = await page.evaluate(() => {
        const root = document.getElementById("storybook-root");
        return {
          documentClasses: document.documentElement.className,
          bodyClasses: document.body.className,
          root: root
            ? {
                firstChildElementCount:
                  root.firstElementChild?.childElementCount ?? 0,
              }
            : null,
        };
      });
      page.off("pageerror", onError);
      // storyRenderFailure covers every failure shape: a page error, Storybook's
      // error display, and an empty root (a story that never rendered, or one
      // that rendered nothing within the wait above — either way the root is
      // empty when this runs).
      const failure = storyRenderFailure({
        pageErrors,
        documentClasses: state.documentClasses,
        bodyClasses: state.bodyClasses,
        root: state.root,
      });
      if (failure) {
        // A story that failed to render is a failure, not a clean scan.
        findings.push({ id, renderFailure: failure, violation: null });
        continue;
      }
      // The a11y addon may still be running its own axe pass on this render;
      // retry only on axe's "already running" error (axe-busy-retry.mjs).
      const results = await withAxeBusyRetry(() =>
        new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze(),
      );
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

  const renderFailures = findings.filter(
    (finding) => finding.violation === null,
  );
  const violations = findings.filter((finding) => finding.violation !== null);
  if (findings.length > 0) {
    console.error(
      `a11y: FAIL — ${findings.length} problem(s) across ${ids.length} stor${ids.length === 1 ? "y" : "ies"} (${renderFailures.length} render failure(s), ${violations.length} serious/critical violation(s)):`,
    );
    for (const { id, renderFailure, violation } of findings) {
      if (renderFailure) {
        console.error(`  ${id}: [render] ${renderFailure}`);
        continue;
      }
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
    `a11y: OK — 0 serious/critical violations and 0 render failures across ${scanned} stor${scanned === 1 ? "y" : "ies"} (axe wcag2a/2aa/21a/21aa)`,
  );
}

run().catch((error) => {
  console.error("a11y: ERROR —", error?.stack ?? error);
  process.exit(2);
});
