/* Demo people for the landing page's portrait carousel.

   Names, titles and portraits are the firm's own, read from vinge.se. The
   media host sends no CORS header and the halftone painter has to read the
   image's pixels, so the portraits come through a CORS-clean image proxy at
   the card's own size — in production these are local media paths and the
   proxy goes away. Discipline tags use the register's vocabulary, which is
   what the carousel matches the visitor's dialogue against. */
(() => {
  const portrait = (path) =>
    'https://images.weserv.nl/?url=www.vinge.se' + path + '&w=640&h=800&fit=cover';
  const profile = (slug) => 'https://www.vinge.se/en/our-people/' + slug + '/';


  /* Every card folds out an e-mail and a number ("Ta kontakt") and links the
     profile ("Profil"), so every person carries all three. DEMO DATA: the
     address follows the house pattern (förnamn.efternamn@vinge.se) and the
     number is the office switchboard; in production both are the person
     page's own. */
  const SWITCHBOARD = { 'Stockholm': '010 614 30 00', 'Göteborg': '010 614 10 00', 'Malmö': '010 614 55 00', 'Bruxelles': '+32 2 501 07 00' };
  const fold = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const withContact = (p) => ({
    ...p,
    email: p.email || (p.name ? fold(p.name).replace(/[^a-z0-9]+/g, '.').replace(/(^\.|\.$)/g, '') + '@vinge.se' : undefined),
    phone: p.phone || SWITCHBOARD[p.office] || SWITCHBOARD.Stockholm,
  });
  window.VingePeople = [
    { name: 'Johan Winnerblad', role: 'Partner', areas: ['M&A', 'Publik M&A'], sectors: ['Industri'], href: profile('johan-winnerblad'), imageSrc: portrait('/media/bsbdhch0/winnerblad_johan_highres.jpg') },
    { name: 'Amanda Knutsson', role: 'Partner', areas: ['Publik M&A', 'Kapitalmarknad'], sectors: [], href: profile('amanda-knutsson'), imageSrc: portrait('/media/alcp5wjf/knutsson_amanda_highres.jpg') },
    { name: 'Malin Malm Waerme', role: 'Partner', areas: ['M&A', 'Bolagsrätt'], sectors: ['Life science'], href: profile('malin-malm-waerme'), imageSrc: portrait('/media/tv4fk15a/malm_waerme_malin_highres.jpg') },
    { name: 'Richard Wessman', role: 'Head of IP, Partner', areas: ['Immaterialrätt'], sectors: ['Life science', 'Teknik'], href: profile('richard-wessman'), imageSrc: portrait('/media/2wpfsggd/wessman_richard_highres.jpg') },
    { name: 'Silvia Dahlberg', role: 'Partner', areas: ['Tvistlösning', 'Skiljeförfaranden'], sectors: [], href: profile('silvia-dahlberg'), imageSrc: portrait('/media/puvlegfc/dahlberg-silvia-some.jpg') },
    { name: 'Marcus Glader', role: 'Partner', areas: ['Konkurrensrätt'], sectors: ['Energi'], href: profile('marcus-glader'), imageSrc: portrait('/media/lgiddap0/glader_marcus_socialmedia.jpg') },
    { name: 'Nils Unckel', role: 'Partner', areas: ['Kapitalmarknad', 'Bolagsrätt'], sectors: ['Bank och finans'], href: profile('nils-unckel'), imageSrc: portrait('/media/jwufudt0/unckel_nils_socialmedia.jpg') },
    { name: 'Emma Stuart-Beck', role: 'Partner', areas: ['Bolagsrätt', 'Publik M&A'], sectors: [], href: profile('emma-stuart-beck'), imageSrc: portrait('/media/q25dyf1q/stuart-beck_emma_socialmedia.jpg') },
  ].map(withContact);

})();
