#!/usr/bin/env python3
"""Dependency-free generator for the guia.la planning packet.

Reads Markdown sources under planning/ and writes self-contained HTML
playbooks under planning/. Python 3 stdlib only; run from repo root:

    python3 -I planning/tools/build.py
"""
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "planning" / "src"
PROMPTS = ROOT / "planning" / "prompts"
OUT = ROOT / "planning"

PHASE_IDS = ["%02d" % n for n in range(11)]  # 00..10

REQUIRED_H2S = [
    "Phase identity", "Why this stage exists", "Inputs and source references",
    "Task breakdown", "Architecture choices and guardrails", "Deliverables",
    "Visual and functional QA", "Automated verification", "Acceptance gate",
    "Risks, rollback and handoff", "Next phase handoff",
    "Agent execution prompt",
]

CSS = """
:root { --bg:#f7f5ef; --paper:#fffefa; --ink:#172d2a; --ink2:#38534d; --mute:#5a6e66;
  --sea:#155c60; --deep:#0c3438; --lime:#d3f08e; --lime-dark:#82b83c; --sand:#e9e4d8;
  --line:#d9ddd3; --warm:#a5532f; --white:#ffffff;
  --font:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  --mono:ui-monospace,SFMono-Regular,Consolas,"Liberation Mono",monospace; }
* { box-sizing:border-box; }
body { margin:0; background:var(--bg); font-family:var(--font); color:var(--ink); line-height:1.58; }
a { color:var(--sea); text-underline-offset:3px; }
a:hover { color:#0b3f40; }
:focus-visible { outline:3px solid var(--warm); outline-offset:3px; }
.skip { position:absolute; left:-999px; top:8px; background:var(--deep); color:var(--lime);
  padding:9px 15px; border-radius:8px; z-index:50; }
.skip:focus { left:8px; color:var(--lime); }
.frame { display:grid; grid-template-columns:258px minmax(0,1fr); min-height:100vh; }
.rail { position:sticky; top:0; height:100vh; padding:28px 18px 18px 24px; border-right:1px solid var(--line);
  display:flex; flex-direction:column; background:#f2f1e9; z-index:5; overflow-y:auto; }
.brand { display:flex; align-items:center; gap:11px; font-weight:850; letter-spacing:-.05em;
  font-size:21px; color:var(--deep); text-decoration:none; }
.brandmark { width:36px; height:36px; border-radius:11px; background:var(--deep); color:var(--lime);
  display:grid; place-items:center; font-size:19px; font-weight:800; flex:none; }
.rail-caption { font:700 10px/1.4 var(--mono); letter-spacing:.15em; color:#5c7568; margin:26px 8px 9px;
  text-transform:uppercase; }
.rail nav { display:flex; flex-direction:column; gap:2px; }
.rail nav a { display:block; padding:7px 10px; text-decoration:none; border-radius:8px;
  color:#4d665f; font-size:13px; }
.rail nav a:hover { color:var(--deep); background:#dce7d5; }
.rail-bottom { margin-top:auto; padding:14px 10px 0; border-top:1px solid var(--line);
  color:var(--mute); font-size:11px; }
.rail-bottom strong { color:var(--sea); }
.main { min-width:0; }
.content { max-width:1040px; margin:auto; padding:0 48px 90px; }
.hero { background:var(--deep); color:var(--white); padding:58px 48px 50px; }
.hero-eyebrow { display:flex; align-items:center; gap:9px; text-transform:uppercase;
  font:700 11px/1.5 var(--mono); letter-spacing:.16em; color:#c1e4c6; }
.hero-dot { width:7px; height:7px; border-radius:50%; background:var(--lime); display:inline-block; }
.hero h1 { font-weight:720; font-size:clamp(34px,4.4vw,58px); letter-spacing:-.06em;
  line-height:1.06; margin:22px 0 16px; max-width:820px; }
.hero-short { max-width:720px; color:#c3d6d0; font-size:clamp(16px,1.4vw,18px); line-height:1.65; }
.hero-pills { display:flex; flex-wrap:wrap; gap:9px; margin-top:26px; }
.pill { display:inline-flex; align-items:center; border:1px solid #42706b; border-radius:100px;
  color:#d8e7d9; padding:7px 12px; font:600 11px var(--mono); }
.pill.bright { background:var(--lime); color:var(--deep); border-color:var(--lime); }
.pill a { color:inherit; }
h2 { font-size:clamp(24px,2.8vw,34px); letter-spacing:-.045em; font-weight:720; line-height:1.15;
  margin:52px 0 16px; scroll-margin-top:20px; }
h3 { letter-spacing:-.025em; font-size:19px; margin:30px 0 10px; }
h4 { font-size:15px; margin:22px 0 8px; }
p { color:var(--ink2); margin:0 0 14px; }
li { margin-bottom:6px; color:var(--ink2); }
ul,ol { padding-left:24px; margin:0 0 14px; }
li ul,li ol { margin:6px 0 2px; }
table { border-collapse:collapse; font-size:13.5px; width:100%; margin:18px 0; }
th,td { border-bottom:1px solid #d8dfd5; text-align:left; vertical-align:top; padding:10px 11px; }
th { font:800 10px var(--mono); text-transform:uppercase; letter-spacing:.07em; color:#3f5f56;
  background:#eaece3; }
td { color:var(--ink2); }
.tablewrap { overflow-x:auto; margin:18px 0; }
.tablewrap table { margin:0; }
code { font:.92em var(--mono); background:#ecefe4; border-radius:5px; padding:1px 5px; color:#26433c; }
pre { background:#122f31; color:#d2e9e0; border-radius:13px; padding:18px; overflow:auto; margin:16px 0; }
pre code { background:none; color:inherit; padding:0; font:12.5px/1.7 var(--mono); }
blockquote { margin:16px 0; padding:12px 18px; border-left:4px solid #9db7ad; background:#f0f2ea;
  border-radius:0 12px 12px 0; color:var(--ink2); }
blockquote p:last-child { margin-bottom:0; }
.callout { margin:18px 0; border-radius:12px; padding:14px 18px; border:1px solid var(--line);
  border-left-width:5px; background:var(--paper); }
.callout-label { font:800 10px var(--mono); letter-spacing:.14em; text-transform:uppercase;
  color:var(--deep); margin:0 0 6px; }
.callout p:last-child { margin-bottom:0; }
.callout-gate { border-left-color:#2e624a; background:#eaf2e2; }
.callout-gate .callout-label { color:#2e624a; }
.callout-risk { border-left-color:var(--warm); background:#f7e9dc; }
.callout-risk .callout-label { color:var(--warm); }
.callout-decision { border-left-color:var(--sea); background:#e4eef0; }
.callout-decision .callout-label { color:var(--sea); }
.callout-note { border-left-color:#7f8a72; background:#f1f2ec; }
.callout-note .callout-label { color:#5c6a4e; }
ul.checklist, ol.checklist { list-style:none; padding-left:2px; }
.checklist input { margin-right:8px; }
.linklist { display:flex; flex-wrap:wrap; gap:8px; list-style:none; padding:0; margin:0 0 16px; }
.linklist li { margin:0; }
.pillnav { display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; margin:26px 0 0; }
.pillnav a { border:1px solid #b8cbbd; color:var(--deep); background:var(--paper); font-size:12.5px;
  border-radius:9px; font-weight:650; padding:8px 13px; text-decoration:none; }
.pillnav a:hover { background:#e5f0dd; }
.prompt-details summary { cursor:pointer; font:700 12px var(--mono); letter-spacing:.08em;
  text-transform:uppercase; color:var(--sea); margin-bottom:10px; }
.copy-btn { border:1px solid #b8cbbd; background:#f7f9ef; color:var(--deep); border-radius:9px;
  font:650 12px var(--font); padding:8px 13px; cursor:pointer; margin-bottom:10px; }
.copy-btn:hover { background:#e5f0dd; }
.footer { margin-top:60px; padding-top:20px; border-top:1px solid var(--line); display:flex;
  justify-content:space-between; gap:18px; color:var(--mute); font-size:11px; }
@media (max-width:860px) {
  .frame { display:block; }
  .rail { position:relative; height:auto; padding:12px 16px; flex-direction:row; align-items:center;
    gap:14px; overflow-x:auto; }
  .rail nav { flex-direction:row; gap:3px; white-space:nowrap; }
  .rail-caption,.rail-bottom { display:none; }
  .content { padding:0 18px 60px; }
  .hero { padding:40px 18px 34px; }
}
@media print {
  @page { size:A4; margin:14mm; }
  .frame { display:block; }
  .rail,.copy-btn,.pillnav,.skip { display:none; }
  .hero { color:var(--ink); background:#eff5e8; padding:14px 0; }
  .hero-short { color:var(--ink2); }
  .hero-eyebrow { color:var(--sea); }
  .pill { color:var(--sea); border-color:var(--sea); }
  .content { max-width:100%; padding:0; }
  pre { white-space:pre-wrap; }
  details { display:block; }
  a[href^="http"]::after { content:" (" attr(href) ")"; font-size:11px; color:var(--mute); }
}
"""


