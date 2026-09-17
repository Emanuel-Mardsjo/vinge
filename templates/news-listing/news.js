/* The stream behind the listing: news, press releases and insight articles as
   one object with a type on it.

   DEMO DATA. The shape is the real one — type, date, headline, summary,
   practice areas, sectors, the people attached, and whether the item exists in
   the other language — but the items themselves are composed here, not read
   from the site. Swap this file for the CMS export; nothing in the template
   knows the difference. Photographs are the house library images, assigned
   deterministically — every item carries one, as on the live site. */
(() => {
  const AREAS = ['M&A', 'Publik M&A', 'Kapitalmarknad', 'Konkurrensrätt', 'Tvistlösning', 'Skiljeförfaranden', 'Immaterialrätt', 'Arbetsrätt', 'Fastighet och entreprenad', 'Bank och finans', 'Skatt', 'Offentlig upphandling', 'Handelssanktioner', 'Miljörätt', 'Insolvens och rekonstruktion', 'Antikorruption'];
  const SECTORS = ['Industri', 'Life science', 'Teknik', 'Bank och finans', 'Fastighet', 'Energi', 'Offentlig sektor', 'Handel'];
  const PEOPLE = ['Amanda Knutsson', 'Erik Lindberg', 'Maria Öhman', 'Johan Ekström', 'Sara Bergqvist', 'Petter Hallgren', 'Lovisa Ahlin', 'Karl Sundström', 'Ida Norling', 'Fredrik Wallin', 'Anna Palmér', 'Gustav Rydberg', 'Elin Hedlund', 'Oskar Falk', 'Nina Stenmark', 'Henrik Löfgren'];
  const CLIENTS = ['Nordkraft AB', 'Byggnads Invest', 'Sveaporten', 'Cellect Bio', 'Ferrum Industri', 'Loomis Nordic', 'Kvarnholmen Fastigheter', 'Trelleborgs Hamn', 'Nordisk Kapital', 'Vasa Energi', 'Almex Group', 'Skanör Logistik', 'Bolinder Tech', 'Nyström & Söner', 'Arctic Data Centers', 'Lundin Medical'];
  const DEALS = ['förvärvet av en konkurrent', 'noteringen på Nasdaq Stockholm', 'avyttringen av sin nordiska verksamhet', 'en riktad nyemission om 1,2 miljarder kronor', 'refinansieringen av koncernens skulder', 'ett offentligt uppköpserbjudande', 'etableringen av ett joint venture', 'överlåtelsen av ett produktionsbolag', 'en gränsöverskridande fusion', 'försäljningen av en fastighetsportfölj'];
  const INSIGHTS = [
    ['Nya regler för {a} träder i kraft vid årsskiftet', 'Vad ändringarna innebär i praktiken, och vad som behöver vara på plats innan de börjar gälla.'],
    ['{a}: fem frågor styrelsen bör ställa', 'En genomgång av de beslut som brukar fattas för sent, och vad de kostar när de gör det.'],
    ['Domstolen prövar {a} för första gången', 'Avgörandet är det första i sitt slag och sätter ramen för hur bestämmelsen kommer att tillämpas.'],
    ['Tillsynsmyndigheten skärper praxis inom {a}', 'Tre beslut under året pekar åt samma håll. Vi läser dem tillsammans.'],
    ['Vad EU-förslaget om {a} betyder för svenska bolag', 'Förslaget är inte antaget, men förberedelserna behöver börja nu.'],
    ['{a} i praktiken: en genomgång av årets avgöranden', 'Sex avgöranden, en linje, och de undantag som ännu inte prövats.'],
  ];
  const PRESS = [
    ['Vinge utser {p} till delägare', 'Utnämningen träder i kraft den 1 januari.'],
    ['Vinge rankas i högsta skiktet inom {a}', 'Rankningen bygger på intervjuer med klienter och motparter.'],
    ['{p} ansluter till Vinges verksamhet inom {a}', 'Rekryteringen förstärker gruppen inför kommande år.'],
    ['Vinge biträder i årets största transaktion inom {s}', 'Affären är den mest omfattande på marknaden hittills i år.'],
  ];
  const IMAGES = ['office-01', 'office-02', 'office-03', 'office-04', 'office-05', 'office-06', 'office-07', 'office-08', 'inviting-01', 'inviting-02', 'inviting-03', 'inviting-04', 'inviting-05', 'inviting-06', 'present-01', 'present-02', 'present-03', 'present-04', 'present-05', 'present-06', 'anonymous-01', 'anonymous-03', 'anonymous-05', 'anonymous-07'];

  const slug = (s) => String(s).toLowerCase().replace(/&/g, 'och').replace(/[åä]/g, 'a').replace(/ö/g, 'o').replace(/é/g, 'e').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const MONTHS = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];

  /* One deterministic sequence, so a reload is the same archive. */
  let seed = 20260910;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const pick = (list, i) => list[Math.floor(rnd() * list.length + i) % list.length];

  const items = [];
  const TODAY = new Date(2026, 8, 10);
  let day = 0;
  for (let i = 0; i < 480; i++) {
    /* Newest first: each item steps a plausible distance further back. The
       firm publishes more now than it did in 2019, so the step widens. */
    day += 1 + Math.floor(rnd() * (2 + i / 6));
    const d = new Date(TODAY.getTime() - day * 86400000);
    const year = d.getFullYear();
    const area = pick(AREAS, i);
    const area2 = pick(AREAS, i + 5);
    const sector = pick(SECTORS, i);
    const r = rnd();
    const type = r < 0.5 ? 'Nyhet' : r < 0.72 ? 'Pressmeddelande' : 'Insikt';
    let title, summary;
    if (type === 'Nyhet') {
      title = 'Vinge har biträtt ' + pick(CLIENTS, i) + ' vid ' + pick(DEALS, i);
      summary = 'Vinges team leddes av ' + pick(PEOPLE, i) + ' och omfattade rådgivning inom ' + area.toLowerCase() + '.';
    } else if (type === 'Pressmeddelande') {
      const t = pick(PRESS, i);
      title = t[0].replace('{p}', pick(PEOPLE, i + 3)).replace('{a}', area.toLowerCase()).replace('{s}', sector.toLowerCase());
      summary = t[1];
    } else {
      const t = pick(INSIGHTS, i);
      title = t[0].replace('{a}', area.toLowerCase());
      summary = t[1];
    }
    const authors = [];
    const nAuthors = type === 'Insikt' ? 2 : rnd() < 0.55 ? 1 : rnd() < 0.8 ? 2 : 0;
    for (let k = 0; k < nAuthors; k++) {
      const name = pick(PEOPLE, i + k * 7);
      if (!authors.some((a) => a.name === name)) authors.push({ name: name, href: '/personer/' + slug(name) });
    }
    /* Every item carries a photograph, as the live site does. */
    const hasImage = true;
    items.push({
      id: 'a' + i,
      type: type,
      date: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'),
      dateLabel: d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + year,
      year: year,
      title: title,
      summary: summary,
      /* Reading time, as the article page states it. The real one is counted
         off the body; the stream has no body, so a length is drawn per type:
         an insight is a read, a news item is a paragraph. */
      minutes: type === 'Insikt' ? 4 + Math.floor(rnd() * 6) : type === 'Pressmeddelande' ? 2 + Math.floor(rnd() * 2) : 1 + Math.floor(rnd() * 3),
      areas: area === area2 ? [area] : [area, area2],
      sectors: [sector],
      people: authors,
      imageSrc: hasImage ? '../../assets/images/' + pick(IMAGES, i) + '.png' : null,
      /* The English archive holds roughly 40% of the Swedish one. An item that
         has no English version says so rather than dead-ending. */
      inEnglish: rnd() < 0.4,
      href: '/insikter/' + slug(title).slice(0, 60),
    });
  }

  const years = [];
  for (const it of items) if (years.indexOf(it.year) < 0) years.push(it.year);
  years.sort((a, b) => b - a);

  window.VingeNewsAll = items;
  window.VingeNewsFacets = { areas: AREAS.slice().sort((a, b) => a.localeCompare(b, 'sv')), sectors: SECTORS.slice().sort((a, b) => a.localeCompare(b, 'sv')), years: years, types: ['Nyhet', 'Pressmeddelande', 'Insikt'] };
})();
