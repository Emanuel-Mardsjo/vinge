/* Demo data for Record: ~120 mandates, grouped by year.
   Fictional clients. Built deterministically so the field is identical on
   every load — the block's one quantity is block height, and that must not
   move between reloads. */
(() => {
  const CLIENTS = [
    ['Nordika', 'Industri'], ['Avenyr', 'Detaljhandel'], ['Fältström Industri', 'Industri'],
    ['Bergslagen Kraft', 'Energi'], ['Vidarö Fastigheter', 'Fastigheter'], ['Sköldkroken', 'Bygg och infrastruktur'],
    ['Almnäs Bruk', 'Skog och råvaror'], ['Terrafors', 'Energi'], ['Lindhem Bygg', 'Bygg och infrastruktur'],
    ['Karlavik Hamn', 'Transport'], ['Sylten Energi', 'Energi'], ['Norrsken Life Science', 'Life science'],
    ['Aptera Medical', 'Life science'], ['Halvfors Stål', 'Industri'], ['Vartex Retail', 'Detaljhandel'],
    ['Sundfast', 'Fastigheter'], ['Kvarnbo Mejeri', 'Detaljhandel'], ['Blixtvik Telekom', 'Telekom'],
    ['Norrmalm Kapital', 'Bank och finans'], ['Serafim Invest', 'Private equity'], ['Hägerlund Skog', 'Skog och råvaror'],
    ['Ostkant Logistik', 'Transport'], ['Tredje Vågen Media', 'Media'], ['Klarsjö Försäkring', 'Försäkring'],
    ['Ljungby Verkstad', 'Industri'], ['Frostvik Kyl', 'Industri'], ['Ambion Software', 'Teknik'],
    ['Dalslund Papper', 'Skog och råvaror'], ['Rosenhill Vård', 'Offentlig sektor'], ['Stavgren Bank', 'Bank och finans'],
    ['Ekmark Livsmedel', 'Detaljhandel'], ['Solvarv', 'Energi'], ['Tunnelbolaget Öst', 'Bygg och infrastruktur'],
    ['Vinterhamn Rederi', 'Transport'], ['Grynge Bygg', 'Bygg och infrastruktur'], ['Nyfors Elnät', 'Energi'],
    ['Alveus Data', 'Teknik'], ['Hedmark Gruvor', 'Skog och råvaror'], ['Barkarö Bostad', 'Fastigheter'],
    ['Cendra Pharma', 'Life science'], ['Ranstad Kliniker', 'Life science'], ['Vretlanda Invest', 'Private equity'],
    ['Örnsjö Media', 'Media'], ['Hällby Trygghet', 'Försäkring'], ['Kolmården Nät', 'Telekom'],
    ['Söderfjäll Kommunbolag', 'Offentlig sektor'], ['Tegelvik Handel', 'Detaljhandel'], ['Norrhavet Vind', 'Energi'],
  ];

  /* The lead discipline follows the work type. A merger filing leads with
     competition law, not capital markets. */
  const WORK = [
    ['Förvärv', 'M&A'],
    ['Avyttring', 'M&A'],
    ['Offentligt uppköpsbud', 'Publik M&A'],
    ['Konkurrensanmälan', 'Konkurrensrätt'],
    ['Gryningsräd', 'Konkurrensrätt'],
    ['Skiljeförfarande', 'Skiljeförfaranden'],
    ['Refinansiering', 'Bank och finans'],
    ['Börsnotering', 'Kapitalmarknad'],
    ['Rekonstruktion', 'Obestånd och rekonstruktion'],
    ['Myndighetsutredning', 'Regulatoriskt'],
    ['Carve-out', 'M&A'],
    ['Joint venture', 'Bolagsrätt'],
  ];

  const SUPPORT = ['Skatt', 'Arbetsrätt', 'Fastighetsrätt', 'Immaterialrätt', 'Dataskydd', 'Miljörätt',
    'Offentlig upphandling', 'Compliance', 'Tvistlösning', 'Kapitalmarknad', 'Konkurrensrätt',
    'Finansiering', 'IT och teknologi', 'Energirätt', 'Bolagsrätt'];

  /* 2024 is the tallest block: the firm did 50% more transactions that year. */
  const COUNTS = [[2022, 22], [2023, 24], [2024, 36], [2025, 26], [2026, 14]];

  let seed = 20220107;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];

  const entries = [];
  COUNTS.forEach(([year, n]) => {
    for (let i = 0; i < n; i++) {
      const [client, sector] = pick(CLIENTS);
      const [work, lead] = pick(WORK);
      const extra = 1 + Math.floor(rnd() * 5);
      const rest = [];
      while (rest.length < extra) {
        const d = pick(SUPPORT);
        if (d !== lead && rest.indexOf(d) < 0) rest.push(d);
      }
      entries.push({ year, client, sector, work, disciplines: [lead].concat(rest) });
    }
  });

  /* The demo query — one sector in one year — has to return four lines, so
     four of 2024's are fixed. */
  const seeded = [
    { client: 'Cendra Pharma', work: 'Förvärv', disciplines: ['M&A', 'Life science-regulatoriskt', 'Immaterialrätt', 'Skatt'] },
    { client: 'Norrsken Life Science', work: 'Börsnotering', disciplines: ['Kapitalmarknad', 'Bolagsrätt', 'Skatt'] },
    { client: 'Aptera Medical', work: 'Konkurrensanmälan', disciplines: ['Konkurrensrätt', 'M&A', 'Dataskydd', 'Compliance', 'Immaterialrätt'] },
    { client: 'Ranstad Kliniker', work: 'Carve-out', disciplines: ['M&A', 'Arbetsrätt', 'Fastighetsrätt', 'Skatt'] },
  ];
  const first2024 = entries.findIndex((e) => e.year === 2024);
  seeded.forEach((s, i) => {
    entries[first2024 + 4 + i * 7] = { year: 2024, sector: 'Life science', ...s };
  });


  /* The published record replaces the generated field when it is loaded;
     the generated one is only a fallback. */
  const real = (window.VingeRecordCases || []).slice();
  /* A selection, not the whole record: the same count per year as the
     generated field, picked evenly across each year so every month shows. */
  if (real.length) {
    const pickRows = [];
    COUNTS.forEach(([year, n]) => {
      const y = real.filter((e) => e.year === year);
      const k = Math.min(n, y.length);
      for (let i = 0; i < k; i++) pickRows.push(y[Math.floor(i * y.length / k)]);
    });
    entries.splice(0, entries.length, ...pickRows);
  }
  const lc = (s) => (s || '').charAt(0).toLowerCase() + (s || '').slice(1);
  entries.forEach((e) => {
    if (!e || e.title) return;
    e.title = e.client + ': ' + lc(e.work) + '.';
    e.caption = e.work + ' · ' + e.year;
    e.preamble = 'Vinge har biträtt ' + e.client + ' i samband med ' + lc(e.work) + '.';
    e.figures = [];
    e.team = [];
    e.href = '/uppdrag';
  });

  /* Own global as well: a stale copy under repo/ is compiled into the bundle
     and reassigns VingeRecordEntries after this file has run. */
  /* Every mandate opens the article template. The published hrefs point at
     vinge.se, which the prototype does not carry. */
  entries.forEach((e) => { if (e) e.href = '../article-page/ArticlePage.dc.html'; });

  window.VingeRecordEntries = entries;
  window.VingeRecordEntriesLive = entries;

  /* What the finder hands the Record: the practice areas and sectors it
     derived from what the visitor typed. Substring matching against the
     vocabulary the register itself uses — enough for a demo, and it never
     invents a term the field cannot contain. */
  const AREAS = WORK.map((w) => w[1]).concat(SUPPORT);
  const SECTORS = CLIENTS.map((c) => c[1]);
  const uniq = (a) => a.filter((v, i) => a.indexOf(v) === i);
  window.VingeDeriveDialogue = (text) => {
    const t = (text || '').toLowerCase();
    if (!t) return null;
    const hit = (list) => uniq(list.filter((v) => t.indexOf(v.toLowerCase()) >= 0));
    const areas = hit(AREAS);
    const sectors = hit(SECTORS);
    /* Nothing recognised: treat the question as touching the transaction
       practice, which is what most of them do. */
    if (!areas.length && !sectors.length) return { text: text, areas: ['M&A'], sectors: [] };
    return { text: text, areas: areas, sectors: sectors };
  };

  /* Demo dialogue for cards and for a first load of the second view. */
  window.VingeRecordDialogue = { text: 'Vi förbereder ett förvärv inom life science.', areas: ['M&A'], sectors: ['Life science'] };
})();
