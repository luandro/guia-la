---
id: 00
title: Charter, working agreement and decision baseline
short: Stand up the docs-only guia-la repository — AGENTS.md, SPEC.md, ADRs, evidence rules — so every later phase inherits one set of permissions, names and records.
tag: Govern
status: draft
complexity: Low (coordination)
depends:
inspect: The new guia-la repository docs tree (AGENTS.md, SPEC.md, docs/adr/, evidence templates) and the decision register copied in with unchanged statuses
exit: Owner approves the docs-only repo and D-01/D-03/D-06/D-08/D-09 responses; no application code exists in the repository
---

Phase 00 converts this planning packet into the future repository's operating
system. It writes **documents only** — no application code, no scaffolding, no
CI credentials, no deploys. Everything later phases are allowed or forbidden to
do is decided here and recorded where an agent can read it in one place.

> [!NOTE] Nothing in this phase authorizes implementation. The packet
> ([index](../index.html)) must be approved first; this playbook is the first
> execution step after approval, per [review §10](../review.md).

## Phase identity

- **Number:** 00 — the first phase; nothing precedes it.
- **Objective:** create the `guia-la` repository (proposed name, see D-01) containing the agent working agreement, platform spec, decision records, evidence rules and the security/privacy/spend baseline, with every open decision recorded at its honest status.
- **Prerequisites:** this planning packet is approved by the owner; the review's proposals ([review §2](../review.md), [§8 roadmap edits](../review.md)) are understood as **proposals**, not approved facts.
- **Dependencies:** none. Phases [01](phase-01.html) and the [02](phase-02.html) spike may start as soon as this phase's decisions are recorded.
- **Expected contributors:**

| Role | Human or agent | Responsibility |
|---|---|---|
| Product owner | Human | Approves the doc set, runs naming checks, records decisions D-01/D-03/D-06/D-08/D-09, confirms legacy access |
| Orchestrator agent | Agent | Drafts documents, splits work into PR units, reviews every junior diff, keeps statuses honest |
| Junior implementation agent | Agent | Mechanical doc PRs (formatting, cross-linking, TOCs) via the repo AGENTS.md delegation ladder |
| Reviewer of record | Agent (orchestrator) + RevEngine | Local codex/ohmybug skipped on docs-only PRs (self-reviewed); RevEngine `/review` (Claude subscription, D-14) required before merge |

- **Complexity/risks:** Low mechanical complexity; the risk is coordination and
  wording — an ambiguous permission sentence in AGENTS.md becomes an
  unauthorized production action three phases later.

## Why this stage exists

