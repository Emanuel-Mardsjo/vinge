# Sync: Vinge design system → this repo

One direction only. The design system is the source of truth for components,
tokens, assets **and** the seven page templates. Nothing here is ever pushed
back; a page that differs from the DS copy is a bug.

## The loop

1. In the Vinge design-system project chat: **"Refresh `repo/` from the current
   design system."** It re-copies the tree and hands back a zip.
2. Unzip it anywhere.
3. Here: `scripts/sync.sh ~/Downloads/repo`

That copies verbatim, commits, pushes, and Pages rebuilds. No file needs
editing by hand at any point.

## What the script overwrites

`templates/`, `assets/`, `tokens/` (mirrored, so deletions propagate) and
`_ds_bundle.js`, `styles.css`, `index.html`, `README.md`.

## What it keeps

`scripts/`, `SYNC.md`, `.github/`, `.nojekyll`, `.git/`.

## Constraints that must not drift

- **Folder depth.** Pages reach shared files as `../../…` and each other as
  `../<slug>/<Page>.dc.html`. Flattening or renaming a folder breaks images,
  fonts, the video and every link, with nothing in the console.
- **`.nojekyll`.** Without it GitHub Pages drops `_ds_bundle.js` for its
  leading underscore and every page renders unstyled.
- **No re-authoring.** Never rebuild, port or "improve" a page file. Verbatim
  copy is the only migration that keeps the prototype intact.

## Verify after a sync

- Landing page: hero video plays, wordmark header blends on scroll.
- Fonts are the real faces, not a fallback serif.
- Header menu moves between pages.
- A link in the finder panel: transcript un-prints, panel docks and folds to
  the peek, then the next page loads with the panel already peeking.
- The person page needs network (portraits come through an image proxy).
