// Rastret, kanon (fastställt 2026-10-23). Renders every .vi-raster on the page with the canon
// settings, until the DS ImageReveal can print them itself (see
// overforing-claude-design/brief-ds-raster-kanon.md). The maths follows the DS screen
// (components/core/screenShape.jsx, components/blocks/ImageReveal.jsx): tone from a cover crop
// at twice the screen frequency, histogram-equalised on darkness, cut by exposure, curved; the
// reveal's diagonal front and waves; strokes cut like the V's left stroke.
//
// Markup:
//   <div class="vi-raster" data-ratio="3:2" data-image="office-04" data-browse></div>
//     a still, held at CANON.still; data-browse adds previous / next over the house image set.
//   <div class="vi-raster" data-ratio="3:2" data-image="office-04" data-browse data-upload></div>
//     data-upload adds "Ladda upp bild" (or a drop on the frame) and "Ladda ner": the reader's own
//     picture printed with the canon at its own proportions, and saved as a PNG. Nothing leaves
//     the browser.
//   <div class="vi-raster" data-ratio="4:5" data-src="https://…" data-ink="#DDDCD6" data-ground="#002900" data-invert data-focus="0.5,0.4"></div>
//     any picture by URL (the server must allow CORS), in any palette colour on any ground;
//     data-invert prints the light parts, as on a dark ground; data-focus is the crop's centre.
//   <div class="vi-raster" data-set="branscher" data-browse></div>  browses a named set (SETS)
//   data-real="1080" inside a .vi-fmt preview: the format's real width (px, or pt for print). The
//   raster is drawn at the real size and the canvas scaled down with the preview, so density and
//   stroke widths shrink in proportion, as the real surface would at that size.
//   data-fade="bottom,0.45" thins the strokes to nothing toward one edge over that share of the frame;
//   a third value ("bottom,0.6,0.4") keeps that share from the edge clear of strokes, for text.
//   <div class="vi-raster" data-ratio="3:2" data-image="office-04" data-animate></div>
//     the scroll reveal, with ImageReveal's clock: scrolled in up to ANIM.lead, then played out
//     by itself to the colour photograph; rewinds on the way out, resets when fully out of view.
(() => {
  // The .dc engine can run helmet scripts more than once: one instance only, or the lab would
  // tune one instance's ANIM while another instance's clock runs the print.
  if (window.ViRaster) return;
  const CANON = {
    aspect: 2.25, pitch: 8.2, markSize: 0.46, cap: 0.5, slant: 25.6, growth: 'length',
    dynamics: 0.55, exposure: 0.9, noir: 1.5, still: 0.255,
    equalise: true, brightness: 0.24, sharpen: 0.7, maxTone: 1, gamma: 0.4, minStroke: 1,
    focusX: 0.5, focusY: 0.5,
  };
  // The reveal's clock, as ImageReveal has it today. All of it on the 0–1 clock t, except
  // duration (ms) and the visibility fractions.
  const ANIM = {
    duration: 2200,     // the whole travel, scrolled part included
    playAt: 0.98,       // visible fraction at which the clock takes over
    playAtLarge: 0.65,  // the same, for a frame close to the viewport's size
    lead: 0.5,          // how much of the clock the scroll carries before it takes over
    screenEnd: 0.62,    // the screen's front and growth finish here (p = t / screenEnd)
    closeFrom: 0.5, closeTo: 0.68, closeAmount: 0.45,   // strokes swell toward the plate
    photoFrom: 0.55, photoTo: 0.8,                     // the colour photograph crossfades in
    leaveRate: 1.4,     // how much faster it plays back on the way out
    // density over the reveal: the pitch eases from CANON.pitch to pitchEnd across this window
    pitchEnd: 4, pitchFrom: 0.5, pitchTo: 0.8,
  };
  const IMAGES = ['office-04', 'boardroom', 'present-01', 'present-02', 'present-03', 'present-04', 'present-05', 'present-06', 'inviting-01', 'inviting-02'];
  // Image sets to browse with data-set. "branscher": one motif per sector on vinge.se, Unsplash
  // test pictures (free licence), loaded from Unsplash's CDN, which serves them with CORS.
  const U = (id) => `https://images.unsplash.com/${id}?w=1800&q=80`;
  const SETS = {
    branscher: [
      { label: 'AI, data och cybersäkerhet', src: U('photo-1639675960002-2f414c58ed79') },
      { label: 'Energi', src: U('photo-1609780232681-2c2d078f43ee') },
      { label: 'Finansiella tjänster', src: U('photo-1439434768192-c60615c1b3c8') },
      { label: 'Flyg', src: U('photo-1669823620801-215cbad2056e') },
      { label: 'Fordon, mobilitet och elektrifiering', src: U('photo-1739950075618-f9ae2f90b0c0'), focus: [0.52, 0.32], zoom: 1.08 },
      { label: 'Försvar och säkerhet', src: U('photo-1759610900660-b86f99e57c10') },
      { label: 'Handel', src: U('photo-1760565030243-c92ed557e8da') },
      { label: 'IT, teknik och telekom', src: U('photo-1629494893504-d41e26a02631') },
      { label: 'Life Science och Health', src: U('photo-1550572017-26b5655c1e8c') },
      { label: 'Offentlig verksamhet', src: U('photo-1681140943152-fa709c23bf06') },
      { label: 'Riskkapital', src: U('photo-1732455667495-27515c068aea') },
      { label: 'Samhällsbyggnad och infrastruktur', src: U('photo-1566766804405-eed274ee46bf') },
      { label: 'Service', src: U('photo-1650494890554-3114b1e4eac9') },
      { label: 'Sjöfart och transport', src: U('photo-1657665369735-5d6a917080a1') },
      { label: 'Skog och gruvor', src: U('photo-1559580148-d691e9c43d79') },
    ],
  };
  const INK = '#002900', CLAY = '#D5CFCB';

  const cache = {};
  function load(name, then) {
    let e = cache[name];
    if (!e) {
      e = cache[name] = { img: new Image(), ok: false, waits: [] };
      e.img.onload = () => { e.ok = true; e.waits.splice(0).forEach((f) => f()); };
      // A picture by URL is read into a canvas, so it has to come with CORS.
      if (/^https?:/.test(name)) e.img.crossOrigin = 'anonymous';
      // a house image by name, or any picture by path, URL or blob (the studio's own upload)
      e.img.src = /^(https?:|blob:|data:)/.test(name) || name.includes('/') ? name : `assets/img/${name}.png`;
    }
    if (e.ok) then(e.img); else e.waits.push(() => then(e.img));
  }
  const sm = (v, a, b) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

  // The source window a w × h box shows: a cover crop around the focus point, narrowed by zoom
  // around the same point, so it never reaches past the picture's edge.
  function cropWindow(iw, ih, w, h, focus, zoom) {
    const fx = focus[0], fy = focus[1], wr = w / h;
    let sx, sy, sw, sh;
    if (iw / ih > wr) { sh = ih; sw = sh * wr; sx = (iw - sw) * fx; sy = 0; }
    else { sw = iw; sh = sw / wr; sx = 0; sy = (ih - sh) * fy; }
    if (zoom && zoom > 1) { const nw = sw / zoom, nh = sh / zoom; sx += (sw - nw) * fx; sy += (sh - nh) * fy; sw = nw; sh = nh; }
    return { sx, sy, sw, sh };
  }
  // Everything that depends only on the image and the box: tone, local contrast, luminance.
  function build(img, w, h, inverted, pitchMin, focus, zoom) {
    const c = CANON, pitch = Math.max(1, pitchMin || c.pitch), fx = focus ? focus[0] : c.focusX, fy = focus ? focus[1] : c.focusY;
    const cols = Math.max(2, Math.round(w / (pitch / 2))), rows = Math.max(2, Math.round(h / (pitch / 2)));
    const off = document.createElement('canvas'); off.width = cols; off.height = rows;
    const oc = off.getContext('2d');
    const ir = img.naturalWidth / img.naturalHeight, wr = w / h;
    const { sx, sy, sw, sh } = cropWindow(img.naturalWidth, img.naturalHeight, w, h, [fx, fy], zoom);
    oc.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
    const d = oc.getImageData(0, 0, cols, rows).data, n = cols * rows;
    const lum = new Float32Array(n), hist = new Float32Array(256);
    for (let i = 0; i < n; i++) { const l = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255; lum[i] = l; hist[(l * 255) | 0]++; }
    const cdf = new Float32Array(256); let acc = 0;
    for (let b = 0; b < 256; b++) { acc += hist[b]; cdf[b] = acc / n; }
    const cut = Math.min(0.98, 0.3 * c.exposure), tone = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const l = Math.min(1, Math.max(0, lum[i] + c.brightness * 0.2));
      const dark = c.equalise ? 1 - cdf[(l * 255) | 0] : 1 - l;
      const rank = inverted ? 1 - dark : dark;
      tone[i] = Math.pow(Math.max(0, (rank - cut) / (1 - cut)), c.gamma);
    }
    if (c.sharpen > 0) {
      const src = tone.slice();
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        let sum = 0, k = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= cols || yy >= rows) continue; sum += src[yy * cols + xx]; k++;
        }
        const i = y * cols + x; tone[i] = Math.min(1, Math.max(0, src[i] + c.sharpen * (src[i] - sum / k)));
      }
    }
    for (let i = 0; i < n; i++) tone[i] = Math.min(tone[i], c.maxTone);
    const dyn = new Float32Array(n);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const i = y * cols + x, l = lum[i]; let g = 0;
      if (x > 0) g = Math.max(g, Math.abs(l - lum[i - 1])); if (x < cols - 1) g = Math.max(g, Math.abs(l - lum[i + 1]));
      if (y > 0) g = Math.max(g, Math.abs(l - lum[i - cols])); if (y < rows - 1) g = Math.max(g, Math.abs(l - lum[i + cols]));
      dyn[i] = Math.min(1, g * 4);
    }
    return { w, h, cols, rows, lum, tone, dyn, inverted };
  }

  // One frame of the print at clock t (the DS clock: screen on p = t / screenEnd).
  function frame(cv, g, t, pitchNow, scale, fade) {
    const c = CANON, A = ANIM, { w, h, cols, rows, lum, tone, dyn, inverted } = g;
    const dpr = scale || Math.min(window.devicePixelRatio || 1, 2);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const pitch = pitchNow || c.pitch;
    const sample = (x, y) => {
      const fx = Math.min(cols - 1, Math.max(0, (x / w) * (cols - 1))), fy = Math.min(rows - 1, Math.max(0, (y / h) * (rows - 1)));
      const x0 = fx | 0, y0 = fy | 0, x1 = Math.min(cols - 1, x0 + 1), y1 = Math.min(rows - 1, y0 + 1), tx = fx - x0, ty = fy - y0;
      return (tone[y0 * cols + x0] * (1 - tx) + tone[y0 * cols + x1] * tx) * (1 - ty) + (tone[y1 * cols + x0] * (1 - tx) + tone[y1 * cols + x1] * tx) * ty;
    };
    // An edge fade (data-upload): the strokes thin to nothing at one side, over a share of the frame.
    const fadeAt = !fade || fade.side === 'none' || fade.amount <= 0 ? null : (x, y) => {
      const f = fade.side === 'bottom' ? 1 - y / h : fade.side === 'top' ? y / h : fade.side === 'left' ? x / w : 1 - x / w;
      // clear: a share from the edge with no strokes at all (room for text), then the ramp
      const c0 = Math.min(fade.clear || 0, fade.amount - 0.02);
      return Math.min(1, Math.max(0, (f - c0) / (fade.amount - c0)));
    };
    const at = (arr, x, y) => arr[Math.min(rows - 1, Math.max(0, Math.round((y / h) * (rows - 1)))) * cols + Math.min(cols - 1, Math.max(0, Math.round((x / w) * (cols - 1))))];
    const clk = t, pr = Math.min(1, clk / A.screenEnd);
    const closeT = A.closeAmount * sm(clk, A.closeFrom, A.closeTo);
    const sizeT = 0.72 + 0.28 * sm(pr, 0, 0.92), front = -0.15 + pr * 2.3, settle = sm(pr, 0.6, 1), bias = c.dynamics * 0.22;
    const plateTone = (l) => { let dk = inverted ? l : 1 - l; dk = 0.5 + (dk - 0.5) * c.noir; return Math.min(1, Math.max(0, dk)); };
    const tan = Math.tan((c.slant * Math.PI) / 180), capH = c.cap * pitch, minW = c.minStroke / 2, k = c.aspect;
    ctx.fillStyle = g.ink || (inverted ? CLAY : INK);
    // Every stroke is a plain rect in sheared space (x' = x + tan·y), as the DS screen fills
    // them: rects are the cheapest thing a canvas fills, a path of quads is not.
    ctx.setTransform(dpr, 0, tan * dpr, dpr, 0, 0);
    ctx.beginPath();
    for (let y = pitch / 2; y < h + pitch; y += pitch) {
      for (let x = pitch / 2; x < w + pitch; x += pitch) {
        let rr = c.markSize * pitch * sample(x, y) * (fadeAt ? fadeAt(x, y) : 1);
        if (closeT > 0) rr += (pitch * 0.6 * Math.sqrt(plateTone(at(lum, x, y))) - rr) * closeT;
        if (rr <= 0.01) continue;
        const nd = (x + y) / (w + h);
        const bandT = sm(front - nd + (at(dyn, x, y) - 0.5) * bias, -0.35, 0.22);
        if (bandT <= 0) continue;
        const pulse = 0.68 + 0.32 * Math.sin(nd * Math.PI * 2 * 2.6 - pr * 9) + 0.14 * Math.sin(x * 0.012 - y * 0.017 + pr * 5);
        const rhythm = 1 + (pulse - 1) * (1 - settle);
        if (rhythm <= 0) continue;
        rr *= sizeT * bandT * rhythm;
        if (rr < 0.05) continue;
        const area = Math.PI * rr * rr;
        // darker grows longer: width held, length carries the ink
        let hw = Math.max(minW, ((c.markSize * pitch) / (2 * k)) * 0.9), hh = area / (4 * hw);
        if (hh > capH) { hh = capH; hw = area / (4 * hh); }
        if (hw < minW) { if (hw * 2 < minW * 0.15) continue; hw = minW; }
        ctx.rect(x - tan * y - hw, y - hh, 2 * hw, 2 * hh);
      }
    }
    ctx.fill();
  }

  function mount(host) {
    if (host.__viRaster) return host.__viRaster;
    const ratio = (host.dataset.ratio || '3:2').split(':').map(Number);
    const box = document.createElement('div');
    // data-fill: the box fills its host (a layout cell) instead of keeping a ratio of its own
    box.style.cssText = host.hasAttribute('data-fill') ? `position: absolute; inset: 0; overflow: hidden; background: ${host.dataset.ground || 'var(--paper)'};`
      : `position: relative; aspect-ratio: ${ratio[0]} / ${ratio[1]}; overflow: hidden; background: ${host.dataset.ground || 'var(--paper)'};`;
    const photo = document.createElement('img');
    const focus = host.dataset.focus ? host.dataset.focus.split(',').map(Number) : null;
    photo.alt = ''; photo.style.cssText = `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: ${(focus ? focus[0] : CANON.focusX) * 100}% ${(focus ? focus[1] : CANON.focusY) * 100}%; opacity: 0;`;
    // Any picture by URL (data-src or a set) is fetched with CORS by the photo too, or the browser
    // caches a non-CORS copy and the raster's own CORS read of it fails.
    if (host.dataset.src || host.dataset.set) photo.crossOrigin = 'anonymous';
    const cv = document.createElement('canvas');
    cv.setAttribute('role', 'img');
    cv.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; display: block;';
    box.append(photo, cv);
    // Append only: the host is the template's node, and anything inside it the template
    // placed must stay where React expects it, or its next render throws on removeChild.
    host.appendChild(box);
    const fadeAttr = host.dataset.fade ? host.dataset.fade.split(',') : null;
    const st = { list: SETS[host.dataset.set] || null, fade: fadeAttr ? { side: fadeAttr[0], amount: Number(fadeAttr[1] || 0.4), clear: Number(fadeAttr[2] || 0) } : null, focus, src: host.dataset.src || null, ink: host.dataset.ink || null, invert: host.hasAttribute('data-invert'), zoom: Number(host.dataset.zoom) || 1, box, photo, cv, index: Math.max(0, IMAGES.indexOf(host.dataset.image || 'office-04')), animate: host.hasAttribute('data-animate'), t: 0, running: false, last: 0, g: null };
    if (host.hasAttribute('data-browse')) {
      const bar = document.createElement('div');
      bar.className = 'vi-raster-browse small';
      // The two buttons together and the name after them, so they never move with its length.
      bar.innerHTML = '<button type="button" data-d="-1">Föregående</button><button type="button" data-d="1">Nästa</button><span class="vi-raster-name"></span>';
      bar.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (!b.dataset.d) return;
        st.custom = null;
        const n = (st.list || IMAGES).length;
        st.index = (st.index + Number(b.dataset.d) + n) % n; st.t = 0; st.running = false; prepare(host);
      });
      host.appendChild(bar);
      st.name = bar.querySelector('.vi-raster-name');
      st.bar = bar;
    }
    if (host.hasAttribute('data-upload')) upload(host, st);
    host.__viRaster = st;
    new ResizeObserver(() => prepare(host)).observe(box);
    if (st.animate) watch(host, st);
    return st;
  }
  function show(st, t) {
    if (st.animate && st.img && st.g && Math.min(CANON.pitch, ANIM.pitchEnd) < st.gPitch - 0.01) {
      st.gPitch = Math.min(CANON.pitch, ANIM.pitchEnd);
      st.g = build(st.img, st.g.w, st.g.h, st.g.inverted, st.gPitch, st.focus); st.g.ink = st.ink;
    }
    const photoT = st.animate ? sm(t, ANIM.photoFrom, ANIM.photoTo) : 0;
    st.photo.style.opacity = String(photoT);
    st.cv.style.opacity = String(1 - photoT);
    const pitchNow = st.animate ? CANON.pitch + (ANIM.pitchEnd - CANON.pitch) * sm(t, ANIM.pitchFrom, ANIM.pitchTo) : CANON.pitch;
    // at real size (data-real) one canvas pixel per real pixel; the CSS scales it with the preview
    // shown larger than its real size (a large Rasterstorlek in the studio), it is drawn at the
    // screen's own resolution instead, so the strokes stay sharp
    const sharp = st.k && st.k !== 1 ? Math.max(1, (st.box.clientWidth * Math.min(window.devicePixelRatio || 1, 2)) / st.g.w) : 0;
    if (photoT < 1 && st.g) frame(st.cv, st.g, t, Math.max(0.5, pitchNow), sharp, st.fade);
  }
  function prepare(host) {
    const st = mount(host);
    // a set entry may carry its own crop (focus) and zoom, so the motif fills the frame
    if (st.list) { const e = st.list[st.index]; st.src = e.src; host.dataset.label = e.label; st.focus = e.focus || null; st.zoom = e.zoom || 1; }
    const name = st.custom ? st.custom.name : st.src ? (host.dataset.label || 'bild') : IMAGES[st.index];
    if (st.name) {
      // the label as text, the count in tabular figures (Circular's tnum also sets the letters)
      const count = document.createElement('span');
      count.className = 'vi-raster-count';
      count.textContent = st.custom ? '' : `${st.index + 1} / ${(st.list || IMAGES).length}`;
      st.name.textContent = st.custom ? st.custom.name : st.list ? `${name} ` : '';
      st.name.appendChild(count);
    }
    // An uploaded picture keeps its own proportions; the house set uses the page's ratio.
    const ratio = st.custom ? [st.custom.img.naturalWidth, st.custom.img.naturalHeight] : (host.dataset.ratio || '3:2').split(':').map(Number);
    if (!host.hasAttribute('data-fill')) {
      st.box.style.aspectRatio = `${ratio[0]} / ${ratio[1]}`;
      // A tall picture is held within the window, so the controls under it stay in reach.
      st.box.style.width = `min(100%, calc(80svh * ${ratio[0] / ratio[1]}))`;
    }
    st.cv.setAttribute('aria-label', `Rastrerat fotografi, ${name}`);
    st.photo.src = st.custom ? st.custom.url : st.src || `assets/img/${name}.png`;
    (st.custom ? (then) => then(st.custom.img) : (then) => load(st.src || name, then))((img) => {
      const r = st.box.getBoundingClientRect();
      if (r.width < 2) return;
      const fmt = host.dataset.real ? host.closest('.vi-fmt') : null;
      st.k = fmt && fmt.clientWidth ? Number(host.dataset.real) / fmt.clientWidth : 1;
      st.g = build(img, r.width * st.k, r.height * st.k, st.invert || !!host.closest('[data-inverted]'), st.animate ? Math.min(CANON.pitch, ANIM.pitchEnd) : CANON.pitch, st.focus, st.zoom);
      st.g.ink = st.ink;
      st.gPitch = Math.min(CANON.pitch, ANIM.pitchEnd); st.img = img;
      show(st, st.animate ? st.t : CANON.still);
    });
  }

  // The reader's own picture: read locally, printed with the canon, saved at a size fit for use.
  function upload(host, st) {
    // This mount's own bar: a remount leaves the old one in the host until the template clears it.
    let bar = st.bar;
    if (!bar) { bar = document.createElement('div'); bar.className = 'vi-raster-browse small'; host.appendChild(bar); }
    const own = document.createElement('span');
    own.className = 'vi-raster-own';
    own.innerHTML = '<button type="button" data-up>Ladda upp bild</button><button type="button" data-down>Ladda ner</button><input type="file" accept="image/*" hidden>';
    bar.appendChild(own);
    // The fade, to make room for text: which edge, and how far in.
    const fade = document.createElement('div');
    fade.className = 'vi-raster-fade small';
    fade.innerHTML = '<label>Tona ut mot <select><option value="none">Ingen kant</option><option value="top">Överkant</option><option value="bottom">Nederkant</option><option value="left">Vänster</option><option value="right">Höger</option></select></label>'
      + '<label class="vi-raster-fade-amount" hidden>Toning <input type="range" min="0.1" max="1" step="0.01" value="0.4"><span></span></label>';
    host.appendChild(fade);
    const side = fade.querySelector('select'), amount = fade.querySelector('input'), amountRow = fade.querySelector('.vi-raster-fade-amount'), amountOut = fade.querySelector('span');
    const setFade = () => {
      st.fade = { side: side.value, amount: Number(amount.value) };
      amountRow.hidden = side.value === 'none';
      amountOut.textContent = Math.round(st.fade.amount * 100) + ' %';
      show(st, st.animate ? st.t : CANON.still);
    };
    side.addEventListener('change', setFade);
    amount.addEventListener('input', setFade);
    st.fade = { side: 'none', amount: 0.4 };
    const input = own.querySelector('input');
    const take = (file) => {
      if (!file || !/^image\//.test(file.type)) return;
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        if (st.custom) URL.revokeObjectURL(st.custom.url);
        st.custom = { img, url, name: file.name.replace(/\.[^.]+$/, '') };
        prepare(host);
      };
      img.onerror = () => URL.revokeObjectURL(url);
      img.src = url;
    };
    own.querySelector('[data-up]').addEventListener('click', () => input.click());
    input.addEventListener('change', () => { take(input.files[0]); input.value = ''; });
    st.box.addEventListener('dragover', (e) => { e.preventDefault(); });
    st.box.addEventListener('drop', (e) => { e.preventDefault(); take(e.dataTransfer.files[0]); });
    own.querySelector('[data-down]').addEventListener('click', () => save(st));
  }
  // The same strokes as on screen, drawn again at a scale that reaches the picture's own width
  // (at least 2400 px, at most 6000 px), on the white ground.
  function save(st) {
    if (!st.g) return;
    const { w, h } = st.g, nat = st.custom ? st.custom.img.naturalWidth : 2400;
    const scale = Math.min(6000, Math.max(2400, nat)) / w;
    const cv = document.createElement('canvas');
    frame(cv, st.g, CANON.still, CANON.pitch, scale, st.fade);
    const out = document.createElement('canvas'); out.width = cv.width; out.height = cv.height;
    const oc = out.getContext('2d');
    oc.fillStyle = getComputedStyle(st.box).backgroundColor || '#fff';
    oc.fillRect(0, 0, out.width, out.height);
    oc.drawImage(cv, 0, 0);
    out.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vinge-raster-${(st.custom ? st.custom.name : IMAGES[st.index]).replace(/[^\w-]+/g, '-')}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, 'image/png');
  }

  // The scroll clock, after ImageReveal's progressNow / reconcile, vertical axis only.
  function watch(host, st) {
    let raf = 0, inView = false;
    const step = () => {
      raf = 0;
      const r = st.box.getBoundingClientRect(), vh = window.innerHeight;
      const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      const v = Math.min(1, Math.max(0, visible / Math.max(1, Math.min(r.height, vh))));
      const now = performance.now(), dt = st.last ? Math.min(0.1, (now - st.last) / 1000) : 0;
      st.last = now;
      const A = ANIM;
      const large = r.height >= vh * 0.8;
      const playAt = large ? A.playAtLarge : A.playAt;
      const secs = Math.max(0.1, (A.duration / 1000) * (1 - A.lead));
      const posT = A.lead * Math.min(1, v / Math.max(0.05, playAt));
      const leaveAt = Math.min(0.7, playAt - 0.15);
      if (v <= 0) { st.t = 0; st.running = false; }
      else if (v >= playAt) st.running = true;
      else if (v < leaveAt) st.running = false;
      if (st.running) st.t = Math.min(1, Math.max(st.t, A.lead) + dt / secs);
      else if (v < leaveAt) st.t = st.t > posT ? Math.max(posT, st.t - (dt * A.leaveRate) / secs) : posT;
      else st.t = Math.max(st.t, posT);
      show(st, st.t);
      if (inView || st.running) raf = requestAnimationFrame(step);
      else st.last = 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(step); };
    new IntersectionObserver((es) => { inView = es[es.length - 1].isIntersecting; kick(); }, { rootMargin: '20% 0px' }).observe(st.box);
    window.addEventListener('scroll', kick, { passive: true });
    st.replay = () => { st.t = 0; st.running = false; st.last = 0; kick(); };
    kick();
  }

  // For hosts driven from outside (the layout engine): read the data-* attributes again and redraw.
  function refresh(host) {
    const st = host.__viRaster;
    if (!st) { prepare(host); return; }
    const num = (v) => v.split(',').map(Number);
    st.src = host.dataset.src || null; st.ink = host.dataset.ink || null; st.invert = host.hasAttribute('data-invert');
    st.focus = host.dataset.focus ? num(host.dataset.focus) : null; st.zoom = Number(host.dataset.zoom) || 1;
    const f = host.dataset.fade ? host.dataset.fade.split(',') : null;
    st.fade = f ? { side: f[0], amount: Number(f[1] || 0.4), clear: Number(f[2] || 0) } : null;
    st.box.style.background = host.dataset.ground || 'var(--paper)';
    if (st.src) st.photo.crossOrigin = 'anonymous';
    if (st.focus) st.photo.style.objectPosition = `${st.focus[0] * 100}% ${st.focus[1] * 100}%`;
    prepare(host);
  }
  function scan() { document.querySelectorAll('.vi-raster').forEach((h) => { if (!h.__viRaster || !h.contains(h.__viRaster.box)) { h.__viRaster = null; prepare(h); } }); }
  // The page renders by template and swaps chapters: keep up with new hosts.
  const start = () => { scan(); new MutationObserver(scan).observe(document.body, { childList: true, subtree: true }); };
  if (typeof document !== 'undefined') document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
  // For the raster lab: tune ANIM live and replay.
  // The still as drawn, again at another width (the studio's PNG): the same strokes, sharp at that size.
  function snapshot(host, width) {
    const st = host.__viRaster;
    if (!st || !st.g) return null;
    const cv = document.createElement('canvas');
    frame(cv, st.g, CANON.still, CANON.pitch, width / st.g.w, st.fade);
    return cv;
  }
  window.ViRaster = { cropWindow, refresh, snapshot, CANON, ANIM, IMAGES, SETS, _build: build, _frame: frame, replay: () => document.querySelectorAll('.vi-raster').forEach((h) => h.__viRaster && h.__viRaster.replay && h.__viRaster.replay()) };
})();
