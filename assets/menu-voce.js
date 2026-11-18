/* IL RIQUADRO CHE SEGUE LA VOCE

   Un sottile riquadro d'oro si muove da una voce all'altra mentre il dito
   scorre sull'elenco, e resta dove il dito si stacca.

   L'inseguimento sta su DOCUMENT e non sul pannello: durante un
   trascinamento il telefono manda gli eventi all'elemento dove il dito è
   partito, non a quello che sta sotto adesso. Si guarda quindi che cosa
   c'è sotto le coordinate, a ogni movimento. */
(function () {
  'use strict';

  function avvia(pannello) {
    var elenco = pannello.querySelector('.menu-voci');
    if (!elenco || elenco.querySelector('.menu-cursore')) return;

    /* La prima voce è la Home. Nella barra non c'è — lì il nome in alto fa
       già da collegamento — ma dentro il pannello del telefono serve: senza,
       l'unico modo per tornare alla prima pagina è chiudere il menu. */
    if (!elenco.querySelector('[data-casa]')) {
      var it = (document.documentElement.lang || 'en').slice(0, 2) === 'it';
      var casa = document.createElement('a');
      casa.setAttribute('data-casa', '');
      casa.href = it ? '/it/' : '/';
      casa.textContent = it ? 'Home' : 'Home';
      /* il collegamento vero lo prende dal nome in alto, così funziona
         anche nelle cartelle di prova */
      var marchio = document.querySelector('.topbar .brand');
      if (marchio && marchio.getAttribute('href')) casa.href = marchio.getAttribute('href');
      if (location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') ===
          casa.getAttribute('href').replace(/index\.html$/, '').replace(/\/$/, '')) {
        casa.setAttribute('aria-current', 'page');
      }
      elenco.insertBefore(casa, elenco.firstChild);
    }

    var voci = Array.prototype.slice.call(elenco.querySelectorAll('a'));
    if (!voci.length) return;

    var cursore = document.createElement('span');
    cursore.className = 'menu-cursore';
    cursore.setAttribute('aria-hidden', 'true');
    elenco.appendChild(cursore);

    var scelta = null;
    var dito = false;

    function porta(a, subito) {
      if (!a) return;
      /* si accende SOLO la voce dentro il riquadro: comanda lui */
      voci.forEach(function (v) { v.classList.toggle('dentro-box', v === a); });
      if (subito) cursore.style.transition = 'none';
      cursore.style.transform = 'translateY(' + a.offsetTop + 'px)';
      cursore.style.height = a.offsetHeight + 'px';
      cursore.classList.add('viva');
      if (subito) { void cursore.offsetHeight; cursore.style.transition = ''; }
    }

    function scegli(a, subito) {
      if (a && a !== scelta) { scelta = a; porta(a, subito); }
      else if (a) porta(a, subito);
    }

    function sotto(x, y) {
      var e = document.elementFromPoint(x, y);
      while (e) {
        if (e.tagName === 'A' && voci.indexOf(e) > -1) return e;
        e = e.parentElement;
      }
      return null;
    }

    /* col dito: si segue il movimento, ovunque finisca */
    document.addEventListener('touchstart', function (ev) {
      if (pannello.hidden || !ev.touches[0]) return;
      dito = true;
      scegli(sotto(ev.touches[0].clientX, ev.touches[0].clientY));
    }, { passive: true });

    document.addEventListener('touchmove', function (ev) {
      if (pannello.hidden || !dito || !ev.touches[0]) return;
      scegli(sotto(ev.touches[0].clientX, ev.touches[0].clientY));
    }, { passive: true });

    document.addEventListener('touchend', function () { dito = false; }, { passive: true });

    /* col mouse */
    voci.forEach(function (a) {
      a.addEventListener('mouseenter', function () { if (!dito) scegli(a); }, { passive: true });
      a.addEventListener('focus', function () { scegli(a); }, { passive: true });
    });

    /* Ogni volta che il menu si apre, il riquadro torna sulla pagina in cui
       ci si trova — non resta dove l'aveva lasciato il dito la volta prima. */
    function corrente() {
      return voci.filter(function (a) { return a.hasAttribute('aria-current'); })[0] || voci[0];
    }

    var osserva = new MutationObserver(function () {
      if (!pannello.hidden) {
        scelta = corrente();
        setTimeout(function () { porta(scelta, true); }, 30);
      }
    });
    osserva.observe(pannello, { attributes: true, attributeFilter: ['hidden', 'class'] });

    scelta = corrente();
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
    var n = 0, ogni = setInterval(function () { if (cerca() || ++n > 40) clearInterval(ogni); }, 50);
  }
})();
