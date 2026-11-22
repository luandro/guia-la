# Glossary

Short definitions for the words this repository uses in a fixed way.
This is the canonical glossary — SPEC.md §5 points here. The decision
register ([planning/decisions.md](../planning/decisions.md))
is the source of truth for decision status. This file never changes or
upgrades a status.

- **APP_ENV** — environment variable that selects the environment (which
  backend and data the build talks to): development, preview, staging or
  production. Zod-validated; a build fails on a missing variable. It does
  not select a build profile.
- **APP_VARIANT** — environment variable that selects the build profile in
  use: `flagship`, `cotijuba-web` or `serra-web`. Zod-validated; a build
  fails on a missing variable. Pair rule: `APP_ENV` = environment,
  `APP_VARIANT` = build profile.
- **build profile** — one buildable configuration of the platform: which
  destinations and widgets it includes, its theme, and its identity.
  Selected at build time by `APP_VARIANT`. Phase 06 proves two destination
  web profiles plus the flagship union.
- **Cotiju** — the legacy app only (`luandro/cotiju-app`). The name is
  never renamed and never means this platform (D-00).
- **destination** — one place the platform serves, with its own content,
  theme, and widget set. Cotijuba is the pilot destination. Serra is the
  demo destination (synthetic mountain destination, made-up data).
- **flagship app** — the single native app that serves all destinations
  behind a destination picker (D-07, proposed). Its widget set is the union
  of its destinations' allowlists; exclusion applies to destination web
  profiles, not the flagship (D-06 — native per-destination exclusion is
  deferred: one-module spike only).
- **NODE_ENV** — never key configuration off it: Expo CLI forces its value,
  so it cannot distinguish environments or profiles. Use `APP_ENV` and
  `APP_VARIANT`.
- **platform** — guia.la: the whole system (apps, backend, editorial
  console, content model) that serves many destinations. Repository:
  `luandro/guia-la`. npm scope `@guia-la/*`; bundle ID candidate
  `la.guia.app` (D-01).
- **profile** — short form of build profile. A destination web profile is a
  build profile scoped to one destination.
- **provenance** — the record of where a piece of content came from and
  whether it is still valid. Fields: `source`, `sourceUrl`, `checkedAt`,
  `validFrom`, `validUntil`, `license`, `correctionContact`. Derived:
  `stale`, `ageSeconds`.
- **runtime flag** — a per-destination, server-fetched flag. It can only
  hide or reorder widgets already compiled into the build. The registry is
  a closed set; unknown ids are ignored and logged.
- **snapshot** — a versioned, per-destination export of public JSON for
  offline use. It shows users its max-age (D-10, proposed).
- **spike** — a short, throwaway build that answers one open question with
  evidence before its decision is locked (for example S1, raw-HTML SEO in
  Phase 02). The result is recorded against that decision.
- **white-label web deploy** — a web deploy for one destination under that
  destination's own domain. The first one (Cotijuba) goes on `cotiju.app`
  (D-01). Widgets of other destinations are excluded at build time (D-06).
- **widget ids** — the closed set of widget identifiers: `places`,
  `transport`, `tides`, `local-services`, `trails`, `guides`. Boats and
  ferries are not a widget: the id is `transport`; a boat is a mode
  (`modes: ["boat"]`).
- **widget vs card** — a **widget** is a feature unit with a stable id, a
  contract, and an entry in the widget registry; it is shared across
  destinations. A **card** is a UI component inside a widget's rendering.
  Widget ids name features, not visual layouts: boats and ferries use the
  widget id `transport`, because boats are a mode of transport.
