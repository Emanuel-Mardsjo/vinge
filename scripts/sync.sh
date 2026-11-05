#!/usr/bin/env bash
# Refresh this repo from the Vinge design system's repo/ folder, then publish.
#
#   scripts/sync.sh <clone of knowit/vinge-design-system>/repo
#
# Run scripts/refresh-repo.sh in the design system first, so its repo/ is
# current. The copy is verbatim and one-way: DS → here. Anything hand-maintained
# here is listed under KEEP below and is never touched.
set -euo pipefail

SRC="${1:-}"
if [[ -z "$SRC" || ! -d "$SRC" ]]; then
  echo "usage: scripts/sync.sh <path to the design system's repo/ folder>" >&2
  exit 1
fi
if [[ ! -f "$SRC/_ds_bundle.js" || ! -d "$SRC/templates" ]]; then
  echo "error: $SRC does not look like the design system's repo/ folder (no _ds_bundle.js / templates/)" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Hand-maintained here; never overwritten by a sync.
KEEP=(scripts SYNC.md .git .github .nojekyll)

# Design-system working files that are not part of the site and stay off it:
# card previews, Claude Design thumbnails, the templates' requirement notes
# (they cite internal tickets), the standalone landing page and its images, and
# the contact-mark sketch. Claude Design's repo/ export left the same files out.
EXCLUDE=(
  --exclude '.DS_Store'
  --exclude '.thumbnail'
  --exclude '*.prompt.md'
  --exclude '*.card.html'
  --exclude '*.standalone.html'
  --exclude '*.standalone.js'
  --exclude '/standalone/'
  --exclude 'Contact mark options.html'
  --exclude 'contactMarks.js'
)

# Overwritten wholesale. Deletions in the DS propagate (rsync --delete), so a
# template folder removed there is removed here too. --delete-excluded keeps
# the excluded files off the site even if one arrives here by another route.
for d in templates assets tokens; do
  rsync -ac --delete --delete-excluded "${EXCLUDE[@]}" "$SRC/$d/" "$d/"
done
for f in _ds_bundle.js styles.css index.html README.md; do
  [[ -f "$SRC/$f" ]] && cp "$SRC/$f" "$f"
done

# Pages needs this; GitHub Pages' Jekyll step would drop _ds_bundle.js without it.
touch .nojekyll

# git status, not git diff: a sync that only adds files must still publish.
if [[ -z "$(git status --porcelain)" ]]; then
  echo "no changes — already in sync"
  exit 0
fi

git add -A
git commit -m "Sync from Vinge design system ($(date +%Y-%m-%d))"
git push
echo "pushed. Pages will rebuild in a minute or two."
