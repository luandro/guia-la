#!/usr/bin/env bash
# Regression test for the Claude Code hooks (D-15: a gate must prove it can fail).
# Pipes sample tool-input JSON into each hook and asserts the exit code.
set -euo pipefail
cd "$(dirname "$0")/../.."
root=$(pwd)
fail=0
expect() { # expect <code> <description> <json>
  local want=$1 desc=$2 json=$3 got=0
  printf '%s' "$json" | bash scripts/hooks/guard-paths.sh >/dev/null 2>&1 || got=$?
  if [ "$got" != "$want" ]; then echo "test-hooks: FAIL - $desc (exit $got, want $want)"; fail=1; fi
}
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
# bug-fix lock, using a temporary lock file restored afterwards
lock="$root/.state/bugfix-tests"
had_lock=0; [ -f "$lock" ] && had_lock=1 && cp "$lock" "$lock.test-hooks.bak"
mkdir -p "$root/.state"
echo "packages/core/src/slug.test.ts" >"$lock"
expect 2 "bug-fix locked test" "$(j "$root/packages/core/src/slug.test.ts")"
expect 0 "unlocked source with lock active" "$(j "$root/packages/core/src/slug.ts")"
if [ "$had_lock" = 1 ]; then mv "$lock.test-hooks.bak" "$lock"; else mv "$lock" "$lock.test-hooks.done"; fi
# format hook never fails the tool call
for json in "$(j "$root/does/not/exist.ts")" "not json" '{}'; do
  printf '%s' "$json" | bash scripts/hooks/format-file.sh >/dev/null 2>&1 || { echo "test-hooks: FAIL - format-file exited non-zero"; fail=1; }
done
[ "$fail" = 0 ] && echo "test-hooks: OK"
exit "$fail"
