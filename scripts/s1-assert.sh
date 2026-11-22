#!/usr/bin/env bash
# S1 raw-HTML assertion (task 02-10): prove the static export carries SEO
# metadata in the raw HTML — no JavaScript.
#
# Failure class it catches: (1) a page rendered without its <title>, og: tags
# or hreflang alternates (the exact regression SDK 58's <Head> deprecation
# made silent — expo-stack research §1.3); (2) a page missing from the export
# entirely (e.g. generateStaticParams removed — deliberate-failure demo 02-11a
# proved the gate fails for exactly this).
#
# Usage: s1-assert.sh [destination-id]   (default: cotijuba)
#
# Asserts, for the root page, every locale's list page and EVERY fixture
# place's detail page (expected pages are derived from
# packages/fixtures/<destination>/places.json — a missing page fails):
#   - a <title> element
#   - og:title, og:description and og:locale meta properties
#   - hreflang alternates for all six locales
# Then s1-cluster-check.mjs adds the structural checks (og:locale OG form,
# hreflang cluster shape + reciprocity, per-locale <html lang>, and the list
# page linking every detail slug in raw HTML).
# Prints counts on success; names file and reason on failure.
set -euo pipefail
cd "$(dirname "$0")/.."

DEST="${1:-cotijuba}"
DIST="apps/app/dist"
FIXTURE="packages/fixtures/$DEST/places.json"
LOCALES=("en" "pt-BR" "es" "fr" "nl" "de")

fail() {
  echo "s1-assert: FAIL — $1"
  exit 1
}

[ -f "$FIXTURE" ] || fail "fixture $FIXTURE does not exist"
[ -f "$DIST/index.html" ] || fail "$DIST/index.html does not exist (export not run?)"

check_page() {
  local file="$1"
  [ -f "$file" ] || fail "missing page $file"
  grep -q "<title>" "$file" || fail "$file: no <title>"
  grep -q "og:title" "$file" || fail "$file: no og:title"
  grep -q "og:description" "$file" || fail "$file: no og:description"
  grep -q "og:locale" "$file" || fail "$file: no og:locale"
  local hl
  for hl in "${LOCALES[@]}"; do
    grep -q "hreflang=\"$hl\"" "$file" || fail "$file: no hreflang for $hl"
  done
}

check_page "$DIST/index.html"
pages=1

slugs=$(node -e '
  const places = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
  for (const p of places) console.log(p.slug);
' "$FIXTURE")
[ -n "$slugs" ] || fail "no places found in $FIXTURE"

for locale in "${LOCALES[@]}"; do
  list="$DIST/$locale/places/index.html"
  check_page "$list"
  pages=$((pages + 1))
  for slug in $slugs; do
    detail="$DIST/$locale/places/$slug.html"
    check_page "$detail"
    pages=$((pages + 1))
  done
done

node scripts/s1-cluster-check.mjs "$DIST" "packages/fixtures/$DEST"

total_html=$(find "$DIST" -name "*.html" -type f | wc -l)
echo "s1-assert: OK — $pages journey pages checked against $FIXTURE (title, og:title, og:description, og:locale, 6 hreflang each); $total_html HTML files total in $DIST"
