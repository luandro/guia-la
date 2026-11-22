# Approval list — actions that always need a human

> Phase 00 deliverable (PR 00-7). An agent never runs the actions below alone.
> Ask the owner first. Wait for a recorded yes before you act. A "recorded
> yes" is an owner comment or approval on the GitHub PR or issue, or an entry
> in [planning/decisions.md](../../planning/decisions.md).

## Always ask first

1. **Production data writes** — any write to production data or a production store. This includes production migrations and data fixes.
2. **Credentials and secrets** — create, rotate, view or delete any key, token or password. Legacy key rotation is D-12: owner TODO (tsk #297), outside this repo.
3. **Tenancy and auth changes** — add or remove a destination tenant; change roles, scopes or the auth flow (Cloudflare Access, D-09).
4. **Store publication** — any app-store release, listing or metadata change. The owner must own `guia.la` before the first store release (D-01).
5. **Spending** — any paid plan, paid tool or paid service, and any move off free tiers. This includes any service that needs a payment method on the account (R2 does). Free tiers only for now (D-08): no Workers Paid, no Expo Starter. An upgrade is a new owner decision.
6. **Domain purchase and DNS** — buy a domain or change a DNS record. This includes `guia.la` and `cotiju.app`.
7. **Disabling required checks** — no skip of a required CI check, branch protection rule or review gate. Never on a hard PR. (Docs/setup merges: see Standing exceptions below.)
8. **Legacy production** — any production action on `luandro/cotiju-app`. Access is read-only. Legacy backups and exports are owner-run only, with a backup before any export. Never commit legacy personal data, or media with unverified rights, to git, fixtures, staging or PR artifacts.
9. **Governance files** — edits to `AGENTS.md`, `SPEC.md`, `docs/security/`, `planning/decisions.md`, `docs/adr/` or `.github/workflows/` need a recorded owner approval before merge.
10. **Repository visibility** — never change the repository between private and public.
11. **Deploys and cloud resources** — any deploy to staging or production, and creating or deleting any cloud resource (Workers, D1, R2, Access apps, backups).
12. **Failing tests** — never delete, skip, quarantine or weaken a failing test.
13. **Telemetry and personal data** — adding telemetry, or any new personal-data collection.

## Standing exceptions

- Docs/setup non-hard PRs merge with `SKIP_BUGHUNT=1` per AGENTS.md. Never on a hard PR.
- The owner pre-authorizes OhMyBug lite hunts on the AGENTS.md triggers — they run only after codex review, in the order AGENTS.md fixes.

## Secrets policy

- Secrets live in environment variables only.
- Never write a secret value into a config file, a report, a PR body or chat output.
- Never put a secret in an `EXPO_PUBLIC_*` variable or in `app.config` `extra` — Expo inlines both into the client bundle (the D-12 failure).
- Never read local secret files (`.env`, `.dev.vars`) into output.
- Setting platform secrets (`gh secret set`, `wrangler secret put`, EAS secrets) is item 2 — ask first.
- Redact secrets and personal data in PR evidence excerpts and screenshots.

## Privacy baseline (LGPD)

- guia.la collects no visitor personal data in v1 (D-13a approved; D-13b, no visitor accounts at all, proposed).
- Visitor location stays on-device; it is never sent to analytics or logs. No IP, device id or precise location enters analytics.
- Map tile requests reveal the visitor's IP to the tile host — disclose this in the privacy notice.
- Editor personal data (Cloudflare Access email, audit logs) is kept minimal, with a stated retention period.
- Business contacts may be published only with `contactConsent` and `publishContact` flags, recorded by an editor. Natural-person contacts (for example moto-taxi drivers) additionally need consent provenance — `consentedAt`, `recordedBy`, scope — and a takedown path: unpublish, static rebuild, cache purge.

## Budget

- Ceiling (D-08, approved 2026-11-21): free tiers only. No Workers Paid, no Expo Starter.
- Any spend or upgrade is a new owner decision — see item 5 above.

## Sources

- Decision register: [planning/decisions.md](../../planning/decisions.md) — statuses as of 2026-11-21.
- Phase 00 playbook, task 7: [planning/src/phases/phase-00.md](../../planning/src/phases/phase-00.md).
