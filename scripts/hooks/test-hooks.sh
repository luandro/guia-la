#!/usr/bin/env bash
# Regression test for the Claude Code hooks (D-15: a gate must prove it can fail).
# Pipes sample tool-input JSON into each hook and asserts the exit code.
set -euo pipefail
cd "$(dirname "$0")/../.."
# Running inside a git hook (pre-commit) exports GIT_INDEX_FILE etc.; they would
# leak into the throwaway repos created below.
unset GIT_DIR GIT_INDEX_FILE GIT_WORK_TREE GIT_PREFIX GIT_OBJECT_DIRECTORY GIT_COMMON_DIR GIT_ALTERNATE_OBJECT_DIRECTORIES
root=$(pwd)
fail=0
expect() { # expect <code> <description> <json>
  local want=$1 desc=$2 json=$3 got=0
  printf '%s' "$json" | bash scripts/hooks/guard-paths.sh >/dev/null 2>&1 || got=$?
  if [ "$got" != "$want" ]; then echo "test-hooks: FAIL - $desc (exit $got, want $want)"; fail=1; fi
}
expect_lock() { # expect_lock <code> <description> <json> <lock-file>
  local want=$1 desc=$2 json=$3 lock=$4 got=0
  printf '%s' "$json" | BUGFIX_TESTS_FILE="$lock" bash scripts/hooks/guard-paths.sh >/dev/null 2>&1 || got=$?
  if [ "$got" != "$want" ]; then echo "test-hooks: FAIL - $desc (exit $got, want $want)"; fail=1; fi
}
expect_secret() { # expect_secret <code> <description> <json>
  local want=$1 desc=$2 json=$3 got=0
  printf '%s' "$json" | bash scripts/hooks/guard-secrets.sh >/dev/null 2>&1 || got=$?
  if [ "$got" != "$want" ]; then echo "test-hooks: FAIL - $desc (exit $got, want $want)"; fail=1; fi
}
c() { printf '{"tool_input":{"command":"%s"}}' "$1"; }
j() { printf '{"tool_input":{"file_path":"%s"}}' "$1"; }
expect 2 "root dist" "$(j "$root/dist/index.html")"
expect 2 "nested app dist" "$(j "$root/apps/app/dist/index.html")"
expect 2 "package dist" "$(j "$root/packages/core/dist/x.js")"
expect 2 "generated composer output" "$(j "$root/apps/app/src/generated/w.ts")"
expect 2 "generated planning view" "$(j "$root/planning/phases/phase-02.html")"
expect 2 "generated planning index" "$(j "$root/planning/index.html")"
expect 2 "unparsable input" "not json"
expect 0 "normal source" "$(j "$root/packages/core/src/slug.ts")"
expect 0 "no file_path" '{"tool_input":{}}'
expect 0 "distillery is not dist" "$(j "$root/packages/core/src/distillery.ts")"
# normalized paths: guards must hold for worktree prefixes (AGENTS.md runs
# every task in .worktrees/<slug>) and for ..-bearing paths (PR #12 review)
expect 2 "planning index via .. path" "$(j "$root/apps/../planning/index.html")"
expect 2 "planning view under a worktree prefix" "$(j "$root/.worktrees/other/planning/phases/phase-02.html")"
expect 2 "planning index under a worktree prefix" "$(j "$root/.worktrees/other/planning/index.html")"
expect 2 "generated output under a worktree prefix" "$(j "$root/.worktrees/other/apps/app/src/generated/w.ts")"
expect 2 "dist under a worktree prefix" "$(j "$root/.worktrees/other/dist/x.js")"
expect 0 "own worktree tree is editable" "$(j "$root/packages/core/src/slug.ts")"
# bug-fix lock via BUGFIX_TESTS_FILE on a temp file: the suite never touches
# the live .state lock (PR #12 review: the old version overwrote it).
state_lock="$root/.state/bugfix-tests"
state_before=$(cat "$state_lock" 2>/dev/null || true)
tmplock=$(mktemp)
echo "packages/core/src/slug.test.ts" >"$tmplock"
expect_lock 2 "bug-fix locked test via BUGFIX_TESTS_FILE" "$(j "$root/packages/core/src/slug.test.ts")" "$tmplock"
expect_lock 2 "worktree path against bug-fix lock" "$(j "$root/.worktrees/other/packages/core/src/slug.test.ts")" "$tmplock"
expect_lock 0 "unlocked source with lock active" "$(j "$root/packages/core/src/slug.ts")" "$tmplock"
rm -f "$tmplock"
state_after=$(cat "$state_lock" 2>/dev/null || true)
if [ "$state_before" != "$state_after" ]; then
  echo "test-hooks: FAIL - suite modified the live .state/bugfix-tests lock"
  fail=1
