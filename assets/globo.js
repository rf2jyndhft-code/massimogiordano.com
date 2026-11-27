(function () {
  'use strict';

  /* Le parole, nelle due lingue del sito. */
  var IT = (document.documentElement.lang || 'it').slice(0, 2) === 'it';
  var P = IT ? {
    tutti:'Tutti i teatri', unRuolo:'Ruolo cantato qui', ruoli:' ruoli cantati qui',
    inScena:'In scena', nessuna:'Fotografie non ancora scelte per questo teatro.',
    nessunaRuolo:'Nessuna fotografia di questo ruolo, per ora. ', vediTutte:'Vedi tutte',
    tutte:'tutte', una:' fotografia', molte:' fotografie',
    credito:'Fotografie: ', haUna:' fotografia ha', hannoMolte:' fotografie hanno',
    daCartella:' l\u2019attribuzione presa dal nome della cartella, non dal file: da confermare.',
    daConfermare:'attribuzione da confermare', diCui:' di ', stessaCitta:'Anche qui, nella stessa citt\u00e0',
    archivio:'Le recite nell\u2019archivio del teatro \u2192',
    apriTutte:'Vedi tutte le ', chiudiTutte:'Mostrane meno'
  } : {
    tutti:'All the theatres', unRuolo:'Role sung here', ruoli:' roles sung here',
    inScena:'On stage', nessuna:'Photographs not yet chosen for this theatre.',
    nessunaRuolo:'No photograph of this role yet. ', vediTutte:'See all',
    tutte:'all', una:' photograph', molte:' photographs',
    credito:'Photographs: ', haUna:' photograph has', hannoMolte:' photographs have',
    daCartella:' its attribution taken from the folder name, not from the file: to be confirmed.',
    daConfermare:'attribution to be confirmed', diCui:' of ', stessaCitta:'Also here, in the same city',
    archivio:'The performances in the theatre\u2019s own archive \u2192'
  };
  var D = JSON.parse(document.getElementById('dati').textContent);
  var T = D.teatri, TERRE = D.terre;
  var cv = document.getElementById('tela'), cx = cv.getContext('2d');
  var scheda = document.getElementById('scheda'), chips = document.getElementById('chips');
  var sugg = document.getElementById('sugg');
  var RAD = Math.PI / 180;

  /* --------------------------------------------------- stato */
  var lam = 10, phi = 20;        // centro del globo, in gradi
  var gira = true, scelto = -1, toccato = false;
  /* Il globo gira da solo e si ferma solo quando qualcuno ci passa sopra:
     appena il mouse se ne va, riprende. Prima il giro era legato a 'scelto',
     e siccome all'avvio apriamo la scheda del primo teatro per non lasciare
     la colonna vuota, non partiva mai. Le due cose ora sono separate. */
  var sopra = false;
  var anim = null;
  var L = 900, R = 0, ox = 0, oy = 0, dpr = 1;
  var zoom = 1, mira = 1, ZMIN = 1, ZMAX = 4.5;

  function misura() {
    var w = cv.parentNode.clientWidth;
    L = Math.max(280, Math.min(w, 620));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.style.width = L + 'px'; cv.style.height = L + 'px';
    cv.width = Math.round(L * dpr); cv.height = Math.round(L * dpr);
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ox = L / 2; oy = L / 2; raggio();
  }
  function raggio() { R = L * 0.44 * zoom; }
  function ingrandisci(k, subito) {
    var z = Math.max(ZMIN, Math.min(ZMAX, mira * k));
    if (Math.abs(z - mira) < 1e-4) return;
    mira = z;
    if (subito) { zoom = z; raggio(); }   /* il pizzico segue le dita, senza ritardo */
    sugg.classList.add('via');
  }

  /* ------------------------------------- proiezione ortografica */
  var cl, sl, cp, sp;
  function prepara() {
    cl = Math.cos(lam * RAD); sl = Math.sin(lam * RAD);
    cp = Math.cos(phi * RAD); sp = Math.sin(phi * RAD);
  }
  /* (lon,lat) -> vettore ruotato: x verso chi guarda, y a destra, z in alto */
  function vet(lo, la) {
    var clo = Math.cos(lo * RAD), slo = Math.sin(lo * RAD);
    var cla = Math.cos(la * RAD), sla = Math.sin(la * RAD);
    var X = cla * clo, Y = cla * slo, Z = sla;
    var X1 = X * cl + Y * sl, Y1 = -X * sl + Y * cl, Z1 = Z;
    return [X1 * cp + Z1 * sp, Y1, -X1 * sp + Z1 * cp];
  }
  function sx(v) { return ox + R * v[1]; }
  function sy(v) { return oy - R * v[2]; }
  /* punto esatto sull'orizzonte fra due vettori, uno visibile e uno no */
  function limite(a, b) {
    var t = a[0] / (a[0] - b[0]);
    var v = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    var n = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / n, v[1] / n, v[2] / n];
  }

  /* --------------------------------------------------- disegno */
  function oceano() {
    var g = cx.createRadialGradient(ox - R * .34, oy - R * .4, R * .08, ox, oy, R);
    g.addColorStop(0, '#20201d'); g.addColorStop(.62, '#161511'); g.addColorStop(1, '#0c0b08');
    cx.beginPath(); cx.arc(ox, oy, R, 0, 6.2832); cx.fillStyle = g; cx.fill();
    cx.lineWidth = 1; cx.strokeStyle = 'rgba(192,149,80,.30)'; cx.stroke();
  }

  function reticolo() {
    cx.lineWidth = .6; cx.strokeStyle = 'rgba(192,149,80,.085)';
    var i, j, v, p, giu;
    for (i = -60; i <= 60; i += 30) {           // paralleli
      cx.beginPath(); giu = true;
      for (j = -180; j <= 180; j += 4) {
        v = vet(j, i);
        if (v[0] >= 0) { if (giu) { cx.moveTo(sx(v), sy(v)); giu = false; } else cx.lineTo(sx(v), sy(v)); }
        else giu = true;
      }
      cx.stroke();
    }
    for (i = -180; i < 180; i += 30) {          // meridiani
      cx.beginPath(); giu = true;
      for (j = -80; j <= 80; j += 4) {
        v = vet(i, j);
        if (v[0] >= 0) { if (giu) { cx.moveTo(sx(v), sy(v)); giu = false; } else cx.lineTo(sx(v), sy(v)); }
        else giu = true;
      }
      cx.stroke();
    }
  }

  function terre() {
    cx.fillStyle = '#2d2922'; cx.strokeStyle = 'rgba(192,149,80,.34)'; cx.lineWidth = .7;
    for (var k = 0; k < TERRE.length; k++) {
      var ring = TERRE[k], vs = [], n = ring.length, i;
      for (i = 0; i < n; i++) vs.push(vet(ring[i][0], ring[i][1]));
      /* raccolgo i tratti visibili, chiudendoli sull'orizzonte */
      var tratto = null, tratti = [];
      for (i = 0; i < n; i++) {
        var a = vs[i], b = vs[(i + 1) % n];
        if (a[0] >= 0) {
          if (!tratto) { tratto = [a]; } else tratto.push(a);
          if (b[0] < 0) { tratto.push(limite(a, b)); tratti.push(tratto); tratto = null; }
        } else if (b[0] >= 0) {
          tratto = [limite(a, b)];
        }
      }
      if (tratto) tratti.push(tratto);
      for (var q = 0; q < tratti.length; q++) {
        var p = tratti[q]; if (p.length < 2) continue;
        cx.beginPath(); cx.moveTo(sx(p[0]), sy(p[0]));
        for (i = 1; i < p.length; i++) cx.lineTo(sx(p[i]), sy(p[i]));
        cx.closePath(); cx.fill(); cx.stroke();
      }
    }
  }

  var vis = [];   // teatri visibili in questo fotogramma
  function punti() {
    vis.length = 0;
    var i, t, v, a, x, y, raggio;
    for (i = 0; i < T.length; i++) {
      t = T[i]; v = vet(t.lo, t.la);
      if (v[0] <= .02) continue;
      a = Math.min(1, v[0] * 2.1);            // sfuma vicino al bordo
      x = sx(v); y = sy(v);
      raggio = 2.6 + Math.min(6, t.r.length * .62);
      vis.push({ i: i, x: x, y: y, a: a, r: raggio });
    }
    vis.sort(function (p, q) { return p.a - q.a; });
    for (i = 0; i < vis.length; i++) {
      var p = vis[i], acceso = p.i === scelto;
      cx.beginPath(); cx.arc(p.x, p.y, p.r + (acceso ? 7 : 4.5), 0, 6.2832);
      cx.fillStyle = 'rgba(192,149,80,' + (p.a * (acceso ? .30 : .13)).toFixed(3) + ')'; cx.fill();
      cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.2832);
      cx.fillStyle = 'rgba(' + (acceso ? '243,239,232,' : '192,149,80,') + p.a.toFixed(3) + ')';
      cx.fill();
    }
    /* etichette: prima il teatro scelto, poi i piu' centrali, saltando
       quelle che si sovrappongono a una gia' scritta (l'Europa e' fitta) */
    /* L'ordine delle etichette era dato da 'a', cioe' da quanto il puntino e'
       vicino al centro: un valore che cambia a ogni fotogramma, quindi l'ordine
       si ribaltava di continuo e i nomi si accendevano e si spegnevano. Ora
       l'ordine e' fisso - prima i teatri con piu' ruoli - e cambia solo quando
       un punto passa davvero dietro al globo. */
    var cand = vis.slice().sort(function (p, q) {
      var d = T[q.i].r.length - T[p.i].r.length;
      return d || (p.i - q.i);
    });
    if (scelto >= 0) {
      var s = vis.filter(function (p) { return p.i === scelto; })[0];
      if (s) { cand = cand.filter(function (p) { return p.i !== scelto; }); cand.unshift(s); }
    }
    cx.textAlign = 'center'; cx.textBaseline = 'top';
    var corpo = Math.max(13, Math.round(L * .0235)), presi = [], scritte = 0;
    for (i = 0; i < cand.length && scritte < 7; i++) {
      var o = cand[i], t2 = T[o.i], ac = o.i === scelto;
      /* troppo di taglio sul bordo: niente nome, altrimenti lampeggia */
      if (!ac && o.a < 0.5) continue;
      cx.font = (ac ? '600 ' : '500 ') + corpo + 'px Archivo, system-ui, sans-serif';
      var w = cx.measureText(t2.c).width, bx = o.x - w / 2 - 4, by = o.y + o.r + 4;
      var box = [bx, by, bx + w + 8, by + corpo + 5], urta = false;
      for (var z = 0; z < presi.length; z++) {
        var b = presi[z];
        if (box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1]) { urta = true; break; }
      }
      if (urta && !ac) continue;
      presi.push(box); scritte++;
      cx.shadowColor = 'rgba(8,7,5,.9)'; cx.shadowBlur = 5;
      cx.fillStyle = ac ? 'rgba(249,246,241,' + o.a.toFixed(3) + ')'
                        : 'rgba(226,218,204,' + Math.min(1, o.a * .95).toFixed(3) + ')';
      cx.fillText(t2.c, o.x, by + 2);
      cx.shadowBlur = 0;
    }
  }

  function disegna() {
    prepara();
    cx.clearRect(0, 0, L, L);
    oceano(); reticolo(); terre(); punti();
  }

  /* --------------------------------------------------- giro */
  var ultimo = 0;
  function battito(ts) {
    var dt = ultimo ? Math.min(60, ts - ultimo) : 16; ultimo = ts;
    if (anim) {
      anim.t += dt / anim.durata;
      var k = anim.t >= 1 ? 1 : 1 - Math.pow(1 - anim.t, 3);
      lam = anim.l0 + anim.dl * k; phi = anim.p0 + anim.dp * k;
      if (anim.t >= 1) anim = null;
    } else if (gira && !sopra) {
      lam += dt * .0094;   /* un giro in poco piu' di sei minuti era troppo: ora ~38 secondi */
    }
    if (Math.abs(mira - zoom) > 0.0008) {
      var passoZ = 1 - Math.pow(1 - 0.135, dt / 16.7);   /* stesso freno a ogni cadenza */
      zoom += (mira - zoom) * passoZ;
      if (Math.abs(mira - zoom) <= 0.0008) zoom = mira;
      raggio();
    }
    if (lam > 180) lam -= 360; if (lam < -180) lam += 360;
    disegna();
    requestAnimationFrame(battito);
  }

  function porta(lo, la) {
    var dl = lo - lam; while (dl > 180) dl -= 360; while (dl < -180) dl += 360;
    var pl = Math.max(-62, Math.min(62, la));
    anim = { t: 0, durata: 900, l0: lam, p0: phi, dl: dl, dp: pl - phi };
  }

  /* --------------------------------------------------- scheda */
  var ruoloScelto = -1;

  function quante(t, k) {
    var n = 0;
    for (var z = 0; z < t.f.length; z++) if (t.f[z].ri.indexOf(k) >= 0) n++;
    return n;
  }

  var tutteAperte = false;

  function fotografie(t) {
    var el = scheda.querySelector('.globo-fotos-posto');
    if (!el) return;
    var scelte = t.f, eti = P.inScena;
    if (ruoloScelto >= 0) {
      scelte = t.f.filter(function (f) { return f.ri.indexOf(ruoloScelto) >= 0; });
      eti = t.r[ruoloScelto].r;
    }
    if (!t.f.length) { el.innerHTML = '<p class="vuoto">' + P.nessuna + '</p>'; return; }
    if (!scelte.length) {
      el.innerHTML = '<p class="vuoto">' + P.nessunaRuolo +
        '<button type="button" class="tutte">' + P.vediTutte + '</button></p>';
      el.querySelector('.tutte').addEventListener('click', function () { apriRuolo(t, -1); });
      return;
    }
    var h = '<p class="eti">' + eti + ' · ' + scelte.length +
            (scelte.length === 1 ? P.una : P.molte) +
            (ruoloScelto >= 0 ? ' <button type="button" class="tutte">' + P.tutte + '</button>' : '') + '</p>';
    /* SEI IN ANTEPRIMA, IL RESTO SOLO SE LE CHIEDI.
       Di Vienna ce ne sono ottantasei: aprendo la scheda partiva uno
       scorrimento infinito, e il mappamondo accanto restava solo in
       mezzo al nero. Adesso se ne vedono sei e un tasto dice quante
       sono. Chi le vuole tutte le apre; chi guarda un altro teatro non
       se le trova addosso. (Massimo, 27 novembre 2026: «io non farei
       vedere tutte le fotografie subito, solo se uno ci clicca sopra,
       oppure un tasto apri tutte».)
       Il tetto NON limita la lente: `mostrate` resta l'elenco intero,
       cosi' scorrendo a tutto schermo ci sono tutte. */
    var ANTEPRIMA = 6;
    var apribile = scelte.length > ANTEPRIMA;
    var quante = tutteAperte ? scelte.length : Math.min(ANTEPRIMA, scelte.length);
    h += '<div class="globo-fotos">';
    for (var k = 0; k < quante; k++)
      h += '<img src="' + scelte[k].src + '" alt="' + scelte[k].alt.replace(/"/g, '') + '"' +
           (scelte[k].pv === 'SOLO CARTELLA' ? ' class="daConfermare" title="' + P.daConfermare.charAt(0).toUpperCase() + P.daConfermare.slice(1) + '"' : '') +
           ' loading="lazy">';
    h += '</div>';
    if (apribile) h += '<p class="globo-ancora"><button type="button" class="ancora">' +
      (tutteAperte ? P.chiudiTutte
                   : P.apriTutte + scelte.length + (IT ? ' fotografie' : ' photographs')) +
      '</button></p>';
    var dubbie = scelte.filter(function (f) { return f.pv === 'SOLO CARTELLA'; }).length;
    var cr = {};
    for (k = 0; k < scelte.length; k++) if (scelte[k].cr) cr[scelte[k].cr] = 1;
    var nomi = Object.keys(cr);
    if (nomi.length) h += '<p class="globo-credito">' + P.credito + nomi.join(' \u00b7 ') + '</p>';
    if (dubbie) h += '<p class="globo-credito dub">' + dubbie +
      (dubbie === 1 ? P.haUna : P.hannoMolte) +
      P.daCartella + '</p>';
    el.innerHTML = h;
    var b = el.querySelector('.tutte');
    if (b) b.addEventListener('click', function () { apriRuolo(t, -1); });
    var an = el.querySelector('.ancora');
    if (an) an.addEventListener('click', function () {
      tutteAperte = !tutteAperte;
      fotografie(t);
      if (!tutteAperte) el.scrollIntoView({ block: 'nearest' });
    });
    /* TUTTE, non le prime dodici. Quando abbiamo tolto il tetto alla
       griglia questo e' rimasto indietro: la pagina mostrava tutte le
       fotografie ma la lente ne conosceva solo dodici, cosi' cliccando
       la tredicesima faceva il giro e ne apriva un'altra. Si vedeva
       solo sulla Carmen di Vienna, l'unica con piu' di dodici.
       (Massimo, 26 novembre 2026: «quando clicco per allargare una
       delle foto salta ad un'altra, e solo quelle di Carmen») */
    mostrate = scelte;
    var mini = el.querySelectorAll('.globo-fotos img');
    for (var q = 0; q < mini.length; q++) {
      (function (k, im) {
        im.setAttribute('tabindex', '0');
        im.setAttribute('role', 'button');
        im.addEventListener('click', function () { tornaA = im; apriLente(k); });
        im.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tornaA = im; apriLente(k); }
        });
      })(q, mini[q]);
    }
  }

  function apriRuolo(t, k) {
    ruoloScelto = (ruoloScelto === k) ? -1 : k;
    tutteAperte = false;          /* cambiando ruolo si riparte da sei */
    var voci = scheda.querySelectorAll('.globo-ruoli li');
    for (var z = 0; z < voci.length; z++) {
      if (z === ruoloScelto) voci[z].setAttribute('aria-current', 'true');
      else voci[z].removeAttribute('aria-current');
    }
    fotografie(t);
  }

  function vai(i, muovi) {
    scelto = i; ruoloScelto = -1; var t = T[i];
    if (muovi) porta(t.lo, t.la);
    var h = '<p class="dove">' + t.c + '</p><h2>' + t.n + '</h2>';
    h += '<div class="globo-ruoli"><p class="eti">' + (t.r.length === 1 ? P.unRuolo : t.r.length + P.ruoli) + '</p><ul>';
    for (var k = 0; k < t.r.length; k++) {
      var n = quante(t, k);
      h += '<li' + (n ? ' class="conFoto" tabindex="0" role="button"' : '') + '><b>' + t.r[k].r + '</b><span>' + t.r[k].o + '</span>' +
           (n ? '<i class="n">' + n + '</i>' : '') + '</li>';
    }
    h += '</ul></div>';
    /* Due teatri nella stessa citta' si pestano sul globo: dal puntino se ne
       apre sempre e solo uno. Qui sotto compaiono gli altri, cliccabili. */
    var vicini = [];
    for (var v = 0; v < T.length; v++) if (v !== i && T[v].c === t.c) vicini.push(v);
    if (vicini.length) {
      h += '<div class="globo-vicini"><p class="eti">' + P.stessaCitta + '</p>';
      for (var v2 = 0; v2 < vicini.length; v2++) {
        h += '<button type="button" data-vai="' + vicini[v2] + '">' + T[vicini[v2]].n + '</button>';
      }
      h += '</div>';
    }
    /* L'ARCHIVIO DEL TEATRO.
       Dieci teatri pubblicano online l'elenco delle recite con il cast:
       da qui ogni data del sito si puo' verificare alla fonte. Serve a
       chi legge, serve per Wikipedia (dove una modifica senza fonte
       viene respinta) e dice a Google che questo sito e' collegato agli
       archivi ufficiali. (Massimo, 25 novembre 2026: «mettiamo i link
       ai teatri, archivi e produzioni») */
    if (t.arc) {
      h += '<p class="globo-arc"><a href="' + t.arc + '" target="_blank" rel="noopener">'
         + P.archivio + '</a></p>';
    }
    h += '<div class="globo-fotos-posto"></div>';
    tutteAperte = false;          /* cambiando teatro si riparte da sei */
    scheda.innerHTML = h;
    var voci = scheda.querySelectorAll('.globo-ruoli li');
    (function (tt) {
      for (var z = 0; z < voci.length; z++) {
        if (!voci[z].classList.contains('conFoto')) continue;
        (function (k, li) {
          li.addEventListener('click', function () { apriRuolo(tt, k); });
          li.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); apriRuolo(tt, k); }
          });
        })(z, voci[z]);
      }
    })(t);
    var vic = scheda.querySelectorAll('.globo-vicini button');
    for (var q = 0; q < vic.length; q++) {
      (function (bb) { bb.addEventListener('click', function () { vai(+bb.getAttribute('data-vai'), true); }); })(vic[q]);
    }
    fotografie(t);
    var b = chips.children;
    for (k = 0; k < b.length; k++) {
      if (k === i) b[k].setAttribute('aria-current', 'true'); else b[k].removeAttribute('aria-current');
    }
  }

  /* --------------------------------------------------- tocco */
  function dove(ev) {
    var r = cv.getBoundingClientRect();
    var p = ev.touches ? ev.touches[0] : ev;
    return { x: p.clientX - r.left, y: p.clientY - r.top };
  }
  function sotto(x, y) {
    var best = -1, bd = 26 * 26;
    for (var i = 0; i < vis.length; i++) {
      var p = vis[i], d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y);
      if (d < bd) { bd = d; best = p.i; }
    }
    return best;
  }

  var preso = false, px = 0, py = 0, mosso = 0;
  function giu(ev) {
    preso = true; mosso = 0; var p = dove(ev); px = p.x; py = p.y;
    cv.classList.add('presa'); sugg.classList.add('via');
    if (ev.cancelable) ev.preventDefault();
  }
  function muovi(ev) {
    if (!preso) return;
    var p = dove(ev), dx = p.x - px, dy = p.y - py; px = p.x; py = p.y;
    mosso += Math.abs(dx) + Math.abs(dy);
    var passo = 0.26 / zoom;
    lam -= dx * passo;                       /* a destra il globo va a destra */
    phi = Math.max(-78, Math.min(78, phi + dy * passo * 0.92));
    anim = null;
    if (ev.cancelable) ev.preventDefault();
  }
  function su(ev) {
    if (!preso) return;
    preso = false; cv.classList.remove('presa');
    if (mosso < 6) {
      var p = dove(ev.changedTouches ? { touches: ev.changedTouches } : ev);
      var i = sotto(p.x, p.y);
      if (i >= 0) vai(i, true); else scelto = -1;
    }
  }
  /* rotellina del mouse e trackpad */
  cv.addEventListener('wheel', function (ev) {
    ev.preventDefault();
    ingrandisci(Math.exp(-ev.deltaY * 0.0022));
  }, { passive: false });

  /* due dita: pizzica per ingrandire */
  var pizzico = 0;
  function distanza(ts) {
    var a = ts[0], b = ts[1];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }
  cv.addEventListener('touchstart', function (ev) {
    if (ev.touches.length === 2) { pizzico = distanza(ev.touches); preso = false; cv.classList.remove('presa'); }
  }, { passive: true });
  cv.addEventListener('touchmove', function (ev) {
    if (ev.touches.length === 2 && pizzico) {
      var d = distanza(ev.touches);
      if (d > 0) { ingrandisci(d / pizzico, true); pizzico = d; }
      if (ev.cancelable) ev.preventDefault();
    }
  }, { passive: false });
  cv.addEventListener('touchend', function (ev) {
    if (ev.touches.length < 2) pizzico = 0;
  }, { passive: true });

  /* doppio tocco / doppio clic: avvicina, e al massimo torna indietro */
  var ultimoTocco = 0;
  function doppio() { ingrandisci(mira > ZMAX - 0.6 ? ZMIN / mira : 1.9); }
  cv.addEventListener('dblclick', function (ev) { ev.preventDefault(); doppio(); });
  cv.addEventListener('touchend', function () {
    var t = Date.now();
    if (t - ultimoTocco < 320 && mosso < 6) doppio();
    ultimoTocco = t;
  }, { passive: true });

  /* col mouse: si ferma quando ci entri sopra, riparte quando esci */
  cv.addEventListener('mouseenter', function () { sopra = true; });
  cv.addEventListener('mousemove',  function () { sopra = true; });
  cv.addEventListener('mouseleave', function () { sopra = false; });
  /* col dito: si ferma mentre lo tieni, riparte quando lo stacchi */
  cv.addEventListener('touchstart', function () { sopra = true; }, { passive: true });
  cv.addEventListener('touchend',   function () { sopra = false; }, { passive: true });
  cv.addEventListener('touchcancel',function () { sopra = false; }, { passive: true });
  cv.addEventListener('mousedown', giu);
  window.addEventListener('mousemove', muovi);
  window.addEventListener('mouseup', su);
  cv.addEventListener('touchstart', giu, { passive: false });
  cv.addEventListener('touchmove', muovi, { passive: false });
  cv.addEventListener('touchend', su);

  /* ----------------------------------------- la lente che ingrandisce */
  var lente = document.getElementById('lente'), lenteImg = document.getElementById('lenteImg'),
      lenteCap = document.getElementById('lenteCap'), mostrate = [], quale = 0, tornaA = null;

  function apriLente(i) {
    quale = (i + mostrate.length) % mostrate.length;
    var f = mostrate[quale];
    lenteImg.src = f.full || f.src;
    lenteImg.alt = f.alt;
    lenteCap.textContent = f.alt + (f.cr ? '  ·  ' + f.cr : '') +
      '  ·  ' + (quale + 1) + P.diCui + mostrate.length +
      (f.pv === 'SOLO CARTELLA' ? '  \u00b7  ' + P.daConfermare : '');
    lente.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('chiudi').focus();
  }
  function chiudiLente() {
    lente.hidden = true; lenteImg.src = '';
    document.body.style.overflow = '';
    if (tornaA) { try { tornaA.focus(); } catch (e) {} }
  }
  /* DUE DITA NON SONO UNA SCORSA, E IL CLIC DOPO UNA PIZZICATA NON VALE.
     Allargando le dita per ingrandire, la lente cambiava fotografia e
     a volte si chiudeva: la scorsa leggeva solo il primo dito, e
     finita la pizzicata iPhone manda un clic a quello che sta sotto -
     cioe' le frecce, che stanno ai lati sopra l'immagine, e lo sfondo,
     che chiude. Mezzo secondo di sordita' e il problema sparisce.
     (Massimo, 25 novembre 2026: «impazzisce e comincia a girarle alla
     rinfusa senza lasciarle ingrandire con le due dita») */
  var finePizzicata = 0;
  function dopoPizzicata() { return Date.now() - finePizzicata < 600; }

  document.getElementById('chiudi').addEventListener('click', function () {
    if (dopoPizzicata()) return; chiudiLente(); });
  document.getElementById('prec').addEventListener('click', function () {
    if (dopoPizzicata()) return; apriLente(quale - 1); });
  document.getElementById('succ').addEventListener('click', function () {
    if (dopoPizzicata()) return; apriLente(quale + 1); });
  lente.addEventListener('click', function (ev) {
    if (dopoPizzicata()) return;
    if (ev.target === lente) chiudiLente(); });
  document.addEventListener('keydown', function (ev) {
    if (lente.hidden) return;
    if (ev.key === 'Escape') chiudiLente();
    else if (ev.key === 'ArrowLeft') apriLente(quale - 1);
    else if (ev.key === 'ArrowRight') apriLente(quale + 1);
  });
  /* scorrimento col dito dentro la lente: un dito solo */
  var lx = null, dita = 0;
  lente.addEventListener('touchstart', function (ev) {
    dita = Math.max(dita, ev.touches.length);
    if (ev.touches.length > 1) { finePizzicata = Date.now(); lx = null; return; }
    lx = ev.touches[0].clientX;
  }, { passive: true });
  lente.addEventListener('touchmove', function (ev) {
    if (ev.touches.length > 1) { dita = ev.touches.length; finePizzicata = Date.now(); lx = null; }
  }, { passive: true });
  lente.addEventListener('touchend', function (ev) {
    if (ev.touches.length === 0) {
      var piu = dita > 1; dita = 0;
      if (piu) { finePizzicata = Date.now(); lx = null; return; }
    }
    if (lx === null) return;
    var d = ev.changedTouches[0].clientX - lx;
    lx = null;
    if (Math.abs(d) > 60) apriLente(quale + (d < 0 ? 1 : -1));
  }, { passive: true });
  lente.addEventListener('touchcancel', function () { lx = null; dita = 0; }, { passive: true });

  /* --------------------------------------------------- elenco */
  /* due teatri nella stessa citta' (Vienna, Berlino, New York): distinguili */
  var conta = {};
  T.forEach(function (t) { conta[t.c] = (conta[t.c] || 0) + 1; });
  function etichetta(t) {
    if (conta[t.c] < 2) return t.c;
    var corti = { 'Wiener Staatsoper': 'Staatsoper', 'Musikverein': 'Musikverein',
                  'Deutsche Oper Berlin': 'Deutsche Oper', 'Philharmonie': 'Philharmonie',
                  'Metropolitan Opera': 'Metropolitan', 'Carnegie Hall': 'Carnegie',
                  'Salle Pleyel': 'Pleyel', 'Op\u00e9ra national de Paris': 'Op\u00e9ra' };
    return t.c + ' · ' + (corti[t.n] || t.n.split(/[\s,]/)[0]);
  }

  T.map(function (t, i) { return [t, i]; })
   .sort(function (a, b) { return b[0].r.length - a[0].r.length; })
   .forEach(function (par) {
     var b = document.createElement('button');
     b.type = 'button'; b.className = 'globo-chip'; b.textContent = etichetta(par[0]);
     b.title = par[0].n + ', ' + par[0].c;
     b.setAttribute('data-i', par[1]);
     b.addEventListener('click', function () { vai(par[1], true); });
     chips.appendChild(b);
   });
  /* i bottoni sono ordinati per numero di ruoli: rifaccio la mappa indice->bottone */
  (function () {
    var ordinati = [].slice.call(chips.children);
    chips.innerHTML = '';
    var perIndice = [];
    ordinati.forEach(function (b) { perIndice[+b.getAttribute('data-i')] = b; });
    for (var i = 0; i < T.length; i++) chips.appendChild(perIndice[i]);
  })();

  document.getElementById('piu').addEventListener('click', function () { ingrandisci(1.45); });
  document.getElementById('meno').addEventListener('click', function () { ingrandisci(1 / 1.45); });

  window.addEventListener('resize', function () { misura(); });
  /* spioncino di sola lettura: serve a verificare la pagina da fuori */
  window.__globo = { stato: function () { return { lam: lam, phi: phi, zoom: zoom, mira: mira, R: R, sopra: sopra, gira: gira }; } };

  misura(); vai(0, false); lam = T[0].lo - 40; phi = 24;
  requestAnimationFrame(battito);
})();
