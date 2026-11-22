# guia.la — agent operating rules (draft)

> **DRAFT — not in force until approved in Phase 00.** Feedstock for the future
> guia.la application repository's `AGENTS.md`. Derived from master plan v0.2 §07
> (agent operating model), [review.md](../review.md), [decisions.md](../decisions.md).

## Source-of-truth files

Order of authority when documents disagree (plan §07); keep them consistent, link
instead of duplicating. HTML plan files are presentations; Markdown/JSON are the
maintainable machine-readable sources.

1. `SPEC.md` — platform contract: goals, non-goals, glossary, widget contract,
   destination manifest, API principles, timezone/offline rules, quality gates.
2. `AGENTS.md` — this file: how agents work in the guia.la repo.
3. `docs/adr/` — decision records. `planning/drafts/adr/0000-template.md` is the
   format; `planning/decisions.md` is the pre-repo decision register.
4. `docs/architecture/`, `docs/roadmap/` — architecture notes and phase playbooks.
5. Widget contracts: `packages/widgets/*/` and `@guia-la/widget-sdk` types.

## Where to work: one task, one branch (optionally a worktree)

- One task = one branch `task/<slug>` off current `main`. For isolation, or when
  a task would conflict with other in-flight work, use a git worktree under
  `.worktrees/<task-slug>`. `.worktrees/` is gitignored. Never commit it.
- One task per branch; merge back through a PR; remove the worktree after merge.
- Small PRs: one behavior per PR, aim ≤ 400 changed lines, never mix refactors
  with behavior changes; split by widget or package when larger.
- Do not commit `.worktrees/`, `.state/`, `.env*`, or generated files
  (`generated/registry.ts`, route stubs) — regenerated in CI.

## PR evidence package

Every PR carries an evidence package so a reviewer can re-check the claims:

- **Summary** — what changed and why, linked to the task and any D-xx decision.
  Label every claim [C]/[I]/[S] (confirmed / inference / spike) as review.md
  does; nothing is "done" or "passes" without command + output — a "pass"
  written in a playbook is a planned check, not a result.
- **Commands + output** — exact commands and output (or failure) for every
  build/test matrix section the diff touches.
- **Screenshots/stories** — Storybook stories for UI changes; raw-HTML
  (JS-disabled) assertions when touching SEO/OG or share pages.
- **Risks** — what could break, what is untested, including real-device cases
  CI cannot cover (GPS accuracy, offline packs, share sheets/WhatsApp
  previews, low-memory devices — always manual at RC, review.md §5).
- **Docs** — files updated; "no docs affected" is a claim to verify.
- **D-xx** — decisions touched, with their current status from decisions.md.
- **Next task** — next unblocked task, so the reviewer can order the queue.

## Autonomous by default

- Read SPEC/AGENTS/ADR/roadmap and previous work state before picking work.
- Pick/plan a bounded task with explicit acceptance criteria and dependency
  check; if not bounded, split it or stop and ask.
- Implement on a branch, add tests/stories, create a preview.
- Run the affected build/test matrix, inspect screenshots/logs, self-correct a
  bounded number of times.
- Flaky-test protocol: quarantine label + linked issue + 7-day expiry; never
  delete or skip a failing test without human approval (charter rule).
- Publish a PR with the evidence package.

## Stop and ask (human approval required)

Stop and ask the user before any of these:
- Production data migration, deletion, or modifying existing user records.
- Secrets, cloud credentials, permission escalation, security policy relaxation.
- Changes to tenancy/auth boundaries, privacy policy, licensing (D-11).
- Store publication, billing changes, paid services, public domain cutover.
- Disabling required checks, removing tests, declaring an unverified feature
  production-ready.
- D-12 legacy key rotation: never attempted by an agent; owner action only.
- Legacy (Cotiju) production export is owner-run and read-only; agents never
  hold the Supabase service key.
- How to ask: stop work past the gate, write the question in the PR or task
  tracker with options + recommended default, link spike evidence, and wait.
  State blockers instead of fabricating findings (plan §09).

## Data rules: tenant scope, secrets, production

- Every DB query goes through one tenant-scoped repository layer that requires
  `destinationId` (review.md R4). Lint rule banning raw D1 access outside it.
- Tenancy is checked server-side on every write; client checks are UX only.
  Tenant A/B isolation tests in every API PR (D1 has no RLS).
- No secrets in client bundles; upstream HTTP calls run server-side (R5); CI
  secret scan (gitleaks + built-bundle grep); treat every legacy Cotiju `.env`
  or key as compromised — never copy it into guia.la.
- No virtual tables (FTS5/R*Tree) in the primary D1 DB (R12): they block
  `d1 export`; nightly export to R2; weekly automated restore drill (latest R2
  export into a scratch D1, row counts + checksums) plus a quarterly
  human-witnessed drill. Time Travel is in-place only — a production incident
  tool needing human approval, never a drill.
- Every public entity carries `source`, `sourceUrl`, `checkedAt`,
  `validFrom`/`validUntil`, `license`, `correctionContact` (the API adds
  derived `stale`, `ageSeconds`) — defined in SPEC.md.

## Widget boundary rule

- Widgets live in `packages/widgets/<name>` and depend only on
  `@guia-la/widget-sdk`, `@guia-la/ui`, `@guia-la/core`, `@guia-la/map`,
  `@guia-la/api-client`, `@guia-la/contracts` (review.md §4).
- Forbid widget→widget private imports and app→widget imports outside
  `generated/` — ESLint `no-restricted-imports` / dependency-cruiser.
- A disabled widget is never imported, so it cannot be bundled; tree shaking
  is a bonus, not the mechanism (review.md §4).
- Runtime flags hide/reorder registered widgets only; unknown IDs ignored +
  logged; the registry is a closed set (review.md §4.6).
- Capabilities declared per widget manifest; `app.config.ts` composes plugins
  and permissions from the selected widgets only (review.md §4.5).

## Handoff protocol

- `.state/goal.md` (gitignored; rebuild rather than trust stale entries) or the
  task tracker holds the current task + progress log; update at start,
  milestone, and finish. Only humans set done.
- Cross-agent handoffs carry: task, branch, evidence package, open questions,
  D-xx decisions touched, next task.
