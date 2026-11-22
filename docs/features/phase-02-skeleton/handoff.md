# Phase 02 handoff (to phases 03 and 04)

Date: 2026-11-22 · Per the playbook's "Next phase handoff"
([phase-02.md](../../../planning/src/phases/phase-02.md)). Short by design;
details live in the linked files.

## To Phase 04 (pipeline / deploy)

- **Deferred link-preview check (owner decision, 2026-11-22).** The manual
  WhatsApp/link-preview check outstanding from
  [s1-result.md](s1-result.md) is deferred to Phase 04: it needs a public
  preview URL, which first exists once 04a deploys one. Run it there; S1's
  GO stays conditional on it.
- **Absolute og:image / hreflang URLs once an origin exists.** Both are
  root-relative today (deliberate — no origin is pinned, D-01); each is a
  one-line change in `apps/app/src/lib/metadata.ts` per deploy profile when
  the Phase 04 origin lands.
- **iOS native boot blocked on hardware.** No macOS machine here; iOS builds
  need Xcode (SDK 58-supported version) + CLI tools. Exact steps:
  [native-boot.md](native-boot.md) — this is 04b's credential/setup list
  entry, together with the Android `ANDROID_SDK_ROOT`/`ANDROID_HOME` pitfall
  recorded there.

## Kept decisions (do not re-litigate without cause)

- **asyncRoutes stays at the SDK 58 default** (enabled on web). If a deploy
  ever needs smaller per-route bundles, flip `experiments.asyncRoutes.web:
  false` and re-export ([plan.md](plan.md)).
- **Pin deviation — ESLint 9, not 10.** `eslint-config-expo` 58.0.4 pulls
  `eslint-plugin-react` 7.37.x, which crashes on ESLint 10's removed context
  API. Pinned `eslint ^9.39.0`; revisit when eslint-config-expo ships ESLint
  10 support ([template-notes.md](template-notes.md)).

## To Phase 03 (design system / Storybook)

- **S9 Storybook spike warning ([review R10](../../../planning/review.md)).**
  Storybook setup starts with a compatibility spike and a recorded fallback,
  never an assumption — it may not run in both runtimes on this stack.
- The skeleton screens (`src/app/**`) are the first story candidates; all
  new UI text flows through the i18n layer and its six locales (D-14).

## States inventory (Phase 05 tests these)

Which journey views implement which states today:

| View | loading | empty | error | offline |
| --- | --- | --- | --- | --- |
| Places list (`/[locale]/places`) | yes (`LoadingView`) | yes (`EmptyView`) | yes (`ErrorView` + retry) | yes (`OfflineHint`) |
| Place detail (`/[locale]/places/[slug]`) | yes | n/a — unknown slug renders `NotFoundView` | yes (+ retry) | yes |
| Root picker (`/`) | n/a (static links) | n/a | n/a | n/a |
| Not-found (`NotFoundView`) | n/a | n/a | n/a | n/a |

Loading is bounded by `LOAD_DEADLINE_MS` (8 s) — a hung load becomes a
timeout error, never an infinite spinner (legacy #60). Offline is a visible
hint, never a gate; `navigator.onLine` on web, treated as online on native.
