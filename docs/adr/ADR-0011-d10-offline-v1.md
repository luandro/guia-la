# 11. Offline v1

- **Decision register:** D-10
- **Status:** proposed.
- **Date:** 2026-11-21
- **Deciders:** owner (decision pending)
- **Phase gate:** 08
- **Reversal cost:** not stated in the register
- **Related:** [decision register](../../planning/decisions.md); D-05 (maps)

## Context

The legacy app cached all Supabase responses for 24 hours, including authenticated responses (#65). Offline v1 must not repeat that.

## Options considered

The register records no alternatives beyond the web/native split below.

## Decision

Proposed:

- Web: Workbox precache of the app shell, plus public JSON snapshots per destination. Snapshots are versioned; max-age is shown to users.
- Native: SQLite/file cache of the same snapshots.
- Never cache authenticated responses.
- No `expo-sqlite` on web until S8.

## Evidence

Source: [decision register, D-10](../../planning/decisions.md). Legacy behavior record: #65.

## Consequences

Authenticated responses stay out of every cache.
