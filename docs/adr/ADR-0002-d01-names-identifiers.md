# 02. Names and identifiers

- **Decision register:** D-01
- **Status:** approved — by the owner on 2026-11-21. The owner does not own `guia.la` yet but can buy it; use guia.la-based names and IDs now. The first white-label web deploy (Cotijuba) goes on `cotiju.app`
- **Date:** 2026-11-21
- **Deciders:** owner
- **Phase gate:** 00
- **Reversal cost:** bundle IDs are effectively permanent after first store release
- **Related:** [decision register](../../planning/decisions.md); D-00 (platform identity)

## Context

All names and IDs must come from one base. Bundle IDs cannot change after the first store release. The owner does not yet own the `guia.la` domain.

## Options considered

| Option | Pros | Cons | Evidence needed |
|---|---|---|---|
| guia.la-based names | One base for repo, packages, and app IDs | Needs the `guia.la` domain | WHOIS/registrar record, GitHub org/repo availability, store name search |
| `app.guiala.*` | Works if `guia.la` cannot be secured | A second naming base | Needed only if `guia.la` cannot be bought |

## Decision

Use guia.la-based names and IDs now: repo `guia-la`, npm scope `@guia-la/*`, app slug `guia-la`, bundle/package ID candidate `la.guia.app`. The first white-label web deploy (Cotijuba) goes on `cotiju.app`.

Constraint: buy `guia.la` before the first store release. `la.guia.app` is the reverse-DNS of an unverified domain; confirm ownership first.

## Evidence

Source: [decision register, D-01](../../planning/decisions.md). Required: WHOIS/registrar record of `guia.la`, GitHub org/repo availability, store name search.

## Consequences

IDs stay stable across web and store builds. If `guia.la` cannot be secured, the fallback is `app.guiala.*`.
