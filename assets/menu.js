/* IL MENU DEL TELEFONO

   Su uno schermo stretto la barra prendeva tre righe — nome, menu tagliato a
   meta' parola, lingua su una riga sua — cioe' un quarto dello schermo prima
   ancora di cominciare a leggere.

   Qui la barra torna a UNA riga: il nome a sinistra, e a destra un comando
   che apre le pagine a tutto schermo. Nessun HTML in piu' nelle pagine: il
   pannello e' costruito da qui, dalle voci che ci sono gia'. */
(function () {
  var barra = document.querySelector('.topbar:not(.topbar-fissa)');
  if (!barra) return;

  var nav = barra.querySelector('.nav');
  var lang = barra.querySelector('.lang');
  if (!nav) return;

  var IT = (document.documentElement.lang || 'en').slice(0, 2) === 'it';
  var T = IT ? { apri: 'Apri il menu', chiudi: 'Chiudi il menu', pagine: 'Pagine', segui: 'Dove seguirlo' }
             : { apri: 'Open menu', chiudi: 'Close menu', pagine: 'Pages', segui: 'Follow him' };

  /* il comando: due righe, diventano una croce quando e' aperto */
  var bot = document.createElement('button');
  bot.type = 'button';
  bot.className = 'menu-bot';
  bot.setAttribute('aria-expanded', 'false');
  bot.setAttribute('aria-label', T.apri);
  bot.innerHTML = '<span class="menu-righe" aria-hidden="true"><i></i><i></i></span>';
  barra.querySelector('.wrap').appendChild(bot);

  /* il pannello: le stesse voci della barra, in grande */
  var pan = document.createElement('div');
  pan.className = 'menu-pan';
  pan.hidden = true;
  var voci = Array.prototype.map.call(nav.querySelectorAll('a'), function (a) {
    return '<a href="' + a.getAttribute('href') + '"' +
           (a.hasAttribute('aria-current') ? ' aria-current="page"' : '') +
           '>' + a.textContent.trim() + '</a>';
  }).join('');

  /* Home in cima: nella barra non c'e' perche' il nome a sinistra fa da
     ritorno alla home, ma dentro il pannello quel nome non si vede piu'.
     Senza questa voce, da una pagina interna non si torna indietro. */
  var casa = IT ? 'it/' : '';
  var qui = location.pathname.replace(/\/index\.html$/, '/');
  var inCasa = qui === '/' || qui === '/it/' || /\/index\.html$/.test(location.pathname);
  var radice = /^\/it\//.test(location.pathname) ? '/it/' : '/';
  voci = '<a href="' + radice + '"' + (inCasa ? ' aria-current="page"' : '') + '>' +
         (IT ? 'Home' : 'Home') + '</a>' + voci;
  var profili = document.querySelector('.social-hero, footer .social');

  /* L'altra lingua sta QUI, non nella barra: li' galleggiava fra il nome e il
     menu senza appartenere a nessuno dei due. */
  var altra = lang ? lang.querySelector('a[hreflang]') : null;
  var rigaLingua = altra
    ? '<a class="menu-lingua" href="' + altra.getAttribute('href') + '" hreflang="' +
      altra.getAttribute('hreflang') + '">' +
      (IT ? 'English' : 'Italiano') + '</a>'
    : '';

  pan.innerHTML =
    '<nav class="menu-voci" aria-label="' + T.pagine + '">' + voci + '</nav>' +
    '<div class="menu-piede">' +
      rigaLingua +
      /* L'indirizzo qui sotto non c'e' piu': era l'unica riga in carattere
         bastone in mezzo al serif, e Contatti sta due voci sopra. */
      (profili ? '<div class="menu-social">' + profili.innerHTML + '</div>' : '') +
    '</div>';
  barra.appendChild(pan);

  /* nel pannello i profili non devono rubare il giro della tastiera due volte */
  Array.prototype.forEach.call(pan.querySelectorAll('.menu-social a'), function (a) {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'me noopener');
  });

  var aperto = false;

  function mostra(si) {
    aperto = si;
    pan.hidden = !si;
    bot.setAttribute('aria-expanded', si ? 'true' : 'false');
    bot.setAttribute('aria-label', si ? T.chiudi : T.apri);
    document.documentElement.classList.toggle('menu-aperto', si);
    if (si) {
      requestAnimationFrame(function () { pan.classList.add('viva'); });
      var primo = pan.querySelector('a');
      if (primo) primo.focus();
    } else {
      pan.classList.remove('viva');
    }
  }

  bot.addEventListener('click', function () { mostra(!aperto); });

  pan.addEventListener('click', function (e) {
    if (e.target.closest('a')) mostra(false);
  });

  document.addEventListener('keydown', function (e) {
    if (!aperto) return;
    if (e.key === 'Escape') { mostra(false); bot.focus(); }
    else if (e.key === 'Tab') {
      var dentro = pan.querySelectorAll('a');
      var primo = dentro[0], ultimo = dentro[dentro.length - 1];
      if (e.shiftKey && document.activeElement === primo) { e.preventDefault(); bot.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); bot.focus(); }
    }
  });

  /* allargando la finestra il pannello non resta aperto per sbaglio */
  var largo = window.matchMedia('(min-width:761px)');
  function guarda() { if (largo.matches && aperto) mostra(false); }
  if (largo.addEventListener) largo.addEventListener('change', guarda);
  if (lang) lang.classList.add('lang-in-barra');
})();
