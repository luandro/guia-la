# Brief: write phase playbook sources (guia.la planning packet)

You are a senior planner writing **planning documents only** (no app code, no scaffolding, no network deploys, no git commits). Work inside this worktree; touch only the files named in your assignment.

## Read first (all of it)
1. `docs/guia-la-agent-handoff.md` — the "Required contents of every phase HTML" list (12 items) and quality standard. This is your spec.
2. `docs/guia-la-master-plan.html` — baseline scope for each phase (section 05; read the phase text for your phases).
3. `planning/review.md` — the orchestrator's critique; its §8 roadmap edits and red-team rows are **proposals** you must incorporate as proposals (say "proposed in review R#/D-#"), never as approved facts.
4. `planning/decisions.md` — decision IDs D-00..D-14. Reference them; never upgrade a status.
5. `planning/research/*.md` — verified versions, spikes S1–S13, legacy findings. Cite as relative links e.g. `[expo-stack S1](../research/expo-stack.md)` (phase pages live in `planning/phases/`, so links from a phase source go up one level: `../review.md`, `../decisions.md`, `../research/x.md`, `phase-03.html`, `../prompts/phase-03-agent.md`).
6. `planning/src/phases/phase-00.md` (sample) and `planning/tools/build.py` — the source format and supported Markdown (metadata block between `---`, H2 sections, tables, lists, fenced code, callouts `> [!GATE]`, `> [!RISK]`, `> [!DECISION]`, `> [!NOTE]`, `- [ ]` checkboxes).

## Write, for each assigned phase XX
### A. `planning/src/phases/phase-XX.md`
Metadata keys: id, title, short (one-sentence objective), tag (Govern/Learn/Build/See/Ship/Prove/Core/Data/Product/Field/Operate as in the master plan), status (`draft`), complexity (Low/Medium/High + one-word risk note), depends (comma list of phase ids), inspect (what a reviewer can open at the end), exit (one-line gate).
Then exactly these H2 sections, in this order, with these exact titles:
1. `## Phase identity` — number, objective, prerequisites, dependencies, expected contributors (human roles + agent roles), complexity/risks. **No hour estimates.**
2. `## Why this stage exists`
3. `## Inputs and source references` — exact paths (in the future guia-la repo use proposed paths, marked proposed), legacy refs `luandro/cotiju-app` issues/paths where relevant, authoritative docs URLs (from research files), known unknowns, credentials/tools needed.
4. `## Task breakdown` — numbered bounded tasks (typically 6–12), each with: goal, owner boundary (agent / human / both), suggested PR unit (e.g. "PR 02-3"), depends-on. Prefer a table plus short notes. Split anything that would be one giant PR.
5. `## Architecture choices and guardrails` — code locations, interfaces/contracts (short TypeScript sketches fine, labelled illustrative), patterns, **forbidden** list, security/privacy implications, acceptable alternatives.
6. `## Deliverables` — exact filenames/artifacts/build outputs/doc updates.
7. `## Visual and functional QA` — concrete manual journeys for human and agent, screenshots/recordings/stories expected, platform matrix (web/Android/iOS), error states. Preview URL patterns only if real (otherwise say "pattern TBD in Phase 04").
8. `## Automated verification` — commands. Mark each as **validated** only if it appears verified in research files (e.g. `npx expo export -s external`), otherwise **proposed**. Include positive and negative tests and at least one deliberate-failure demonstration where useful.
9. `## Acceptance gate` — `> [!GATE]` callout + checklist of observable pass/fail checks, and an explicit "Blocks progression if:" list.
10. `## Risks, rollback and handoff` — risks table (risk, likelihood, impact, mitigation), sensitive operations needing human approval, budget impact, rollback, restart instructions for an agent picking up mid-phase.
11. `## Next phase handoff` — exact records/links/checks/decisions the next phase's agent needs.
(The template appends "Agent execution prompt" automatically — do NOT write that heading.)

Tone: specific, skeptical, executable by a competent coding agent without clarification. Dense but readable; 250–450 lines per phase. Use guia.la for the platform, Cotijuba only as pilot destination, "Serra demo" as the synthetic mountain destination, Cotiju only for the legacy app. Never claim anything was run or passed. Never include secrets, personal data, or invented benchmark numbers/costs (use the figures in research files with links, or say "unknown — measure in S#").

### B. `planning/prompts/phase-XX-agent.md`
Execution brief for a future agent (60–120 lines): role; hard constraints (only essential global ones: no prod data writes, no secrets, no store/DNS/spend without human approval, evidence over claims, small PRs); canonical docs to read (relative to the future repo, plus this packet's `planning/phases/phase-XX.html`); ordered tasks; acceptance criteria; the PR evidence package (summary, linked issue/phase task, commands run with output excerpts, screenshots/recordings/stories, risks, docs updated, next unblocked task); stop conditions ("stop and ask when…"). Start with a line saying it must not be executed until the planning packet is approved.

## Done when
For each assigned phase both files exist, follow the structure exactly, and `python3 -I planning/tools/build.py && python3 -I planning/tools/check.py` exits 0 (other phases may be missing — that is fine; fix only your own errors). Report files written and the check output.
