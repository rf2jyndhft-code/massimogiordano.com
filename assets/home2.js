/* Le tre righe che si suonano. Un brano per volta, il filo d'oro
   cammina sul bordo basso, e la riga resta viva finche' suona. */
(function () {
  'use strict';
  var righe = Array.prototype.slice.call(document.querySelectorAll('.voce-r'));
  if (!righe.length) return;
  var suono = null, vivo = null;

  function spegni() {
    if (vivo) { vivo.classList.remove('suona');
      vivo.querySelector('.voce-avanza').style.width = '0'; }
    vivo = null;
  }

  righe.forEach(function (r) {
    var tasto = r.querySelector('.voce-t');
    var avanza = r.querySelector('.voce-avanza');
    tasto.addEventListener('click', function () {
      if (vivo === r && suono && !suono.paused) { suono.pause(); spegni(); return; }
      if (suono) { suono.pause(); suono.currentTime = 0; }
      spegni();
      suono = new Audio(r.dataset.audio);
      suono.play().catch(function () { /* il browser puo' rifiutare: pazienza */ });
      vivo = r; r.classList.add('suona');
      suono.addEventListener('timeupdate', function () {
        if (!suono.duration) return;
        avanza.style.width = (suono.currentTime / suono.duration * 100) + '%';
      });
      suono.addEventListener('ended', spegni);
    });
  });
})();

/* Il Don Carlo: non e' un fondale che gira, e' un video che si preme.
   Resta fermo sul fotogramma con i versi sopra; al clic parte dall'inizio
   con la voce, e il testo si leva di mezzo. */
(function () {
  'use strict';
  var s = document.querySelector('.carlo');
  if (!s) return;
  var v = s.querySelector('video'), b = s.querySelector('.carlo-voce');
  if (!v || !b) return;
  var eti = b.querySelector('.eti');
  function ferma() {
    v.pause(); v.currentTime = 0; v.muted = true;
    s.classList.remove('canta'); eti.textContent = b.dataset.on;
  }
  b.addEventListener('click', function () {
    if (s.classList.contains('canta')) { ferma(); return; }
    v.muted = false;
    v.play().then(function () {
      s.classList.add('canta'); eti.textContent = b.dataset.off;
    }).catch(function () { /* se il browser rifiuta, resta fermo */ });
  });
  v.addEventListener('ended', ferma);
})();
