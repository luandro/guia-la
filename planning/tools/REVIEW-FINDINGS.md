# Independent review findings (pass 1) and canonical fixes

## Canonical choices (orchestrator decisions for consistency — apply everywhere)
- Transport widget ID: `transport` (boats are a configured mode of transport). Replace widget ID `boats` everywhere (06, 08, SPEC draft, examples). Destination config example: `transport: { modes: ['boat'] }`.
- Repo layout (define once in Phase 02's tree; reference everywhere): `apps/app/` (Expo; routes in `apps/app/src/app/`, widget route stubs in `apps/app/src/app/(widgets)/`), `apps/api/` (Hono Worker), `packages/core`, `packages/ui`, `packages/widget-sdk`, `packages/widgets/<id>`, `packages/map`, `packages/contracts` (zod schemas + OpenAPI), `packages/api-client` (generated typed client), `packages/db` (only D1 access), `packages/fixtures/{cotijuba,serra}/` (synthetic only), `packages/testing` (helpers, no fixtures), `destinations/<id>/`, `profiles/`, `tools/compose`.
- Widget import allowlist: `@guia-la/widget-sdk`, `@guia-la/ui`, `@guia-la/core`, `@guia-la/map`, `@guia-la/api-client`, `@guia-la/contracts`. Never another widget.
- Env vars: `APP_ENV` = environment (development/preview/staging/production); `APP_VARIANT` = build profile (flagship, cotijuba-web, serra-web). Both zod-validated; build fails if missing.
- Provenance fields (API camelCase / DB snake_case): `source`, `sourceUrl`, `checkedAt` (last verified), `validFrom`, `validUntil`, `license`, `correctionContact`; API adds derived `stale: boolean` and `ageSeconds`.
- Contacts: business/service contact numbers are allowed as an explicit field with `contactConsent` + `publishContact` flags recorded by an editor; personal/visitor data never modeled.
- Restore drills: weekly automated drill (latest R2 export -> scratch D1, row counts + checksums); quarterly human-witnessed drill. Time Travel is in-place only: never use it as a drill; it is a production incident tool needing human approval.
- Approval boundaries: D-09 is not decided by agents — PR 07-5 blocks until the owner records a D-09 choice (provisional allowed). Production-domain deploys only in the human-approved promotion step. Where a phase relies on an unapproved review §8 change or a proposed decision (e.g. 02 deferring native cloud builds, 06 web-only exclusion per D-06), add an explicit "If the owner rejects §8.x / D-xx:" fallback gate restoring the master-plan baseline gate.
- Evidence labels: only call a command "validated" if the research file's *Confirmed* section supports it; otherwise "proposed".

## Findings to fix (from independent reviewer; src NN = planning/src/phases/phase-NN.md)
1. HIGH src 02:277-279 S1 grep inverted: `grep -L 'og:title' "$f" && exit 1` passes on pages lacking tag. Use `grep -q 'og:title' "$f" || { echo "$f"; exit 1; }` (same for <title>).
2. HIGH src 10:189 `wrangler d1 time-travel restore … --remote` "into scratch DB" — Time Travel restores in place only; would roll prod back. Replace with R2-export -> scratch D1 drill (as src 07:187).
3. HIGH phone numbers contradict: 07:137/07:72 vs 08:69/86/117/138 (moto-taxi tel:) vs 09:44/94. Apply canonical Contacts rule in 07 schema.
4. HIGH widget set 06 vs 08: `boats` vs `transport` (06:46/72/108, 08:17/52/54, drafts/SPEC.md:89); 08:52/127 omit `guides` but 08:71 ships PR 08-7b; 08:74/130/218 "five new sentinels" but 06 created six placeholders — say 08 replaces the placeholders.
5. HIGH boundary lint 06:75 + drafts/AGENTS.md:95-96 would block 08:93 (@guia-la/map, api-client). Apply canonical allowlist.
6. Paths drift: apps/api vs workers/api (08:55, 09:188, prompts 08:29, 09:29); packages/contracts vs validators+api-client (07:46, 08:52/93); fixtures in 4 places (01:142, 02:145, 05:41, 07:48, 08:52). Apply canonical layout.
7. Route stubs: 02:141 apps/app/src/app vs 06:74 & 08:53 apps/app/app/(widgets). Use apps/app/src/app/(widgets)/.
8. src 00:224-226 decision check never fails (anchored ^D-). Grep 'D-[0-9]{2}' unanchored; require D-xx in ADR filename or front matter (00:126, drafts/adr/0000-template.md:3).
9. src 00:217 greps '^Status: ' but template writes '- **Status:** …'; copied statuses carry suffixes ("proposed — blocked on S1"). Align template + regex, allow trailing note.
10. src 01:122 PR 01-2 depends on itself; make it 01-1. 01:297 restart text mixes task/PR numbers.
11. src 04:72 task 1 depends on Phase 03 but 04:22 says 04a can start after 02; front matter depends 02,03. Make 04-1 depend on 02; only Storybook wiring depends on 03.
12. src 02:8 depends 00,01 but text says only task 02-5 needs 01. Set depends: 00 with a soft note about 01.
13. src 07:8 add dependency 04 (staging previews, provenance, redeploy at 07:82/162/165).
14. src 05:250 stale "Phase 06, source pending…" — replace with normal link to phase-06.html.
15. src 06:169-171 QA matrix requires Android flagship evidence though 06:19 says native optional — mark "if 04b available, else recorded blocker".
16. src 09:53 + prompts/phase-09-agent.md:28 expect docs/legacy/data-inventory.md which 01 never produces — point to extraction-matrix.md + owner row-count record.
17. Env var: 02:120 APP_ENV vs 04:54 + prompts/phase-04-agent.md:39 APP_VARIANT. Apply canonical (both, distinct meanings).
18. Provenance names diverge: drafts/SPEC.md:59,108; drafts/AGENTS.md:90; 07:72; 09 adds correction_contact/license. Apply canonical list.
19. Restore drill cadence: apply canonical (weekly automated + quarterly witnessed) in drafts/AGENTS.md:89, drafts/SPEC.md:145, src 10:58/253, src 07.
20. src 07:85 + prompts/phase-07-agent.md:31,63 let agent default D-09 to Cloudflare Access. Block 07-5 until owner records D-09.
21. src 10:54 + prompts/phase-10-agent.md:43 deploy to production domain before human-approved promotion (10:56). Task 4 deploys to a production-like hostname; prod-domain deploy moves to task 6 behind recorded approval.
22. src 02:235 defers native cloud builds to 04b (unapproved §8.3); src 06:10, 208-221 web-only gate (D-06 proposed). Add "If the owner rejects…" fallback gate lines restoring master-plan baseline gates.
24. src 02:254-255 expo-doctor / expo install --check marked validated citing inference §2.7 -> "proposed (inference)".
25. src 06:193, 07:189 tsc --noEmit "validated" -> proposed.
26. src 01:248 anonymous zero-row counts "validated as a fact" -> "reported by legacy PR #52, not re-run".
27. src 08:106 "America/Belem fixed UTC-3, no DST since 2019" not in research -> cite IANA tz database (https://www.iana.org/time-zones) as to-verify or move to open questions.
28. src 07:231 `wrangler rollback` and src 10:44 OTA store-rule claim not in research -> mark unverified.
29. src 04:30 legacy "seven workflows including … Workers Builds triggers" -> seven workflow files plus Workers Builds triggers configured by PR #52 (not a workflow).
30. src 10:39 `.eas/workflows/release-*.yml` called "build profiles" -> workflows (proposed names), not eas.json profiles.
31. src 09:45 cites "audit §3" for no consent record -> review §6 (inference). src 08:69 cites review §8 for "no self-registration" -> cite D-13 instead.
33. src 07:226 garbled -> "≤1,000 queries per Worker invocation (Paid)".
34. src 07:135 garbled -> "search stays plain LIKE until measured need".
35. src 08:196 API_BASE env at test time can't redirect an exported bundle (EXPO_PUBLIC_* inlined) -> rebuild with bad base or Playwright route interception.
36. src 05:182 `pnpm dlx gitleaks` wrong (Go binary) -> gitleaks binary or gitleaks GitHub Action.
37. src 01:238-240 matrix completeness check only checks existing rows -> loop over the 23 legacy table names and require each.
38. src 02:286 grep fx-serra-demo conflicts with fixture ID scheme (01:158 fx-cotijuba-001) and 02 has no profile split -> drop it.
39. src 09:17 "Cotijuuba" typo.
40. src 09:96-130, 151-158 subsections inserted inside bullet lists break structure -> move subsections after the lists they interrupt.
41. src 10:99-100, 110-111 lists directly after tables without blank line -> add blank lines/headings.
42. src 01:256-259 GATE callout: only first line has '>' -> prefix every line.
