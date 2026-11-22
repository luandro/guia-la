# Glossary

Short definitions for the words this repository uses in a fixed way.
The decision register ([planning/decisions.md](../planning/decisions.md))
is the source of truth for decision status. This file never records or
changes a status.

- **APP_ENV** — environment variable that names the environment (which
  backend and data the build talks to). It does not select a build profile.
- **APP_VARIANT** — environment variable that names the build profile in
  use. Pair rule: `APP_ENV` = environment, `APP_VARIANT` = build profile.
- **build profile** — one buildable configuration of the platform: which
  destinations and widgets it includes, its theme, and its identity.
  Selected at build time by `APP_VARIANT`. Phase 06 proves two destination
  web profiles plus the flagship union.
- **Cotiju** — the legacy app only (`luandro/cotiju-app`). The name is
  never renamed and never means this platform (D-00).
- **destination** — one place the platform serves, with its own content,
  theme, and widget set. Cotijuba is the pilot destination. Serra is the
  demo destination (synthetic mountain destination, made-up data).
- **flagship app** — the single native app that contains the union of all
  destinations and widgets behind a destination picker (D-07, proposed).
  It must include the union; exclusion applies to destination web profiles,
  not the flagship (D-06).
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
- **spike** — a short, throwaway build that answers one open question with
  evidence before its decision is locked (for example S1, raw-HTML SEO in
  Phase 02). The result is recorded against that decision.
- **white-label web deploy** — a web deploy for one destination under that
  destination's own domain. The first one (Cotijuba) goes on `cotiju.app`
  (D-01). Widgets of other destinations are excluded at build time (D-06).
- **widget vs card** — a **widget** is a feature unit with a stable id, a
  contract, and an entry in the widget registry; it is shared across
  destinations. A **card** is a UI component inside a widget's rendering.
  Widget ids name features, not visual layouts: boats and ferries use the
  widget id `transport`, because boats are a mode of transport.