def warn(msg):
    print("WARNING: %s" % msg, file=sys.stderr)


def parse_meta(text):
    """Parse a leading `---` fenced block of simple key: value pairs."""
    lines = text.splitlines()
    meta = {}
    if not lines or lines[0].strip() != "---":
        return meta, lines
    body_start = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            body_start = i + 1
            break
    if body_start is None:
        return meta, lines
    for line in lines[1:body_start - 1]:
        if ":" in line:
            key, _, value = line.partition(":")
            meta[key.strip().lower()] = value.strip()
    return meta, lines[body_start:]


def esc(text):
    return html.escape(text, quote=True)


def slugify(text, seen):
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "section"
    if slug in seen:
        n = 2
        while "%s-%d" % (slug, n) in seen:
            n += 1
        slug = "%s-%d" % (slug, n)
    seen.add(slug)
    return slug


_INLINE_CODE = re.compile(r"`([^`]+)`")
_BOLD = re.compile(r"\*\*([^*]+)\*\*")
_ITALIC = re.compile(r"(?<!\*)\*([^*\n]+)\*(?!\*)")
_LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")


def inline(text):
    """Escape, then apply inline markdown. Text must already be raw."""
    out = esc(text)
    out = _INLINE_CODE.sub(r"<code>\1</code>", out)
    out = _BOLD.sub(r"<strong>\1</strong>", out)
    out = _LINK.sub(r'<a href="\2">\1</a>', out)
    out = _ITALIC.sub(r"<em>\1</em>", out)
    return out


