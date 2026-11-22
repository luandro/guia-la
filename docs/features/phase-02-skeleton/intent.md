# Intent: Phase 02 walking skeleton — Places list/detail journey

- **Problem:** The platform exists only as documents. The riskiest assumptions —
  static-export SEO (D-03/S1) and a locale-prefixed journey over fixture data
  (D-14) — have never run as code.
- **Outcome:** One Places list/detail journey, locale-prefixed
  (`/<locale>/places/...`), rendered from synthetic fixtures on the static web
  export with raw-HTML `<title>`, `og:` tags and hreflang alternates for all
  six locales, with visible loading/empty/error/offline states and marked
  fallback/machine-translated content. Guardrail gates (i18n key completeness,
  env guard, S1 assert script) fail when planted defects are introduced.
- **Affected users and systems:** visitors (web readers, six locales);
  developers (workspace packages `@guia-la/core`, `@guia-la/fixtures`, app
  routes); CI (`pnpm check` grows `i18n:check`, `s1`).
- **Constraints:** D-14 (six locales, no hardcoded user-facing strings, missing
  key fails CI), D-15 (TDD, gates first), D-03 (S1 evidence before building on
  the static-export assumption), one journey only, fixtures only, no cloud
  accounts, no secrets, Node 24.
- **Open questions:** none blocking. asyncRoutes default and i18n library are
  decided and recorded in plan.md and i18n-spike.md.
