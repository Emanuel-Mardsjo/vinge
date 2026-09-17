#!/usr/bin/env bash
# Refresh this repo from a Vinge design-system export, then publish.
#
#   scripts/sync.sh ~/Downloads/repo
#
# The argument is an unzipped export of the design system's `repo/` folder
# (produced in the design-system project). The copy is verbatim and one-way:
# DS → here. Anything hand-maintained here is listed under KEEP below and is
# never touched.
set -euo pipefail

SRC="${1:-}"
if [[ -z "$SRC" || ! -d "$SRC" ]]; then
  echo "usage: scripts/sync.sh <path-to-unzipped-DS-export>" >&2
  exit 1
fi
if [[ ! -f "$SRC/_ds_bundle.js" || ! -d "$SRC/templates" ]]; then
  echo "error: $SRC does not look like a DS export (no _ds_bundle.js / templates/)" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Hand-maintained here; never overwritten by a sync.
KEEP=(scripts SYNC.md .git .github .nojekyll)

# Overwritten wholesale. Deletions in the DS propagate (rsync --delete), so a
# template folder removed there is removed here too.
for d in templates assets tokens; do
  rsync -a --delete "$SRC/$d/" "$d/"
done
for f in _ds_bundle.js styles.css index.html README.md; do
  [[ -f "$SRC/$f" ]] && cp "$SRC/$f" "$f"
done

# Pages needs this and the export does not always carry it through a browser zip.
touch .nojekyll

if git diff --quiet && git diff --cached --quiet; then
  echo "no changes — already in sync"
  exit 0
fi

git add -A
git commit -m "Sync from Vinge design system ($(date +%Y-%m-%d))"
git push
echo "pushed. Pages will rebuild in a minute or two."
