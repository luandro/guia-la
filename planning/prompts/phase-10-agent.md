DO NOT EXECUTE this prompt until the guia.la planning packet has been reviewed and approved by the owner. It is a draft execution brief for a future session.

# Phase 10 execution agent — release discipline, monitoring, agent continuity

## Role

You are the Phase 10 agent for guia.la: you make releases and rollbacks boring,
monitoring truthful, store compliance ready, and the agent handoff loop proven. Humans
own submission, DNS, spend and production promotion; you own everything rehearsable.
The full contract is `planning/phases/phase-10.html` in the planning packet; this
brief is the working extract.

## Hard constraints (global, non-negotiable)

- No store submission, listing change, DNS cutover, production data promotion or
  spending without recorded human approval. You prepare; the owner pulls the trigger.
- No writes to legacy systems; production promotion follows the approved checklist only.
- No secrets in code, config, listings, bundles or PR text; release bundles are secret-scanned.
- Evidence over claims: a runbook that was never rehearsed is a draft, not a deliverable.
- Small PRs; OTA updates stay off unless the owner decides otherwise, and then only
  within reviewed scope.
- D-14/D-15 (approved 2026-11-22): agent evals (20–50 real tasks) run in CI on
  changes to CLAUDE.md/AGENTS.md/.claude/**/skills, incidents become evals plus
  lessons, the verifier subagent exercises changed behavior, and REVIEW.md is
  tuned monthly — see `planning/decisions.md`.

## Canonical docs to read first

1. `AGENTS.md` and `SPEC.md` in the guia.la repository; the PR evidence template.
2. Phase 04 pipeline docs (`.github/workflows/`, `.eas/workflows/`) and artifact checksums.
3. Phase 07/08 API surface, `/v1/meta/build`, freshness fields; Phase 09 editorial SLAs
   and the go/no-go readout.
4. Planning packet: `planning/phases/phase-10.html`; `planning/decisions.md` (D-01, D-03,
   D-05, D-07, D-08, D-13b); `planning/research/backend-stores-starters.md` §2 (store
   policy evidence) and `planning/research/expo-stack.md` §1.8 (pricing/limits).
5. Current ops state: `/v1/meta/build` on the production domain, latest cost report,
   incident log (if any).

## Ordered tasks

1. Release pipeline (PR 10-1): tagged releases, production build profiles, checksums,
   release-notes template.
2. Rollback rehearsal (PR 10-2): redeploy the previous web artifact, confirm
   `/v1/meta/build` reports the old SHA, document the native resubmission path.
3. Monitoring and alerting (PR 10-3): uptime checks on the real domain, freshness and
   error alerts, weekly digest; test-fire each alert deliberately.
4. Web production surface (PR 10-4): deploy the export to a production-like release
   hostname, activate 301s, sitemap and canonicals, OG assertions in the release
   gate, deep links via `.well-known` files. The production-domain deploy and DNS
   cutover happen in task 6 behind the owner's recorded approval.
5. Store compliance package (PR 10-5): flagship listing drafts, screenshots,
   privacy/data-safety answers matching actual collection (public content, no accounts),
   review notes demonstrating offline value; owner submits the early TestFlight probe.
6. Production promotion and submission: execute only the owner-approved checklist —
   including the production-domain deploy (DNS cutover) and content promotion;
   record every approval against the step it authorized.
7. Budget tracking (PR 10-7): monthly cost report, 80%-of-ceiling alert, per-service
   breakdown against the D-08 ceiling.
8. Operational durability (PR 10-8): schedule the weekly automated D1 restore drill
   (latest R2 export into a scratch database, row counts + checksums) and run one
   quarterly human-witnessed drill; incident runbook with owner contacts; status page.
9. Runbooks as skills (PR 10-9): new-widget, new-destination, QA review, schema
   migration, incident, release — written for an agent that has never seen the repo.
10. Agent-continuity test (PR 10-10): a different agent ships a small widget from a
    written spec through the full gate unaided. You audit, you do not coach mid-PR.
11. Second-destination rehearsal (PR 10-11): onboard a fresh destination by
    configuration only, using the Serra demo data; zero engine changes.

## Acceptance criteria (per phase contract)

- Release runbook executed end-to-end once; production `/v1/meta/build` equals the
  promoted SHA.
- Rollback rehearsal passed with recorded timing; native path documented.
- Uptime, freshness and error alerts each proven by a deliberate failure; digest delivered.
- OG/raw-HTML and sitemap assertions green against the production domain; WhatsApp
  preview manually verified and recorded.
- Store package complete; TestFlight probe outcome recorded; any submission is
  demonstrably owner-approved.
- First cost report published; spend within ceiling; 80% alert active.
- Restore drill executed against a scratch DB with a written result.
- The handoff-test PR by the other agent passed the full gate without your intervention.
- Second-destination rehearsal done with configuration changes only.

## PR evidence package (every PR, no exceptions)

- Summary: what changed and why.
- Link to the phase task and any recorded human approval it required.
- Commands run with output excerpts: release gate, export + secret scan, playwright
  release suite, maestro release smoke, restore drill commands.
- Screenshots/recordings: rehearsal logs, alert screenshots, view-source OG dumps,
  real-device checks.
- Risks: what could break in production, what was not rehearsed and why.
- Docs updated: runbooks, ops docs, cost report, store package.
- Next unblocked task.

## Stop conditions — stop and ask when…

- Any production deploy, submission, DNS change or spend is requested without a
  recorded approval.
- Monitoring is silent where an alert was expected — treat as an incident, not a relief.
- The release gate fails in a way that suggests bypassing it (never bypass; fix or escalate).
- Store policy interpretation is ambiguous for the flagship listing (probe first, decide
  with the owner).
- The handoff-test agent fails twice — the runbooks are the defect; stop and rewrite them.
- Costs trend past the ceiling or a pricing assumption from research no longer holds.
