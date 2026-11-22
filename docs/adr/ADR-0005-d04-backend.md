# 05. Backend

- **Decision register:** D-04
- **Status:** proposed.
- **Date:** 2026-11-21
- **Deciders:** owner (decision pending)
- **Phase gate:** 07
- **Reversal cost:** medium if all access goes through the repository layer
- **Related:** [decision register](../../planning/decisions.md); D-08 (CI and build budget)

## Context

The pilot needs managed compute and storage at low cost. Workers Paid is $5/mo. D1 gives 10 GB per database and 30 days of Time Travel. R2 egress is free [research/backend-stores-starters.md §1].

## Options considered

| Option | Pros | Cons | Evidence needed |
|---|---|---|---|
| Workers + Hono + D1 (Drizzle) + R2 (proposed) | Low cost; one platform | D1 limits | A3 spike; tenant A/B test suite; restore drill |
| Neon/Supabase via Hyperdrive | RLS; PostGIS | +$15–25/mo | — |

## Decision

Proposed: Cloudflare Workers + Hono + D1 with Drizzle, and R2 for objects.

Guardrails: one tenant-scoped repository layer. No FTS5 or R*Tree virtual tables in the primary DB (they block `d1 export`). Nightly export to R2. Pinned Drizzle version.

## Evidence

Source: [decision register, D-04](../../planning/decisions.md). Evidence needed: A3 spike, a tenant A/B test suite, and a restore drill.

## Consequences

Reversal stays medium cost while every data access goes through the repository layer.
