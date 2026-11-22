# guia.la — architecture review and phase-playbook generator

> **Intended use:** Paste this prompt into the coding agent, and provide `guia-la-master-plan.html` alongside it (or save both in the agent's working repository). This prompt authorizes **research, critique, and planning artifacts only**. It does not authorize application implementation, editing the original Cotiju deployment, production data migration, infrastructure purchase, store publication, or releasing software.
>
> **Date of planning baseline:** 2026-11-21. Verify current versions, SDK compatibility, costs, tool capabilities, and GitHub issue/PR status before relying on them.

## Your role

You are the principal software architect, senior React Native/Expo engineer, QA lead, and agentic-delivery systems designer for **guia.la**. You are here to **critique** our initial plan and then translate it into a sequence of exceptionally clear, visually reviewable, independently executable phase plans.

You should be skeptical, pragmatic, and evidence-oriented. We optimize for a **very small team**, with coding agents performing most of the implementation and humans spending more time on community relationships, destination onboarding, content, and marketing. You should challenge unnecessary features, dependencies, frameworks, layers of indirection, and work that makes future autonomy harder.

Do **not** take the master plan as unquestionable truth. Label assumptions, verify technical claims, compare alternatives when consequential, and recommend changes with evidence. **However, do not silently overwrite the user's architectural decisions.** Separate (a) accepted goals, (b) current recommendations, and (c) unresolved decisions.

## Required input

1. Read the **entire** attached `guia-la-master-plan.html`, including every expandable phase. Treat it as the current project charter and phase outline.
2. If access is available, inspect the current private reference repository: **https://github.com/luandro/cotiju-app**. Use **read-only** operations. Review recent architecture work and defects, not just the README:
   - Architecture proposal: https://github.com/luandro/cotiju-app/issues/71
   - Incident: https://github.com/luandro/cotiju-app/issues/63
   - Data and public visibility: https://github.com/luandro/cotiju-app/issues/59
   - Loading reliability: https://github.com/luandro/cotiju-app/issues/60
   - Tide data: https://github.com/luandro/cotiju-app/issues/62
   - Boat schedule validity: https://github.com/luandro/cotiju-app/issues/64
   - Cache/privacy investigation: https://github.com/luandro/cotiju-app/issues/65
   - Prior D1 migration research (closed without merging at planning time): https://github.com/luandro/cotiju-app/pull/39
   - Previous frontend/QA updates: https://github.com/luandro/cotiju-app/pull/52
   - Other issues #57–#70 as applicable.
3. Read current primary documentation and check active maintenance of any selected dependencies, especially:
   - https://docs.expo.dev/ (Expo SDK, Router web rendering, React Native Web, Expo Modules, native build requirements, EAS Workflows)
   - https://storybook.js.org/docs/get-started/frameworks/react-native
   - https://developers.cloudflare.com/workers/ , D1, R2 and service limits
   - https://github.com/infinitered/ignite
   - https://github.com/obytes/react-native-template-obytes
   - https://github.com/t3-oss/create-t3-turbo
   - https://developer.apple.com/app-store/review/guidelines/
   - https://support.google.com/googleplay/android-developer/answer/15884185
4. If code, git history, live services, documentation, native build credentials or browsing are unavailable, **say so** and mark the finding **unverified**. Do not invent repository state, benchmark measurements, tests or costs.

## Product goals — mandatory constraints

**Brand and naming (locked for this planning pass):** The new platform is named **guia.la**, and `guia.la` is the intended domain, **not yet verified as registered or configured**. `Cotijuba` is the first destination configuration. `Cotiju` / `cotiju-app` denote only the existing, private, legacy application and repository. Do not rename historical GitHub URLs, issues, or legacy code references to guia.la. Do not label the new platform `Cotiju v2`. For any newly generated file, code identifier, package scope, app ID or repository name, propose consistent, valid naming (e.g., `guia-la` for a slug), but **do not assume availability or ownership**.

**What we are building:** a sustainable **white-label, multi-destination platform** for tourism and practical local services. Cotijuba, Pará, is the first real destination. Different destinations enable different feature modules:

- Cotijuba: places and beaches, boat schedules, tides, moto-taxis, lodging, restaurants and local services.
- Mountain destination example: waterfalls, trails/GPX, guides, local transport, attractions and services.
- Future destinations must be independently branded and configured without copying the application.

**Distribution:** native Android and iOS applications are intended to be flagship experiences, while the web must be fast, shareable, search-engine-friendly and useful without installation. Favor one multi-destination flagship mobile application plus destination-specific websites by default. Independently branded native apps are optional, subject to actual app-store compliance and meaningful differentiation.

**Widgets:** each independently maintainable feature module has stable typed contracts, optional cards/screens, routing entries, configuration schema, UI stories, tests, API interfaces, permissions, data freshness and offline semantics. Do not equate a "widget" with a single card. Prefer configurable shared domains—for example, `places` covers both beaches and waterfalls—over copy-paste feature packages.

**Two levels of feature selection:**

- **Build-time inclusion** MUST actually exclude disabled widgets from destination-specific JavaScript bundles, routes and, when applicable, native dependencies and permissions. A generated explicit static import registry is one candidate approach. Verify the bundle and native artifact, not just whether the feature is hidden.
- **Runtime flags** may show/hide/reorder only widgets compiled into that app. The multi-destination flagship necessarily contains the **union** of its supported destinations' features; destination-specific builds can exclude more.

**Cost and sustainability:** choose the smallest architecture that reliably serves the product. The current default candidate is official stable Expo + React Native + React Native Web + Expo Router + TypeScript, with platform-specific components where necessary; Cloudflare Workers/Hono + D1/Drizzle + R2 for a lean backend. This is a **hypothesis to test**, especially web SEO/OG, maps, offline, native modules, D1 authorization and backups. Do not add Next.js, another routing layer, a microservice fleet, a marketplace or a complex auth system without evidence.

**Why guia.la begins with a clean foundation:** The original Cotiju app is a useful proof of concept and research archive, but accumulated coupling to Supabase-specific services/auth/realtime, overlapping caches, large migrations, incomplete features, stale fallback data and historical reliability issues. We are **not** discarding real content or validated business rules; we are avoiding accidental complexity.

**Human and agent QA at every phase:** every stage must end with something inspectable (interactive HTML, Storybook, web preview, screenshot, native simulator recording, API sandbox, test report, migration matrix, etc.). An agent must provide independent evidence of functionality and failure handling, not merely claim that tasks were completed.

**Autonomy:** agents should work autonomously on bounded implementation tasks, with predictable checkpoint/handoff state, failure diagnosis, CI retries and PR evidence. Require explicit human approval for destructive production actions, credentials/permissions, privacy/security boundary changes, app-store publication and spending.

## Primary objective for this invocation

Produce a critical review and a **planning packet of HTML phase playbooks**, not the actual application. Treat this as the first planning iteration we will review before engineering begins.

### Step A — independently review the master plan

Produce `planning/review.md` with:

1. **Executive assessment:** Is the architecture sustainable for 2–3 years with a small, agent-led engineering team? Name the highest-risk assumptions and alternatives.
2. **Red-team table:** severity, claim/assumption, risk, supporting evidence/source, recommended change, and whether the user must decide.
3. **Dependency and compatibility check:** Expo SDK and React Native Web, Expo Router rendering/SSR/static, Storybook integration, maps web/native, TypeScript tools, native build CI and Cloudflare deployment. Use version numbers only if verified. Note incompatibilities, version pinning and deprecation risks.
4. **Build-time widget exclusion design:** import graph/code splitting, generated route registry, Expo autolinking/config plugins, optional native dependencies, native permissions, flagship union versus destination-specific bundles, and automated negative assertions.
5. **Testing strategy and cost:** web Playwright, Storybook/visual snapshots, Android/iOS cloud CI, Maestro or alternative, real-device exceptions, CI resource budget, test reliability and credentials. Distinguish every-PR from release-candidate gates.
6. **Legacy extraction risks:** relevant v1 entities, actual production content/data uncertainty, safe backups, access to private repo, privacy and media licensing, test fixture extraction, avoiding reuse of old backend complexity.
7. **Alternatives worth a short spike:** official Expo starter vs Obytes/Ignite, Expo universal web vs thin separate SEO web surface, Cloudflare D1 vs a hosted PostgreSQL option, React Native vs separate native only if justified.
8. **Proposed edits to roadmap:** reorder, split, merge or remove phases only with clear rationale; otherwise retain the existing 00–10 numbering.
9. **Open decisions:** compact ranked list of decisions to resolve before engineering, with a recommendation and evidence required.
10. **A final recommendation:** proceed / revise / stop, with explicit confidence and unknowns.

Clearly separate **confirmed evidence**, **reasonable engineering inference**, and **hypotheses requiring a spike**. Link all important external sources and internal file/commit references accessible to you.

### Step B — generate the HTML phase playbooks

Unless the audit uncovers a fundamental blocker that genuinely prevents planning, proceed to produce a complete **initial draft for each phase 00–10**. Incorporate strong recommendations from your review as **proposals**, without pretending unresolved decisions were approved.

Create this structure (or a clearly justified equivalent):

```text
planning/
  index.html
  review.md
  decisions.md
  traceability.md
  phases/
    phase-00.html
    phase-01.html
    phase-02.html
    phase-03.html
    phase-04.html
    phase-05.html
    phase-06.html
    phase-07.html
    phase-08.html
    phase-09.html
    phase-10.html
  prompts/
    phase-00-agent.md
    phase-01-agent.md
    phase-02-agent.md
    phase-03-agent.md
    phase-04-agent.md
    phase-05-agent.md
    phase-06-agent.md
    phase-07-agent.md
    phase-08-agent.md
    phase-09-agent.md
    phase-10-agent.md
```

Optionally create **planning-only drafts** for `AGENTS.md`, `SPEC.md`, architectural decision records and reusable skills in a dedicated `planning/drafts/` folder. Do not overwrite existing project instructions without human authorization.

The **HTML files are reviewable project playbooks**, not placeholders or slide decks. They should each be complete, self-contained HTML with embedded CSS, keyboard-accessible navigation, mobile responsiveness, print support, and no required external scripts/CDNs or third-party services to display. Use a consistent visual design based on the supplied master HTML: warm off-white background, deep teal, lime accent, thoughtful typography, clear hierarchy, compact but complete technical tables. Avoid generic "AI dashboard" visual clutter.

The `planning/index.html` must link all phases and show dependencies, what reviewers can inspect, exit criteria, current draft status, and open architectural decisions. All generated planning HTML should clearly use **guia.la** as the platform name and **Cotijuba** only as the pilot destination; legacy links and migration references retain **Cotiju** where historically accurate. Links must work as relative local file paths.

### Required contents of **every** phase HTML

1. **Phase identity:** title, number, objective, prerequisites, dependencies, expected contributors and estimated complexity/risks (not fabricated hours).
2. **Why this stage exists:** connection to platform and business goals, especially reduced maintenance for an agent-led team.
3. **Inputs and source references:** exact code/doc paths to inspect, authoritative documentation, known unknowns, and any expected credentials or external tools.
4. **Detailed implementation task breakdown:** numbered, bounded tasks with order, clear ownership boundaries and suggested independently reviewable PR units. Avoid dumping everything into one huge coding-agent prompt.
5. **Architecture choices and guardrails:** likely code locations, interfaces/contracts, expected patterns, things forbidden, security/privacy implications and acceptable alternatives.
6. **Concrete deliverables:** exact filenames or artifact types, build outputs and documentation updates expected by completion.
7. **Visual/functional QA:** specific manual journeys for the human and agent, preview URLs or generated link patterns only if actually supported, screenshots/recordings/stories expected, platform matrix and error states.
8. **Automated verification:** commands when known and validated; otherwise proposed commands clearly marked. Include deterministic fixtures, positive/negative tests and failure demonstrations when useful.
9. **Acceptance gate:** observable, measurable pass/fail checks; explicitly state what would block progression.
10. **Known risks and rollback/handoff:** dependencies on other phases, sensitive operations requiring review, budget impacts, limitations and reproducible restart instructions.
11. **Next phase handoff:** exact records, links, checks and decisions the next agent needs.
12. **Agent execution prompt:** a concise, copyable command section in the HTML pointing to the accompanying `planning/prompts/phase-XX-agent.md` source file.

The per-phase Markdown prompts should be **execution briefs for future agents**, tailored to the exact phase. They must repeat only essential global constraints, point to canonical docs, contain concrete ordered tasks and acceptance criteria, tell agents to inspect and use tools rather than invent success, and specify the PR evidence package. They must **not** execute immediately in this planning invocation.

### Phase sequence (baseline)

- **00:** Charter, architecture review, working agreement, AGENTS.md/SPEC.md/ADR and operating rules.
- **01:** Read-only extraction from the original Cotiju app: schemas, widgets, tests, trusted data, assets, business rules, privacy, migration plan. This phase is mandatory and early.
- **02:** Universal Expo/React Native Web/Expo Router monorepo, pinned versions, basic web/native demo.
- **03:** React Native Storybook, visual primitives, destination themes, accessibility, cross-platform stories.
- **04:** GitHub CI, web preview deployment, EAS Android/iOS builds, artifacts, simulator strategy, cost controls.
- **05:** Regression test gates, Playwright, Maestro, unit/integration, visual/accessibility/security, red/green examples.
- **06:** Typed widget architecture, generated build-time imports/routes and native exclusion, two destination builds.
- **07:** Small Cloudflare API, D1/R2, tenancy isolation, basic CMS, auth for editors, backups and data provenance.
- **08:** End-to-end reference widgets (places/map, transport, tide/weather, services, trails/guides demo) with reliable offline/error/freshness behavior.
- **09:** Approved selective import of real Cotijuba data, local field QA, verified content operations and beta pilot.
- **10:** Production release/rollback, SEO/OG and store compliance, monitoring, cost tracking, repeatable agent handoffs and destination onboarding.

If a stage is too large to be reviewable, **split its implementation into multiple small PR-level substeps within that phase** rather than silently weakening its gate. Recommend phase order changes in `planning/review.md` and `planning/decisions.md`; maintain the stated phase identifiers unless approved otherwise.

### Traceability file

In `planning/traceability.md` provide a matrix linking:

- Core requirement → phase(s) → owner/widget or subsystem → test(s) → evidence artifact → current status.
- At minimum: web+Android+iOS, accessible UI, native maps, real SEO social previews, strict per-build widget exclusion, runtime flags, multi-tenant isolation, public/no-login browsing, offline, data freshness and timezone correctness, preservation of the original Cotiju application, backend backup/restore, reliable error states, releases, agent continuation.
- Every blocker must have an explicit status. Do not mark anything as passing if no tool has run it.

### Decisions file

In `planning/decisions.md`, maintain lightweight ADR candidates with `proposed`, `validated`, `approved`, or `rejected` status. Include rationale, alternatives, technical evidence and reversal cost. Never label a proposal `approved` without an explicit user decision or existing project record supporting it.

## Quality standard and failure handling

- **Specificity:** tasks should be executable by a competent coding agent without repeated clarification, while preserving human approval boundaries.
- **No speculative test results:** planning documents may define expected output; they may not say a test passed unless it actually ran. If cloud builds need credentials or payment, mark the gate blocked/pending and provide the exact setup requirement.
- **Small surface area:** do not add components, services or dependencies just because Ignite or Obytes contains them. Select only what solves a documented need.
- **No destructive production actions:** do not migrate or seed live data, alter old repo code, change DNS, deploy public production, purchase infrastructure or publish store apps.
- **No credential disclosure:** never include keys or tokens in HTML, generated PR descriptions or previews.
- **Data rights:** do not treat user-uploaded photos, phone numbers or private records as automatically transferable or openly licensable.
- **No claims of native test completeness without devices:** cloud simulators are useful but not a replacement for all physical-device checks.
- **Review current guidelines:** Apple and Google limit near-duplicate white-label listings. Recommend the shared flagship app by default and destination-specific web profiles.
- **Keep the plan implementable:** if Expo Router's web SEO, RN Storybook on web, D1 backup/restore, EAS cloud testing, or native code exclusion cannot be demonstrated, create an explicit decision gate and fallback. Do not paper over incompatibilities.
- **Use implementation proof:** outputs must include artifacts that can be opened, clicked, run or independently inspected; a checklist with no evidence is not an acceptance gate.
- **No new platform framework from scratch unless necessary:** prefer established Expo, Cloudflare, Storybook and test tooling, with only a small widget composer custom-built.

## Completion message to the user

At the end of this planning pass, report concisely:

1. Top 5 architecture criticisms/findings (including any issues in the master plan).
2. Which decisions require human approval versus which are safe defaults.
3. The files created, with usable local/repository links.
4. The phase sequence and the very first execution step once plans are approved.
5. Any files/services you could not inspect; explicitly distinguish proposed test plans from actual test evidence.

**Do not start Phase 02 application scaffolding until the user approves the planning output and asks to proceed.** The intended handoff sequence is: read the master plan → independently critique it → generate the per-phase reviewable playbooks and execution prompts → stop for review.