CALLOUTS = {"GATE": "gate", "RISK": "risk", "DECISION": "decision", "NOTE": "note"}
_CALLMATCH = re.compile(r"^\[!(GATE|RISK|DECISION|NOTE)\]\s*(.*)$")


def render_markdown(lines):
    """Render a list of markdown body lines to an HTML string."""
    out = []
    seen = set()
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            i += 1
            continue

        m = re.match(r"^(#{2,4})\s+(.*)$", stripped)
        if m:
            level = len(m.group(1))
            text = m.group(2).strip()
            sid = slugify(text, seen)
            out.append("<h%d id=\"%s\">%s</h%d>" % (level, sid, inline(text), level))
            i += 1
            continue

        if stripped.startswith("```"):
            lang = stripped[3:].strip()
            cls = ' class="language-%s"' % esc(lang) if lang else ""
            code_lines = []
            i += 1
            while i < n and not lines[i].strip().startswith("```"):
                code_lines.append(lines[i])
                i += 1
            i += 1  # closing fence (or EOF)
            out.append("<pre><code%s>%s</code></pre>" % (cls, esc("\n".join(code_lines))))
            continue

        if stripped.startswith(">"):
            quote = []
            while i < n and lines[i].strip().startswith(">"):
                quote.append(lines[i].strip()[1:].strip())
                i += 1
            call = _CALLMATCH.match(quote[0]) if quote else None
            if call:
                kind = CALLOUTS.get(call.group(1))
                parts = []
                if call.group(2):
                    parts.append("<p>%s</p>" % inline(call.group(2)))
                parts.extend(_render_blocks(quote[1:]))
                out.append('<aside class="callout callout-%s"><p class="callout-label">%s</p>%s</aside>'
                           % (kind, esc(call.group(1).title()), "".join(parts)))
            else:
                out.append("<blockquote>%s</blockquote>" % _render_blocks(quote))
            continue

        m = re.match(r"^(\|.*)$", stripped)
        if m and "|" in stripped[1:]:
            rows = []
            while i < n and lines[i].strip().startswith("|"):
                rows.append(lines[i].strip())
                i += 1
            out.append(_render_table(rows))
            continue

        m = re.match(r"^([-*+]|\d+[.)])\s+(.*)$", stripped)
        if m:
            ordered = m.group(1) not in ("-", "*", "+")
            items = []  # [text, nested_lines]
            while i < n:
                lm = re.match(r"^(\s*)([-*+]|\d+[.)])\s+(.*)$", lines[i])
                if lm is None:
                    break
                # An indented item with no parent becomes a top-level item;
                # breaking here without consuming the line looped forever.
                if len(lm.group(1)) >= 2 and items:
                    while i < n:
                        sm = re.match(r"^(\s*)([-*+]|\d+[.)])\s+(.*)$", lines[i])
                        if sm is None or len(sm.group(1)) < 2:
                            break
                        items[-1][1].append(lines[i].strip())
                        i += 1
                    continue
                items.append([lm.group(3).strip(), []])
                i += 1
            rendered = []
            any_check = False
            for text, sub in items:
                subhtml = render_markdown(sub) if sub else ""
                check = re.match(r"^\[( |x|X)\]\s*(.*)$", text)
                if check:
                    any_check = True
                    checked = " checked" if check.group(1).lower() == "x" else ""
                    rendered.append('<li><input type="checkbox" disabled%s> %s%s</li>'
                                    % (checked, inline(check.group(2)), subhtml))
                else:
                    rendered.append("<li>%s%s</li>" % (inline(text), subhtml))
            tag = "ol" if ordered else "ul"
            cls = ' class="checklist"' if any_check else ""
            out.append("<%s%s>%s</%s>" % (tag, cls, "".join(rendered), tag))
            continue

        para = [stripped]
        i += 1
        while i < n:
            nxt = lines[i]
            s = nxt.strip()
            if (not s or s.startswith(("#", "```", ">", "|", "- ", "* ", "+ "))
                    or re.match(r"^\d+[.)]\s", s)):
                break
            para.append(s)
            i += 1
        out.append("<p>%s</p>" % inline(" ".join(para)))
    return "".join(out)


