#!/usr/bin/env bash
# Phase 01 legacy-audit checks. Run from the repository root
# (scripts/check.sh calls this after check-docs).
# Usage: scripts/check-legacy.sh [fixtures-dir]   (default: packages/fixtures)
#
# (a) Privacy scan: fixtures must contain no personal data (Brazilian phone
#     patterns, provider or generic emails) and no URLs to real images.
#     Failure class it catches: a real phone, address or hotlinked photo
#     copied "because it was useful" into synthetic fixtures.
# (b) Matrix completeness lint (phase-01.md "Automated verification"): every
#     legacy table name must have a matrix row carrying exactly one verdict.
#     Catches: a table silently left without a recorded verdict.
# (c) Fixture JSON validity plus the shared fixture contract: pt-BR content
#     on every place, unique ids, kebab-case ascii slugs, source "synthetic".
#     Catches: fixture drift away from the contract phases 02-08 consume.
set -euo pipefail
cd "$(dirname "$0")/.."

FIXTURES_DIR="${1:-packages/fixtures}"
MATRIX="docs/legacy/extraction-matrix.md"

fail() { echo "check-legacy: FAIL - $*" >&2; exit 1; }

test -d "$FIXTURES_DIR" || fail "fixtures dir not found: $FIXTURES_DIR"
test -f "$MATRIX" || fail "matrix not found: $MATRIX"

# (a) Privacy scan: expects no output. Patterns from phase-01.md plus a
# generic email form and http(s) image URLs.
privacy_hits=$(grep -rEn \
  '(\+55|559[0-9]{8}|55 9[0-9]{2} [0-9]{4}-[0-9]{4}|@gmail|@outlook|@hotmail|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|https?://[^"[:space:]]+\.(jpe?g|png|webp|gif|svg))' \
  "$FIXTURES_DIR" || true)
if [ -n "$privacy_hits" ]; then
  echo "check-legacy: FAIL - personal data or real media URLs in $FIXTURES_DIR:" >&2
  printf '%s\n' "$privacy_hits" >&2
  exit 1
fi

# (b) Matrix completeness lint: each of the 23 legacy table names must
# appear as a row carrying a verdict; a table absent from the matrix fails.
for t in places beach_locations boat_schedules tide_data weather_data \
         moto_taxi_drivers events profiles user_photos business_photos \
         location_reviews place_reviews review_comments photo_likes \
         place_suggestions place_edit_suggestions owner_requests admin_users \
         admin_audit_log audit_log business_edit_audit rate_limits event_updates; do
  grep -E "^\| $t \|" "$MATRIX" \
    | grep -qE '\| (concept|code|data|fixture|reject) \|' \
    || fail "$t: row missing or lacks a verdict"
done

# (c) JSON validity and shared fixture contract.
python3 -I - "$FIXTURES_DIR" <<'PY'
import json
import os
import re
import sys

fixtures = sys.argv[1]
LOCALES = ["pt-BR", "en", "es", "fr", "nl", "de"]
CATEGORIES = {"beach", "restaurant", "stay", "waterfall", "trail"}
errors = []

dest_dirs = sorted(
    d for d in os.listdir(fixtures) if os.path.isdir(os.path.join(fixtures, d))
)
if not dest_dirs:
    errors.append(f"{fixtures}: no destination directories found")

