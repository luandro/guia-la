# 07. Widget exclusion scope

- **Decision register:** D-06
- **Status:** approved by the owner on 2026-11-21.
- **Date:** 2026-11-21
- **Deciders:** owner
- **Phase gate:** 06
- **Reversal cost:** low — generator already emits capability lists
- **Related:** [decision register](../../planning/decisions.md); D-07 (distribution)

## Context

The flagship app must contain the union of all widgets; destination profiles exclude the rest. `expo.autolinking.exclude` is documented only in `package.json` [S5].

## Options considered

| Option | Pros | Cons | Evidence needed |
|---|---|---|---|
| Web/JS exclusion now (approved) | Proves the hard part in Phase 06 | Native exclusion waits | Negative assertions for two web profiles |

## Decision

Phase 06 must prove JS/route exclusion for two web profiles with negative assertions, and permission/config composition for the flagship. Per-destination native module exclusion is a one-module spike only. The general mechanism is deferred until a partner native app is approved.

## Evidence

Source: [decision register, D-06](../../planning/decisions.md). Spike note: `expo.autolinking.exclude` documented only in `package.json` [S5].

## Consequences

Reversal is cheap: the generator already emits capability lists.
