import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { escapesRoot, isPathInside } from "./static-server-path.mjs";

/**
 * Static-server path containment (PR #20 review, a11y-check.mjs:81). The
 * check was `filePath.startsWith(root)`, so `/../dist-other/x` resolved to
 * `<root>-other/x` and was served — a sibling path escaped. Comparing
 * against the root boundary (path.relative / root + sep) contains it.
 */

describe("isPathInside", () => {
  it("accepts the root itself and paths under it", () => {
    expect(isPathInside("/srv/dist", "/srv/dist")).toBe(true);
    expect(isPathInside("/srv/dist", "/srv/dist/iframe.html")).toBe(true);
    expect(isPathInside("/srv/dist", "/srv/dist/assets/a.js")).toBe(true);
  });

  it("rejects a sibling whose name shares the root's prefix", () => {
    // The exact bug: startsWith("/srv/dist") is true for "/srv/dist-other".
    expect(isPathInside("/srv/dist", "/srv/dist-other")).toBe(false);
    expect(isPathInside("/srv/dist", "/srv/dist-other/x")).toBe(false);
  });

  it("rejects paths that climb out with ..", () => {
    expect(isPathInside("/srv/dist", "/srv/secret")).toBe(false);
    expect(isPathInside("/srv/dist", "/etc/passwd")).toBe(false);
  });

  it("accepts a file whose name merely starts with dots inside the root", () => {
    // Only `..` + a separator climbs out; `..foo` is an ordinary name.
    expect(isPathInside("/srv/dist", "/srv/dist/..foo")).toBe(true);
  });
});

describe("escapesRoot", () => {
  it("is true for a resolved sibling path and false inside the root", () => {
    const root = "/srv/apps/storybook/dist";
    expect(escapesRoot(root, join(root, "..", "dist-other", "x"))).toBe(true);
    expect(escapesRoot(root, join(root, "iframe.html"))).toBe(false);
  });

  it("holds against a real temp directory (path shapes are real)", () => {
    const base = mkdtempSync(join(tmpdir(), "a11y-path-"));
    const root = join(base, "dist");
    const sibling = join(base, "dist-other");
    mkdirSync(root, { recursive: true });
    mkdirSync(sibling, { recursive: true });
    writeFileSync(join(sibling, "x.txt"), "secret");
    try {
      expect(escapesRoot(root, join(sibling, "x.txt"))).toBe(true);
      expect(escapesRoot(root, join(root, "iframe.html"))).toBe(false);
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });
});