def _render_blocks(lines):
    """Render loose inner blocks (used inside blockquotes and nested lists)."""
    return render_markdown([l for l in lines if l.strip()])


def _split_row(row):
    cells = [c.strip() for c in row.strip().strip("|").split("|")]
    return cells


def _render_table(rows):
    if len(rows) < 2:
        return "".join("<p>%s</p>" % inline(r) for r in rows)
    header = _split_row(rows[0])
    if all(re.fullmatch(r":?-{2,}:?", c) for c in _split_row(rows[1])):
        data_rows = rows[2:]
    else:
        data_rows = rows[1:]
    parts = ['<div class="tablewrap"><table>']
    parts.append("<thead><tr>%s</tr></thead>" % "".join("<th scope=\"col\">%s</th>" % inline(c) for c in header))
    parts.append("<tbody>")
    for row in data_rows:
        cells = _split_row(row)
        parts.append("<tr>%s</tr>" % "".join("<td>%s</td>" % inline(c) for c in cells))
    parts.append("</tbody></table></div>")
    return "".join(parts)


COPY_JS = """
document.querySelectorAll('.copy-btn').forEach(function(b){
  b.addEventListener('click', function(){
    var t = document.getElementById(b.getAttribute('data-target'));
    if (!t) return;
    var done = function(){ b.textContent = 'Copied'; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t.textContent).then(done, function(){});
    } else {
      var ta = document.createElement('textarea');
      ta.value = t.textContent; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
  });
});
"""


def page(title, rail_html, body_html, script=""):
    return """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<title>%s</title>
<style>%s</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="frame">
<aside class="rail">%s</aside>
<main class="main" id="main">
%s
</main>
</div>
<script>%s</script>
</body>
</html>""" % (esc(title), CSS, rail_html, body_html, script)


