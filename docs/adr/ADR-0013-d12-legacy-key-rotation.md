# 13. Legacy key rotation

- **Decision register:** D-12
- **Status:** owner TODO, tracked as tsk #297 (2026-11-21); outside guia.la.
- **Date:** 2026-11-21
- **Deciders:** owner (action tracked as tsk #297)
- **Phase gate:** 01
- **Reversal cost:** not applicable — the action is outside this repo
- **Related:** [decision register](../../planning/decisions.md); D-00 (platform identity)

## Context

The legacy app's public JS bundles WorldTides and StormGlass keys [research/legacy-cotiju-audit.md]. Leaked third-party keys are a standing risk.

## Options considered

The register records no alternatives here, and no agent action is authorized.

## Decision

This is an owner TODO, tracked as tsk #297, outside guia.la. The register recommends rotating the keys and moving the calls server-side. No agent action is authorized.

## Evidence

Source: [decision register, D-12](../../planning/decisions.md). Finding: [research/legacy-cotiju-audit.md](../../planning/research/legacy-cotiju-audit.md).

## Consequences

The keys stay exposed until the owner rotates them. This repo records the decision only.
