# Review guide

Every reviewer (human, RevEngine, codex, other agents) uses these passes.
Read `docs/features/<slug>/spec.md` and `plan.md` first when they exist.

## Passes

1. **Bugs** — wrong behavior, broken edge cases, missing tests for the change,
   a test edited during a bug fix, TDD evidence missing (no red run quoted).
2. **Security and privacy** — secrets, injection, auth or tenancy gaps,
   personal data in logs or analytics, anything on
   [docs/security/APPROVAL-LIST.md](docs/security/APPROVAL-LIST.md) done
   without a recorded owner yes.
3. **Compliance** — the diff matches `spec.md` and `plan.md`; decisions in
   [planning/decisions.md](planning/decisions.md) are respected (i18n D-14,
   guardrails and TDD D-15, free tiers D-08); no hardcoded user-facing string.

## Severity

- **Important** — must be fixed or answered before merge.
- **Nit** — optional. At most five nits per review.

Skip generated paths: `planning/phases/*.html`, `planning/index.html`.
The authoring agent never approves its own PR. Repeated findings go into
AGENTS.md (or CLAUDE.md) so they stop recurring.
