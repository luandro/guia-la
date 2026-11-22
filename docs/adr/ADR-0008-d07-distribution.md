# 08. Distribution

- **Decision register:** D-07
- **Status:** proposed (strongly supported by store policy).
- **Date:** 2026-11-21
- **Deciders:** owner (decision pending)
- **Phase gate:** 10
- **Reversal cost:** not stated in the register
- **Related:** [decision register](../../planning/decisions.md); D-06 (widget exclusion scope)

## Context

Store policy pushes against one app per destination. Apple 4.2.6 allows a single "picker" app. Apple 4.3(a) calls "a separate map app for every city" spam. Google's repetitive-content policy pushes aggregation [research/backend-stores-starters.md §2].

## Options considered

| Option | Pros | Cons | Evidence needed |
|---|---|---|---|
| One flagship app + destination picker (proposed) | Matches Apple 4.2.6; aggregates | Destinations share one listing | — |
| One app per destination | Separate branding | Spam risk under Apple 4.3(a) | — |

## Decision

Proposed: one flagship native app with a destination picker, plus destination web profiles.

Exception path: a partner app is allowed only when the partner organization owns its store account and content.

## Evidence

Source: [decision register, D-07](../../planning/decisions.md). Store policy citations in [research/backend-stores-starters.md](../../planning/research/backend-stores-starters.md) §2.

## Consequences

Separate native apps stay limited to the partner exception path.
