# Architecture decision records

Seed ADRs for the guia.la platform. One ADR per decision in the
[decision register](../../planning/decisions.md), which is the source of
truth. Statuses are copied from the register verbatim and never upgraded.
On any conflict, the register wins.

| ADR | Decision | Title | Status |
|---|---|---|---|
| [ADR-0000](ADR-0000-template.md) | — | Template | — |
| [ADR-0001](ADR-0001-d00-platform-identity.md) | D-00 | Platform identity | approved |
| [ADR-0002](ADR-0002-d01-names-identifiers.md) | D-01 | Names and identifiers | approved (buy `guia.la` before first store release) |
| [ADR-0003](ADR-0003-d02-client-stack.md) | D-02 | Client stack | proposed |
| [ADR-0004](ADR-0004-d03-web-rendering-seo.md) | D-03 | Web rendering and SEO | approved (S1 must pass; else fallback returns to owner) |
| [ADR-0005](ADR-0005-d04-backend.md) | D-04 | Backend | proposed |
| [ADR-0006](ADR-0006-d05-maps.md) | D-05 | Maps | approved for pilot (tile source revisited later; S6 still runs) |
| [ADR-0007](ADR-0007-d06-widget-exclusion-scope.md) | D-06 | Widget exclusion scope | approved |
| [ADR-0008](ADR-0008-d07-distribution.md) | D-07 | Distribution | proposed |
| [ADR-0009](ADR-0009-d08-ci-build-budget.md) | D-08 | CI and build budget | approved |
| [ADR-0010](ADR-0010-d09-editor-authentication.md) | D-09 | Editor authentication | approved (A5 still validates the flow; magic link fallback) |
| [ADR-0011](ADR-0011-d10-offline-v1.md) | D-10 | Offline v1 | proposed |
| [ADR-0012](ADR-0012-d11-licensing.md) | D-11 | Licensing | approved (code only; content license open) |
| [ADR-0013](ADR-0013-d12-legacy-key-rotation.md) | D-12 | Legacy key rotation | proposed — owner TODO (tsk #297) |
| [ADR-0014](ADR-0014-d13a-no-account-required-to-read.md) | D-13a | No account required to read | approved |
| [ADR-0015](ADR-0015-d13b-no-visitor-accounts-v1.md) | D-13b | No visitor accounts at all in v1 | proposed |
| [ADR-0016](ADR-0016-d14-i18n.md) | D-14 | Internationalization from day one | approved — owner, 2026-11-22; library chosen by a Phase 02 spike |
| [ADR-0017](ADR-0017-d15-guardrails-tdd.md) | D-15 | Guardrails first, TDD, AI-native SDLC | approved — owner, 2026-11-22 |

Decisions D-00..D-12 map to register sections; D-13a and D-13b are separate
records. Phase playbooks live at `planning/src/phases/phase-00..10.md`; the
planning review is at [planning/review.md](../../planning/review.md).

