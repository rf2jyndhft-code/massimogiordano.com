/* Il selettore di lingua, lo stesso di EraTickets: un bottone con il globo e
   il codice della lingua corrente, che apre l'elenco delle lingue scritte nel
   loro nome — "Italiano", non "Italian". Il globo serve a chi non legge la
   lingua in cui si e' aperto il sito.

   Il markup di partenza resta un link semplice: se lo script non parte, il
   link all'altra lingua c'e' lo stesso. */
(function () {
  /* due barre: quella alta in cima e la copia sottile che scende scorrendo */
  var caselle = document.querySelectorAll('.topbar .lang');
  if (!caselle.length) return;
  Array.prototype.forEach.call(caselle, vesti);

  function vesti(box) {
    if (box.classList.contains('lang-pronta')) return;

  var NOMI = { en: 'English', it: 'Italiano' };
  var qui = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();

  /* le altre lingue le leggo dai link gia' presenti: ognuno sa dove andare */
  var altre = [];
  Array.prototype.forEach.call(box.querySelectorAll('a[hreflang]'), function (a) {
    altre.push({ cod: a.getAttribute('hreflang').slice(0, 2).toLowerCase(), dove: a.href });
  });
  if (!altre.length) return;

  var globo = '<svg class="globo" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
    ' stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9.2"/>' +
    '<path d="M2.8 12h18.4M12 2.8a14 14 0 0 1 0 18.4 14 14 0 0 1 0-18.4Z"/></svg>';
  var freccia = '<svg class="punta" viewBox="0 0 12 8" fill="none" aria-hidden="true">' +
    '<path d="M1 1.5 6 6.5l5-5" stroke="currentColor" stroke-width="1.6"' +
    ' stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var etichetta = box.getAttribute('data-etichetta') ||
    (qui === 'it' ? 'Cambia lingua' : 'Change language');

  var voci = [{ cod: qui, dove: null }].concat(altre);
  voci.sort(function (a, b) { return a.cod < b.cod ? -1 : 1; });

  var html = '<button type="button" class="lang-bot" aria-haspopup="true"' +
    ' aria-expanded="false" aria-label="' + etichetta + '">' +
    globo + '<span class="lang-cod">' + qui.toUpperCase() + '</span>' + freccia + '</button>' +
    '<div class="lang-pannello" role="menu" hidden>';
  voci.forEach(function (v) {
    var nome = NOMI[v.cod] || v.cod.toUpperCase();
    html += v.dove
      ? '<a role="menuitem" class="lang-voce" href="' + v.dove + '" hreflang="' + v.cod + '">' +
        '<span>' + nome + '</span><span class="lang-sigla">' + v.cod.toUpperCase() + '</span></a>'
      : '<span role="menuitem" class="lang-voce adesso" aria-current="true">' +
        '<span>' + nome + '</span><span class="lang-sigla">' + v.cod.toUpperCase() + '</span></span>';
  });
  html += '</div>';

  box.innerHTML = html;
  box.classList.add('lang-pronta');

  var bot = box.querySelector('.lang-bot');
  var pannello = box.querySelector('.lang-pannello');

  function apri(si) {
    pannello.hidden = !si;
    bot.setAttribute('aria-expanded', si ? 'true' : 'false');
    box.classList.toggle('aperta', si);
  }

  bot.addEventListener('click', function (e) {
    e.stopPropagation();
    apri(pannello.hidden);
  });

  document.addEventListener('click', function (e) {
    if (!box.contains(e.target)) apri(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !pannello.hidden) { apri(false); bot.focus(); }
  });
  }
})();
