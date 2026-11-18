/* IL RIQUADRO CHE SEGNA LA VOCE

   Un sottile riquadro d'oro si posa sulla voce che si tocca e ci resta.
   Col mouse segue il passaggio; col dito si sposta al tocco.

   Perché NON insegue il dito mentre scorre: su iPhone il trascinamento
   dentro un pannello viene interpretato come scorrimento, gli eventi
   arrivano a singhiozzo e il riquadro restava indietro o tornava al punto
   di partenza. Spostarsi al tocco è prevedibile e non sbaglia mai. */
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

    /* la voce della pagina aperta; sulla home, la prima */
    var scelta = voci.filter(function (a) { return a.hasAttribute('aria-current'); })[0] || voci[0];

    function porta(a, subito) {
      if (!a) return;
      if (subito) cursore.style.transition = 'none';
      /* misure rispetto all'elenco: non cambiano se il pannello si muove */
      cursore.style.transform = 'translateY(' + a.offsetTop + 'px)';
      cursore.style.height = a.offsetHeight + 'px';
      cursore.classList.add('viva');
      if (subito) { void cursore.offsetHeight; cursore.style.transition = ''; }
    }

    function scegli(a, subito) { if (a) { scelta = a; porta(a, subito); } }

    voci.forEach(function (a) {
      /* col dito: appena lo appoggi */
      a.addEventListener('touchstart', function () { scegli(a); }, { passive: true });
      /* col mouse: al passaggio */
      a.addEventListener('mouseenter', function () { scegli(a); }, { passive: true });
      /* con la tastiera */
      a.addEventListener('focus', function () { scegli(a); }, { passive: true });
      /* e in ogni caso quando si preme */
      a.addEventListener('pointerdown', function () { scegli(a); }, { passive: true });
    });

    /* all'apertura si piazza subito, senza volare da un angolo */
    var osserva = new MutationObserver(function () {
      if (!pannello.hidden) setTimeout(function () { porta(scelta, true); }, 30);
    });
    osserva.observe(pannello, { attributes: true, attributeFilter: ['hidden', 'class'] });

    window.addEventListener('resize', function () { porta(scelta, true); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { porta(scelta, true); });
    }
    porta(scelta, true);
  }

  function cerca() {
    var p = document.querySelector('.menu-pan');
    if (p) { avvia(p); return true; }
    return false;
  }

  if (!cerca()) {
    var n = 0;
    var ogni = setInterval(function () { if (cerca() || ++n > 40) clearInterval(ogni); }, 50);
  }
})();
