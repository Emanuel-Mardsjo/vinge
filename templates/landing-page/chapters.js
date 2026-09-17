/* Beat text and mark states for the three chapters on the landing page. The
   copy that carries the claim lives in the template, where it can be edited;
   only the beats live here, because a beat is a sentence bound to a mark
   state and the state is code.

   One stroke width for the whole page: no beat sets a weight, so every line
   in every mark renders at the chapter's resting width. Beats change trim and
   part travel only. */
window.VingeChapterBeats = {
  affaren: (() => {
    /* The shared segment is the one temporary primitive: the stretch of the
       chord that lies inside both circles, which is exactly what neither side
       has to pay for. It retracts as the real chord draws through it, so the
       last beat is the library mark. */
    const beats = [
      {
        text: 'När motparten vill något annat',
        detail: 'Bakom en lång kravlista finns ofta några få frågor som faktiskt avgör. För dig gäller det att identifiera vilka de är och vilka som går att förhandla om',
        /* 14 each: the circles are 54 units wide and their centres sit 32
           apart, so anything under 11 each still overlaps. This clears them
           by 6 — two positions with nothing in common. */
        state: { move: { 'circle-left': 14, 'circle-right': 14 }, trim: { chord: 0 } },
      },
      {
        text: 'När du behöver veta vad du kan ge',
        detail: 'En bra förhandling handlar inte bara om vad du får, utan om vad du kan ge utan att förlora det som är viktigt.',
        /* Both positions come back to the table and start to overlap. */
        state: { trim: { chord: 0 } },
      },
      {
        text: 'När avtalet ska fungera långt efter signering',
        detail: 'Du behöver ett avtal som håller långt efter förhandlingsrummet. Även när människorna, förutsättningarna och affären förändras.',
        state: { trim: { chord: 0, shared: 100 } },
      },
      {
        text: 'När affären är klar',
        detail: 'Underskriften är inte slutpunkten. Du ska också kunna få det ni kommit överens om att fungera i praktiken.',
        /* The line grows out of the shared segment in both directions at once
           and lands exactly on the chord's own ends, so the mark arrives at
           its final form here rather than being drawn across. */
        state: { trim: { chord: 0, shared: 100, 'chord-left': 100, 'chord-right': 100 } },
      },
      {
        text: 'Fördjupa dig i M&A',
        links: [
          { label: 'Se relevanta uppdrag', href: '#registret' },
          { label: 'Prata med en expert', href: '#personerna' },
        ],
        detail: '',
        /* Held: the closing beat adds nothing to the mark. */
        state: { trim: { chord: 0, shared: 100, 'chord-left': 100, 'chord-right': 100 } },
      },
    ];
    beats.extras = [
      { part: 'shared', d: 'M 39 50 L 61 50' },
      { part: 'chord-left', d: 'M 39 50 L 7 50' },
      { part: 'chord-right', d: 'M 61 50 L 93 50' },
    ];
    return beats;
  })(),
  tvisten: (() => {
    /* The bench beat replaces the outline with vertical lines that add up to
       the same triangle: one line per seat, the shape held by the people in
       it rather than by its own edges. They rest at zero length, so the last
       beat is the library mark again. */
    const hatch = []; /* nine seats, evenly spaced across the base */
    for (let i = 0; i < 9; i++) {
      const x = +(18 + i * 8).toFixed(2);
      const top = +(81 - 64 * (1 - Math.abs(x - 50) / 40)).toFixed(2);
      hatch.push({ part: 'hatch-' + i, d: `M ${x} ${top} L ${x} 81` });
    }
    const allHatch = (v) => {
      const t = {};
      for (const h of hatch) t[h.part] = v;
      return t;
    };

    const beats = [
      {
        text: 'Samtalen har upphört.',
        detail: 'Båda sidor har vänt varandra ryggen och lämnat frågan till någon annan att avgöra. Härifrån är utgången inte längre er egen att bestämma.',
        state: { move: { 'side-left': 12, 'side-right': 12 }, trim: { axis: 0 } },
      },
      {
        text: 'Vi har fört din talan.',
        detail: 'Kärandesidan, år efter år. Vi vet vad ett anspråk behöver för att hålla hela vägen till ett avgörande.',
        state: { trim: { 'side-right': 0, axis: 0 } },
      },
      {
        /* The sides swap rather than accumulate: the claim is that we have sat
           on both, not that we sit on both at once. */
        text: 'Och vi har fört deras.',
        detail: 'Samma typ av tvist från andra hållet. Det är därför vi kan säga vad motparten kommer att göra innan de gör det.',
        state: { trim: { 'side-left': 0, axis: 0 } },
      },
      {
        text: 'Några av oss utses att avgöra dem.',
        detail: 'Flera av våra jurister sitter som skiljemän i SCC-, ICC- och ICSID-förfaranden. De vet vad en tribunal faktiskt lägger vikt vid.',
        /* The bench arrives here, on the beat about who ends up deciding: the
           outline is replaced by one line per seat. */
        state: { trim: Object.assign(allHatch(100), { 'side-left': 0, 'side-right': 0, axis: 0 }) },
      },
      {
        text: 'Så vår läsning av hur det slutar är värd något.',
        detail: 'Vi säger vad vi tror innan du har lagt pengar på att ta reda på det. Ibland är svaret att inte driva tvisten.',
        state: {},
      },
    ];
    beats.extras = hatch;
    return beats;
  })(),
  /* Chapter 03 animates one mark, star-radial, and brings in two temporary
     primitives on the way: a ring and 33 ticks around it, one per practice
     area. Both rest at zero length, so the last beat is the six-armed star
     exactly as the library draws it with nothing left to undo. */
  banken: (() => {
    const RING = 'M 50 12 A 38 38 0 0 1 50 88 A 38 38 0 0 1 50 12 Z';
    const AREAS = 33;
    const ticks = [];
    for (let i = 0; i < AREAS; i++) {
      const a = (i / AREAS) * Math.PI * 2 - Math.PI / 2;
      const r = (n) => [50 + Math.cos(a) * n, 50 + Math.sin(a) * n].map((v) => v.toFixed(2));
      const [x1, y1] = r(38);
      const [x2, y2] = r(45);
      ticks.push({ part: 'tick-' + i, d: `M ${x1} ${y1} L ${x2} ${y2}` });
    }
    const ARMS = ['arm-up', 'arm-upper-right', 'arm-lower-right', 'arm-down', 'arm-lower-left', 'arm-upper-left'];
    const only = (kept) => {
      const t = {};
      for (const a of ARMS) if (!kept.includes(a)) t[a] = 0;
      return t;
    };
    const allExtras = (v) => {
      const t = { ring: v };
      for (const k of ticks) t[k.part] = v;
      return t;
    };

    const beats = [
      {
        text: 'Det börjar med din situation',
        detail: 'Ett förvärv. Ett myndighetsbesked. En konflikt som växer. Din fråga kommer sällan med namnet på rättsområdet du behöver.',
        /* One question is one full vertical stroke: the up and down arms
           together, so it reads as a single line rather than half of one. */
        state: { trim: only(['arm-up', 'arm-down']) },
      },
      {
        text: 'Sedan blir en fråga ofta flera',
        detail: 'Det som börjar som en skattefråga kan också handla om anställning, tillstånd och finansiering. Du behöver perspektiv som hänger ihop.',
        /* Four as an X, symmetric on both axes — the diagonal arms only, so the
           single vertical arm of the first beat gives way rather than being
           joined by three arms on one side. */
        state: { trim: only(['arm-upper-right', 'arm-lower-right', 'arm-lower-left', 'arm-upper-left']) },
      },
      {
        text: 'Rätt kompetens för din situation',
        detail: 'Du ska inte behöva välja mellan 33 verksamhetsområden. Du ska få tillgång till den kombination av expertis som din situation kräver.',
        state: { trim: allExtras(100) },
      },
      {
        text: 'Du behöver bara beskriva situationen',
        detail: 'Urvalet är vårt arbete, inte ditt. Du beskriver läget — vi sätter samman de personer som behövs.',
        links: [
          { label: 'Beskriv din situation', ask: true },
          { label: 'Utforska våra verksamhetsområden', href: '/verksamhetsomraden' },
        ],
        state: {},
      },
    ];
    beats.extras = [{ part: 'ring', d: RING }].concat(ticks);
    return beats;
  })(),
};
