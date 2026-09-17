// Loads this design system into the template. In a consuming project, point
// base at the bound DS folder relative to this file (e.g. '_ds/<folder>' at
// the project root, '../_ds/<folder>' one level down) — one line to edit.
(() => {
  /* The page can mount this loader twice (helmet mount, then remount), and
     appending the tags again would evaluate the whole bundle a second time and
     redeclare every @font-face. One load per page, guarded here. */
  if (window.__dsBase) return;
  window.__dsBase = true;

  /* One clean paint. The stylesheets, the bundle and the webfonts all arrive
     after the markup, so an ungated page shows unstyled text, then reflows as
     each sheet lands, then pops again as components replace their placeholders.
     Instead the document is held invisible (on the paper ground, so there is no
     white flash), CSS animations are held at their first frame, and the whole
     page is revealed in one short fade once styles, bundle, fonts and the
     above-the-fold images are in. Timeouts floor every wait, so nothing that
     fails to answer can leave the page blank. While a template is being
     authored the markup streams in on purpose — the gate steps aside then. */
  const streaming = () => document.documentElement.classList.contains('sc-dc-streaming');
  const reveal = () => {
    document.documentElement.setAttribute('data-ds-ready', '');
    /* The veil normally takes itself out on transitionend; this covers the
       case where it was mounted after the reveal and so never transitioned. */
    window.setTimeout(() => { const v = document.getElementById('ds-veil'); if (v) v.remove(); }, 500);
  };
  if (!streaming()) {
    const gate = document.createElement('style');
    /* Hidden, then uncovered — never faded by an opacity on <body>. An
       opacity below 1 on an ancestor isolates the group, and the headers'
       wordmark and glyphs are drawn in exclusion against the page behind
       them: inside an isolated group they have nothing to blend with and
       render as plain paper, so every light page opened with an inverted
       header for the length of the fade. The fade is a paper veil over the
       page instead, which leaves the blend alone. */
    gate.textContent = 'html:not([data-ds-ready]) body{visibility:hidden}'
      + 'html:not([data-ds-ready]) *,html:not([data-ds-ready]) *::before,html:not([data-ds-ready]) *::after{animation-play-state:paused !important}'
      + 'html{background:#F7F6FA}'
      + '#ds-veil{position:fixed;inset:0;z-index:2147483647;background:#F7F6FA;visibility:visible;pointer-events:none;transition:opacity 260ms cubic-bezier(.22,.61,.36,1)}'
      + 'html[data-ds-ready] #ds-veil{opacity:0}';
    document.head.appendChild(gate);
    const veil = () => {
      if (document.getElementById('ds-veil') || !document.body) return;
      const v = document.createElement('div');
      v.id = 'ds-veil';
      v.addEventListener('transitionend', () => v.remove(), { once: true });
      document.body.appendChild(v);
    };
    if (document.body) veil(); else document.addEventListener('DOMContentLoaded', veil, { once: true });
    /* If authoring starts after this ran, get out of the way at once. */
    new MutationObserver(() => { if (streaming()) reveal(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }
  const after = (ms) => new Promise((r) => window.setTimeout(r, ms));
  const frame = () => new Promise((r) => window.requestAnimationFrame(() => window.requestAnimationFrame(r)));
  const floor = (p, ms) => Promise.race([p, after(ms)]);
  /* Images already in the markup and not deferred: a hero that decodes a beat
     late is the most visible pop of all. Lazy ones are below the fold. */
  const images = () => Promise.all(Array.from(document.images)
    .filter((i) => i.loading !== 'lazy' && !i.complete)
    .slice(0, 12)
    .map((i) => new Promise((r) => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); })));
  const gates = [];
  const base = '../..';
  /* Routing. A template is a demo of a real page, so its links point at the
     live site's routes ('/personer', '/insikter/...') and the panel's people
     carry absolute profile URLs on the live host. No such document exists
     here, so a site route is resolved against the seven template files and
     followed as a sibling file; the origin is stripped off vinge.se URLs
     first, and a language segment with it, so /personer and /en/our-people
     land on the same page. A route with no template behind it stays inert
     rather than navigating the frame off the template for good. Anchors,
     mail, telephone, downloads, other hosts and relative links between
     template files are left alone. */
  const ROUTES = {
    '/': '../landing-page/LandingPage.dc.html',
    '/om-oss': '../about-page/AboutPage.dc.html',
    '/personer': '../people-listing/PeopleListing.dc.html',
    '/hitta-advokat': '../find-a-lawyer/FindALawyer.dc.html',
    '/hitta-ratt-person': '../find-a-lawyer/FindALawyer.dc.html',
    '/nyheter': '../news-listing/NewsListing.dc.html',
    '/insikter': '../news-listing/NewsListing.dc.html',
    '/uppdrag': '../news-listing/NewsListing.dc.html',
    '/verksamhetsomraden': '../news-listing/NewsListing.dc.html',
    '/karriar': '../about-page/AboutPage.dc.html',
  };
  /* A prefix stands for a whole class of route: any one person, any one
     article, any practice area. The exact map above wins first, so
     '/personer' is still the list and '/uppdrag' still the flow. */
  const PREFIXES = [
    ['/personer/', '../person-page/PersonPage.dc.html'],
    ['/our-people/', '../person-page/PersonPage.dc.html'],
    ['/insikter/', '../article-page/ArticlePage.dc.html'],
    ['/uppdrag/', '../article-page/ArticlePage.dc.html'],
    ['/verksamhetsomraden/', '../news-listing/NewsListing.dc.html'],
    ['/karriar/', '../about-page/AboutPage.dc.html'],
  ];
  /* The site path an href asks for, or null when the href is not a site link. */
  const route = (raw) => {
    let href = String(raw || '');
    if (/^https?:\/\//i.test(href)) {
      let u;
      try { u = new URL(href); } catch (err) { return null; }
      if (!/(^|\.)vinge\.se$/i.test(u.hostname)) return null;
      href = u.pathname;
    } else if (!href.startsWith('/') || href.startsWith('//')) {
      return null;
    }
    href = href.split('#')[0].split('?')[0].replace(/^\/(en|sv)(?=\/|$)/i, '');
    href = href.replace(/\/+$/, '');
    return href || '/';
  };
  const fileFor = (path) => {
    if (!path) return null;
    if (ROUTES[path]) return ROUTES[path];
    for (const pair of PREFIXES) {
      if (path.indexOf(pair[0]) === 0 && path.length > pair[0].length) return pair[1];
    }
    return null;
  };
  const go = (raw) => {
    const dest = fileFor(route(raw));
    if (dest) window.location.href = dest;
  };
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    /* A disclosure trigger is not a destination. The menu's "Se all vår
       expertis" carries an href for the real site but folds its children out
       instead of navigating; this listener runs in the capture phase, before
       the component's own handler can cancel the click, so it has to stand
       aside on its own. Marked by aria-expanded, or by data-no-route. */
    if (a.hasAttribute('aria-expanded') || a.hasAttribute('data-no-route')) return;
    const path = route(a.getAttribute('href'));
    if (!path) return;
    e.preventDefault();
    /* A link inside the finder is not followed here: the panel docks and folds
       to the peek first, and raises `vinge:navigate` when it has arrived. */
    if (a.closest('[data-finder-frame]')) return;
    go(path);
  }, true);
  window.addEventListener('vinge:navigate', (e) => go(e.detail && e.detail.href));
  /* The bundle and the stylesheets are recompiled in place on every edit, so
     they are requested with a per-load key: without it the browser serves the
     build it cached and the page renders the previous design system. */
  /* Every component reference reserves its space with a placeholder box while
     the bundle loads. Reserving the space is right — the page must not jump —
     but a grey fill and a border on each of them reads as broken content for
     the first moment of every visit, so here they hold the space invisibly.
     The shimmer a template shows while it is being authored is left alone. */
  const ph = document.createElement('style');
  ph.textContent = 'html:not(.sc-dc-streaming) .sc-placeholder,html:not(.sc-dc-streaming) .sc-interp.sc-missing{background:transparent !important;border-color:transparent !important}';
  document.head.appendChild(ph);
  const BUST = window.__dsBust || (window.__dsBust = '?v=' + Date.now());
  const sheets = ["tokens/fonts.css","tokens/colors.css","tokens/typography.css","tokens/spacing.css","tokens/grid.css","tokens/motion.css","tokens/base.css","styles.css"];
  /* `data-ds-ready` on <html> is also the signal a page can hold an individual
     element back with until the real layout exists. */
  for (const p of sheets) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = base + '/' + p + BUST;
    gates.push(new Promise((r) => { l.addEventListener('load', r, { once: true }); l.addEventListener('error', r, { once: true }); }));
    document.head.appendChild(l);
  }
  const s = document.createElement('script');
  s.src = base + '/_ds_bundle.js' + BUST;
  gates.push(new Promise((r) => { s.addEventListener('load', r, { once: true }); s.addEventListener('error', r, { once: true }); }));
  s.onerror = () => console.error('ds-base.js: failed to load ' + s.src + ' — if this is a consuming project, point the base line in ds-base.js at the bound _ds/<folder> tree relative to this page (e.g. _ds/<folder> at the project root, ../_ds/<folder> one level down); in a fresh design system this can just mean the bundle is not compiled yet');
  document.head.appendChild(s);
  /* Styles and bundle first, then the faces and the images they lay out, then
     two frames so the mounted components have taken their real size. */
  (async () => {
    await floor(Promise.all(gates), 2500);
    await floor(Promise.all([document.fonts ? document.fonts.ready : null, images()]), 1200);
    await frame();
    reveal();
  })();
  /* Absolute floor. */
  window.setTimeout(reveal, 4000);
})();
