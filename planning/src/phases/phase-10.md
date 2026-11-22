---
id: 10
title: Release discipline, self-service growth and agent continuity
short: Operationalize launch and rollback, monitoring and budgets, store compliance, and the runbooks and handoff test that let agents keep developing the platform without a growing team.
tag: Operate
status: draft
complexity: Medium (release-risk)
depends: 04,08,09
inspect: Release and rollback rehearsal evidence, live monitoring and freshness alerts, store listing drafts, cost report, second-agent handoff PR
exit: A rehearsed release and rollback, alerting that fires on real failures, and a different agent shipping a small widget from spec to a green PR unaided
---

## Phase identity

Phase **10** turns a working staging product into an operable platform: releases that are boring, rollbacks that are rehearsed, alerts that fire before users complain, store listings that survive review, and handoffs any competent agent can pick up.

- **Objective:** production release and rollback discipline (web first, flagship native app second); monitoring, freshness alerting and cost tracking on the real domain; SEO/deep-link completion; store compliance package; reusable runbooks and a proven agent-continuity loop.
- **Prerequisites:** Phase 04 artifact pipeline with checksums and previews; Phase 08 widget verticals with provenance; Phase 09 verified content, editorial routine and go/no-go readout.
- **Dependencies:** phases 04, 08, 09. Task 6 (submission) additionally requires the user's store accounts and D-01 identity to be settled — bundle IDs are effectively permanent after first release ([decisions.md](../decisions.md) D-01).
- **Expected contributors:** human — product owner (submits to stores, approves spend and production promotion), editor community (content), QA reviewer (release checks on real devices); agent — release tooling, monitoring wiring, compliance drafts, runbook authoring, handoff-test implementer.
- **Complexity/risks:** Medium engineering, high consequence. Dominant risks: store review outcomes (policy, not code — mitigated by the flagship distribution model D-07); production-domain surprises the staging environment cannot reveal; monitoring/tool costs that are unknown until chosen. No hour estimates.

| Phase | What it must provide before 10 starts |
| --- | --- |
| 04 | Artifact pipeline with checksums, preview and native build budgets |
| 08 | Widget verticals with provenance, offline and error behavior |
| 09 | Verified content, operating editorial routine, go/no-go readout, 301 map |

## Why this stage exists

