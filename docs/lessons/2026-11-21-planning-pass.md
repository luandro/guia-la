# Lessons learned — planning pass 1 (2026-11-21)

Scope: architecture review and phase 00–10 playbooks in `planning/`, produced by Claude (orchestrator) with research sub-agents, `glm`/`glm-flash` writers and an independent reviewer.

## What worked
- **Research first, in parallel, with an evidence contract.** Three read-only research agents (legacy repo, Expo stack, Cloudflare/stores/starters) each wrote one sourced file with Confirmed / Inference / Needs-spike sections. Every later claim could cite them.
- **Orchestrator writes the judgment, juniors write the volume.** review.md and decisions.md were written by the orchestrator; phase pages were drafted by four parallel `glm` runs against one brief.
- **Markdown sources + generator + checker.** `planning/tools/build.py` (stdlib) renders all HTML; `check.py` validates links, sections and remote assets. Edits stay in Markdown; HTML stays consistent.
- **Independent critical review before acceptance.** A separate reviewer found 5 high and 37 lower defects in the drafts, including an inverted grep that would pass broken pages and a D1 Time Travel command that would have restored production in place. Never accept junior-written plans without this pass.

## What went wrong, and the rule it produced
| Problem | Cause | Rule |
|---|---|---|
| Path/ID drift between phases (`apps/api` vs `workers/api`, `boats` vs `transport`, two env var names, four fixture locations) | Parallel writers made their own choices | Fix canonical names (repo layout, widget IDs, env vars, field names) **in the brief** before fanning out |
| Generator hung all builds (~1.9 GB RSS each) | List parser never consumed an indented first item; four writers built concurrently | Fuzz the renderer with odd input; juniors build in isolation or after writes settle |
| Garbled text in long single writes from `glm-flash` (also some `glm` edits) | Model output corruption on long writes | Brief juniors to use small Edits and re-read; run a garble scan before commit |
| Unapproved proposals leaked into gates (agent defaults for auth, prod deploy before approval) | Writers treated review proposals as decisions | Every proposal-dependent gate needs an "if the owner rejects" fallback; agents never choose a human-approval decision |
| "Validated" labels on unverified commands | Writers over-labelled | Only research *Confirmed* sections may back "validated" |
| DeepSeek search API returned HTTP 402 | Account balance empty | Research fell back to direct primary-source fetches; top up or drop the skill from briefs |
| Juniors could not send herdr progress or nest `glm` | Non-interactive permission mode | Do not ask juniors for progress reports; the orchestrator reports |

## Process notes
- Docs-only change: codex/ohmybug review skipped per AGENTS.md; independent agent review used instead.
- Nothing in `planning/` has been built or run; all gates are proposed.
