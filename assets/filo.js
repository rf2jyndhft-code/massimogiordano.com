/* IL FILO DEGLI ANNI — riscritto da capo il 22 novembre 2026.

   Massimo: «cancella il mappamondo e riscrivilo che facciamo prima».
   Aveva ragione: la versione precedente era nata semplice ed era
   cresciuta a rattoppi, uno per ogni cosa che non andava, finche' non
   si capiva piu' chi comandava cosa.

   Qui comanda una cosa sola: UN INDICE, l'anno che stai leggendo.
   Lo possono cambiare tre gesti — scorrere il racconto, girare la
   ghiera, cliccare un anno — e tutto il resto (il globo che si volta,
   i contatori, le liste, la fotografia di sfondo) e' una conseguenza.

   La ghiera e' un oggetto fisico: si prende dal bordo, si gira, si
   ferma agli estremi, si incastra quando lasci. Un dito la gira; due
   dita sono una pinza per ingrandire e restano al browser. */
(function () {
  'use strict';

  var dati = JSON.parse(document.getElementById('anni-dati').textContent);
  var ANNI = dati.anni, TERRE = dati.terre;
  var cv = document.getElementById('filo-quadrante');
  if (!cv || !ANNI.length) return;
  var cx = cv.getContext('2d');

  var RAD = Math.PI / 180, TAU = Math.PI * 2;
  var ARCO = 334 * RAD;              /* il quadrante non si chiude */

  /* ── dove sta ogni anno sulla ghiera ─────────────────────────────
     A distanza di tempo vera, non a passi uguali: fra il 1989 e il
     1997 ci sono due buchi, e si devono vedere. */
  var A0 = ANNI[0].anno, A1 = ANNI[ANNI.length - 1].anno;
  var POS = ANNI.map(function (a) {
    return -Math.PI / 2 + (a.anno - A0) / (A1 - A0) * ARCO;
  });
  var GIRO_MIN = -ARCO, GIRO_MAX = 0;   /* 2027 in cima … 1989 in cima */

  /* tutti i teatri, per i puntini spenti sul globo */
  var TUTTI = [], visti = {};
  ANNI.forEach(function (a) {
    a.teatri.forEach(function (t) { if (!visti[t.n]) { visti[t.n] = 1; TUTTI.push(t); } });
  });

  /* ── lo stato, tutto qui ─────────────────────────────────────── */
  var anno = -1;                     /* l'indice che comanda */
  var giro = 0, giroVuole = 0;       /* rotazione della ghiera */
  var lam = 0, phi = -18, lamVuole = 0, phiVuole = -18;   /* il globo */
  var acceso = [];                   /* i teatri dell'anno */
  var sopra = -1;                    /* l'anno sotto il mouse */
  var mano = { giu: false, dita: 0, ang: 0, corsa: 0 };

  /* ── il disegno ──────────────────────────────────────────────── */
  function misura() {
    var r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    cv.width = Math.round(r.width * d);
    cv.height = Math.round(r.height * d);
    cx.setTransform(d, 0, 0, d, 0, 0);
  }

  function raggi() {
    var w = cv.clientWidth, h = cv.clientHeight, S = Math.min(w, h);
    var corpo = S < 300 ? 6.5 : (S < 420 ? 7.5 : 9.5);
    cx.font = '400 ' + corpo + 'px "Archivo",system-ui,sans-serif';
    var margine = Math.ceil(cx.measureText('1992–95').width) + (S < 420 ? 14 : 22);
    return { w: w, h: h, S: S, corpo: corpo, margine: margine,
             cxx: w / 2, cyy: h / 2,
             Rq: S / 2 - 4, Rt: S / 2 - margine, Rg: S / 2 - margine - 14 };
  }

  function proietta(la, lo, R, cxx, cyy) {
    var p = la * RAD, l = (lo - lam) * RAD, p0 = phi * RAD;
    if (Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l) < 0) return null;
    return { x: cxx + R * Math.cos(p) * Math.sin(l),
             y: cyy - R * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)) };
  }

  function disegna() {
    var m = raggi();
    if (m.Rg < 24) return;                  /* tela troppo piccola */
    cx.clearRect(0, 0, m.w, m.h);

    /* il globo */
    cx.beginPath(); cx.arc(m.cxx, m.cyy, m.Rg, 0, TAU);
    cx.fillStyle = 'rgba(195,153,79,.05)'; cx.fill();
    cx.strokeStyle = 'rgba(195,153,79,.4)'; cx.lineWidth = 1; cx.stroke();

    cx.strokeStyle = 'rgba(241,238,232,.46)'; cx.lineWidth = .8;
    TERRE.forEach(function (poly) {
      var staccato = true; cx.beginPath();
      for (var k = 0; k < poly.length; k++) {
        var p = proietta(poly[k][1], poly[k][0], m.Rg, m.cxx, m.cyy);
        if (!p) { staccato = true; continue; }
        if (staccato) { cx.moveTo(p.x, p.y); staccato = false; } else cx.lineTo(p.x, p.y);
      }
      cx.stroke();
    });
    TUTTI.forEach(function (t) {
      var p = proietta(t.la, t.lo, m.Rg, m.cxx, m.cyy);
      if (!p) return;
      cx.beginPath(); cx.arc(p.x, p.y, 1.5, 0, TAU);
      cx.fillStyle = 'rgba(241,238,232,.5)'; cx.fill();
    });
    acceso.forEach(function (t) {
      var p = proietta(t.la, t.lo, m.Rg, m.cxx, m.cyy);
      if (!p) return;
      cx.beginPath(); cx.arc(p.x, p.y, 6.5, 0, TAU);
      cx.fillStyle = 'rgba(195,153,79,.18)'; cx.fill();
      cx.beginPath(); cx.arc(p.x, p.y, 3, 0, TAU);
      cx.fillStyle = '#c3994f'; cx.fill();
    });

    /* la ghiera */
    cx.save();
    cx.translate(m.cxx, m.cyy);
    cx.textBaseline = 'middle';
    for (var i = 0; i < ANNI.length; i++) {
      var ang = POS[i] + giro, qui = (i === anno), hov = (i === sopra);

      cx.save();
      cx.rotate(ang + Math.PI / 2);
      cx.beginPath();
      cx.moveTo(0, -m.Rt);
      cx.lineTo(0, -(m.Rt + (qui ? 10 : 4)));
      cx.strokeStyle = qui ? '#c3994f'
                    : (hov ? 'rgba(241,238,232,.75)' : 'rgba(241,238,232,.4)');
      cx.lineWidth = qui ? 1.8 : 1;
      cx.stroke();
      cx.restore();

      /* i numeri stanno di taglio, lungo il raggio: di piatto si
         accavallerebbero dove gli anni sono fitti */
      var giu = Math.sin(ang) > 0;
      cx.save();
      cx.rotate(ang + Math.PI / 2 + (giu ? Math.PI : 0));
      cx.fillStyle = qui ? '#c3994f'
                   : (hov ? 'rgba(241,238,232,.95)' : 'rgba(241,238,232,.62)');
      cx.font = (qui ? '500 ' + (m.corpo + 2.5) : '400 ' + m.corpo)
              + 'px "Archivo",system-ui,sans-serif';
      cx.textAlign = 'center';
      cx.fillText(ANNI[i].etichetta, 0, giu ? (m.Rq - 9) : -(m.Rq - 9));
      cx.restore();
    }
    cx.restore();
  }

  /* ── il movimento ────────────────────────────────────────────── */
  function passo() {
    if (!mano.giu) {
      var d = giroVuole - giro;
      giro = Math.abs(d) > .002 ? giro + d * .12 : giroVuole;
    }
    var dl = lamVuole - lam, dp = phiVuole - phi;
    while (dl > 180) dl -= 360;
    while (dl < -180) dl += 360;
    if (Math.abs(dl) > .05 || Math.abs(dp) > .05) { lam += dl * .07; phi += dp * .07; }
    else { lam = lamVuole; phi = phiVuole; }
    disegna();
    requestAnimationFrame(passo);
  }

  /* ── cambiare anno ───────────────────────────────────────────── */
  var contaR = document.getElementById('filo-conta-ruoli');
  var contaT = document.getElementById('filo-conta-teatri');
  var elTeatri = document.getElementById('filo-teatri');
  var elRuoli = document.getElementById('filo-ruoli');
  var boxDove = document.getElementById('filo-dove');
  var boxNuovi = document.getElementById('filo-nuovi');
  var sfondi = [].slice.call(document.querySelectorAll('.filo-sfondo img'));
  var blocchi = [].slice.call(document.querySelectorAll('.filo-anno'));
  var finestra = document.querySelector('.filo-racconti');

  function scorreDaSola() {
    return finestra && getComputedStyle(finestra).overflowY === 'auto';
  }

  function vai(i, nonGirare) {
    if (i < 0 || i >= ANNI.length || i === anno) return;
    anno = i;
    var a = ANNI[i];

    if (!nonGirare) giroVuole = sistema(-Math.PI / 2 - POS[i]);

    acceso = a.teatri;
    if (a.teatri.length) {
      var sx = 0, sy = 0, sz = 0;
      a.teatri.forEach(function (t) {
        var p = t.la * RAD, l = t.lo * RAD;
        sx += Math.cos(p) * Math.cos(l); sy += Math.cos(p) * Math.sin(l); sz += Math.sin(p);
      });
      lamVuole = Math.atan2(sy, sx) / RAD;
      phiVuole = Math.atan2(sz, Math.sqrt(sx * sx + sy * sy)) / RAD * .8;
    }

    var ruoli = {}, teatri = {};
    for (var k = 0; k <= i; k++) {
      ANNI[k].ruoli.forEach(function (r) { ruoli[r.r] = 1; });
      ANNI[k].teatri.forEach(function (t) { teatri[t.n] = 1; });
    }
    if (contaR) contaR.textContent = Object.keys(ruoli).length;
    if (contaT) contaT.textContent = Object.keys(teatri).length;

    if (elTeatri) elTeatri.innerHTML = a.teatri.map(function (t) {
      return '<li><b>' + t.n + '</b><span>' + t.c + '</span></li>'; }).join('');
    if (elRuoli) elRuoli.innerHTML = a.ruoli.map(function (r) {
      return '<li><b>' + r.r + '</b><span>' + r.o + '</span></li>'; }).join('');
    if (boxDove) boxDove.hidden = !a.teatri.length;
    if (boxNuovi) boxNuovi.hidden = !a.ruoli.length;

    sfondi.forEach(function (im, k) { im.classList.toggle('visto', k === i); });
  }

  function sistema(g) { return Math.max(GIRO_MIN, Math.min(GIRO_MAX, g)); }

  function inCima() {
    var meglio = 1e9, vinto = 0;
    for (var k = 0; k < POS.length; k++) {
      var d = Math.abs(POS[k] + giro + Math.PI / 2);
      if (d < meglio) { meglio = d; vinto = k; }
    }
    return vinto;
  }

  /* porta il racconto sull'anno, senza muovere la pagina sotto il dito */
  function mostra(i, dolce) {
    if (!blocchi[i]) return;
    if (scorreDaSola()) {
      finestra.scrollTo({
        top: blocchi[i].offsetTop - finestra.clientHeight / 2 + blocchi[i].offsetHeight / 2,
        behavior: dolce ? 'smooth' : 'auto'
      });
    } else if (dolce) {
      blocchi[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* ── la ghiera si gira ───────────────────────────────────────── */
  function polare(ev) {
    var r = cv.getBoundingClientRect();
    var x = ev.clientX - r.left - r.width / 2;
    var y = ev.clientY - r.top - r.height / 2;
    return { ang: Math.atan2(y, x), d: Math.sqrt(x * x + y * y),
             S: Math.min(r.width, r.height) };
  }
  function sullAnello(ev) {
    var p = polare(ev);
    return p.d > p.S * .24 && p.d < p.S / 2 + 10;
  }

  cv.addEventListener('pointerdown', function (ev) {
    mano.dita++;
    if (mano.dita > 1) { mano.giu = false; return; }   /* due dita: e' uno zoom */
    if (!sullAnello(ev)) return;
    mano.giu = true; mano.corsa = 0; mano.ang = polare(ev).ang;
    try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
    ev.preventDefault();
  });

  cv.addEventListener('pointermove', function (ev) {
    if (!mano.giu) { sopra = quale(ev); cv.style.cursor = sopra >= 0 ? 'pointer' : 'grab'; return; }
    var a = polare(ev).ang, d = a - mano.ang;
    while (d > Math.PI) d -= TAU;
    while (d < -Math.PI) d += TAU;
    mano.ang = a; mano.corsa += Math.abs(d);
    giro = sistema(giro + d * .3);       /* piano: il polso non deve fare vent'anni */
    giroVuole = giro;
    var i = inCima();
    if (i !== anno) { vai(i, true); mostra(i, false); }
    ev.preventDefault();
  });

  function molla(ev) {
    mano.dita = Math.max(0, mano.dita - 1);
    if (!mano.giu) return;
    mano.giu = false;
    try { cv.releasePointerCapture(ev.pointerId); } catch (e) {}
    if (anno >= 0) {
      giroVuole = sistema(-Math.PI / 2 - POS[anno]);   /* si incastra */
      if (!scorreDaSola()) mostra(anno, true);
    }
  }
  cv.addEventListener('pointerup', molla);
  cv.addEventListener('pointercancel', molla);
  cv.addEventListener('pointerleave', function () { if (!mano.giu) sopra = -1; });

  /* ── un anno si puo' anche cliccare ──────────────────────────── */
  function quale(ev) {
    var p = polare(ev);
    if (p.d < p.S / 2 - 46 || p.d > p.S / 2 + 10) return -1;
    var ang = p.ang - giro, meglio = 1e9, vinto = -1;
    for (var k = 0; k < POS.length; k++) {
      var d = Math.abs(((POS[k] - ang + Math.PI) % TAU + TAU) % TAU - Math.PI);
      if (d < meglio) { meglio = d; vinto = k; }
    }
    return meglio < 5 * RAD ? vinto : -1;
  }
  cv.addEventListener('click', function (ev) {
    if (mano.corsa > .05) { mano.corsa = 0; return; }   /* era un giro */
    var i = quale(ev);
    if (i >= 0) { vai(i); mostra(i, true); }
  });

  /* ── scorrendo il racconto cambia l'anno ─────────────────────── */
  blocchi.forEach(function (b, i) {
    new IntersectionObserver(function (voci) {
      if (mano.giu) return;              /* mentre si gira comanda la ghiera */
      voci.forEach(function (v) { if (v.isIntersecting) vai(i); });
    }, { root: scorreDaSola() ? finestra : null,
         rootMargin: '-45% 0px -45% 0px', threshold: 0 }).observe(b);
  });

  window.addEventListener('resize', function () { misura(); disegna(); });
  misura(); vai(0); passo();
})();
