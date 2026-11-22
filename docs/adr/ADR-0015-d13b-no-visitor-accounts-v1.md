# 15. No visitor accounts at all in v1

- **Decision register:** D-13b
- **Status:** proposed — master plan §08 marks "No public account at first" as an open decision to validate against real visitor journeys.
- **Date:** 2026-11-21
- **Deciders:** owner (decision pending)
- **Phase gate:** 07
- **Reversal cost:** not stated in the register
- **Related:** [decision register](../../planning/decisions.md); D-13a (no read accounts)

## Context

D-13a keeps public reads open. Whether v1 needs visitor accounts at all is still open. Master plan §08 marks it for validation against real visitor journeys.

## Options considered

| Option | Pros | Cons | Evidence needed |
|---|---|---|---|
| No visitor accounts in v1 (proposed) | Simplest; consistent with D-13a | Some journeys may need identity | Validate against real visitor journeys |
| Visitor accounts when a feature needs them | Adds identity only on demand | Later migration work | A concrete feature need |

## Decision

Proposed: ship v1 with editor accounts only. Introduce visitor accounts only when a concrete feature needs them.

## Evidence

Source: [decision register, D-13b](../../planning/decisions.md), citing master plan §08.

## Consequences

v1 carries no visitor identity. Validation against real visitor journeys decides the next step.