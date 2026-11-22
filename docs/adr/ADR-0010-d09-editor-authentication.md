# 10. Editor authentication

- **Decision register:** D-09
- **Status:** approved — by the owner on 2026-11-21: Cloudflare Access, configured with the `cf` CLI (cf-cli skill). A5 still validates the editor flow; magic link stays the fallback
- **Date:** 2026-11-21
- **Deciders:** owner
- **Phase gate:** 07
- **Reversal cost:** not stated in the register; magic link stays the fallback
- **Related:** [decision register](../../planning/decisions.md); D-13a (no read accounts)

## Context

Editors must sign in; visitors must not. The register compares two ways to sign editors in.

## Options considered

| Option | Pros | Cons | Evidence needed |
|---|---|---|---|
| Cloudflare Access (approved) | One-time PIN; no auth code in the app; JWT verified in the Worker | Tied to Cloudflare | A5 editor flow |
| Magic link stored in D1 (fallback) | Self-managed | Auth code handling in the app | A5 editor flow |

## Decision

Cloudflare Access, configured with the `cf` CLI (cf-cli skill). A5 still validates the editor flow; the magic link stays the fallback.

Guardrail: roles (`editor`, `admin`) are scoped to `destinationId`. The server checks roles on every write. Visitors never authenticate.

## Evidence

Source: [decision register, D-09](../../planning/decisions.md). Evidence needed: A5 editor flow.

## Consequences

Visitors never authenticate. Editor writes are role-checked on the server.
