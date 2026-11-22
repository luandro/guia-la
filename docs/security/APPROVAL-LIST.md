# Approval list — actions that always need a human

> Phase 00 deliverable (PR 00-7). An agent never runs the actions below alone.
> Ask the owner first. Wait for a recorded yes before you act.

## Always ask first

1. **Production data writes** — any write to production data or a production store. This includes production migrations and data fixes.
2. **Credentials and secrets** — create, rotate, view or delete any key, token or password. Legacy key rotation is D-12: owner TODO (tsk #297), outside this repo.
3. **Tenancy and auth changes** — add or remove a destination tenant; change roles, scopes or the auth flow (Cloudflare Access, D-09).
4. **Store publication** — any app-store release, listing or metadata change. The owner must own `guia.la` before the first store release (D-01).
5. **Spending** — any paid plan, paid tool or paid service, and any move off free tiers. Free tiers only for now (D-08): no Workers Paid, no Expo Starter. An upgrade is a new owner decision.
6. **Domain purchase and DNS** — buy a domain or change a DNS record. This includes `guia.la` and `cotiju.app`.
7. **Disabling required checks** — no skip of a required CI check, branch protection rule or review gate. One standing exception: docs-only PRs skip the paid OhMyBug hunt with `SKIP_BUGHUNT=1`, as AGENTS.md describes. Never on a hard PR.
8. **Legacy production** — any production action on `luandro/cotiju-app`. Access is read-only, with a backup before any export.

## Secrets policy

- Secrets live in environment variables only.
- Never write a secret value into a config file, a report, a PR body or chat output.

## Privacy baseline (LGPD)

- guia.la collects no visitor personal data in v1 (D-13a approved; D-13b, no visitor accounts at all, proposed).
- Business contacts may be published only with `contactConsent` and `publishContact` flags, recorded by an editor.

## Budget

- Ceiling (D-08, approved 2026-11-21): free tiers only. No Workers Paid, no Expo Starter.
- Any spend or upgrade is a new owner decision — see item 5 above.

## Sources

- Decision register: [planning/decisions.md](../../planning/decisions.md) — statuses as of 2026-11-21.
- Phase 00 playbook, task 7: [planning/src/phases/phase-00.md](../../planning/src/phases/phase-00.md).