The legacy platform died operationally, not technically: an incident nobody could diagnose because two hosts served unknown commits ([#63](https://github.com/luandro/cotiju-app/issues/63)), tides that expired silently ([#62](https://github.com/luandro/cotiju-app/issues/62)), and no privacy pages before launch ([#68](https://github.com/luandro/cotiju-app/issues/68)). Phase 10 exists so guia.la's failure modes are *known in advance and rehearsed*: which commit is live, what breaks first, who is called, how it rolls back.

It also carries the platform's actual promise — a small team plus agents that keeps shipping. The final gate is not "launched"; it is *a different agent, given only a spec, ships a small widget to a green PR*. If that fails, every runbook above it is decoration. Distribution follows the store-policy evidence: one flagship app with a destination picker (Apple 4.2.6 "picker model", 4.3(a) anti-fragmentation; Google repetitive-content guidance — [backend research §2](../research/backend-stores-starters.md)), with per-destination branding living on the web, per D-07.

## Inputs and source references

Paths in the future `guia-la` repository are **proposed**.

- Release assets (proposed): `.eas/workflows/release-*.yml` EAS build workflows — proposed names, not `eas.json` profiles (naming per [expo-stack §1.8](../research/expo-stack.md)); `docs/runbooks/release.md`, `docs/runbooks/rollback.md`, `docs/runbooks/incident.md`; `docs/ops/monitoring.md`; `docs/ops/cost-report.md` (monthly).
- Web production surface (proposed): Cloudflare Workers Static Assets deployment of the exported site (`assets.directory` per [backend research §1](../research/backend-stores-starters.md)); `public/.well-known/apple-app-site-association` and Android asset links — `public/` is copied into `dist/` by export ([expo-stack §1.3](../research/expo-stack.md)); `docs/web/legacy-redirects.md` from Phase 09 activated on the real domain.
- Store package (proposed): `docs/store/listing-*.md`, screenshot sets per device class, privacy-policy and data-safety answers (LGPD pages from Phase 09), review notes demonstrating offline tides/schedules and maps for Apple 4.2 minimum functionality.
- Monitoring surfaces: `/v1/meta/build` and freshness fields from Phase 07; editorial SLA alerts from Phase 09; uptime checks against the real domain (tool choice open — unknown).
- Authoritative references: [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (4.2, 4.2.6, 4.3); [Google Play white-label guidance](https://support.google.com/googleplay/android-developer/answer/15884185) and [repetitive-content policy](https://support.google.com/googleplay/android-developer/answer/9899034); [Expo pricing](https://expo.dev/pricing.md) and [Cloudflare pricing](https://developers.cloudflare.com/workers/platform/pricing/) as verified in research.
- Known unknowns: store review outcomes (flagship picker model is inferred-acceptable, not tested — research recommends an early TestFlight external build to probe); error-monitoring tool choice and cost (unknown — decide with a bounded evaluation); real traffic-driven tile and API costs (bounded in 08/09, confirmed here); whether Expo Update (OTA) is used at all — MAU limits apply (1k free, 3k Starter — [expo-stack §1.8](../research/expo-stack.md)) and store rules are assumed to require OTA changes to stay within review scope (unverified — confirm Apple/Google OTA policy before enabling).
- Credentials/tools: store accounts, EAS production credentials and the production domain exist only with the user — agents prepare everything around them and never hold billing.

## Task breakdown

| # | Task (goal) | Owner | PR unit | Depends on |
| --- | --- | --- | --- | --- |
| 1 | Release pipeline: tagged releases, production build profiles, artifact checksums and retention, release-notes template | agent | PR 10-1 | 04 |
| 2 | Rollback rehearsal: redeploy previous web artifact; resubmit-previous native build path; OTA rollback if enabled; evidence recorded | agent + human (approves rehearsal window) | PR 10-2 | 1 |
| 3 | Monitoring and alerting: uptime checks on the release hostname (the real domain after task-6 promotion), `/v1/meta/build` surfaced publicly, freshness and error alerts routed, weekly ops digest | agent + human (tool choice, contacts) | PR 10-3 | 09 |
| 4 | Web production surface: deploy exported site to a production-like release hostname, activate 301 map, sitemap and canonical URLs, OG assertions in the release gate, deep links both directions | agent (production-domain deploy moves to task 6) | PR 10-4 | 1, 09 |
| 5 | Store compliance package: flagship listing drafts, screenshots, privacy/data-safety answers, review notes; early TestFlight external probe | agent + human (submits probe) | PR 10-5 | 3, 4 |
| 6 | Production promotion and submission: execute the human-approved checklist; deploy to the production domain (DNS cutover), promote content from staging; submit flagship app | human (approves and submits) + agent (executes approved steps) | release event | 2, 4, 5 |
| 7 | Budget tracking: monthly cost report, 80%-of-ceiling alert against the D-08 ceiling, per-service breakdown | agent | PR 10-7 | 3 |
| 8 | Operational durability: weekly automated D1 restore drill (latest R2 export into a scratch DB; row counts + checksums) scheduled, plus one quarterly human-witnessed drill run; incident runbook; status page (proposed) | agent | PR 10-8 | 3 |
| 9 | Reusable runbooks as skills: new-widget, new-destination, QA review, schema migration, incident, release | agent | PR 10-9 | 6 |
| 10 | Agent-continuity test: a *different* agent adds a small widget from a written spec to a green PR using only repo docs | agent (fresh) + human (reviews) | PR 10-10 | 9 |
| 11 | Second-destination rehearsal: onboard a fresh destination config end-to-end using the Serra demo as data, no engine changes | agent | PR 10-11 | 9 |
| 12 | Agent evals in CI (D-15): a suite of 20–50 real tasks runs on changes to `CLAUDE.md`, `AGENTS.md`, `.claude/**` and skills, gated on pass rate; incidents become permanent evals plus lessons in `docs/lessons/` | agent | PR 10-12 | 9 |

Notes: task 6 is the only outward-facing irreversible step and is gated on the user; everything before it is rehearsal in staging or on internal tracks. Tasks 10 and 11 are the phase's real exam — they fail loudly if the runbooks from task 9 are incomplete.

## Architecture choices and guardrails

- **Deployed surface:** web = static export on Workers Static Assets (D-03) behind the production domain; API Worker versioned and deployed independently — the web shell never hard-fails because the API is down (Phase 08 error states are the contract). Native = one flagship app per D-07; no per-destination native binaries without a partner-owned store account.
- **Release identity:** every deploy stamps the git SHA into `/v1/meta/build` and the web bundle; the runbook's first diagnostic question is "what does `/v1/meta/build` say?" — the direct answer to legacy's two-hosts confusion ([#63](https://github.com/luandro/cotiju-app/issues/63)).

### Release flow (web first, native second)

1. Freeze — release branch cut; fast gate green; release notes drafted from PR evidence.
2. Build — web export and native production builds, checksums retained with artifacts.
3. Verify — release-gate script against the built artifact: OG and sitemap assertions, secret scan, sentinel checks.
4. Rehearse — rollback runbook executed against the previous artifact in the ops environment.
5. Promote — recorded human approval; deploy; `/v1/meta/build` checked against the promoted SHA.
6. Watch — one full digest cycle before store submission; submission itself is a separate human decision.

### Monitoring stack (thresholds proposed, tuned in staging)

| Signal | Source | Threshold (proposed) | Route |
| --- | --- | --- | --- |
| Uptime of the real domain | uptime checker on the home page and `/v1/meta/build` | two consecutive failures | ops digest and owner alert |
| Live-commit drift | `/v1/meta/build` versus promoted SHA | any mismatch | owner alert, visible page badge |
| Tide ingestion freshness | ingestion job last-success timestamp | older than 24 h | editor and ops alert |
| Boat schedule checked_at | freshness fields per destination | older than 7 days | editor alert |
| API error rate | Worker logs or the chosen monitoring tool | sustained 5xx rise | ops alert |
| Cost against ceiling | monthly cost report job | 80 percent of the D-08 ceiling | owner alert |

### Known cost figures (verified in research; re-check at adoption)

| Item | Figure | Source |
| --- | --- | --- |
| Workers Paid base | 5 USD per month | [backend research §1](../research/backend-stores-starters.md) |
| Expo Starter plan | 19 USD per month | [expo-stack §1.8](../research/expo-stack.md) |
| Maestro job on Workflows | 0.05 USD per job | [expo-stack §1.8](../research/expo-stack.md) |
| Android build overage | 1 USD medium, 2 USD large | [expo-stack §1.8](../research/expo-stack.md) |
| iOS build overage | 2 USD medium, 4 USD large | [expo-stack §1.8](../research/expo-stack.md) |
| R2 egress | free | [backend research §1](../research/backend-stores-starters.md) |

- **SEO completion (D-03):** `generateMetadata()` per route at export; sitemap generated from the same source; release gate asserts raw-HTML OG for a sample of every route class (the S1 assertion pattern); WhatsApp preview is a manual human check before each release. Deep links via `.well-known` files shipped from `public/`.

### Deep-link matrix (each direction proven once per release)

| Link | Direction | Expected behavior |
| --- | --- | --- |
| WhatsApp share of a place | web to web | OG card renders; opens the place page |
| Share of a place from the app | app to web | same public URL, same card |
| Place URL opened on Android with app installed | web to app | app opens on the place screen |
| Place URL opened without the app | web to web | page renders fully, store hint only if gentle |
| Legacy PT route on the production domain | old to new | 301 to the equivalent new page |

- **OTA (Expo Update):** optional, default off for v1; if enabled, OTA may ship only JS-within-reviewed-scope changes, and rollback must be rehearsed with it. Decide explicitly; do not drift into it.
- **Forbidden:** agent-driven store submission, DNS cutover, spending, or production data writes (human approval each time); OTA changes that alter app behavior beyond reviewed scope; disabling required CI checks to make a release; publishing without the rollback rehearsal having passed.
- **Security/privacy:** release bundles are secret-scanned (Phase 05 gate); privacy policy and data-safety answers must match what the app actually collects (public content, no accounts — D-13b); crash/monitoring tooling must not collect identifiers the policy denies.
- **Acceptable alternatives:** staged web rollout (deploy to a canary hostname first) over big-bang; TestFlight/Play internal tracks for the flagship before public listing; a managed monitoring service vs a Worker-based uptime checker — decide on cost and alert-routing simplicity, both currently unknown.

### Runbook and skill inventory

| Runbook or skill | Answers | First draft by |
| --- | --- | --- |
| new-widget | how a widget is scaffolded, contracted, tested and composed | agent |
| new-destination | manifest, profile, content seed, preview, launch | agent |
| qa-review | what a reviewer checks and what evidence must exist | agent with QA reviewer |
| schema-migration | additive migration, backup, restore-drill steps | agent |
| incident | detection, roles, rollback, communication | human with agent |
| release | freeze, build, verify, promote, watch | agent with human |

### Agent-continuity protocol

- Every task starts from a written spec small enough for one PR series; scope never lives only in a conversation.
- Session state lives in repo files (goal, task log, decisions); an agent's memory is a cache, not the store.
- A picking-up agent proves orientation by reproducing the fast gate locally before pushing anything.
- A read-only verifier subagent exercises changed behavior on every PR per `REVIEW.md` passes (bugs, security, compliance with spec/plan; nits capped at five); the authoring agent never approves its own PR (D-15).
- Handoff quality is measured by the task-10 exam: a fresh agent, a written spec, no coaching, a green PR — the same bar the planning packet set for itself.

> [!DECISION] D-07 (one flagship app) is `proposed` but strongly evidence-backed; the TestFlight probe in task 5 is its live test. D-08 (budget ceiling) becomes enforced, not advisory, in task 7. Neither becomes `approved` without the user.

## Deliverables

- [ ] `docs/runbooks/{release,rollback,incident}.md` — each rehearsed at least once with linked evidence
- [ ] Production web surface live on the real domain with sitemap, canonicals, 301 map active and OG assertions in the release gate
- [ ] Monitoring wired: uptime checks, `/v1/meta/build` public, freshness and error alerts test-fired, weekly digest
- [ ] Store package: listing drafts, screenshots, privacy/data-safety answers, review notes, TestFlight probe result
- [ ] Executed production-promotion checklist (human-approved) and, if the user proceeds, submitted flagship app
- [ ] `docs/ops/cost-report.md` (first month) with the 80% alert active
- [ ] Weekly automated restore drill scheduled (latest R2 export into a scratch D1) and the first quarterly human-witnessed drill executed with a written result
- [ ] Runbook/skill set: new-widget, new-destination, QA review, schema migration, incident, release
- [ ] Agent-continuity test PR by a different agent, merged green with standard evidence
- [ ] Agent evals in CI (D-15): 20–50 real tasks gated on pass rate, running on `CLAUDE.md`/`AGENTS.md`/`.claude/**`/skills changes; at least one incident-to-eval case recorded with its lesson in `docs/lessons/`
- [ ] Second-destination rehearsal report (config-only onboarding, zero engine changes)

## Visual and functional QA

Human and agent journeys on the *production* domain and release candidates:

1. **Release rehearsal:** run the release runbook end-to-end in staging-for-production; verify `/v1/meta/build` matches the promoted SHA; verify a place page's raw HTML (view-source) carries title, description and OG tags with no JS executed.
2. **Rollback rehearsal:** deploy the previous artifact; confirm the site serves the prior version within minutes and `/v1/meta/build` reports the old SHA; document the native path (previous build resubmission) even if not executed on a live listing.
3. **Monitoring truth test:** deliberately expire a tide dataset in the ops environment; confirm the freshness alert fires and the status page reflects it; confirm uptime checks catch a stopped Worker.
4. **Real-device release checks:** low-end Android on 3G (Phase 09 device), iPhone spot check; install the release candidate; verify deep link from a WhatsApp share opens the right place screen; verify offline first-run degrades honestly.
5. **Store-readiness review:** a human who has not seen the app reads only the listing and review notes, then attempts the core journeys unaided; gaps found become listing or onboarding fixes.
6. **Agent handoff exam:** the second agent receives a small widget spec and nothing else; their PR must pass the full gate (types, tests, exclusion assertions, stories, evidence) without orchestrator intervention.

| Check | Web (production) | Android (RC/device) | iOS (RC/simulator) |
| --- | --- | --- | --- |
| OG/raw-HTML assertions | required | n/a | n/a |
| Deep link in from share | required | required | required |
| Offline first-run honesty | required | required | required |
| Release install path | n/a | required | required if submitting |

Expected artifacts: rehearsal recordings/logs, alert screenshots, view-source dumps attached to the release gate, the second agent's PR with its evidence package, and the store package as reviewable files.

### Store package contents

- Listing copy per locale (pt-BR first): name, subtitle, description, keywords — no unverifiable claims, no "best island guide" puffery a reviewer cannot check.
- Screenshots per required device class, generated from real release-candidate screens, not design mocks.
- Privacy and data-safety answers that match actual behavior: public content, no accounts (D-13b), no tracking beyond aggregate, error-free consent language.
- Review notes for Apple 4.2 minimum functionality: what works offline (schedules, tides, cached places), what is native (maps, deep links), and demo credentials if any gated surface existed (none planned).
- The TestFlight probe result and, if a rejection arrives, the appeal or fix plan — recorded as an incident, not a surprise.
- Reserve listing: what changes if the reviewer asks for differentiation (destination picker positioning, per-destination content depth).

## Automated verification

Nothing below has been run. Commands marked **validated** exist as verified in research; the rest are **proposed** until a PR or release gate links real output.

| Command | Purpose | Status |
| --- | --- | --- |
| `npx expo export -p web -s external` | release web export with source maps for the secret/OG gate | validated (flag verified, [expo-stack §1.9](../research/expo-stack.md)) |
| `node tools/release-gate.mjs dist/` | sitemap present, OG asserted per route class, sentinel greps, secret scan | proposed |
| `pnpm playwright test e2e/release/ --project=chromium --project=webkit` | release journeys incl. JS-disabled OG and 301 spot checks | proposed |
| `pnpm exec maestro test .maestro/release.yaml` | release-candidate native smoke on both platforms | proposed |
| `eas build --profile production --platform all` | production native builds (credentials and spend are human-gated) | proposed |
| `node scripts/restore-drill.mjs --target scratch` | restore drill: latest R2 backup into a scratch D1, compare row counts/checksums (as Phase 07) — Time Travel restores in place only and is never used as a drill | proposed |
| `node tools/prod-parity.mjs https://<domain>` | production parity: `/v1/meta/build` SHA equals promoted SHA, uptime endpoints 200 | proposed |

Deliberate-failure demonstrations for this phase: the monitoring truth test (task 3) and the rollback rehearsal (task 2) are mandatory red drills — a release gate that has never seen a failure is untested. Both produce attached evidence, not claims.

## Acceptance gate

> [!GATE] Phase 10 passes only with linked evidence. Launch without rehearsal evidence is a process failure even if nothing breaks.

- [ ] Release runbook executed end-to-end once; `/v1/meta/build` matches the promoted SHA on the real domain
- [ ] Rollback rehearsal passed with recorded timing; native rollback path documented
- [ ] Monitoring live: uptime, freshness and error alerts each test-fired; weekly digest delivered once
- [ ] OG/raw-HTML assertions and sitemap checks green in the release gate; WhatsApp preview manually verified
- [ ] 301 map active on the production domain and spot-checked
- [ ] Store package complete; TestFlight probe outcome recorded; submission (if made) is demonstrably user-approved
- [ ] First cost report published; 80%-of-ceiling alert active; spend within the D-08 ceiling
- [ ] Restore drill executed against a scratch D1 DB with a written result (no virtual tables in the primary DB — R12)
- [ ] A different agent shipped the handoff-test widget PR through the full gate unaided
- [ ] Agent evals green in CI on an instruction/skill change; the verifier subagent and REVIEW.md passes are exercised on the gate PR (D-15)
- [ ] Second-destination rehearsal completed with configuration changes only

**Blocks progression if:** rollback is unrehearsed; monitoring alerts do not fire on real failures; the release gate can be bypassed; the handoff test fails twice (runbooks are the defect, not the agent); budget exceeds the ceiling without a user decision.

### Pre-promotion checklist (the human-approved gate itself)

1. Content: Phase 09 readout is go; no blocking field defects open.
2. Web: release gate green against the production-like release hostname; rollback rehearsed within the last cycle.
3. Native: release-candidate install checked on the real devices available.
4. Compliance: privacy pages live; data-safety answers match behavior; review notes ready.
5. Budget: current spend and projection inside the ceiling, alert verified.
6. People: owner available during the promotion window; incident runbook contacts current.

## Risks, rollback and handoff

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Store rejection on policy grounds | medium | high | flagship picker model (D-07); early TestFlight probe; review notes demonstrating native value; partner-app path only with partner-owned accounts |
| SEO regression vs staging (domain, headers, caching) | medium | medium | release-gate assertions run against the production domain, not just dist |
| Monitoring tool cost or lock-in surprises | medium | low | bounded evaluation; Worker-based checker as the fallback |
| OTA misuse shipping unreviewed behavior | low | high | OTA off by default; explicit decision; rollback rehearsed if enabled |
| Launch incident with no diagnosis path | low | high | `/v1/meta/build`, single host, rehearsal, incident runbook with owner contacts |
| Cost drift past ceiling (tiles, builds, jobs) | medium | medium | 80% alert, monthly report, D-08 enforcement; overage rates known ([expo-stack §1.8](../research/expo-stack.md)) |

Sensitive operations requiring human approval: store submission and any listing change; DNS cutover; production data promotion; spending or plan changes; enabling OTA; emergency rollback of a live listing.

Budget impact: this phase *is* the budget phase — D-08 keeps everything on free tiers today; any upgrade (Workers Paid $5/mo, Expo Starter $19/mo when native CI runs) is a new owner decision. Reference prices: Maestro $0.05/job, build overages $1–4/build, tile costs as measured in Phase 08 (all per [research](../research/backend-stores-starters.md), [expo-stack §1.8](../research/expo-stack.md)). Everything must fit the user-set ceiling with alerting at 80%.

Rollback: web = redeploy previous artifact (minutes, rehearsed); API = previous Worker version; content = Phase 09 reverse-mapping plus D1 Time Travel (in-place, 30-day window); native = previous build resubmission plus OTA-within-scope if enabled. The rollback runbook names the owner, the order and the evidence to capture.

Restart instructions for an agent picking this phase up mid-flight: read `AGENTS.md`, this page and [../prompts/phase-10-agent.md](../prompts/phase-10-agent.md); check `/v1/meta/build` on the production domain and the latest cost report before touching anything; never execute a production deploy, submission or rollback without the recorded human approval; if monitoring is silent, treat that as an incident, not a relief.

## Next phase handoff

There is no Phase 11; the handoff is to steady-state operations:

- The runbook and skill set from task 9 is the operating system for everything after launch: new widgets, new destinations, migrations, incidents, releases.
- The first real second destination (post-Serra rehearsal) is onboarded by configuration using the new-destination runbook, with the Serra rehearsal report as the worked example.
- Feedback loops: store reviews, field corrections (Phase 09 routine) and the weekly ops digest feed the backlog; the agent-continuity protocol (state files, PR evidence template, handoff test) governs how agents pick work up.
- Planning-packet maintenance: [decisions.md](../decisions.md) statuses are updated as evidence lands (D-03, D-05, D-07, D-08 gain real outcomes); [review.md](../review.md) assumptions are revisited at each SDK bump — expect SDK 59 around Q1 2027 with RN 0.89 dropping the deep-import opt-out ([expo-stack §2](../research/expo-stack.md)).
- Records for whoever operates next: release history with SHAs, cost reports, restore-drill results, incident log, and the standing rule that nothing is "done" without linked evidence.

### Steady-state cadence (what "done" looks like from here)

- Weekly: ops digest reviewed (including the automated restore-drill result); corrections triaged; one real-device spot check.
- Monthly: cost report against ceiling; dependency and SDK watch (next bump expected around Q1 2027); flaky-test review; `REVIEW.md` tuning and agent-eval pass-rate review (D-15).
- Quarterly: human-witnessed restore drill; freshness SLA review with editors; runbook corrections from actual incidents.
- Per destination: onboarding via the new-destination runbook, with the Serra rehearsal report as the worked example — engineering involvement is a bug report, not a requirement.
