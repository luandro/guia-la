#!/usr/bin/env python3
"""Validate the generated planning HTML pages.

Checks: parses with html.parser, relative href/src targets exist, no
remote script/link/img, and each phase page carries the required H2s.
Run from repo root: python3 -I planning/tools/check.py
"""
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "planning"

REQUIRED_H2S = [
    "Phase identity", "Why this stage exists", "Inputs and source references",
    "Task breakdown", "Architecture choices and guardrails", "Deliverables",
    "Visual and functional QA", "Automated verification", "Acceptance gate",
    "Risks, rollback and handoff", "Next phase handoff",
    "Agent execution prompt",
]


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.h2s = []
        self.links = []      # (kind, value) where kind in href/src
        self.remote = []     # remote script/link/img references
        self._in_h2 = False
        self._h2_text = []

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "h2":
            self._in_h2 = True
            self._h2_text = []
        elif tag in ("script", "link", "img"):
            url = d.get("src") or d.get("href") or ""
            if url.startswith(("http://", "https://", "//")):
                self.remote.append("<%s %s>" % (tag, url))
        for key in ("href", "src"):
            if key in d and d[key]:
                self.links.append((key, d[key]))

    def handle_endtag(self, tag):
        if tag == "h2" and self._in_h2:
            self.h2s.append("".join(self._h2_text).strip())
            self._in_h2 = False

    def handle_data(self, data):
        if self._in_h2:
            self._h2_text.append(data)


def check_file(path, problems):
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as exc:
        problems.append("%s: unreadable (%s)" % (path.relative_to(ROOT), exc))
        return None
    parser = PageParser()
    try:
        parser.feed(text)
        parser.close()
    except Exception as exc:  # html.parser raises on malformed input
        problems.append("%s: html.parser error: %s" % (path.relative_to(ROOT), exc))
        return None

    for tag_url in parser.remote:
        problems.append("%s: remote reference %s" % (path.relative_to(ROOT), tag_url))

    for kind, url in parser.links:
        target = url.split("#", 1)[0]
        if not target or target.startswith(("http://", "https://", "mailto:", "data:", "//")):
            continue
        resolved = (path.parent / target).resolve()
        if not resolved.exists():
            problems.append("%s: broken %s=%s (resolved %s does not exist)"
                            % (path.relative_to(ROOT), kind, url, resolved))
    return parser


def main():
    problems = []
    files = []
    index = OUT / "index.html"
    phases_dir = OUT / "phases"
    if index.exists():
        files.append(index)
    else:
        problems.append("missing %s — run build.py first" % index.relative_to(ROOT))
    if phases_dir.is_dir():
        files.extend(sorted(phases_dir.glob("*.html")))
    else:
        problems.append("missing %s/ — run build.py first" % phases_dir.relative_to(ROOT))

    phase_pages = 0
    for path in files:
        parser = check_file(path, problems)
        if parser is None:
            continue
        if path.parent == phases_dir:
            phase_pages += 1
            for h2 in REQUIRED_H2S:
                if h2 not in parser.h2s:
                    problems.append("%s: missing required H2 %r" % (path.relative_to(ROOT), h2))

    if phase_pages == 0:
        problems.append("no phase pages found under planning/phases/")

    if problems:
        print("CHECK FAILED (%d problem(s)):" % len(problems))
        for p in problems:
            print("  - %s" % p)
        return 1
    print("OK: %d file(s) validated (%d phase page(s)), no problems."
          % (len(files), phase_pages))
    return 0


if __name__ == "__main__":
    sys.exit(main())
