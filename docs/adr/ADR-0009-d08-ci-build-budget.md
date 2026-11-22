# 09. CI and build budget

- **Decision register:** D-08
- **Status:** approved by the owner on 2026-11-21: all free tiers for now. No Workers Paid, no Expo Starter. Upgrading is a new owner decision.
- **Date:** 2026-11-21
- **Deciders:** owner
- **Phase gate:** 04
- **Reversal cost:** not stated in the register; upgrading is a new owner decision
- **Related:** [decision register](../../planning/decisions.md); D-04 (backend)

## Context

The project runs on free tiers until the owner decides to pay. That caps CI minutes, EAS builds, and Workers/D1 usage.

## Options considered

| Option | Pros | Cons | Evidence needed |
|---|---|---|---|
| All free tiers (approved) | No monthly cost | Tight limits; build caps | S12; S13 |
| Expo Starter ($19/mo) + Workers Paid ($5/mo) (superseded) | Headroom; hard monthly ceiling; alert at 80% | Monthly cost | — |

## Decision

All free tiers for now. No Workers Paid, no Expo Starter. Upgrading is a new owner decision.

From the register:

- Fast gate on GitHub Actions on every PR.
- Native EAS builds only by label/path filter, weekly or manual cadence, inside 15 Android + 15 iOS builds per month.
- No Maestro on Expo Workflows; the S13 GitHub Actions emulator is the only E2E route.
- Workers Free (about 100k requests/day, 10 ms CPU per invocation) and D1 Free daily caps apply. These limits are inferred, not verified; confirm against the Workers and D1 pricing pages in Phase 04.

## Evidence

Source: [decision register, D-08](../../planning/decisions.md). Evidence needed: S12 (minutes per workflow) and S13 (GH Actions emulator Maestro flake rate).

## Consequences

Free-tier limits shape the phase gates. Phase 04 must confirm the inferred limits.
