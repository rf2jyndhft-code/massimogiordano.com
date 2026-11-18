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

    /* La voce di partenza: quella della pagina aperta. Sulla home nessuna
       voce è "corrente", e allora il riquadro si mette sulla prima — se no
       resterebbe invisibile proprio dove lo si guarda per la prima volta. */
    var ferma = voci.filter(function (a) { return a.hasAttribute('aria-current'); })[0] || voci[0];
    var sopra = null;
    var colDito = false;      /* se si sta usando il dito, il mouse non comanda */

    function porta(a, subito) {
      if (!a) { cursore.classList.remove('viva'); return; }
      /* Si misura rispetto all'ELENCO, non allo schermo: se il pannello
         scorre di un pelo, le misure sullo schermo cambiano e il riquadro
         finisce fuori bersaglio. offsetTop invece resta sempre vero. */
      if (subito) cursore.style.transition = 'none';
      cursore.style.transform = 'translateY(' + a.offsetTop + 'px)';
      cursore.style.height = a.offsetHeight + 'px';
      cursore.classList.add('viva');
      if (subito) {
        /* si forza il ridisegno, se no la transizione riparte dal vecchio punto */
        void cursore.offsetHeight;
        cursore.style.transition = '';
      }
    }

    function aggiorna(subito) { porta(sopra || ferma, subito); }

    voci.forEach(function (a) {
      /* mouseenter oltre a pointerenter: su qualche browser il secondo non
         arriva mai, e il riquadro resterebbe fermo */
      ['pointerenter', 'mouseenter', 'focus'].forEach(function (ev) {
        a.addEventListener(ev, function () { sopra = a; aggiorna(); }, { passive: true });
      });
      /* al tocco il riquadro resta lì: è la voce che si sta aprendo */
      a.addEventListener('pointerdown', function () { ferma = a; sopra = a; aggiorna(); }, { passive: true });
    });

    /* ⚠️ Col dito, appena si stacca, il telefono manda comunque un "il
       puntatore è uscito": senza questo controllo il riquadro tornava
       indietro di scatto proprio mentre la voce si apriva. */
    elenco.addEventListener('pointerleave', function () {
      if (colDito) return;
      sopra = null; aggiorna();
    }, { passive: true });

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

    /* I gestori stanno sul PANNELLO, non sull'elenco: il dito può uscire di
       un pelo dalle voci mentre scorre, e lì l'inseguimento si interromperebbe.
       E si ascolta sia il tocco sia il puntatore, perché a seconda del
       browser arriva l'uno o l'altro — mai dare per scontato quale. */
    function segui(x, y) {
      var e = document.elementFromPoint(x, y);
      while (e && e !== pannello) {
        if (e.tagName === 'A' && voci.indexOf(e) > -1) {
          if (e !== sopra) { sopra = e; aggiorna(); }
          return;
        }
        e = e.parentElement;
      }
    }

    pannello.addEventListener('touchstart', function (ev) {
      colDito = true;
      if (ev.touches[0]) segui(ev.touches[0].clientX, ev.touches[0].clientY);
    }, { passive: true });

    pannello.addEventListener('touchmove', function (ev) {
      if (ev.touches[0]) segui(ev.touches[0].clientX, ev.touches[0].clientY);
    }, { passive: true });

    pannello.addEventListener('pointermove', function (ev) {
      if (colDito && ev.pointerType === 'mouse') return;
      segui(ev.clientX, ev.clientY);
    }, { passive: true });

    pannello.addEventListener('touchend', function () {
      if (sopra) { ferma = sopra; }      /* resta dove il dito si è staccato */
      aggiorna();
      /* un attimo di immunità: gli eventi del mouse che iOS manda dopo il
         tocco non devono riportare indietro il riquadro */
      setTimeout(function () { colDito = false; }, 900);
    }, { passive: true });

    pannello.addEventListener('touchcancel', function () {
      setTimeout(function () { colDito = false; }, 900);
    }, { passive: true });

    /* quando il pannello si apre, il riquadro si mette a posto senza volare
       da un angolo: si piazza subito dov'è la voce corrente */
    var osserva = new MutationObserver(function () {
      if (!pannello.hidden) setTimeout(function () { aggiorna(true); }, 30);
    });
    osserva.observe(pannello, { attributes: true, attributeFilter: ['hidden', 'class'] });

    window.addEventListener('resize', function () { aggiorna(true); });

    /* i caratteri arrivano dopo il resto: quando arrivano le righe cambiano
       altezza, e il riquadro va rimesso a posto */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { aggiorna(true); });
    }

    aggiorna(true);
    window.__cursoreOk = true;
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
