/* Le strisce si trascinano col mouse, non solo col dito. E sotto ognuna
   un filo d'oro dice a che punto sei: senza, non si capisce che c'e'
   dell'altro a destra. */
(function () {
  'use strict';
  document.querySelectorAll('.gs-nastro').forEach(function (n) {
    /* il filo */
    var barra = document.createElement('div');
    barra.className = 'gs-barra';
    var dentro = document.createElement('i');
    barra.appendChild(dentro);
    n.after(barra);
    function avanza() {
      var max = n.scrollWidth - n.clientWidth;
      var p = max > 4 ? n.scrollLeft / max : 0;
      dentro.style.width = (Math.max(.06, p) * 100).toFixed(1) + '%';
      barra.style.opacity = max > 4 ? 1 : 0;
    }
    n.addEventListener('scroll', avanza, {passive: true});
    addEventListener('resize', avanza);
    avanza();

    /* trascinare col mouse */
    var giu = false, x0 = 0, s0 = 0, mosso = 0;
    n.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;      /* il dito ce l'ha gia' */
      giu = true; mosso = 0; x0 = e.clientX; s0 = n.scrollLeft;
      n.classList.add('tira');
    });
    addEventListener('pointermove', function (e) {
      if (!giu) return;
      var d = e.clientX - x0; mosso += Math.abs(d);
      n.scrollLeft = s0 - d;
    });
    addEventListener('pointerup', function (e) {
      if (!giu) return;
      giu = false; n.classList.remove('tira');
      /* se ho trascinato non devo anche aprire la fotografia */
      if (mosso > 6) {
        var una = function (ev) { ev.preventDefault(); ev.stopPropagation(); };
        n.addEventListener('click', una, {capture: true, once: true});
      }
    });

    /* NESSUNA cattura della rotella: avevo fatto scorrere la striscia
       anche con il movimento verticale, e con due dita sul trackpad la
       pagina non scendeva piu'. Il movimento laterale lo gestisce gia'
       il browser da solo. */
  });
})();
