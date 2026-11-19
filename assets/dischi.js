/* IL LETTORE DEI BRANI

   Il lettore di sistema è un confetto bianco: su questo fondo sembra
   incollato da un'altra pagina. Qui ogni brano ha un cerchio d'oro, una
   riga che si riempie mentre suona e il tempo che scorre — gli stessi
   segni del pulsante "Ascolta" in apertura.

   Un solo brano per volta: se ne parte un altro, il primo si ferma.
   Se il javascript non arriva, restano i lettori di sistema: il tag
   <audio controls> è già nella pagina e questo script lo sostituisce. */
(function () {
  'use strict';
  var brani = [].slice.call(document.querySelectorAll('.brano'));
  if (!brani.length) return;

  var insuona = null;

  function tempo(s) {
    if (!isFinite(s) || s < 0) s = 0;
    var m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  brani.forEach(function (b) {
    var a = b.querySelector('audio');
    if (!a) return;
    a.removeAttribute('controls');
    a.preload = 'metadata';

    var fila = document.createElement('div');
    fila.className = 'suona';
    fila.innerHTML =
      '<button type="button" class="suona-bot" aria-label="Ascolta">' +
        '<span class="suona-tri" aria-hidden="true"></span>' +
      '</button>' +
      '<div class="suona-riga" role="slider" tabindex="0" aria-label="Posizione nel brano" ' +
           'aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
        '<i class="suona-fatta"></i>' +
      '</div>' +
      '<span class="suona-tempo">0:00</span>';
    a.parentNode.insertBefore(fila, a);

    var bot = fila.querySelector('.suona-bot'),
        riga = fila.querySelector('.suona-riga'),
        fatta = fila.querySelector('.suona-fatta'),
        orol = fila.querySelector('.suona-tempo');

    function aggiorna() {
      var d = a.duration || 0;
      var q = d ? (a.currentTime / d) * 100 : 0;
      fatta.style.width = q.toFixed(2) + '%';
      riga.setAttribute('aria-valuenow', Math.round(q));
      orol.textContent = tempo(a.currentTime) + (d ? ' / ' + tempo(d) : '');
    }

    bot.addEventListener('click', function () {
      if (a.paused) {
        if (insuona && insuona !== a) { insuona.pause(); }
        insuona = a;
        var pr = a.play();
        if (pr && pr.catch) pr.catch(function () {});
      } else {
        a.pause();
      }
    });

    a.addEventListener('play',  function () { b.classList.add('suonando'); });
    a.addEventListener('pause', function () { b.classList.remove('suonando'); });
    a.addEventListener('ended', function () {
      b.classList.remove('suonando'); a.currentTime = 0; aggiorna();
    });
    a.addEventListener('timeupdate', aggiorna);
    a.addEventListener('loadedmetadata', aggiorna);

    function vai(x) {
      var r = riga.getBoundingClientRect();
      var q = Math.min(1, Math.max(0, (x - r.left) / r.width));
      if (a.duration) { a.currentTime = q * a.duration; aggiorna(); }
    }
    riga.addEventListener('click', function (e) { vai(e.clientX); });
    riga.addEventListener('keydown', function (e) {
      if (!a.duration) return;
      if (e.key === 'ArrowRight') { a.currentTime = Math.min(a.duration, a.currentTime + 5); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { a.currentTime = Math.max(0, a.currentTime - 5); e.preventDefault(); }
      else if (e.key === 'Enter' || e.key === ' ') { bot.click(); e.preventDefault(); }
      aggiorna();
    });
    var preso = false;
    riga.addEventListener('pointerdown', function (e) { preso = true; vai(e.clientX); });
    window.addEventListener('pointermove', function (e) { if (preso) vai(e.clientX); });
    window.addEventListener('pointerup', function () { preso = false; });

    aggiorna();
  });
})();
