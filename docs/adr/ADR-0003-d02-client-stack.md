# 03. Client stack

- **Decision register:** D-02
- **Status:** proposed
- **Date:** 2026-11-21
- **Deciders:** owner (decision pending)
- **Phase gate:** 02
- **Reversal cost:** high after Phase 06
- **Related:** [decision register](../../planning/decisions.md); D-03 (web rendering and SEO)

## Context

One codebase must serve web, Android, and iOS. Expo SDK 58 is current: RN 0.88.1, React 19.3, RNW 0.21.4 [research/expo-stack.md](../../planning/research/expo-stack.md).

## Options considered

| Option | Pros | Cons | Evidence needed |
|---|---|---|---|
| Expo SDK 58 + Expo Router + RNW, official template | One codebase; current SDK | Router web constraints | A1 spike: template boots on all three targets |
| Ignite | Known starter | SDK 55, React Navigation | — |
| Obytes | Known starter | SDK 54, stale | — |
| T3 Turbo | Full-stack Next/Postgres | Different stack shape | — |
| Next.js web + separate RN app | Full web control | Two stacks to keep in step | — |
| Bare RN | No framework lock-in | No Router web layer | — |

## Decision

Proposed: Expo SDK 58 with Expo Router, React Native Web, and TypeScript, from the official `create-expo-app` template.

## Evidence

Source: [decision register, D-02](../../planning/decisions.md). Starter comparison: [research/backend-stores-starters.md](../../planning/research/backend-stores-starters.md) §3. Stack versions: [research/expo-stack.md](../../planning/research/expo-stack.md). Evidence needed: A1 spike.

## Consequences

One stack to upgrade. After Phase 06 a change is costly.
