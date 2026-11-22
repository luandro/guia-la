# 04. Web rendering and SEO

- **Decision register:** D-03
- **Status:** approved — by the owner on 2026-11-21. Spike S1 must still pass; if it fails, the fallback (a) returns to the owner as a new decision
- **Date:** 2026-11-21
- **Deciders:** owner
- **Phase gate:** 02
- **Reversal cost:** medium (route layer only if contract kept)
- **Related:** [decision register](../../planning/decisions.md); D-02 (client stack)

## Context

Public place pages must render for crawlers and chat previews. The web app is Expo Router, so the rendering mode decides SEO.

## Options considered

| Option | Pros | Cons | Evidence needed |
|---|---|---|---|
| Static export (chosen) | Real HTML for every route | Rebuild on each publish | Spike S1 |
| (a) Hono-rendered share pages + Expo web shell | Smaller rebuild story | Two render paths | Needed only if S1 fails |
| (b) `web.output: "server"` on Workers | Server rendering | Undocumented `expo-server` workerd adapter [S3]; not recommended | — |

## Decision

Set `web.output: "static"` explicitly. Use `generateMetadata()` for OG tags and `generateStaticParams` from the API at build. Editor "publish" triggers a rebuild + deploy (GitHub `repository_dispatch` or a Workers Builds hook). Deploy to Cloudflare Workers Static Assets.

## Evidence

Source: [decision register, D-03](../../planning/decisions.md). Spike S1: raw-HTML assertions (`curl`, Playwright with JS disabled) for every place page; rebuild time at 1k pages; WhatsApp preview manual check.

## Consequences

If S1 fails, fallback (a) returns to the owner as a new decision. Reversal is medium cost while the route contract is kept.