The legacy Cotiju app failed operationally as much as technically: 455 hidden
`tsc` errors because nothing enforced typechecking ([legacy audit, issue #69](../research/legacy-cotiju-audit.md)),
two live deploy targets so nobody knew which commit served production
([incident #63](../research/legacy-cotiju-audit.md)), and data whose freshness
nobody owned ([review R1](../review.md)). Those are charter failures, not code
failures — the rewrite inherits them unless the rules are written down first.

This phase also exists to make decisions **cheap to change now and expensive to
change later**: bundle IDs and store names are effectively permanent after
first release ([decisions D-01](../decisions.md)), so candidate names are
recorded with an ownership checklist before any identifier is committed to
code in Phase 02.

Finally, an agent-led team needs one evidence standard. The master plan
([section 07](../../docs/guia-la-master-plan.html)) requires every PR to carry
inspectable evidence; this phase defines the template so phases 01–10 all
produce the same shape of record, and [traceability.md](../traceability.md)
can link against a stable format.

## Inputs and source references

- This packet (copy or submodule into the future repo, exact mechanism is a
  Phase 00 decision): [review.md](../review.md), [decisions.md](../decisions.md),
  [traceability.md](../traceability.md), [research/](../research/backend-stores-starters.md),
  and the phase playbooks ([00](phase-00.html), [01](phase-01.html), [02](phase-02.html)).
- Master plan and handoff (kept in the current repo, linked for provenance):
  [master plan v0.2](../../docs/guia-la-master-plan.html),
  [agent handoff](../../docs/guia-la-agent-handoff.md).
- Legacy references — naming rules only, never rename history:
  `luandro/cotiju-app` stays the historical name; issue [#71 RFC](https://github.com/luandro/cotiju-app/issues/71)
  is the origin of this rebuild; issue #69 (TypeScript debt) motivates the
  typecheck-from-day-one rule recorded here.
- Authoritative external docs (already verified during research, re-check if
  older than a quarter): [Apple App Review Guidelines 4.2.6/4.3](https://developer.apple.com/app-store/review/guidelines/)
  and [Google Play white-label guidance](https://support.google.com/googleplay/android-developer/answer/15884185)
  behind D-07; [Expo pricing](https://expo.dev/pricing.md) and
  [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
  behind the D-08 budget placeholder.
- Drafts: `planning/drafts/` may contain planning-only drafts of AGENTS.md or
  SPEC.md — use as raw material, do not copy blindly; they were not written
  against the final decision register.
- **Known unknowns:** whether `guia.la` the domain is registrable/owned;
  whether store names and the GitHub repo name are free; which code/content
  license applies (D-11). All are recorded as open, never assumed.
- **Credentials/tools needed:** a GitHub account able to create the repository
  (human); a registrar lookup for the domain (human, read-only); no secrets,
  no API keys, no store accounts are created in this phase.

## Task breakdown

| # | Task and goal | Owner | PR unit | Depends on |
|---|---|---|---|---|
| 1 | Naming and identity check (D-01): registrar/WHOIS lookup for `guia.la`, GitHub repo-name search, app-store name search; record candidates (`guia-la` repo, `@guia-la` scope, `la.guia.app` bundle) as unverified until confirmed | Human runs checks, agent records results | PR 00-1 | — |
| 2 | Create the `guia-la` repository, docs only: default branch, branch protection, PR template shell | Human creates, agent configures | PR 00-2 | 00-1 |
| 3 | AGENTS.md working agreement: autonomy defaults, the human-approval list, delegation ladder, branch/worktree/PR conventions, evidence wording standard | Agent drafts, human approves | PR 00-3 | 00-2 |
| 4 | SPEC.md: platform spec, non-goals, widget vocabulary (widget ≠ card; shared domains), destination model — guia.la platform, Cotijuba pilot, Serra demo synthetic mountain destination | Agent drafts, human approves | PR 00-4 | 00-2 |
| 5 | docs/adr/: ADR template plus seed ADRs mirroring [decisions.md](../decisions.md) D-00..D-14 with statuses copied verbatim — never upgraded | Agent | PR 00-5 | 00-2 |
| 6 | Evidence rules: `docs/evidence/PR-EVIDENCE.md` template, handoff state file convention, claim-vs-evidence wording rules ("must not say passed unless a run exists") | Agent | PR 00-6 | 00-3 |
| 7 | Security, privacy, spend baseline: `docs/security/APPROVAL-LIST.md`, secrets policy (env vars only), LGPD data-minimization default, budget ceiling placeholder for D-08 | Agent drafts, human approves | PR 00-7 | 00-3 |
| 8 | docs/roadmap.md: mirror of phases 00–10 with per-phase exit gates and links back to this packet | Agent | PR 00-8 | 00-5 |
| 9 | Contradiction pass: enumerate every point where [review §2/§8](../review.md) proposals disagree with the master plan; owner records accept/reject/defer for D-01, D-03, D-06, D-08, D-09 | Human decides, agent records | PR 00-9 | 00-5 |
| 10 | Phase 01 readiness: confirm read-only access to `luandro/cotiju-app`, draft the owner-run export runbook stub, state the backup-before-export policy | Agent + human | PR 00-10 | 00-7 |

Notes on splitting: PRs 00-3/00-4/00-7 are the substantive documents and each
gets a human read; PRs 00-5/00-6/00-8 are mechanical and can go to a junior
agent. Nothing here is one giant PR — the whole point is reviewability.

## Architecture choices and guardrails

- **Docs-only repository.** The only "architecture" is the file tree; the
  application monorepo layout is decided in [Phase 02](phase-02.html), not here.
- **Markdown is the source of truth; HTML is presentation** — the same rule
  this packet follows ([master plan §07](../../docs/guia-la-master-plan.html)).
  Generated views must never be edited by hand.

```text
guia-la/                          (proposed name — D-01 unverified)
  AGENTS.md                       working agreement for humans and agents
  SPEC.md                         platform spec, non-goals, widget vocabulary
  docs/
    roadmap.md                    phase mirror 00–10 with exit gates
    glossary.md                   platform, destination, profile, widget, build profile
    adr/ADR-0000-template.md      status line "- **Status:** <status>",
                                  trailing note allowed (e.g. "— blocked on S1")
    adr/ADR-0001-platform-identity.md   (from D-00, approved)
    adr/...                       one ADR per decision D-01..D-14, its D-xx id
                                  in the filename or front matter (both linted)
    evidence/PR-EVIDENCE.md       per-PR evidence template
    evidence/HANDOFF-STATE.md     checkpoint file convention for agent handoffs
    security/APPROVAL-LIST.md     actions that always require a human
  .github/PULL_REQUEST_TEMPLATE.md
```

- **Evidence contract (illustrative, not runnable here):**

```yaml
# every PR body fills this; empty sections block merge per AGENTS.md
summary: one paragraph, what and why
phase-task: "PR 00-3 AGENTS.md"
commands:                        # only commands actually run, with real excerpts
  - run: <command>
    excerpt: "<verbatim output lines>"
artifacts:                       # at least one for any behavioral claim
  - kind: screenshot|recording|report|link
    path: docs/evidence/2026-12/...
risks: what could still be wrong
docs-updated: [AGENTS.md]
next-unblocked: "PR 01-2 entity matrix"
```

- **Forbidden in this phase:** application code, scaffolding, CI runners with
  secrets, store accounts, domain purchase, renaming legacy GitHub URLs,
  marking any decision `approved` without a recorded user decision
  ([decisions.md rule](../decisions.md)).
- **Security/privacy implications:** the approval list must include (from the
  [handoff](../../docs/guia-la-agent-handoff.md)): production data writes,
  credentials, tenancy/auth changes, store publication, spending, and
  disabling required checks. LGPD default: guia.la collects no visitor
  personal data in v1 (D-13b).
- **Acceptable alternatives:** a wiki/Notion (rejected — not git-reviewable,
  agents cannot diff it); a single long README (rejected — unscalable and
  unenforceable); skipping this phase because "it's just docs" (rejected —
  [review R1](../review.md) shows the failure mode this prevents).

## Deliverables

- [ ] `guia-la` repository exists, docs only, branch protection on (PR 00-2)
- [ ] `AGENTS.md` approved and merged (PR 00-3)
- [ ] `SPEC.md` with non-goals and widget vocabulary approved (PR 00-4)
- [ ] `docs/adr/` seeded: template + ADRs for D-00..D-14, statuses verbatim from [decisions.md](../decisions.md) (PR 00-5)
- [ ] `docs/evidence/PR-EVIDENCE.md` and `HANDOFF-STATE.md` conventions (PR 00-6)
- [ ] `docs/security/APPROVAL-LIST.md`, secrets policy, LGPD baseline (PR 00-7)
- [ ] `docs/roadmap.md` and `docs/glossary.md` (PR 00-8)
- [ ] Decision responses recorded for D-01, D-03, D-06, D-08, D-09 (PR 00-9)
- [ ] Phase 01 access confirmed + export runbook stub (PR 00-10)
- [ ] Zero files outside `docs/`, `.github/` and the root markdown (repo stays docs-only)

## Visual and functional QA

There is no UI in this phase. The inspectable surface is the repository
itself; GitHub's markdown rendering is the "preview". Preview URL patterns
beyond the repo browser are TBD in Phase 04.

- **Human journey:** read `AGENTS.md` cold and answer, without asking anyone:
  what may an agent do alone, and what always needs me? Open the ADR folder
  and confirm no status disagrees with [decisions.md](../decisions.md). Open
  `docs/roadmap.md` next to this packet's index and confirm the phase list and
  exit gates match.
- **Agent journey:** a fresh agent (no session history) reads `AGENTS.md`,
  `SPEC.md` and the roadmap, then states the next task, its PR unit and its
  acceptance criteria. If it cannot — or asks questions the docs should have
  answered — the docs fail QA.
- **Contradiction check:** the list from PR 00-9 has an owner response on
  every row; no row is silently dropped.
- **Platform matrix:** not applicable (no app); recorded here so reviewers
  do not expect screens.

## Automated verification

All commands are **proposed** — none has run; expected outputs are stated so
a failing run is recognizable. They belong in a tiny `scripts/check-docs.sh`
added by PR 00-6.

```bash
# proposed — structure check: fails if any expected document is missing
for f in AGENTS.md SPEC.md docs/roadmap.md docs/glossary.md \
         docs/evidence/PR-EVIDENCE.md docs/security/APPROVAL-LIST.md \
         .github/PULL_REQUEST_TEMPLATE.md; do
  test -f "$f" || { echo "missing $f"; exit 1; }
done
```

```bash
# proposed — ADR status lint. Expected: no output (pass).
# Matches the template's "- **Status:** …" line form as well as a plain
# "Status:" line; a trailing note after an em dash is allowed because
# statuses are copied verbatim (e.g. "proposed — blocked on S1").
# Deliberate-failure demonstration: add a draft ADR with
# "- **Status:** decided" and confirm this command prints it and exits non-zero.
grep -E '^(Status: |- \*\*Status:\*\*)' docs/adr/*.md \
  | grep -vE 'Status:\*{0,2} ?(proposed|validated|approved|rejected)( —.*)?$' && exit 1
```

```bash
# proposed — decision consistency: every D-xx in the packet's decisions.md
# has an ADR carrying that id in its filename or front matter/body.
# Unanchored on both sides, so a heading-format drift in decisions.md cannot
# silently empty the list and turn the check into a vacuous pass.
# Expected: no output (pass).
ids=$(grep -oE 'D-[0-9]{2}' ../planning/decisions.md 2>/dev/null | sort -u)
test -n "$ids" || { echo "no D-xx parsed from ../planning/decisions.md"; exit 1; }
missing=$(comm -23 <(printf '%s\n' "$ids") \
  <({ ls docs/adr/; cat docs/adr/*.md; } | grep -oE 'D-[0-9]{2}' | sort -u))
test -z "$missing" || { echo "ADR missing for: $(echo $missing)"; exit 1; }
```

Negative test worth keeping: the status lint above is itself the
deliberate-failure demo — it must catch a bad status, or it is decorative.

## Acceptance gate

> [!GATE] Phase 00 passes only when the owner has approved the document set
> and every open decision carries an honest status. A green script run alone
> is not passage; the human sign-off row below is part of the gate.

- [ ] `scripts/check-docs.sh` exits 0 on a clean clone (proposed command, first real run is the evidence)
- [ ] Owner has read and approved AGENTS.md, SPEC.md, APPROVAL-LIST.md (recorded in PR threads)
- [ ] D-01, D-03, D-06, D-08, D-09 each have a recorded owner response (accept/reject/defer)
- [ ] No ADR status differs from [decisions.md](../decisions.md) at merge time
- [ ] Repository contains no application code (verified by file listing in the PR)
- [ ] A fresh-agent cold-read test passes (agent states next task correctly, quoted in PR evidence)

**Blocks progression if:** AGENTS.md or APPROVAL-LIST.md is unapproved (phases
01–02 would operate without permission boundaries); D-01 is unresolved **and**
Phase 02 wants to commit bundle IDs (02 may still run its spike with placeholder
IDs); the evidence template is missing (every later PR would improvise).

## Risks, rollback and handoff

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Owner availability bottlenecks decisions | Medium | High | Batch D-01/D-03/D-06/D-08/D-09 into one recorded session; safe defaults pre-written per decision |
| `guia.la` domain or names unavailable | Low | High | Fallback names pre-listed in D-01 (`app.guiala` scope variant); decide before Phase 02 pins IDs |
| Docs drift from the planning packet | Medium | Medium | roadmap mirror + consistency check; packet stays the planning source of truth until Phase 02 forks it |
| Scope creep into implementation | Medium | Medium | Hard gate: no app code; reviewer rejects any non-docs file |
| Decision status inflation (proposal recorded as approved) | Low | High | Status lint + review rule; statuses copy verbatim from [decisions.md](../decisions.md) |

- **Sensitive operations needing human approval:** creating the repository;
  any domain registration or purchase (explicitly out of scope here — only the
  check happens); making the repo public (stay private by default).
- **Budget impact:** none. A private repo uses the existing GitHub plan —
  verify allowance; no paid services.
- **Rollback:** everything is git history; revert the PR. Nothing external is
  created except the repository itself (deletable by the owner).
- **Restart instructions for an agent picking up mid-phase:** read
  `AGENTS.md` and `docs/roadmap.md` in the guia-la repo; list merged PRs
  matching `PR 00-*`; read `docs/evidence/HANDOFF-STATE.md`; resume at the
  lowest-numbered unfinished task in the table above; do not re-decide
  recorded decisions.

## Next phase handoff

Phase [01](phase-01.html) (legacy extraction) and the [02](phase-02.html) S1
spike may start in parallel once this phase merges. They need:

- `docs/security/APPROVAL-LIST.md` — the read-only boundaries for legacy work.
- Confirmed read-only access to `luandro/cotiju-app` and the export runbook
  stub (PR 00-10) — [legacy audit](../research/legacy-cotiju-audit.md) is the
  starting inventory.
- D-01 response (names) before Phase 02 pins any identifier.
- D-02 left `proposed` (and D-03 approved subject to S1) is fine for Phase 02's spike — the spike exists
  to produce their evidence, per [review §9](../review.md).
- The evidence template (PR 00-6) so Phase 01's extraction matrix and Phase
  02's spike report use the same PR evidence format.
- D-12 advisory (legacy key rotation) handed to the owner — an owner action
  outside the guia-la repo, flagged in [decisions.md](../decisions.md).
