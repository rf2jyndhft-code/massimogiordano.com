/* Slider della home. Nessuna libreria.
   - le immagini sono gia' nel documento, in posizione assoluta: non c'e' salto di layout
   - si ferma se il visitatore ha chiesto meno animazioni
   - si ferma col mouse sopra, col fuoco da tastiera e quando la scheda non e' in primo piano
   - frecce sinistra/destra da tastiera quando il carosello ha il fuoco */
(function () {
  var hero = document.querySelector('[data-slider]');
  if (!hero) return;
  var imgs = Array.prototype.slice.call(hero.querySelectorAll('.slides img'));
  if (imgs.length < 2) return;

  document.documentElement.classList.add('js');

  /* Le immagini dopo la prima hanno il caricamento differito: l'ultima arrivava
     a schermo mentre il browser la stava ancora decodificando, e si vedeva lo
     scatto. Appena la pagina e' pronta le prendiamo tutte, con calma. */
  function preparaTutte() {
    imgs.forEach(function (im) {
      im.loading = 'eager';
      im.decoding = 'async';
      if (im.decode) { im.decode().catch(function () {}); }
    });
  }
  if (document.readyState === 'complete') preparaTutte();
  else window.addEventListener('load', preparaTutte);

  var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
  var live = hero.querySelector('[data-slider-live]');
  var i = 0, timer = null, fermo = false, inPausa = false;
  var lento = window.matchMedia('(prefers-reduced-motion: reduce)');
  var PAUSA = 6500;

  /* barra di avanzamento: dice a colpo d'occhio che il carosello e' vivo */
  var barra = document.createElement('div');
  barra.className = 'hero-barra';
  var corsa = document.createElement('i');
  barra.appendChild(corsa);
  (hero.querySelector('.hero-vista') || hero).appendChild(barra);
  hero.style.setProperty('--pausa', PAUSA + 'ms');

  function riavvolgi() {
    corsa.classList.remove('corre');
    void corsa.offsetWidth;          // forza il riavvio dell'animazione
  }


  var uscitaTimer = null;

  function mostra(n) {
    var vecchia = imgs[i];
    i = (n + imgs.length) % imgs.length;
    imgs.forEach(function (im, k) {
      if (k === i) {
        im.classList.remove('uscita');
        im.style.transform = '';
        /* un giro di rendering prima di accendere: cosi' la transizione
           parte davvero dallo stato iniziale e non salta */
        void im.offsetWidth;
        im.classList.add('on');
      } else {
        im.classList.remove('on');
      }
      im.setAttribute('aria-hidden', k === i ? 'false' : 'true');
    });
    /* La foto che lascia la scena viene CONGELATA dove si trova in quel
       momento: il cambio avviene a 6,5s ma lo zoom dura 14s, quindi e' a
       meta' strada. Imporle la dimensione finale faceva saltare l'immagine. */
    if (vecchia && vecchia !== imgs[i]) {
      var dove = window.getComputedStyle(vecchia).transform;
      if (dove && dove !== 'none') vecchia.style.transform = dove;
      vecchia.classList.add('uscita');
      clearTimeout(uscitaTimer);
      uscitaTimer = setTimeout(function () {
        imgs.forEach(function (im) {
          if (!im.classList.contains('on')) {
            im.classList.remove('uscita');
            im.style.transform = '';     /* torna alle regole del foglio di stile */
          }
        });
      }, 1800);
    }
    dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    if (live) live.textContent = (i + 1) + ' / ' + imgs.length;
  }

  /* Mostra solo quando l'immagine e' decodificata: niente primo fotogramma
     a scatti. Se la decodifica non e' disponibile, procede comunque. */
  function vaiA(n) {
    var k = (n + imgs.length) % imgs.length;
    var im = imgs[k];
    if (im && im.decode && !im.complete) {
      im.decode().then(function () { mostra(k); }).catch(function () { mostra(k); });
    } else {
      mostra(k);
    }
  }

  function avanti() { vaiA(i + 1); }
  function indietro() { vaiA(i - 1); }

  function parti() {
    if (timer || fermo || inPausa || lento.matches) return;
    riavvolgi();
    corsa.classList.add('corre');
    timer = setInterval(function () { avanti(); riavvolgi(); corsa.classList.add('corre'); }, PAUSA);
  }
  function stop() {
    clearInterval(timer); timer = null;
    corsa.classList.remove('corre');
  }

  var btnPausa = hero.querySelector('[data-pausa]');
  if (btnPausa) {
    btnPausa.hidden = false;
    btnPausa.addEventListener('click', function () {
      inPausa = !inPausa;
      btnPausa.textContent = inPausa ? '\u25B6' : '\u2016';
      btnPausa.setAttribute('aria-label', inPausa ? 'Riprendi le immagini' : 'Ferma le immagini');
      btnPausa.setAttribute('aria-pressed', inPausa ? 'true' : 'false');
      if (inPausa) stop(); else parti();
    });
  }

  hero.querySelector('[data-prev]').addEventListener('click', function () { indietro(); riparti(); });
  hero.querySelector('[data-next]').addEventListener('click', function () { avanti(); riparti(); });
  dots.forEach(function (d, k) {
    d.addEventListener('click', function () { vaiA(k); riparti(); });
  });

  function riparti() { stop(); if (!inPausa) parti(); }

  /* Si ferma col mouse SOLO sopra la fotografia, non sul testo sotto:
     quello e' un blocco da leggere, non un carosello da guardare.
     Sul telefono non succede nulla: non esiste il passaggio del cursore. */
  var vista = hero.querySelector('.hero-vista') || hero;
  var puntatoreFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (puntatoreFine.matches) {
    vista.addEventListener('mouseenter', function () { fermo = true; stop(); });
    vista.addEventListener('mouseleave', function () { fermo = false; parti(); });
  }
  hero.addEventListener('focusin', function () { fermo = true; stop(); });
  hero.addEventListener('focusout', function () {
    if (!hero.contains(document.activeElement)) { fermo = false; parti(); }
  });
  hero.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { indietro(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { avanti(); e.preventDefault(); }
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else parti();
  });
  if (lento.addEventListener) {
    lento.addEventListener('change', function () { lento.matches ? stop() : parti(); });
  }

  mostra(0);
  parti();

  /* ---------- il dito, sul telefono ----------
     I comandi — pausa e frecce — spariscono sotto i 760px: coprivano la
     fotografia proprio dove c'e' la scena. Al loro posto il dito, che e'
     come si scorre su un telefono, e i pallini per sapere quante sono. */
  (function () {
    var vista = document.querySelector('.hero-vista');
    if (!vista) return;
    var x0 = null, y0 = null, t0 = 0;
    vista.addEventListener('touchstart', function (e) {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = Date.now();
    }, { passive: true });
    vista.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      var dy = e.changedTouches[0].clientY - y0;
      /* solo un gesto orizzontale e deciso: scorrere la pagina non deve
         far cambiare fotografia per sbaglio */
      if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.6 && Date.now() - t0 < 700) {
        if (dx < 0) avanti(); else indietro();
        riparti();
      }
      x0 = y0 = null;
    }, { passive: true });
  })();

})();
