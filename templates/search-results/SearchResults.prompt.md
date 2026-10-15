# Search results (`/sok/?query=…`)

The site's ordinary search, beside the finder. It must behave as vinge.se's
does today, minus the live page's faults. Data: `assets/data/sok.json`,
read through SiteNav's `Sök` utility item (`search.load`, `search.find`), the
same object the menu's type-ahead uses.

## No authored copy

Every visible string is from `sok.json` (`page.*`, the rows) or a
component's fixed labels (`Filtrera`, `Rensa`, `Rensa sökningen`). The one
derived string is the count line, `{n} träffar` (`page.count_suffix`). Do not
add an intro, helper text, captions or a zero-hits sentence: the live page has
none (`no_hits_text: null`) and that line is Vinge's to write.

## Page

1. `PageBanner` with `search`: trail `Hem`, `Sök` (`page.breadcrumb`), the
   title `Sökresultat` (`page.results_heading`) small as the field's name, and
   the query at display-2 in the banner's own field. It re-queries after the
   type-ahead's pause (500ms) and at once on Enter. The banner is the tight
   variant so the filter row and the first group are on the first screen.
   With an empty query the page is the banner and nothing else.
2. (The field is the banner's; there is no second one.)
3. `ListingFilters` with one `checks` field: the six categories, each with its
   total as the note, in the listings' drawer at every size: the categories
   fold out under `Filtrera` (four across from MD, on the page's column lines; two on SM). Count line `{n} träffar`, n the sum of the visible
   categories' totals. `Rensa` clears the categories, never the query.
4. One group per category with rows, in this order: Medarbetare, Nyhet,
   Insights, Sidor, Uppdrag, Events. Heading = category name, `display-3` (a step under the query's display-2),
   `--space-4` above and `--space-3` below.
   First 8 rows (`page.page_size_per_category`), then `Fler resultat` adds 8
   and goes once every row is shown.
   - Medarbetare: four across from MD, each card on two page columns at LG
     and one at MD; two across on SM (`[data-search-people]` in grid.css).
     The people listing's card (4:5 `ImageReveal` on the noir
     plate, colour on hover, name, roles).
   - Everything else: `NewsList` without images, date on column 1 (the
     publication date, `date_shown_first_page`, in the news stream's form),
     title as the headline, the description under it in secondary ink,
     clamped to 3 lines. Sidor carries no date; its descriptions arrive cut
     with ` ...` and are shown as they are.
5. `ClosingFooter`. No finder block.

Zero hits: banner, field with the query, `0 träffar`. Nothing else.

## Address

`?query=avtal&employees=1&mandates=1` (`page.filter_url_params`), written on
every change and restored on load. A filtered address opens the drawer.
Routing: `/sok` is in `ROUTES` in every `ds-base.js`, and `go()` carries the
query string to this page.

## Prototype limits

The four harvested queries render the API's rows and totals. Any other query
matches every harvested row by substring; its totals are what matched.
`Fler resultat` stops at the harvest (e.g. *avtal* Uppdrag: 368 total, 16
rows), so the count line and the option notes can exceed the rows on screen.