def rail_html_for(index_active, phases, current=None, prev=None, next_=None):
    links = []
    for ph in phases:
        active = ' aria-current="page"' if ph["id"] == current else ""
        links.append('<a href="%s%s"%s>%s · %s</a>' % (
            "phases/" if index_active else "", ph["file"],
            active, esc(ph["id"]), esc(ph.get("short") or ph.get("title", ph["id"]))))
    nav = '<nav aria-label="Sections">%s</nav>' % "".join(links) if links else ""
    prevnext = ""
    if prev or next_:
        parts = []
        if prev:
            parts.append('<a href="%s">← %s</a>' % (prev["file"], esc(prev["id"])))
        if next_:
            parts.append('<a href="%s">%s →</a>' % (next_["file"], esc(next_["id"])))
        prevnext = '<div class="pillnav">%s</div>' % "".join(parts)
    back = "" if index_active else '<div class="rail-bottom"><a href="../index.html">← Planning index</a></div>'
    return ('<a class="brand" href="%s"><span class="brandmark">g.</span>'
            '<span>guia.la <em>/ planning</em></span></a>'
            '<div class="rail-caption">Planning packet</div>%s%s%s'
            % ("index.html" if index_active else "../index.html", nav, back, prevnext))


def hero_html(eyebrow, title, short, pills):
    pill_html = "".join('<span class="pill%s">%s</span>' % (
        " bright" if i == 0 else "", p) for i, p in enumerate(pills))
    return """<header class="hero">
<div class="hero-eyebrow"><span class="hero-dot"></span> %s</div>
<h1>%s</h1>
<p class="hero-short">%s</p>
<div class="hero-pills">%s</div>
</header>""" % (esc(eyebrow), inline(title), inline(short), pill_html)


def phase_page(ph, phases, prompt_text, prompt_exists, prev, next_):
    body_md = ph["body_lines"]
    content = render_markdown(body_md)
    toc = re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', content, re.S)
    toc_html = "".join('<a href="#%s">%s</a>' % (sid, re.sub(r"<[^>]+>", "", label)) for sid, label in toc)
    deps = [d.strip() for d in ph.get("depends", "").split(",") if d.strip()]
    dep_links = []
    for d in deps:
        target = next((p for p in phases if p["id"] == d), None)
        dep_links.append('<a href="%s">%s</a>' % (target["file"], d) if target else esc(d))
    pills = ["Status: " + esc(ph.get("status", "?"))]
    if ph.get("complexity"):
        pills.append(esc(ph["complexity"]))
    if ph.get("tag"):
        pills.append(esc(ph["tag"]))
    if deps:
        pills.append("depends on: %s" % ", ".join(dep_links))
    hero = hero_html("guia.la / Phase %s" % ph["id"],
                     "Phase %s — %s" % (ph["id"], ph.get("title", ph["id"])),
                     ph.get("short", ""), pills)

    prompt_block = ['<h2 id="agent-execution-prompt">Agent execution prompt</h2>']
    if prompt_exists:
        prompt_block.append('<p>The full agent prompt lives at '
                            '<a href="../prompts/phase-%s-agent.md">../prompts/phase-%s-agent.md</a>.</p>'
                            % (ph["id"], ph["id"]))
        prompt_block.append('<button type="button" class="copy-btn" data-target="agent-prompt">Copy prompt</button>')
        prompt_block.append('<details class="prompt-details" open>'
                            '<summary>Prompt contents</summary>'
                            '<pre id="agent-prompt"><code>%s</code></pre></details>' % esc(prompt_text))
    else:
        prompt_block.append('<p><em>No agent prompt file found for this phase.</em></p>')

    toc_rail = ('<div class="rail-caption">On this page</div>'
                '<nav aria-label="On this page">%s</nav>' % toc_html) if toc_html else ""
    rail = ('<a class="brand" href="../index.html"><span class="brandmark">g.</span>'
            '<span>guia.la <em>/ planning</em></span></a>%s'
            '<div class="rail-bottom"><a href="../index.html">← Planning index</a></div>' % toc_rail)
    prevnext = ""
    if prev or next_:
        parts = []
        if prev:
            parts.append('<a href="%s">← Phase %s</a>' % (prev["file"], prev["id"]))
        if next_:
            parts.append('<a href="%s">Phase %s →</a>' % (next_["file"], next_["id"]))
        prevnext = '<div class="pillnav">%s</div>' % "".join(parts)
    body = '%s<div class="content">%s%s<div class="footer"><span>guia.la planning packet</span><span>Phase %s · generated by planning/tools/build.py</span></div></div>' % (
        hero, content, "".join(prompt_block) + prevnext, esc(ph["id"]))
    return page("Phase %s — %s · guia.la planning" % (ph["id"], ph.get("title", ph["id"])),
                rail, body, COPY_JS)