fi
# secrets guard (guard-secrets.sh): .env/.dev.vars references blocked on file
# tools and Bash; .env.example (the committed template) stays allowed
expect_secret 2 "read .env" "$(j "$root/.env")"
expect_secret 2 "read .env.local" "$(j "$root/apps/app/.env.local")"
expect_secret 2 "read .dev.vars" "$(j "$root/apps/app/.dev.vars")"
expect_secret 2 "read .dev.vars.production" "$(j "$root/apps/app/.dev.vars.production")"
expect_secret 0 "read .env.example" "$(j "$root/.env.example")"
expect_secret 0 "read normal source" "$(j "$root/packages/core/src/slug.ts")"
expect_secret 2 "bash cat .env" "$(c "cat .env")"
expect_secret 2 "bash sed on .env.local" "$(c "sed -i s/a/b/ .env.local")"
expect_secret 2 "bash mv into .env" "$(c "mv .env.example .env")"
expect_secret 2 "bash env var referencing .env" "$(c "set -a; . ./.env; set +a")"
expect_secret 0 "bash cat .env.example" "$(c "cat .env.example")"
expect_secret 0 "bash harmless command" "$(c "ls -la packages")"
expect_secret 2 "secrets unparsable input" "not json"
# secrets guard fails closed without jq (empty PATH, bash by absolute path)
empty_path=$(mktemp -d)
bash_bin=$(command -v bash)
got=0
printf '{}' | env PATH="$empty_path" "$bash_bin" scripts/hooks/guard-secrets.sh >/dev/null 2>&1 || got=$?
if [ "$got" != 2 ]; then
  echo "test-hooks: FAIL - guard-secrets must fail closed without jq (exit $got, want 2)"
  fail=1
fi
rmdir "$empty_path"
# format hook never fails the tool call
for json in "$(j "$root/does/not/exist.ts")" "not json" '{}'; do
  printf '%s' "$json" | bash scripts/hooks/format-file.sh >/dev/null 2>&1 || { echo "test-hooks: FAIL - format-file exited non-zero"; fail=1; }
done
# format hook must run from the repo root (derived from its own location), so
# the root .prettierignore always applies: a .prettierignore'd file (**/*.md)
# passed from a subdirectory cwd stays untouched (PR #12 review)
fmt_fixture="$root/packages/core/tmp-format-hook-fixture.md"
printf '#   Messy   heading\n\n\n\n*   a\n*    b\n' >"$fmt_fixture"
fmt_before=$(cat "$fmt_fixture")
( cd "$root/apps" && printf '%s' "$(j "$fmt_fixture")" | bash "$root/scripts/hooks/format-file.sh" >/dev/null 2>&1 )
if [ "$(cat "$fmt_fixture")" != "$fmt_before" ]; then
  echo "test-hooks: FAIL - format-file formatted a .prettierignore'd file (cwd-dependent ignore)"
  fail=1
fi
rm -f "$fmt_fixture"
# trufflehog pre-push: with no usable base (no remote sha, no origin/main) the
# scan must cover the whole history — --since-commit skips its own start
# commit, so the root commit's content would never be scanned (PR #12 review)
th=$(mktemp -d)
mkdir -p "$th/bin"
cat >"$th/bin/trufflehog" <<'STUB'
#!/usr/bin/env bash
printf '%s\n' "$@" >"$(dirname "$0")/args"
exit 0
STUB
chmod +x "$th/bin/trufflehog"
git -C "$th" init -q -b main
git -C "$th" -c user.name=t -c user.email=t@example.com commit -q --allow-empty -m one
git -C "$th" -c user.name=t -c user.email=t@example.com commit -q --allow-empty -m two
( cd "$th" && PATH="$th/bin:$PATH" PRE_COMMIT_FROM_REF= PRE_COMMIT_TO_REF=HEAD bash "$root/scripts/hooks/trufflehog-push.sh" >/dev/null 2>&1 )
if [ ! -f "$th/bin/args" ]; then
  echo "test-hooks: FAIL - trufflehog-push did not run trufflehog (no-base case)"
  fail=1
elif grep -q '^--since-commit$' "$th/bin/args"; then
  echo "test-hooks: FAIL - trufflehog-push used --since-commit with no base (root commit skipped)"
  fail=1
fi
# with origin/main available, the scan must still be scoped to --since-commit
origin=$(mktemp -d)
git -C "$origin" init -q --bare
git -C "$th" remote add origin "$origin"
git -C "$th" push -q origin main
git -C "$th" fetch -q origin
git -C "$th" switch -q -c feature
git -C "$th" -c user.name=t -c user.email=t@example.com commit -q --allow-empty -m three
rm -f "$th/bin/args"
( cd "$th" && PATH="$th/bin:$PATH" PRE_COMMIT_FROM_REF= PRE_COMMIT_TO_REF=feature bash "$root/scripts/hooks/trufflehog-push.sh" >/dev/null 2>&1 )
if ! grep -q '^--since-commit$' "$th/bin/args"; then
  echo "test-hooks: FAIL - trufflehog-push ignored the origin/main base (full scan on every push)"
  fail=1
fi
rm -rf "$th" "$origin"
[ "$fail" = 0 ] && echo "test-hooks: OK"
exit "$fail"
