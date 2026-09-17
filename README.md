# Vinge prototype

Static snapshot of the Vinge prototype: seven interlinked pages built on the
Vinge design system. No build step, no dependencies to install. Every file in
this repo is served as-is.

## Run locally

Any static server from the repo root — the pages load siblings and
`../../assets/…`, so opening the files straight off disk (`file://`) will not
work.

```
python3 -m http.server 8000
# → http://localhost:8000
```

## Publish

Push and enable GitHub Pages on `main`, root folder. Nothing else to configure.
`.nojekyll` must stay: without it Pages' Jekyll step drops `_ds_bundle.js`
because of the leading underscore, and every page renders unstyled with no
components.

## Structure

```
index.html                  redirect to the landing page
_ds_bundle.js               compiled design-system components
styles.css, tokens/         global stylesheet and design tokens
assets/                     fonts, logos, images, hero video
templates/<slug>/
  <Slug>.dc.html            the page
  support.js                runtime that renders the page
  ds-base.js                loads tokens + bundle, and the route map
  *.js                      that page's data (people, news, chapters, …)
```

The pages are:

| Page | File |
| --- | --- |
| Landing page | `templates/landing-page/LandingPage.dc.html` |
| About | `templates/about-page/AboutPage.dc.html` |
| Article | `templates/article-page/ArticlePage.dc.html` |
| Find a lawyer | `templates/find-a-lawyer/FindALawyer.dc.html` |
| News listing | `templates/news-listing/NewsListing.dc.html` |
| People listing | `templates/people-listing/PeopleListing.dc.html` |
| Person page | `templates/person-page/PersonPage.dc.html` |

**Do not change the folder depth.** Pages reach shared files as `../../…` and
each other as `../<slug>/<Page>.dc.html`. Moving or flattening a folder breaks
images, fonts, the video and every link, silently.

## Links between pages

`ds-base.js` in each page folder carries a `ROUTES` / `PREFIXES` map that
resolves live-site paths (`/personer`, `/insikter/…`) — and absolute
`vinge.se` URLs, language segment stripped — to the sibling template file. A
route with no page behind it stays inert rather than navigating away. The same
block is duplicated in all seven folders; edit it in all seven or not at all.

## Network dependencies

The prototype is online-only:

- React and ReactDOM from `unpkg.com` (pinned, with integrity hashes), loaded
  by `support.js`.
- Portraits on the people listing, person page and article page come through
  the `images.weserv.nl` proxy in front of `vinge.se` media.

Both can be vendored into the repo if it ever needs to run on a closed network.

## Relation to the design system

This is a frozen copy. The source of truth is the Vinge design system project;
components live there and are compiled into `_ds_bundle.js`. To refresh this
repo, copy from the source again — verbatim, never re-authored:

| From (design system) | To (here) |
| --- | --- |
| `_ds_bundle.js`, `styles.css` | repo root |
| `tokens/`, `assets/` | `tokens/`, `assets/` |
| every folder under `templates/` | `templates/<same-slug>/` |

Editing a component here means editing build output — it will be overwritten by
the next copy.

## Verify after any refresh

- The landing page hero video plays and the wordmark header blends on scroll.
- Fonts are the real faces, not a fallback serif.
- The header menu moves between pages.
- Following a link in the finder panel: the transcript un-prints, the panel
  docks and folds to the peek, and only then does the next page load.