def index_page(meta, body_lines, phases):
    hero = hero_html("guia.la / Planning packet", meta.get("title", "Planning"),
                     meta.get("short", ""), ['PLANNING / REVIEW',
                                             '%d phases' % len(phases)])
    rows = []
    strip = []
    for ph in phases:
        deps = [d.strip() for d in ph.get("depends", "").split(",") if d.strip()]
        by_id = {q["id"]: q for q in phases}
        dep_links = ", ".join(
            ('<a href="phases/%s">%s</a>' % (by_id[d]["file"], esc(d)))
            if d in by_id else esc(d) for d in deps) or "—"
        rows.append("<tr><td>%s</td><td><a href=\"phases/%s\">%s</a></td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>" % (
            esc(ph["id"]), ph["file"], esc(ph.get("title", ph["id"])), esc(ph.get("tag", "")),
            dep_links, esc(ph.get("inspect", "")), esc(ph.get("exit", "")), esc(ph.get("status", ""))))
    table = ('<h2 id="phases">Phases</h2>'
             '<div class="tablewrap"><table><thead><tr>'
             '<th scope="col">No.</th><th scope="col">Title</th><th scope="col">Tag</th>'
             '<th scope="col">Depends on</th><th scope="col">Inspect</th><th scope="col">Exit gate</th>'
             '<th scope="col">Status</th></tr></thead><tbody>%s</tbody></table></div>'
             % "".join(rows)) if phases else "<h2 id=\"phases\">Phases</h2><p>No phase sources found.</p>"
    for ph in phases:
        deps = [d.strip() for d in ph.get("depends", "").split(",") if d.strip()]
        dep_note = ("after " + ",".join(deps)) if deps else "start"
        strip.append('<li><a href="phases/%s"><strong>%s</strong><span>%s</span></a></li>'
                     % (ph["file"], esc(ph["id"]), esc(dep_note)))
    strip_html = ('<h2 id="dependency-order">Dependency order</h2>'
                  '<ul class="linklist depstrip">%s</ul>' % "".join(strip)) if strip else ""
    content = render_markdown(body_lines)
    body = '%s<div class="content">%s%s%s<div class="footer"><span>guia.la planning packet</span><span>generated by planning/tools/build.py</span></div></div>' % (
        hero, table, strip_html, content)
    return page("%s · guia.la planning" % meta.get("title", "Planning"),
                rail_html_for(True, phases), body)


def load_phases():
    phases = []
    for pid in PHASE_IDS:
        path = SRC / "phases" / ("phase-%s.md" % pid)
        if not path.exists():
            warn("missing phase source %s — skipped" % path.relative_to(ROOT))
            continue
        meta, body = parse_meta(path.read_text(encoding="utf-8"))
        meta["id"] = pid
        meta["file"] = "phase-%s.html" % pid
        meta["body_lines"] = body
        phases.append(meta)
    return phases


def main():
    phases = load_phases()
    out_phases = OUT / "phases"
    out_phases.mkdir(parents=True, exist_ok=True)
    written = []
    for idx, ph in enumerate(phases):
        prompt_path = PROMPTS / ("phase-%s-agent.md" % ph["id"])
        prompt_exists = prompt_path.exists()
        if not prompt_exists:
            warn("missing prompt %s — placeholder shown" % prompt_path.relative_to(ROOT))
        prompt_text = prompt_path.read_text(encoding="utf-8") if prompt_exists else ""
        prev = phases[idx - 1] if idx > 0 else None
        next_ = phases[idx + 1] if idx + 1 < len(phases) else None
        target = out_phases / ("phase-%s.html" % ph["id"])
        target.write_text(phase_page(ph, phases, prompt_text, prompt_exists, prev, next_),
                          encoding="utf-8")
        written.append(target.relative_to(ROOT).as_posix())

    index_path = SRC / "index.md"
    if not index_path.exists():
        warn("missing %s — index skipped" % index_path.relative_to(ROOT))
    else:
        meta, body = parse_meta(index_path.read_text(encoding="utf-8"))
        OUT.joinpath("index.html").write_text(index_page(meta, body, phases), encoding="utf-8")
        written.append("planning/index.html")

    for w in written:
        print("wrote %s" % w)
    print("%d phase page(s) + index written." % len(phases))


if __name__ == "__main__":
    main()
