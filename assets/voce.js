/* IL LETTORE DELLA HOME — uno solo, tre brani.
 *
 * Massimo: «ne voglio uno super cool e professionale». Tre cerchi
 * uguali in fila erano ripetitivi; qui c'e' un lettore unico con la
 * scaletta sotto. Si sceglie un brano e quello entra nel lettore,
 * con la scena della sua opera che compare dietro.
 *
 * Le barre non sono un'animazione finta: leggono davvero l'uscita
 * audio, come il lettore in apertura di pagina.
 */
(function () {
  'use strict';
  var L = document.querySelector('.lettore');
  if (!L) return;

  var via      = L.querySelector('.lt-via'),
      cerchio  = L.querySelector('.lt-via .cerchio'),
      titolo   = L.querySelector('.lt-ora-t'),
      meta     = L.querySelector('.lt-ora-m'),
      passato  = L.querySelector('.lt-passato'),
      tutto    = L.querySelector('.lt-tutto'),
      tela     = L.querySelector('.lt-onda'),
      riga     = L.querySelector('.lt-riga'),
      fatta    = L.querySelector('.lt-fatta'),
      sfondo   = L.querySelector('.lt-sfondo img'),
      brani    = [].slice.call(L.querySelectorAll('.lt-br'));

  var suono = new Audio(), scelto = -1, gira = null, ultimo = 0;
  suono.preload = 'none';

  /* ── le barre, come in apertura ─────────────────────────────── */
  /* Gli stessi identici numeri dell'apertura: 56 barre. */
  var BANDE = 56;
  var oro = getComputedStyle(document.documentElement)
              .getPropertyValue('--oro').trim() || '#c3994f';
  var ctxA = null, an = null, dati = null, bordi = null;
  var livelli = new Float32Array(BANDE), picchi = new Float32Array(BANDE),
      caduta  = new Float32Array(BANDE);

  function rifaiBordi() {
    if (!an || !ctxA) return;
    var n = an.frequencyBinCount, sr = ctxA.sampleRate, f0 = 50, f1 = Math.min(14000, sr / 2);
    bordi = [];
    for (var i = 0; i <= BANDE; i++) {
      var f = f0 * Math.pow(f1 / f0, i / BANDE);
      bordi.push(Math.max(0, Math.min(n - 1, Math.round(f / (sr / 2) * n))));
    }
  }

  function prepara() {
    if (ctxA) { if (ctxA.state === 'suspended') ctxA.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctxA = new AC();
    an = ctxA.createAnalyser();
    an.fftSize = 2048;
    an.smoothingTimeConstant = 0.72;
    dati = new Float32Array(an.frequencyBinCount);
    rifaiBordi();
    try { ctxA.createMediaElementSource(suono).connect(an); } catch (e) {}
    an.connect(ctxA.destination);
  }

  function misura() {
    var r = tela.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
    tela.width = Math.max(1, Math.round(r.width * d));
    tela.height = Math.max(1, Math.round(r.height * d));
  }
  misura();
  addEventListener('resize', misura);

  function disegna(t) {
    gira = requestAnimationFrame(disegna);
    var dt = ultimo ? Math.min(.1, (t - ultimo) / 1000) : .016;
    ultimo = t;
    var x = tela.getContext('2d'), W = tela.width, A = tela.height, base = A - 2;
    x.clearRect(0, 0, W, A);
    var canta = !suono.paused && an && bordi;
    if (canta) {
      an.getFloatFrequencyData(dati);
      var MIN = an.minDecibels, MAX = an.maxDecibels;
      for (var b = 0; b < BANDE; b++) {
        var da = bordi[b], a = Math.max(bordi[b + 1], da + 1), somma = 0, n = 0;
        for (var k = da; k < a; k++) { var d = dati[k]; if (d > -Infinity) { somma += d; n++; } }
        var v = Math.max(0, Math.min(1, ((n ? somma / n : MIN) - MIN) / (MAX - MIN)));
        v = Math.pow(v, .78);
        livelli[b] = v > livelli[b] ? v : Math.max(v, livelli[b] - dt * 1.9);
        if (livelli[b] >= picchi[b]) { picchi[b] = livelli[b]; caduta[b] = -0.55; }
        else { caduta[b] += dt * 2.3;
               picchi[b] = Math.max(livelli[b], picchi[b] - Math.max(0, caduta[b]) * dt * 2.4); }
      }
    } else {
      for (var z = 0; z < BANDE; z++) {
        livelli[z] = Math.max(0, livelli[z] - dt * 2.6);
        picchi[z] = Math.max(livelli[z], picchi[z] - dt * 2.0);
      }
    }
    /* Copiato dall'apertura, riga per riga: la sfumatura sta DENTRO ogni
       barra — scura alla base, oro in mezzo, avorio in punta — e il picco
       e' avorio, non oro. Era quella la differenza che si vedeva. */
    var largo = W / BANDE, w = Math.max(1.5, largo * .62);
    for (var i = 0; i < BANDE; i++) {
      var h = livelli[i] * base, px = i * largo + (largo - w) / 2;
      if (h > .5) {
        var g = x.createLinearGradient(0, base, 0, base - h);
        g.addColorStop(0, 'rgba(185,146,74,.35)');
        g.addColorStop(.55, oro);
        g.addColorStop(1, '#f1e4c8');
        x.fillStyle = g;
        x.fillRect(px, base - h, w, h);
      }
      var hp = picchi[i] * base;
      if (hp > 1.5) {
        x.fillStyle = 'rgba(241,228,200,.9)';
        x.fillRect(px, base - hp - 1.5, w, 1.5);
      }
    }
  }

  /* ── il tempo ───────────────────────────────────────────────── */
  function mmss(s) {
    if (!isFinite(s)) return '0:00';
    var m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  /* ── scegliere un brano ─────────────────────────────────────── */
  function scegli(i, parti) {
    if (i === scelto) { if (parti) avvia(); return; }
    var b = brani[i]; if (!b) return;
    scelto = i;
    brani.forEach(function (x) { x.classList.toggle('attivo', x === b); });
    titolo.innerHTML = b.dataset.tit;
    meta.innerHTML = b.dataset.meta;
    sfondo.src = b.dataset.foto;
    /* ogni scena ha il suo punto di messa a fuoco: con un taglio solo,
       sul telefono del Don Carlo restava il muro e lui finiva fuori. */
    if (b.dataset.pos) sfondo.style.objectPosition = b.dataset.pos;
    tutto.textContent = b.querySelector('.lt-d').textContent;
    passato.textContent = '0:00';
    fatta.style.width = '0%';
    suono.src = b.dataset.audio;
    if (parti) avvia();
  }

  function avvia() {
    prepara();
    suono.play().catch(function () {});
  }

  via.addEventListener('click', function () {
    if (scelto < 0) scegli(0, true);
    else if (suono.paused) avvia();
    else suono.pause();
  });

  brani.forEach(function (b, i) {
    b.addEventListener('click', function () { scegli(i, true); });
  });

  suono.addEventListener('play', function () {
    L.classList.add('in-ascolto'); cerchio.classList.add('pausa');
    if (!gira) gira = requestAnimationFrame(disegna);
  });
  suono.addEventListener('pause', function () {
    L.classList.remove('in-ascolto'); cerchio.classList.remove('pausa');
  });
  suono.addEventListener('ended', function () {
    /* finito un brano, parte il successivo: e' una scaletta, non tre file sparsi */
    if (scelto < brani.length - 1) scegli(scelto + 1, true);
    else { L.classList.remove('in-ascolto'); cerchio.classList.remove('pausa'); fatta.style.width = '0%'; }
  });
  suono.addEventListener('timeupdate', function () {
    if (!suono.duration) return;
    passato.textContent = mmss(suono.currentTime);
    fatta.style.width = (suono.currentTime / suono.duration * 100) + '%';
  });
  suono.addEventListener('loadedmetadata', function () {
    if (isFinite(suono.duration)) tutto.textContent = mmss(suono.duration);
  });

  /* spostarsi dentro il brano */
  function vaiA(ev) {
    if (!suono.duration) return;
    var r = riga.getBoundingClientRect();
    var p = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
    suono.currentTime = p * suono.duration;
  }
  riga.addEventListener('click', vaiA);
  riga.addEventListener('keydown', function (e) {
    if (!suono.duration) return;
    if (e.key === 'ArrowRight') { suono.currentTime = Math.min(suono.duration, suono.currentTime + 5); e.preventDefault(); }
    if (e.key === 'ArrowLeft')  { suono.currentTime = Math.max(0, suono.currentTime - 5); e.preventDefault(); }
  });

  scegli(0, false);
  gira = requestAnimationFrame(disegna);
})();
