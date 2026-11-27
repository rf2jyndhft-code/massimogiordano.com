/* IL FILO DEGLI ANNI — la biografia che si disegna mentre si legge.

   Gli anni non sono un elenco: sono il quadrante di un orologio, e il
   mappamondo sta dentro. Scorrendo il quadrante gira e porta in alto
   l'anno che stai leggendo; dentro, il globo si volta sui teatri di
   quell'anno e i numeri crescono.

   Tutto da anni.json, costruito leggendo repertorio, galleria e
   cronologia del sito: niente scritto a mano. */
(function () {
  'use strict';
  var dati = JSON.parse(document.getElementById('anni-dati').textContent);
  var ANNI = dati.anni, TERRE = dati.terre;
  var cv = document.getElementById('filo-quadrante');
  if (!cv) return;
  var cx = cv.getContext('2d');
  var RAD = Math.PI / 180, TAU = Math.PI * 2;

  var TUTTI = [];
  ANNI.forEach(function (a) {
    a.teatri.forEach(function (t) {
      if (!TUTTI.some(function (x) { return x.n === t.n; })) TUTTI.push(t);
    });
  });

  /* Gli anni non sono a distanza uguale: fra il 1989 e il 1997 ci sono
     due buchi veri. Sulla ghiera stanno alla loro distanza di tempo,
     cosi' il quadrante racconta anche i silenzi. Un varco in fondo
     separa l'ultimo anno dal primo: e' una linea, non un anello.
     (Massimo: «gli anni dovrebbero essere meglio assortiti») */
  var ARCO = 334 * RAD;
  var minA = 1e9, maxA = -1e9;
  ANNI.forEach(function (a) { if (a.anno < minA) minA = a.anno; if (a.anno > maxA) maxA = a.anno; });
  var POS = ANNI.map(function (a) {
    return -Math.PI / 2 + (a.anno - minA) / (maxA - minA) * ARCO;
  });
  var giroVuole = 0, giro = 0;          /* rotazione del quadrante */
  var lam = 0, phi = -18, lamVuole = 0, phiVuole = -18;
  var attivo = -1, acceso = [];
  var sopra = -1;                        /* anno sotto il mouse */

  function dim() {
    var r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d);
    cx.setTransform(d, 0, 0, d, 0, 0);
  }

  function proietta(la, lo, R, cxx, cyy) {
    /* la seconda rete: se entra un dato che non e' un numero, qui si
       ferma e sparisce un punto solo, non tutto il disegno. */
    if (!isFinite(la) || !isFinite(lo) || !isFinite(lam) || !isFinite(phi)) return null;
    var p = la * RAD, l = (lo - lam) * RAD, p0 = phi * RAD;
    if (Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l) < 0) return null;
    return { x: cxx + R * Math.cos(p) * Math.sin(l),
             y: cyy - R * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)) };
  }

  function disegna() {
    var w = cv.clientWidth, h = cv.clientHeight;
    var S = Math.min(w, h), cxx = w / 2, cyy = h / 2;

    /* Il margine per i numeri si MISURA, non si indovina: l'etichetta
       piu' lunga e' «1992-95» e su una colonna stretta, con un margine
       fisso, finiva mezza fuori dallo schermo. */
    /* Su un quadrante piccolo i numeri si accavallano: il carattere
       scende e, se lo spazio per ciascuno resta sotto i dodici punti,
       si scrive solo un anno ogni cinque. Le tacche restano tutte. */
    var corpo = S < 300 ? 6.5 : (S < 420 ? 7.5 : 9.5);
    cx.font = '400 ' + corpo + 'px "Archivo",system-ui,sans-serif';
    var margine = Math.ceil(cx.measureText('1992\u201395').width) + (S < 420 ? 14 : 22);
    /* Se la tela e' piu' stretta del doppio del margine, i raggi
       vengono negativi e il disegno va in errore a ogni fotogramma.
       Succedeva su una finestra piccola, dove il controllo apre le
       pagine: 'The radius provided (-4) is negative'. */
    if (S < margine * 2 + 70) return;
    var Rt = S / 2 - margine;        /* dove finiscono le tacche */
    var Rg = Rt - 14;                /* il globo, dentro */
    var Rq = S / 2 - 4;              /* il bordo esterno del quadrante */
    cx.clearRect(0, 0, w, h);

    /* ── il globo, dentro il quadrante ──────────────────────────── */
    /* La sfera ha un suo vetro scuro: i continenti si leggono anche
       quando dietro c'e' la fotografia dell'anno, e la fotografia
       resta accesa tutt'intorno invece di essere spenta su mezza
       pagina. (Massimo, 24 novembre 2026: «il globo cade sul viso»,
       poi «ma non si vede piu' la fotografia».) */
    var vetro = cx.createRadialGradient(cxx, cyy, 0, cxx, cyy, Rg);
    vetro.addColorStop(0,   'rgba(14,12,9,.80)');
    vetro.addColorStop(.72, 'rgba(14,12,9,.72)');
    vetro.addColorStop(1,   'rgba(14,12,9,.40)');
    cx.beginPath(); cx.arc(cxx, cyy, Rg, 0, TAU);
    cx.fillStyle = vetro; cx.fill();

    cx.beginPath(); cx.arc(cxx, cyy, Rg, 0, TAU);
    cx.strokeStyle = 'rgba(195,153,79,.4)'; cx.lineWidth = 1; cx.stroke();

    cx.save();
    cx.shadowColor = 'rgba(10,8,6,.85)'; cx.shadowBlur = 5;
    cx.strokeStyle = 'rgba(241,238,232,.46)'; cx.lineWidth = .8;
    TERRE.forEach(function (poly) {
      var giu = true; cx.beginPath();
      for (var k = 0; k < poly.length; k++) {
        var p = proietta(poly[k][1], poly[k][0], Rg, cxx, cyy);
        if (!p) { giu = true; continue; }
        if (giu) { cx.moveTo(p.x, p.y); giu = false; } else cx.lineTo(p.x, p.y);
      }
      cx.stroke();
    });
    cx.restore();
    TUTTI.forEach(function (t) {
      var p = proietta(t.la, t.lo, Rg, cxx, cyy);
      if (!p) return;
      cx.beginPath(); cx.arc(p.x, p.y, 1.5, 0, TAU);
      cx.fillStyle = 'rgba(241,238,232,.5)'; cx.fill();
    });
    acceso.forEach(function (t) {
      var p = proietta(t.la, t.lo, Rg, cxx, cyy);
      if (!p) return;
      cx.beginPath(); cx.arc(p.x, p.y, 6.5, 0, TAU);
      cx.fillStyle = 'rgba(195,153,79,.18)'; cx.fill();
      cx.beginPath(); cx.arc(p.x, p.y, 3, 0, TAU);
      cx.fillStyle = '#c3994f'; cx.fill();
    });

    /* ── il quadrante ───────────────────────────────────────────── */
    /* Gli anni stanno DI TAGLIO, lungo il raggio, non di piatto lungo
       il cerchio. Di piatto un «1992-95» e' largo 45 punti e dove gli
       anni sono fitti - nove gradi l'uno dall'altro - diventavano una
       matassa. Di taglio occupano solo la loro altezza, dieci punti, e
       ci stanno tutti e trentatre'. (Massimo: «ora un casino con gli
       anni», «e comunque inserisci ogni anno») */
    cx.save();
    cx.translate(cxx, cyy);
    cx.textBaseline = 'middle';
    /* Gli anni e le tacche stanno sopra la fotografia dell'anno, che
       ora e' accesa: senza un'ombra sotto, sul controluce della
       finestra sparivano. L'ombra sta sul segno, non sulla foto.
       (Massimo, 24 novembre 2026: «scura e non ancora centrata») */
    cx.shadowColor = 'rgba(10,8,6,.95)';
    cx.shadowBlur = 7;
    for (var i = 0; i < ANNI.length; i++) {
      var ang = POS[i] + giro;
      var qui = (i === attivo), hov = (i === sopra);

      cx.save();
      cx.rotate(ang + Math.PI / 2);
      cx.beginPath();
      cx.moveTo(0, -Rt);
      cx.lineTo(0, -(Rt + (qui ? 10 : 4)));
      cx.strokeStyle = qui ? '#c3994f' : (hov ? 'rgba(241,238,232,.6)' : 'rgba(241,238,232,.2)');
      cx.lineWidth = qui ? 1.8 : 1;
      cx.stroke();
      cx.restore();

      /* Tutti e trentanove gli anni, sempre: diradarli faceva sparire
         il senso della ghiera. (Massimo: «lascia lo stesso globo con
         le date e gli anni che aveva prima») Se stanno stretti, a
         stringersi e' il carattere, non il numero di anni. */
      cx.save();
      cx.rotate(ang);
      cx.fillStyle = qui ? '#c3994f' : (hov ? 'rgba(241,238,232,.95)' : 'rgba(241,238,232,.62)');
      cx.font = (qui ? '500 ' + (corpo + 2.5) + 'px ' : '400 ' + corpo + 'px ')
              + '"Archivo",system-ui,sans-serif';
      if (Math.cos(ang) < 0) {           /* meta' sinistra: si ribalta */
        cx.rotate(Math.PI);
        cx.textAlign = 'right';
        cx.fillText(ANNI[i].etichetta, -(Rt + 10), 0);
      } else {
        cx.textAlign = 'left';
        cx.fillText(ANNI[i].etichetta, Rt + 10, 0);
      }
      cx.restore();
    }
    cx.restore();
  }

  function muovi() {
    if (trascino) { disegna(); requestAnimationFrame(muovi); return; }
    var dg = giroVuole - giro;
    while (dg > Math.PI) dg -= TAU; while (dg < -Math.PI) dg += TAU;
    giro += Math.abs(dg) > .002 ? dg * .09 : dg;
    var dl = lamVuole - lam, dp = phiVuole - phi;
    while (dl > 180) dl -= 360; while (dl < -180) dl += 360;
    if (Math.abs(dl) > .05 || Math.abs(dp) > .05) { lam += dl * .07; phi += dp * .07; }
    else { lam = lamVuole; phi = phiVuole; }
    disegna();
    requestAnimationFrame(muovi);
  }

  var contaR = document.getElementById('filo-conta-ruoli');
  var contaT = document.getElementById('filo-conta-teatri');
  var elTeatri = document.getElementById('filo-teatri');
  var elRuoli = document.getElementById('filo-ruoli');
  var sfondi = [].slice.call(document.querySelectorAll('.filo-sfondo img'));

  function vai(i, tenendoFermaLaGhiera) {
    if (i === attivo || !ANNI[i]) return;
    attivo = i;
    var a = ANNI[i];
    if (!tenendoFermaLaGhiera) giroVuole = -Math.PI / 2 - POS[i];
    acceso = a.teatri;
    /* UN TEATRO SENZA COORDINATE NON DEVE SPEGNERE IL MAPPAMONDO.
       Il 26 novembre 2026, rigenerando i dati, dieci teatri hanno perso
       latitudine e longitudine. In JS «undefined * RAD» non e' zero: e'
       NaN. Bastava arrivare al 2000 — il Teatro dell'Opera di Roma — e
       l'inclinazione della sfera diventava NaN PER SEMPRE: coste e punti
       sparivano anche tornando indietro, mentre gli anni e l'anello
       continuavano perche' non dipendono da li'. Sembrava un difetto di
       Safari e non lo era. (Massimo: «sul telefono la cartina del
       mappamondo non si visualizza».)
       I dati sono stati rimessi a posto, ma il codice non deve piu'
       poter morire per un dato mancante: qui si contano solo i teatri
       con coordinate vere, e se non ce n'e' nessuno la sfera resta dove
       sta invece di impazzire. */
    var buoni = a.teatri.filter(function (t) {
      return isFinite(t.la) && isFinite(t.lo);
    });
    if (buoni.length) {
      var sx = 0, sy = 0, sz = 0;
      buoni.forEach(function (t) {
        var p = t.la * RAD, l = t.lo * RAD;
        sx += Math.cos(p) * Math.cos(l); sy += Math.cos(p) * Math.sin(l); sz += Math.sin(p);
      });
      var nl = Math.atan2(sy, sx) / RAD;
      var np = Math.atan2(sz, Math.sqrt(sx * sx + sy * sy)) / RAD * .8;
      if (isFinite(nl) && isFinite(np)) { lamVuole = nl; phiVuole = np; }
    }
    var ruoli = {}, teatri = {};
    for (var k = 0; k <= i; k++) {
      ANNI[k].ruoli.forEach(function (r) { ruoli[r.r] = 1; });
      ANNI[k].teatri.forEach(function (t) { teatri[t.n] = 1; });
    }
    contaR.textContent = Object.keys(ruoli).length;
    contaT.textContent = Object.keys(teatri).length;
    elTeatri.innerHTML = a.teatri.map(function (t) {
      return '<li><b>' + t.n + '</b><span>' + t.c + '</span></li>'; }).join('');
    elRuoli.innerHTML = a.ruoli.map(function (r) {
      return '<li><b>' + r.r + '</b><span>' + r.o + '</span></li>'; }).join('');
    document.getElementById('filo-dove').hidden = !a.teatri.length;
    document.getElementById('filo-nuovi').hidden = !a.ruoli.length;
    sfondi.forEach(function (im, k) {
      var mio = k === i;
      /* la fotografia dell'anno si scarica solo quando serve: sono 39 da
         300 KB, caricarle tutte voleva dire dodici mega per una pagina sola. */
      if (mio && !im.src && im.dataset.src) im.src = im.dataset.src;
      im.classList.toggle('visto', mio);
    });
    /* E QUELLE DI PRIMA E DI DOPO SI PREPARANO INTANTO.
       Caricare solo l'anno che guardi significa che ogni volta che scorri
       aspetti 300 KB: la pagina sembrava lenta. Qui i due anni vicini si
       scaricano in sottofondo, a priorita' bassa, cosi' quando ci arrivi
       sono gia' pronti. Non si tocca la qualita' di una sola fotografia.
       (Massimo, 25 novembre 2026: «la biografia e' molto lenta»,
       «non toccare la qualita' mi raccomando») */
    [i - 1, i + 1].forEach(function (k) {
      var im = sfondi[k];
      if (!im || im.src || !im.dataset.src) return;
      var p = new Image();
      if ('fetchPriority' in p) p.fetchPriority = 'low';
      p.onload = function () { if (!im.src) im.src = im.dataset.src; };
      p.src = im.dataset.src;
    });
  }

  /* ── il quadrante si tocca ──────────────────────────────────────── */
  function quale(ev) {
    var r = cv.getBoundingClientRect();
    var x = ev.clientX - r.left - r.width / 2, y = ev.clientY - r.top - r.height / 2;
    var d = Math.sqrt(x * x + y * y), S = Math.min(r.width, r.height);
    if (d < S / 2 - 46 || d > S / 2 + 6) return -1;
    var ang = Math.atan2(y, x) - giro;
    var vicino = -1, meglio = 1e9;
    for (var k = 0; k < POS.length; k++) {
      var d2 = Math.abs(((POS[k] - ang + Math.PI) % TAU + TAU) % TAU - Math.PI);
      if (d2 < meglio) { meglio = d2; vicino = k; }
    }
    return meglio < 5 * RAD ? vicino : -1;
  }
  /* ── LA GHIERA SI GIRA COL DITO ─────────────────────────────────
     Massimo: «fai in modo che posso girare sul mappamondo per gli anni
     come una ghiera». Si prende dal bordo, dove stanno i numeri, e si
     gira: l'anno che arriva in cima diventa quello che leggi, e il
     racconto lo segue. Lasciando, si incastra sull'anno piu' vicino.
     Il centro resta libero: li' c'e' il mappamondo, che non si tocca. */
  var trascino = false, angPrec = 0, mosso = 0;

  /* Il centro si fissa quando prendi la ghiera, in coordinate di PAGINA.
     Prima si rileggeva a ogni movimento con getBoundingClientRect: se la
     pagina scorreva di un pixel il centro si spostava, l'angolo faceva un
     salto e la ghiera impazziva. Massimo, dall'iPhone: «impazzisce, resta
     ferma, si muove, si blocca». */
  var cxP = 0, cyP = 0;
  function fissaCentro() {
    var r = cv.getBoundingClientRect();
    cxP = r.left + window.pageXOffset + r.width / 2;
    cyP = r.top + window.pageYOffset + r.height / 2;
  }
  function angoloDi(ev) {
    return Math.atan2(ev.clientY + window.pageYOffset - cyP,
                      ev.clientX + window.pageXOffset - cxP);
  }
  function sullAnello(ev) {
    var r = cv.getBoundingClientRect();
    var x = ev.clientX - r.left - r.width / 2, y = ev.clientY - r.top - r.height / 2;
    var d = Math.sqrt(x * x + y * y), S = Math.min(r.width, r.height);
    return d > S * .26 && d < S / 2 + 8;
  }
  function annoInCima() {
    var meglio = 1e9, vinto = -1;
    for (var k = 0; k < POS.length; k++) {
      var d = Math.abs(((POS[k] + giro + Math.PI / 2 + Math.PI) % TAU + TAU) % TAU - Math.PI);
      if (d < meglio) { meglio = d; vinto = k; }
    }
    return vinto;
  }

  /* Al primo movimento si decide: in tondo e' un giro di ghiera, su e giu'
     e' la pagina che scorre. Finche' non si e' deciso non si tocca niente,
     cosi' lo scorrimento parte liscio senza strattoni.
     (Massimo: «se passo su quel blocco su e giu' ho bisogno di scorrere la
     pagina, non il testo che sta sotto») */
  var deciso = false, x0 = 0, y0 = 0;

  cv.addEventListener('pointerdown', function (e) {
    if (!sullAnello(e)) return;
    trascino = true; deciso = false; mosso = 0;
    x0 = e.clientX; y0 = e.clientY;
    fissaCentro(); angPrec = angoloDi(e);
  });
  window.addEventListener('pointermove', function (e) {
    if (!trascino) return;
    if (!deciso) {
      var dx = e.clientX - x0, dy = e.clientY - y0;
      var q = dx * dx + dy * dy;
      if (q < 100) return;                 /* dieci punti: ancora presto */
      if (Math.abs(dy) > Math.abs(dx) * 1.2) { trascino = false; return; }  /* scorre la pagina */
      deciso = true;
      if (cv.setPointerCapture) { try { cv.setPointerCapture(e.pointerId); } catch (x) {} }
      fissaCentro(); angPrec = angoloDi(e);
      return;
    }
    var a = angoloDi(e), d = a - angPrec;
    while (d > Math.PI) d -= TAU;
    while (d < -Math.PI) d += TAU;
    /* un terzo del giro del dito: era troppo veloce */
    giro += d * 0.70;
    /* IL QUADRANTE NON FA IL GIRO COMPLETO. Il 1989 e l'ultimo anno sono
       attaccati, divisi solo dal varco in fondo: girando all'indietro dal
       primo si finiva dritti sull'ultimo, un salto di trent'anni. Col
       mouse quasi non si notava, col dito era il difetto che Massimo
       vedeva sul telefono. Qui la ghiera si ferma agli estremi. */
    var g1 = -Math.PI / 2 - POS[0], g2 = -Math.PI / 2 - POS[POS.length - 1];
    var gMin = Math.min(g1, g2), gMax = Math.max(g1, g2);
    if (giro < gMin) giro = gMin;
    if (giro > gMax) giro = gMax;
    giroVuole = giro; angPrec = a; mosso += Math.abs(d);
    var i = annoInCima();
    if (i >= 0 && i !== attivo) {
      vai(i, true);
      /* Mentre giri, la pagina non si muove: scorrerla sotto il dito
         e' proprio quello che non deve succedere. Il racconto si
         allinea quando lasci. (Massimo: «se sono sul mappamondo non
         deve scrollare») */
    }
    e.preventDefault();
  });
  /* Il testo si accosta piano. Con lo scorrimento del browser arrivava
     di scatto e l'occhio non faceva in tempo a seguire l'anno.
     (Massimo: «rallenta il caricamento delle date, in caso vada su un
     anno non deve andare sul testo troppo velocemente») */
  function accosta(el, durataVoluta) {
    if (!el) return;
    var finestra = document.querySelector('.filo-racconti');
    var dentro = finestra && getComputedStyle(finestra).overflowY === 'auto';
    var chi = dentro ? finestra : (document.scrollingElement || document.documentElement);
    var da = dentro ? finestra.scrollTop : window.scrollY;
    var a = dentro
      ? el.offsetTop - finestra.clientHeight / 2 + el.offsetHeight / 2
      : window.scrollY + el.getBoundingClientRect().top
        - (window.innerHeight - el.offsetHeight) / 2;
    var salto = a - da;
    if (Math.abs(salto) < 2) return;
    /* La durata segue la distanza: un salto corto in fretta, uno lungo
       con calma. Sul telefono scorre tutta la pagina e i blocchi sono
       lontani, quindi una durata fissa arrivava di schianto.
       (Massimo: «fai in modo che come nel desktop il testo arrivi con
       morbidezza») */
    var durata = durataVoluta ||
      Math.max(420, Math.min(1100, 320 + Math.abs(salto) * 0.45));
    var inizio = 0;
    function morbido(t) { return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2; }
    function passo(ora) {
      if (!inizio) inizio = ora;
      var t = Math.min(1, (ora - inizio) / durata);
      var y = da + salto * morbido(t);
      if (dentro) chi.scrollTop = y; else window.scrollTo(0, y);
      if (t < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  function lascia() {
    if (!trascino) return;
    trascino = false;
    if (attivo >= 0) accosta(blocchi[attivo]);
    if (attivo >= 0) giroVuole = -Math.PI / 2 - POS[attivo];   /* si incastra */
  }
  /* Su iPhone il browser decide di scorrere PRIMA che arrivi pointermove:
     l'unico modo di fermarlo e' un ascoltatore touchmove non passivo. */
  cv.addEventListener('touchmove', function (e) {
    if (trascino && deciso) e.preventDefault();   /* solo se e' un giro */
  }, {passive: false});

  window.addEventListener('pointerup', lascia);
  window.addEventListener('pointercancel', lascia);

  cv.addEventListener('mousemove', function (e) {
    var i = quale(e); sopra = i;
    cv.style.cursor = i >= 0 ? 'pointer' : 'default';
  });
  cv.addEventListener('mouseleave', function () { sopra = -1; });
  cv.addEventListener('click', function (e) {
    if (mosso > .05) { mosso = 0; return; }   /* era un giro, non un clic */
    var i = quale(e);
    if (i < 0) return;
    /* Massimo: «quando clicco su un anno deve andarci immediatamente, non
       aspettare 3 secondi». Prima il clic faceva solo scorrere, e il
       mappamondo e i testi cambiavano dopo, quando lo scorrimento
       arrivava: vai() li accende subito, e la corsa dura 420 invece di
       1100 (quella lenta resta per quando lasci la ghiera). */
    vai(i);
    accosta(blocchi[i]);
  });

  var finestra = document.querySelector('.filo-racconti');
  var dentro = finestra && getComputedStyle(finestra).overflowY === 'auto' ? finestra : null;
  var blocchi = [].slice.call(document.querySelectorAll('.filo-anno'));
  new IntersectionObserver(function (voci) {
    voci.forEach(function (v) { if (v.isIntersecting) vai(blocchi.indexOf(v.target)); });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 }).observe
    ? blocchi.forEach(function (b, i) {
        new IntersectionObserver(function (voci) {
          voci.forEach(function (v) { if (v.isIntersecting) vai(i); });
        }, { root: dentro, rootMargin: '-45% 0px -45% 0px', threshold: 0 }).observe(b);
      })
    : null;

  window.addEventListener('resize', function () { dim(); disegna(); });
  dim(); vai(0); muovi();
})();

/* ══════════════════════════════════════════════════════════════════
   LA ROTELLA DENTRO LA SEZIONE MUOVE GLI ANNI, NON LA PAGINA
   Da quando il globo apre la biografia, la sezione e' la prima cosa
   della pagina e la pagina e' alta una schermata sola: un solo scatto
   di rotella portava via apertura, globo e tutti e trentanove gli
   anni, e si finiva sul piede. Ora la rotella scorre la finestra
   degli anni finche' ce n'e'; quando finisce, la pagina riprende.
   Solo da 1000 punti in su: sul telefono la finestra non esiste e il
   dito deve restare libero di scorrere la pagina.
   (Massimo, 24 novembre 2026: «di nuovo lo sfondo si muove con tutto
   il resto»)
   ══════════════════════════════════════════════════════════════════ */
(function () {
  var sez = document.querySelector('.filo');
  var lista = document.querySelector('.filo-racconti');
  if (!sez || !lista) return;
  sez.addEventListener('wheel', function (e) {
    if (getComputedStyle(lista).overflowY !== 'auto') return;   /* telefono */
    if (lista.contains(e.target)) return;                       /* ci pensa lei */
    var prima = lista.scrollTop;
    lista.scrollTop = prima + e.deltaY;
    if (lista.scrollTop !== prima) e.preventDefault();
  }, { passive: false });
})();
