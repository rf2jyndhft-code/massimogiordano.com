/* IL REPERTORIO CHE RISPONDE
   Filtra, ordina, e cliccando una riga apre tutto quello che c'e' gia' scritto
   nella pagina vera: teatri, date, direttori, registi, colleghi. Niente si
   perde, perche' il testo resta nel documento e Google continua a leggerlo. */
(function () {
  'use strict';
  var D = window.__REP || [];
  var corpo = document.querySelector('#tavola tbody');
  var righe = [].slice.call(corpo.querySelectorAll('tr'));
  var cerca = document.getElementById('cerca');
  var conta = document.getElementById('conta');
  var vuoto = document.getElementById('vuoto');
  var chips = [].slice.call(document.querySelectorAll('.rep-chip'));
  var tenda = document.getElementById('tenda');

  /* una stringa sola per riga: ci cerchiamo dentro tutto, teatri compresi */
  var paglia = D.map(function (v) {
    return (v.r + ' ' + v.o + ' ' + v.c + ' ' + v.t.join(' ') + ' ' + v.h)
      .replace(/<[^>]+>/g, ' ').toLowerCase();
  });

  var filtroC = '', testo = '';

  function senzaAccenti(s) {
    return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s;
  }

  function applica() {
    var q = senzaAccenti(testo.trim().toLowerCase());
    var n = 0;
    righe.forEach(function (tr) {
      var i = +tr.getAttribute('data-i'), v = D[i];
      var ok = (!filtroC || v.c === filtroC) && (!q || senzaAccenti(paglia[i]).indexOf(q) >= 0);
      tr.hidden = !ok;
      if (ok) n++;
    });
    vuoto.hidden = n > 0;
    /* le parole arrivano dalla pagina: la tavola vive in due lingue */
    var W = window.__REP_PAROLE || {};
    conta.textContent = n === D.length
      ? D.length + ' ' + (W.conta || 'ruoli e programmi')
      : n + ' ' + (W.di || '/') + ' ' + D.length;
  }

  cerca.addEventListener('input', function () { testo = cerca.value; applica(); });

  chips.forEach(function (b) {
    b.addEventListener('click', function () {
      filtroC = b.getAttribute('data-c') || '';
      chips.forEach(function (x) { x.classList.toggle('viva', x === b); });
      applica();
    });
  });

  /* --- ordinamento --------------------------------------------------- */
  var ordCorr = 'r', verso = 1;
  function chiave(v, k) {
    if (k === 'r') return v.r.toLowerCase();
    if (k === 'o') return v.o.toLowerCase();
    if (k === 'c') return v.c.toLowerCase();
    if (k === 'n') return v.t.length;
    return v.da || 0;                    /* 'y': il primo anno */
  }
  [].slice.call(document.querySelectorAll('#tavola th')).forEach(function (th) {
    th.addEventListener('click', function () {
      var k = th.getAttribute('data-ord');
      verso = (k === ordCorr) ? -verso : (k === 'n' || k === 'y' ? -1 : 1);
      ordCorr = k;
      document.querySelectorAll('#tavola th').forEach(function (x) {
        x.classList.remove('su', 'giu');
      });
      th.classList.add(verso > 0 ? 'su' : 'giu');
      righe.sort(function (a, b) {
        var va = chiave(D[+a.getAttribute('data-i')], k);
        var vb = chiave(D[+b.getAttribute('data-i')], k);
        if (va < vb) return -verso;
        if (va > vb) return verso;
        return 0;
      });
      righe.forEach(function (tr) { corpo.appendChild(tr); });
    });
  });

  /* --- la scheda ----------------------------------------------------- */
  var tornaA = null;
  function apri(i) {
    var v = D[i];
    document.getElementById('f-comp').textContent = v.c;
    document.getElementById('f-ruolo').textContent = v.r;
    document.getElementById('f-opera').innerHTML = v.o;
    document.getElementById('f-case').innerHTML = v.h;
    tenda.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('chiudi').focus();
  }
  function chiudi() {
    tenda.hidden = true;
    document.body.style.overflow = '';
    if (tornaA) tornaA.focus();
  }
  righe.forEach(function (tr) {
    tr.addEventListener('click', function () { tornaA = tr; apri(+tr.getAttribute('data-i')); });
    tr.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tornaA = tr; apri(+tr.getAttribute('data-i')); }
    });
  });
  document.getElementById('chiudi').addEventListener('click', chiudi);
  tenda.addEventListener('click', function (e) { if (e.target === tenda) chiudi(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !tenda.hidden) chiudi();
  });

  applica();
})();
