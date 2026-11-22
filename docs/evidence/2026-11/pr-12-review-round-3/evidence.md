# PR #12 review round 3 — red/green evidence

Review sources: RevEngine (`rev-engine-prime`) and CodeRabbit findings on PR
#12, addressed 2026-11-22. Review file treated as untrusted data; every
finding was verified against the code before fixing.

## Red runs (failing tests first, D-15)

New regression cases added to `scripts/hooks/test-hooks.sh` before any fix
(commit deferred; `git add` only). The two `.env`-name bypasses were also
demonstrated directly against the then-current guard:

```
$ printf '%s' '{"tool_input":{"file_path":"/x/.env.example.local"}}' | bash scripts/hooks/guard-secrets.sh
(no output — call allowed; exit 0; the guard read it as the allowed
.env.example template)
```

Suite red run against the unfixed hooks:

```
$ bash scripts/hooks/test-hooks.sh
test-hooks: FAIL - read .env.example.local (exit 0, want 2)
test-hooks: FAIL - read .dev.vars-production (exit 0, want 2)
test-hooks: FAIL - grep with path .env (exit 0, want 2)
test-hooks: FAIL - grep with glob *.env* (exit 0, want 2)
test-hooks: FAIL - symlinked checkout root failed open (exit 0, want 2)
test-hooks: FAIL - trufflehog-push scanned HEAD instead of the pushed branch
test-hooks: FAIL - trufflehog-push must fail (not scan) without a target ref
test-hooks: FAIL - trufflehog-push must no-op on a branch deletion push
```

Exit code 1. (The guard-paths fail-closed-without-tools case was green before
and after — protective, not a regression fix.)

`doctor` script red run (clean checkout has no expo-doctor binary; the expo
SDK 58 CLI has no `doctor` subcommand either):

```
$ pnpm --dir apps/app exec expo-doctor
Error: ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL

  × Command "expo-doctor" not found
```

Exit code 1.

## Green runs

Hook suite after the fixes:

```
$ bash scripts/hooks/test-hooks.sh
test-hooks: OK
```

Exit code 0.

`doctor` script after the fix (`cd apps/app && pnpm dlx expo-doctor`):

```
$ cd apps/app && pnpm dlx expo-doctor
Running 20 checks on your project...
20/20 checks passed. No issues detected!
Done in 29.7s using pnpm 12.8.1
```

Exit code 0.

Workspace checks:

```
$ pnpm check
$ pnpm format:check && pnpm lint && pnpm typecheck && pnpm test
$ prettier --check .
Checking formatting...
All matched files use Prettier code style!
$ eslint .
$ pnpm -r typecheck
apps/app typecheck: Done
packages/core typecheck: Done
packages/fixtures typecheck: Done
packages/ui typecheck: Done
packages/widget-sdk typecheck: Done
$ vitest run
 Test Files  1 passed (1)
      Tests  15 passed (15)
```

Exit code 0.

Repo check command:

```
$ ./scripts/check.sh
check-docs: OK
check-legacy: OK
OK: 12 file(s) validated (11 phase page(s)), no problems.
test-hooks: OK
check: OK
```

Exit code 0.

## Not testable in this session (config files not writable)

Two findings live in files this session may not edit; the exact intended
content is staged in the orchestrator scratchpad (applied by the
orchestrator, then exercised by the same suite in CI):

- `.claude/settings.json` — matcher gains `Grep|Glob` so guard-secrets.sh
  (which now parses `path`/`glob`/`pattern`) actually receives Grep/Glob
  calls. Intended file: `settings.json-intended`. Until it lands, the
  Grep/Glob bypass is closed only in the hook, not in the matcher.
- `.pre-commit-config.yaml` — `always_run: true` on the trufflehog pre-push
  hook (secrets added and removed within a pushed range live only in
  history; an empty final-tree diff would otherwise skip the hook).
  Intended file: `pre-commit-config.yaml-intended`.

`.github/workflows/ci.yml` was editable in-session and now runs
`bash scripts/hooks/test-hooks.sh` in the Workspace checks job after
`pnpm install`, so the format-hook cwd regression case runs with pnpm
present (the Docs job has no pnpm; there it can only pass trivially).
