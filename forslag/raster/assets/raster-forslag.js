/* Raster-förslag: the client page. No sliders. It sets the tuned values Emanuel arrived at on
   Raster-tuning (Gardinen and Fönstren; the identity variant stays on the canon) and gives every
   animated example a "Spela igen" button that takes the picture out of view and brings it back. */
(function () {
  if (window.__rasterForslag) return;
  window.__rasterForslag = true;
  const TUNED = { devBand: 0.14, devGap: 0.01, devLevels: 0, devSmooth: 0.12, devScale: 1,
    winScale: 1, winTone: 0.27, winGrain: 0.13, winDrift: 0.33, winEnd: 0.45 };
  function boot() {
    const C = window.__vingeScreenCanon, NS = window.VingeDesignSystem_8582c7;
    if (!C || !NS || !NS.RevealEffects || !document.body) { setTimeout(boot, 50); return; }
    Object.assign(C, TUNED);
    NS.RevealEffects.refresh();
    const addReplay = () => {
      document.querySelectorAll('[data-replay]').forEach((sec) => {
        if (sec.querySelector('.rf-replay')) return;
        const at = sec.querySelector('.rf-replay-slot'); if (!at) return;
        const b = document.createElement('button'); b.type = 'button'; b.className = 'small rf-replay'; b.textContent = 'Spela igen';
        b.addEventListener('click', async () => {
          const img = sec.querySelector('img'); if (!img) return;
          const box = img.parentElement.getBoundingClientRect(), top = box.top + scrollY, back = top - (innerHeight - box.height) / 2;
          window.scrollTo({ top: top - innerHeight * 1.6, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 250));
          window.scrollTo({ top: back, behavior: 'smooth' });
        });
        at.appendChild(b);
      });
    };
    addReplay(); setTimeout(addReplay, 1500);
    /* Small browser windows: the real component pages at desktop width (1440), scaled into the frame
       and scrollable inside it. Loaded only when the window comes near, so the page stays light. */
    const fit = (view) => { const f = view.querySelector('iframe'); if (!f) return; const k = view.clientWidth / 1440; f.style.transform = 'scale(' + k + ')'; f.style.height = Math.ceil(view.clientHeight / k) + 'px'; };
    /* "Fotot visas direkt": the window shows the proposal, not today's site. The raster is hidden and the
       photograph shown at once; the film block's raster gets its still. The window opens on the image. */
    const direct = (f) => {
      const d = f.contentDocument; if (!d || !d.body) return;
      if (!d.getElementById('rf-direct')) { const st = d.createElement('style'); st.id = 'rf-direct'; st.textContent = 'canvas{opacity:0!important}img{opacity:1!important;visibility:visible!important}'; d.head.appendChild(st); }
      /* The film block needs a redesign; until then its text is white on the still, without the paper halo. */
      if (/Feature\.card/.test(f.dataset.card || '') && !d.getElementById('rf-white')) { const w = d.createElement('style'); w.id = 'rf-white'; w.textContent = '[data-feature] *{color:#fff!important;text-shadow:none!important;-webkit-text-stroke-color:#fff!important;text-decoration-color:#fff!important}'; d.head.appendChild(w); }
      d.querySelectorAll('canvas[aria-label], canvas[aria-hidden]').forEach((c) => {
        const box = c.parentElement; if (!box || box.querySelector('img.rf-still') || box.querySelector('img')) return;
        const im = d.createElement('img'); im.className = 'rf-still'; im.alt = '';
        im.src = '../../assets/images/' + (/The Seat/.test(c.getAttribute('aria-label') || '') ? 'office-02.png' : 'anonymous-01.png');
        im.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover';
        box.insertBefore(im, c);
      });
    };
    const openOn = (f) => {
      const d = f.contentDocument; if (!d) return;
      const big = [...d.querySelectorAll('img')].filter((i) => { const r = i.getBoundingClientRect(); return r.width > 300 && r.height > 200; })[0];
      if (big) f.contentWindow.scrollTo(0, Math.max(0, big.getBoundingClientRect().top + f.contentWindow.scrollY - f.clientHeight * 0.3));
    };
    const VI_BUNDLE = new URL('vi-ds/vinge-design-system-8582c713-b6fe-4c0e-9d6c-3a48b1294a6a/_ds_bundle.js', document.baseURI).href;
    const load = (view) => {
      if (view.querySelector('iframe')) return;
      const f = document.createElement('iframe');
      /* The windows show the component pages with the coarser raster: the page's own bundle is swapped
         for the identity bundle, with the same raster settings this page uses. */
      const at = new URL(view.dataset.src, document.baseURI).href;
      fetch(at).then((r) => r.text()).then((html) => {
        f.srcdoc = html.replace('<head>', '<head><base href="' + at + '"><script>(function (r) { r.setProperty("--screen-shape", "lines"); r.setProperty("--screen-line-aspect", "2.25"); r.setProperty("--screen-line-grid", "square"); r.setProperty("--screen-line-taper", "off"); })(document.documentElement.style); window.__dsBase = true;<\/script>')
          .replace(/<script src="\.\.\/\.\.\/_ds_bundle\.js[^"]*"><\/script>/, '<script src="' + VI_BUNDLE + '"><\/script>');
      }); f.dataset.card = view.dataset.src; f.title = view.parentElement.querySelector('span') ? view.parentElement.querySelector('span').textContent : ''; f.loading = 'lazy';
      if (view.hasAttribute('data-direct')) f.addEventListener('load', () => { [300, 1200, 3000, 6000].forEach((t) => setTimeout(() => direct(f), t)); setTimeout(() => openOn(f), 3200); });
      view.appendChild(f); fit(view);
    };
    /* Checked on scroll and on a timer rather than with an IntersectionObserver, which follows the
       render loop and does not fire in every browser pane. */
    const near = () => document.querySelectorAll('.rf-view[data-src]').forEach((v) => {
      if (v.querySelector('iframe')) return;
      const r = v.getBoundingClientRect();
      if (r.bottom > -800 && r.top < innerHeight + 800) load(v);
    });
    let pend = 0;
    window.addEventListener('scroll', () => { if (!pend) pend = setTimeout(() => { pend = 0; near(); }, 100); }, { passive: true });
    near(); setInterval(near, 1000);
    window.addEventListener('resize', () => document.querySelectorAll('.rf-view').forEach(fit));
  }
  boot();
})();
