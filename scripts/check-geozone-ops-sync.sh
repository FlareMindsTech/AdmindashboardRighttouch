#!/usr/bin/env bash
# Compare the standalone GeoZone Ops map with the vendored dashboard copy.
#
# The dashboard copy intentionally contains postMessage integration hooks, so a
# plain diff will normally be non-empty. Use this script to review drift after
# updating the standalone map, then port the relevant changes manually.
#
# Usage:
#   scripts/check-geozone-ops-sync.sh            # report differences
#   scripts/check-geozone-ops-sync.sh --strict   # exit 1 when files differ
#
# Override the source location with GEOZONE_OPS_SOURCE=/path/to/map.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="${GEOZONE_OPS_SOURCE:-$HOME/flareminds/map}"
TARGET_DIR="$ROOT_DIR/public/geozone-ops"
STRICT=0

if [[ "${1:-}" == "--strict" ]]; then
  STRICT=1
fi

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "GeoZone Ops source not found: $SOURCE_DIR" >&2
  echo "Set GEOZONE_OPS_SOURCE to the standalone map directory." >&2
  exit 2
fi

changed=0

for file in app.js index.html index.css; do
  source_file="$SOURCE_DIR/$file"
  target_file="$TARGET_DIR/$file"

  if [[ ! -f "$source_file" ]]; then
    echo "skip   $file (missing in source)"
    continue
  fi

  if [[ ! -f "$target_file" ]]; then
    echo "MISSING $file in vendored copy"
    changed=1
    continue
  fi

  if diff -q "$source_file" "$target_file" >/dev/null; then
    echo "same   $file"
  else
    echo "DIFF   $file"
    diff -u "$source_file" "$target_file" | sed -n '1,120p' || true
    changed=1
  fi
done

if [[ $changed -eq 1 ]]; then
  echo
  echo "Vendored copy differs from the standalone map."
  echo "Port the intended changes to public/geozone-ops (keep postMessage hooks)."
  if [[ $STRICT -eq 1 ]]; then
    exit 1
  fi
else
  echo
  echo "Vendored copy matches the standalone map."
fi
