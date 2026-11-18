/* IL RIQUADRO CHE SEGUE LA VOCE

   Nel menu del telefono un sottile riquadro d'oro scivola da una voce
   all'altra mentre il dito passa, e si ferma su quella che si sta per
   aprire. All'apertura parte dalla pagina in cui ci si trova.

   Perché un riquadro che si muove e non uno sfondo che si accende su
   ciascuna voce: il movimento dice da dove vieni e dove sei arrivato,
   e tiene insieme l'elenco invece di farlo lampeggiare. */
(function () {
  'use strict';

  function avvia(pannello) {
    var elenco = pannello.querySelector('.menu-voci');
    if (!elenco || elenco.querySelector('.menu-cursore')) return;

    var voci = Array.prototype.slice.call(elenco.querySelectorAll('a'));
    if (!voci.length) return;

    var cursore = document.createElement('span');
    cursore.className = 'menu-cursore';
    cursore.setAttribute('aria-hidden', 'true');
    elenco.appendChild(cursore);

    /* la voce di partenza: quella della pagina aperta, se c'è */
    var ferma = voci.filter(function (a) { return a.hasAttribute('aria-current'); })[0] || null;
    var sopra = null;

    function porta(a, subito) {
      if (!a) { cursore.classList.remove('viva'); return; }
      var r = a.getBoundingClientRect(), p = elenco.getBoundingClientRect();
      if (subito) cursore.style.transition = 'none';
      cursore.style.transform = 'translateY(' + (r.top - p.top) + 'px)';
      cursore.style.height = r.height + 'px';
      cursore.classList.add('viva');
      if (subito) {
        /* si forza il ridisegno, se no la transizione riparte dal vecchio punto */
        void cursore.offsetHeight;
        cursore.style.transition = '';
      }
    }

    function aggiorna(subito) { porta(sopra || ferma, subito); }

    voci.forEach(function (a) {
      ['pointerenter', 'focus'].forEach(function (ev) {
        a.addEventListener(ev, function () { sopra = a; aggiorna(); }, { passive: true });
      });
      /* al tocco il riquadro resta lì: è la voce che si sta aprendo */
      a.addEventListener('pointerdown', function () { ferma = a; sopra = a; aggiorna(); }, { passive: true });
    });

    elenco.addEventListener('pointerleave', function () { sopra = null; aggiorna(); }, { passive: true });

    /* COL DITO non esiste il passaggio del mouse: si segue il tocco mentre
       scivola sull'elenco, e quando il dito si stacca il riquadro resta
       sull'ultima voce toccata — quella che sta per aprirsi. */
    function vociSotto(t) {
      var e = document.elementFromPoint(t.clientX, t.clientY);
      while (e && e !== elenco) {
        if (e.tagName === 'A' && voci.indexOf(e) > -1) return e;
        e = e.parentElement;
      }
      return null;
    }

    elenco.addEventListener('touchstart', function (ev) {
      var a = vociSotto(ev.touches[0]);
      if (a) { sopra = a; aggiorna(); }
    }, { passive: true });

    elenco.addEventListener('touchmove', function (ev) {
      var a = vociSotto(ev.touches[0]);
      if (a && a !== sopra) { sopra = a; aggiorna(); }
    }, { passive: true });

    elenco.addEventListener('touchend', function () {
      if (sopra) ferma = sopra;          /* resta dove il dito si è staccato */
      aggiorna();
    }, { passive: true });

    /* quando il pannello si apre, il riquadro si mette a posto senza volare
       da un angolo: si piazza subito dov'è la voce corrente */
    var osserva = new MutationObserver(function () {
      if (!pannello.hidden) setTimeout(function () { aggiorna(true); }, 30);
    });
    osserva.observe(pannello, { attributes: true, attributeFilter: ['hidden', 'class'] });

    window.addEventListener('resize', function () { aggiorna(true); });
    if (!pannello.hidden) aggiorna(true);
  }

  function cerca() {
    var p = document.querySelector('.menu-pan');
    if (p) { avvia(p); return true; }
    return false;
  }

  /* il pannello lo costruisce menu.js: se non c'è ancora, si aspetta */
  if (!cerca()) {
    var quante = 0;
    var ogni = setInterval(function () {
      if (cerca() || ++quante > 40) clearInterval(ogni);
    }, 50);
  }
})();
