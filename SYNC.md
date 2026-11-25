# Sync: Vinge design system → this repo

One direction only. The design system (`knowit/vinge-design-system`) is the
source of truth for components, tokens, assets **and** the page templates.
Nothing here is ever pushed back; a page that differs from the DS copy is a bug.

## The loop

1. In a clone of `knowit/vinge-design-system`: `scripts/refresh-repo.sh`, then
   commit. That brings its `repo/` folder up to date with the design system.
2. Here: `scripts/sync.sh <path to that clone>/repo`

That copies verbatim, commits, pushes, and Pages rebuilds. No file needs
editing by hand at any point.

(Until November 2026 step 1 was a request in the Claude Design project, which
handed back a zip. Claude Design is closed; the design system's repository is
the master now.)

## What the script overwrites

`templates/`, `assets/`, `tokens/` (mirrored, so deletions propagate) and
`_ds_bundle.js`, `styles.css`, `index.html`, `README.md`.

## What it keeps

`scripts/`, `SYNC.md`, `.github/`, `.nojekyll`, `.git/`.

Client proposals do not go here: this site is public. They go to `knowit/vinge-prototypes`
(https://vinge-prototypes.pages.dev, behind a password).

## What it leaves out

Design-system working files that are not part of the site: `.thumbnail`,
`*.prompt.md` (the templates' requirement notes, which cite internal tickets),
`*.card.html`, the standalone landing page (`*.standalone.html`,
`*.standalone.js`, `assets/standalone/`) and the contact-mark sketch
(`Contact mark options.html`, `contactMarks.js`). The list is `EXCLUDE` in
`scripts/sync.sh`. Claude Design's export left out the same files.

## Constraints that must not drift

- **Folder depth.** Pages reach shared files as `../../…` and each other as
  `../<slug>/<Page>.dc.html`. Flattening or renaming a folder breaks images,
  fonts, the video and every link, with nothing in the console.
- **`.nojekyll`.** Without it GitHub Pages drops `_ds_bundle.js` for its
  leading underscore and every page renders unstyled.
- **No re-authoring.** Never rebuild, port or "improve" a page file. Verbatim
  copy is the only migration that keeps the prototype intact.

## Verify after a sync

- Landing page: wordmark header blends on scroll.
- Fonts are the real faces, not a fallback serif.
- Header menu moves between pages.
- A link in the finder panel: transcript un-prints, panel docks and folds to
  the peek, then the next page loads with the panel already peeking.
- The person page needs network (portraits come through an image proxy).
