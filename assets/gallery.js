/* La galleria: muro di fotografie a proporzioni vere, e una lente a tutto
   schermo per guardarle una per una.

   Tre scelte dietro a questo file:
   - Le fotografie NON sono ritagliate in quadrati tutti uguali. Un ritratto
     verticale resta verticale: tagliare per far quadrare la griglia significa
     tagliare la testa, ed era successo.
   - Le miniature compaiono mentre si sale, poche alla volta: con sessantasei
     fotografie, farle arrivare tutte insieme blocca il telefono.
   - La lente precarica la foto prima e quella dopo, cosi' scorrere e'
     immediato invece di aspettare a ogni passo. */
(function () {
  var griglie = document.querySelectorAll('[data-gal]');
  if (!griglie.length) return;

  var scatti = [];
  Array.prototype.forEach.call(griglie, function (g) {
    Array.prototype.forEach.call(g.querySelectorAll('button.shot'), function (b) {
      scatti.push(b);
    });
  });
  if (!scatti.length) return;

  document.documentElement.classList.add('gal-viva');
  Array.prototype.forEach.call(griglie, function (g) { g.classList.add('gal-pronta'); });

  /* ---------- il muro: ogni fotografia occupa l'altezza che le spetta ---------- */
  var RIGA = 8;

  /* Lo spazio fra le righe NON va scritto qui dentro: lo decide il CSS e cambia
     col telefono. Se il numero fisso e il CSS non coincidono, il calcolo degli
     span sbaglia e le didascalie finiscono sotto la fotografia successiva. */
  function vuotoDi(griglia) {
    var g = parseFloat(getComputedStyle(griglia).rowGap);
    return isNaN(g) ? 16 : g;
  }

  function misura(fig) {
    var im = fig.querySelector('img');
    if (!im) return;
    /* Alcune file hanno un'altezza decisa dal foglio di stile (la fila delle
       pagine di rivista). Li' il muro a span non serve e anzi fa danni: calcola
       l'altezza vera della fotografia mentre in pagina e' alta un'altra cosa, e
       sul telefono lascia buchi enormi fra una riga e l'altra. */
    if (fig.parentNode && fig.parentNode.hasAttribute('data-gal-fisso')) return;
    var w = +im.getAttribute('width') || im.naturalWidth || 4;
    var h = +im.getAttribute('height') || im.naturalHeight || 3;
    var larghezza = fig.getBoundingClientRect().width;
    if (!larghezza) return;
    var VUOTO = vuotoDi(fig.parentNode);
    var altezza = larghezza * h / w;
    var did = fig.querySelector('figcaption');
    if (did) {
      var st = getComputedStyle(did);
      altezza += did.getBoundingClientRect().height
               + (parseFloat(st.marginTop) || 0)
               + (parseFloat(st.marginBottom) || 0) + 2;
    }
    fig.style.gridRowEnd = 'span ' + Math.ceil((altezza + VUOTO) / (RIGA + VUOTO));
  }

  var figure = [];
  Array.prototype.forEach.call(griglie, function (g) {
    Array.prototype.forEach.call(g.querySelectorAll('figure'), function (f) { figure.push(f); });
  });

  function rifai() { figure.forEach(misura); }

  var attesa;
  window.addEventListener('resize', function () {
    clearTimeout(attesa);
    attesa = setTimeout(rifai, 120);
  }, { passive: true });

  rifai();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rifai);
  /* una fotografia che arriva puo' avere proporzioni diverse da quelle dichiarate */
  figure.forEach(function (f) {
    var im = f.querySelector('img');
    if (im && !im.complete) im.addEventListener('load', function () { misura(f); });
  });

  /* ---------- compaiono salendo ---------- */
  if ('IntersectionObserver' in window &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var occhio = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (v.isIntersecting) { v.target.classList.add('entrata'); occhio.unobserve(v.target); }
      });
    }, { rootMargin: '140px 0px' });
    figure.forEach(function (f) { occhio.observe(f); });
  } else {
    figure.forEach(function (f) { f.classList.add('entrata'); });
  }

  /* ---------- la lente ---------- */
  var IT = document.documentElement.lang.slice(0, 2) === 'it';
  var T = IT
    ? { chiudi: 'Chiudi', prima: 'Precedente', dopo: 'Successiva', di: 'di', apri: 'Guarda la fotografia' }
    : { chiudi: 'Close', prima: 'Previous', dopo: 'Next', di: 'of', apri: 'View photograph' };

  var lente = document.createElement('div');
  lente.className = 'lente';
  lente.setAttribute('role', 'dialog');
  lente.setAttribute('aria-modal', 'true');
  lente.hidden = true;
  lente.innerHTML =
    '<div class="lente-sfondo" data-chiudi></div>' +
    '<button type="button" class="lente-x" data-chiudi aria-label="' + T.chiudi + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>' +
    '</button>' +
    '<button type="button" class="lente-freccia lente-prima" data-vai="-1" aria-label="' + T.prima + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4L7 12l8 8" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    '</button>' +
    '<button type="button" class="lente-freccia lente-dopo" data-vai="1" aria-label="' + T.dopo + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l8 8-8 8" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    '</button>' +
    '<figure class="lente-corpo">' +
      '<div class="lente-palco"><img alt=""></div>' +
      '<figcaption class="lente-did"><span class="lente-testo"></span>' +
        '<span class="lente-cr"></span>' +
        '<span class="lente-conta"></span></figcaption>' +
    '</figure>';
  document.body.appendChild(lente);

  var im = lente.querySelector('img');
  var testo = lente.querySelector('.lente-testo');
  var cred = lente.querySelector('.lente-cr');
  var conta = lente.querySelector('.lente-conta');
  var palco = lente.querySelector('.lente-palco');
  var dove = 0, tornaA = null;

  function fonte(b) { return b.getAttribute('data-full') || b.querySelector('img').src; }

  function precarica(i) {
    [i - 1, i + 1].forEach(function (k) {
      if (k < 0 || k >= scatti.length) return;
      var p = new Image(); p.src = fonte(scatti[k]);
    });
  }

  function mostra(i, verso) {
    dove = (i + scatti.length) % scatti.length;
    var b = scatti[dove];
    palco.classList.remove('arriva-da-destra', 'arriva-da-sinistra');
    if (verso) {
      void palco.offsetWidth;
      palco.classList.add(verso > 0 ? 'arriva-da-destra' : 'arriva-da-sinistra');
    }
    im.src = fonte(b);
    var did = b.getAttribute('data-cap') || '';
    testo.innerHTML = did;
    /* il credito del fotografo, quando lo sappiamo */
    var cr = b.getAttribute('data-cr') || '';
    cred.textContent = cr ? '\u00a9 ' + cr : '';
    cred.hidden = !cr;
    im.alt = did.replace(/<[^>]+>/g, '');
    conta.textContent = (dove + 1) + ' ' + T.di + ' ' + scatti.length;
    lente.querySelector('.lente-prima').disabled = false;
    lente.querySelector('.lente-dopo').disabled = false;
    precarica(dove);
  }

  function apri(i, da) {
    tornaA = da || null;
    lente.hidden = false;
    document.documentElement.classList.add('lente-aperta');
    mostra(i, 0);
    requestAnimationFrame(function () { lente.classList.add('viva'); });
    lente.querySelector('.lente-x').focus();
  }

  function chiudi() {
    lente.classList.remove('viva');
    setTimeout(function () {
      lente.hidden = true;
      im.removeAttribute('src');
      document.documentElement.classList.remove('lente-aperta');
      if (tornaA) tornaA.focus();
    }, 220);
  }

  scatti.forEach(function (b, i) {
    if (!b.getAttribute('aria-label')) b.setAttribute('aria-label', T.apri);
    b.addEventListener('click', function () { apri(i, b); });
  });

  lente.addEventListener('click', function (e) {
    var c = e.target.closest('[data-chiudi]');
    if (c) { chiudi(); return; }
    var v = e.target.closest('[data-vai]');
    if (v) { var d = +v.getAttribute('data-vai'); mostra(dove + d, d); }
  });

  document.addEventListener('keydown', function (e) {
    if (lente.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); chiudi(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); mostra(dove + 1, 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); mostra(dove - 1, -1); }
    else if (e.key === 'Home') { e.preventDefault(); mostra(0, -1); }
    else if (e.key === 'End') { e.preventDefault(); mostra(scatti.length - 1, 1); }
    else if (e.key === 'Tab') {
      /* il fuoco resta dentro la lente finche' e' aperta */
      var dentro = lente.querySelectorAll('button:not([disabled])');
      var primo = dentro[0], ultimo = dentro[dentro.length - 1];
      if (e.shiftKey && document.activeElement === primo) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primo.focus(); }
    }
  });

  /* il dito, sul telefono.
     DUE DITA NON SONO UNA SCORSA. Prima, allargando le dita per
     ingrandire, le due dita si allontanavano, la differenza orizzontale
     diventava grande e la lente cambiava fotografia invece di
     ingrandire: «impazzisce e comincia a girarle alla rinfusa senza
     lasciarle ingrandire» (Massimo, 25 novembre 2026, sulle fotografie
     di Varsavia). Appena compare un secondo dito la scorsa si annulla
     e non si riaccende fino a quando non si riparte da zero. */
  var x0 = null, y0 = null, dita = 0;
  palco.addEventListener('touchstart', function (e) {
    dita = Math.max(dita, e.touches.length);
    if (e.touches.length > 1) { x0 = y0 = null; return; }   /* pizzicata */
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
  }, { passive: true });
  palco.addEventListener('touchmove', function (e) {
    if (e.touches.length > 1) { dita = e.touches.length; x0 = y0 = null; }
  }, { passive: true });
  palco.addEventListener('touchend', function (e) {
    if (e.touches.length === 0) {
      var piu = dita > 1; dita = 0;
      if (piu) { x0 = y0 = null; return; }                  /* era una pizzicata */
    }
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    var dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) mostra(dove + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    else if (dy > 90) chiudi();          /* trascinare in giu' chiude, come nelle app */
    x0 = y0 = null;
  }, { passive: true });
  palco.addEventListener('touchcancel', function () { x0 = y0 = null; dita = 0; }, { passive: true });
})();
