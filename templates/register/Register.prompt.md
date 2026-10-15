# Register A–Ö

The listing page type for Verksamhetsområden (`/vara-tjanster/verksamhetsomraden/`, 34 rows) and Branscher (`/vara-tjanster/branscher/`, 15 rows). It shares the case listing's filter panel, but the rows are laid out as columns, one per first letter, A to Ö.

## Sections

- `PageBanner`: the page title and its trail (Start, Våra tjänster, the page). No intro, no image.
- `Record` in listing mode with `spine="letter"`, `columns`, `readout={false}`, `views={false}`. Each letter is a column: the letter in the display face, then its rows as plain links to the page. As many columns as the field fits; the rows of a line of letters start level.

## Content rules

- Every visible string comes from the data (`register-data.js`) or a component's fixed labels. Nothing is written for these pages.
- One row per item, labelled with `label` (link text on the live index page). Every row, none added.
- Groups: `letter`, sorted with `localeCompare(…, 'sv')` (A–Z, then Å, Ä, Ö). An empty letter is not a group.
- Search reads `label`, `h1` and every `children[].h1`, never the ingress. A row found by something other than its label shows what found it under the row.
- The panel: `FilterSearch` (placeholder *Verksamhetsområde, delområde* or *Bransch, delområde*: what the search reads, in the case listing's pattern), then the letter list, without counts. No work-type or discipline lists.
- Copy not in the data: the count line, `{n} av {total} verksamhetsområden`, `{n} av {total} branscher`.

## Routes (prototype)

`/verksamhetsomraden`, `/branscher` and their `/vara-tjanster/…` forms open this template with `?p=`. Row links are the live hrefs and open the content page: the full expertise page where its data exists, otherwise the banner with the page's H1 and trail.

## Tweaks

- `page`: which register.
- `rowLabel`: `link` (default, the live link text) or `h1` (the page's own H1). Open for Vinge: on six rows the two differ, and the choice moves rows between letters.

## Umbraco

The page holds no editorial content. The rows are the published practice-area or sector pages under it: label from the page's navigation title; its H1 and children's H1s are searched.
