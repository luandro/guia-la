# ADR-0017. Guardrails first, TDD, AI-native SDLC

- **Decision register:** D-15
- **Status:** approved — by the owner on 2026-11-22.
- **Date:** 2026-11-22
- **Deciders:** owner
- **Phase gate:** 00 (applies to every phase)
- **Reversal cost:** low per gate; high for TDD discipline if skipped early
- **Related:** [decision register, D-15](../../planning/decisions.md); [REVIEW.md](../../REVIEW.md); [AGENTS.md](../../AGENTS.md)

## Context

The legacy app shipped 455 hidden type errors and leaked keys because nothing enforced checks. Agents write most of the code here, so the gates are the main quality control.

## Options considered

| Option | Pros | Cons | Evidence needed |
|---|---|---|---|
| Gates first, TDD | Defects caught before merge; agents get a feedback loop | Up-front setup per phase | Gate catch rate |
| Gates added later | Faster start | Debt accumulates, as in the legacy app | — |

## Decision

Each phase lands its gates before or with its first feature PR. TDD (failing test first) for every behavior change and bug fix. Per-feature intent/spec/plan artifacts, REVIEW.md passes, a read-only verifier, and agent evals in CI from Phase 10. Each gate names the failure class it catches.

## Evidence

[AI-native SDLC playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook); legacy issue #69 (type debt) and the D-12 key leak.

## Consequences

Slower first PR per phase; fewer escaped defects; gates that never catch anything are pruned.