for dest in dest_dirs:
    d = os.path.join(fixtures, dest)

    def load(name):
        path = os.path.join(d, name)
        if not os.path.isfile(path):
            errors.append(f"{dest}/{name}: missing")
            return None
        try:
            with open(path, encoding="utf-8") as fh:
                return json.load(fh)
        except ValueError as e:
            errors.append(f"{dest}/{name}: invalid JSON: {e}")
            return None

    destination = load("destination.json")
    categories = load("categories.json")
    places = load("places.json")

    if destination is not None:
        if destination.get("id") != dest:
            errors.append(
                f"{dest}/destination.json: id must be {dest!r}, "
                f"got {destination.get('id')!r}"
            )
        if destination.get("defaultLocale") != "pt-BR":
            errors.append(f"{dest}/destination.json: defaultLocale must be 'pt-BR'")
        if destination.get("locales") != LOCALES:
            errors.append(f"{dest}/destination.json: locales must be {LOCALES}")
        if destination.get("source") != "synthetic":
            errors.append(f"{dest}/destination.json: source must be 'synthetic'")
        if not isinstance(destination.get("name"), str) or not destination["name"]:
            errors.append(f"{dest}/destination.json: name must be a non-empty string")

    cat_ids = set()
    if categories is not None:
        if not isinstance(categories, list) or not categories:
            errors.append(f"{dest}/categories.json: must be a non-empty array")
            categories = []
        for c in categories:
            cid = c.get("id")
            if cid not in CATEGORIES:
                errors.append(f"{dest}/categories.json: bad category id {cid!r}")
            if cid in cat_ids:
                errors.append(f"{dest}/categories.json: duplicate category id {cid!r}")
            cat_ids.add(cid)
            label = c.get("label")
            if not isinstance(label, dict) or sorted(label.keys()) != sorted(LOCALES):
                errors.append(
                    f"{dest}/categories.json: label for {cid!r} must carry all six locales"
                )

    seen_ids = set()
    all_locales_seen = False
    pt_only_seen = False
    if places is not None:
        if not isinstance(places, list) or not places:
            errors.append(f"{dest}/places.json: must be a non-empty array")
            places = []
        for p in places:
            pid = p.get("id")
            if pid in seen_ids:
                errors.append(f"{dest}/places.json: duplicate place id {pid!r}")
            seen_ids.add(pid)
            if not re.fullmatch(r"fx-[a-z]+-\d{3}", pid or ""):
                errors.append(f"{dest}/places.json: bad id {pid!r} (expected fx-<dest>-NNN)")
            slug = p.get("slug")
            if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", slug or ""):
                errors.append(f"{dest}/places.json: slug {slug!r} is not kebab-case ascii")
            if p.get("category") not in CATEGORIES or p.get("category") not in cat_ids:
                errors.append(
                    f"{dest}/places.json: place {pid} category {p.get('category')!r} unknown"
                )
            if p.get("source") != "synthetic":
                errors.append(f"{dest}/places.json: place {pid} source must be 'synthetic'")
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", p.get("verifiedAt") or ""):
                errors.append(f"{dest}/places.json: place {pid} verifiedAt must be YYYY-MM-DD")
            loc = p.get("location")
            if (
                not isinstance(loc, dict)
                or not isinstance(loc.get("lat"), (int, float))
                or not isinstance(loc.get("lng"), (int, float))
            ):
                errors.append(f"{dest}/places.json: place {pid} location must have numeric lat/lng")
            content = p.get("content")
            if not isinstance(content, dict) or "pt-BR" not in content:
                errors.append(f"{dest}/places.json: place {pid} content must include pt-BR")
                continue
            pt = content["pt-BR"]
            if not isinstance(pt, dict) or pt.get("machineTranslated") is not False:
                errors.append(
                    f"{dest}/places.json: place {pid} pt-BR machineTranslated must be false"
                )
            for locale, block in content.items():
                if locale not in LOCALES:
                    errors.append(f"{dest}/places.json: place {pid} unexpected locale {locale!r}")
                    continue
                if (
                    not isinstance(block, dict)
                    or not block.get("name")
                    or not block.get("summary")
                ):
                    errors.append(
                        f"{dest}/places.json: place {pid} locale {locale} needs name and summary"
                    )
                if not isinstance(block.get("machineTranslated"), bool):
                    errors.append(
                        f"{dest}/places.json: place {pid} locale {locale} "
                        "machineTranslated must be boolean"
                    )
            keys = sorted(k for k in content.keys() if k in LOCALES)
            if keys == sorted(LOCALES):
                all_locales_seen = True
            if keys == ["pt-BR"]:
                pt_only_seen = True
        if places and not all_locales_seen:
            errors.append(
                f"{dest}/places.json: contract requires at least one place with all six locales"
            )
        if places and not pt_only_seen:
            errors.append(
                f"{dest}/places.json: contract requires at least one place with only pt-BR"
            )

for e in errors:
    print(f"check-legacy: FAIL - {e}", file=sys.stderr)
if errors:
    sys.exit(1)
PY

echo "check-legacy: OK"
