/* LA REDAZIONE — cambiare i testi del sito senza chiedere a nessuno.

   Si accende aggiungendo  ?redazione  all'indirizzo di una pagina qualsiasi.
   Chi arriva normalmente non vede e non carica niente di tutto questo.

   Dentro: ogni titolo, paragrafo, voce di elenco e didascalia diventa
   scrivibile sul posto. Quello che si scrive resta salvato nel browser mentre
   si lavora, anche chiudendo la finestra. Alla fine si scarica la pagina
   aggiornata, pronta da mettere online.

   Perche' non un pannello con l'elenco dei testi: in questo sito i blocchi di
   testo sono ottocentotrentadue. Un elenco sarebbe illeggibile; sulla pagina
   si vede subito quale frase si sta cambiando e come viene. */
(function () {
  var CHIAVE = 'redazione:' + location.pathname;
  var acceso = /(?:\?|&)redazione\b/.test(location.search);
  if (!acceso) return;

  var IT = document.documentElement.lang.slice(0, 2) === 'it';
  var T = IT ? {
    titolo: 'Redazione',
    sotto: 'Clicca su un testo e scrivi. Si salva da solo mentre lavori.',
    salva: 'Scarica la pagina aggiornata',
    annulla: 'Rimetti com\'era',
    esci: 'Esci dalla redazione',
    cambiati: 'testi cambiati', cambiato: 'testo cambiato',
    nessuno: 'nessun cambiamento',
    conferma: 'Rimettere tutti i testi com\'erano? Quello che hai scritto va perso.',
    scaricata: 'Pagina scaricata. Mettila online al posto di quella vecchia — oppure passamela e la pubblico io.',
    ripreso: 'Ho ritrovato %d testi che avevi cambiato e non ancora scaricato.',
    aiuto: 'Invio per andare a capo. Esc per lasciare un testo.'
  } : {
    titolo: 'Editing',
    sotto: 'Click any text and type. It saves itself as you work.',
    salva: 'Download the updated page',
    annulla: 'Put everything back',
    esci: 'Leave editing',
    cambiati: 'texts changed', cambiato: 'text changed',
    nessuno: 'nothing changed yet',
    conferma: 'Put every text back as it was? What you have written will be lost.',
    scaricata: 'Page downloaded. Put it online in place of the old one — or send it to me and I will publish it.',
    ripreso: 'Found %d texts you changed and had not downloaded yet.',
    aiuto: 'Enter for a new line. Esc to leave a text.'
  };

  var DENTRO = 'h1,h2,h3,h4,p,li,blockquote,figcaption,summary,.lez-dom,.pie-nome,.pie-ruolo,.brand';
  /* Fuori restano i testi che cambiano da soli — il contatore delle
     fotografie, l'anno in fondo — altrimenti risultano "modificati" senza che
     nessuno li abbia toccati; e i pezzi che compaiono solo per un momento. */
  var FUORI = '.redaz, .redaz *, script, style, noscript,' +
              ' .consenso, .consenso *, .lente, .lente *,' +
              ' [aria-live], [aria-live] *, .skip, .sr-only,' +
              ' .hero-ctl, .hero-ctl *, .lez-riepilogo, [data-redaz-no]';

  var pezzi = [];
  var salvati = {};
  try { salvati = JSON.parse(localStorage.getItem(CHIAVE) || '{}'); } catch (e) {}

  /* Una chiave stabile per ogni testo: la via che porta dall'inizio della
     pagina fino a lui. Se la pagina non cambia struttura, la chiave regge. */
  function viaDi(el) {
    var parti = [];
    while (el && el !== document.body) {
      var p = el.parentNode;
      if (!p) break;
      var pari = Array.prototype.filter.call(p.children, function (c) { return c.tagName === el.tagName; });
      parti.unshift(el.tagName.toLowerCase() + (pari.length > 1 ? '[' + pari.indexOf(el) + ']' : ''));
      el = p;
    }
    return parti.join('/');
  }

  function raccogli() {
    Array.prototype.forEach.call(document.querySelectorAll(DENTRO), function (el) {
      if (el.closest(FUORI)) return;
      if (el.querySelector(DENTRO)) return;            /* solo le foglie */
      if (!el.textContent.trim()) return;
      var via = viaDi(el);
      el.setAttribute('data-redaz', via);
      el.setAttribute('contenteditable', 'plaintext-only');
      el.setAttribute('spellcheck', 'true');
      if (!el.getAttribute('data-redaz-era')) el.setAttribute('data-redaz-era', el.innerHTML);
      if (salvati[via] !== undefined && salvati[via] !== el.innerHTML) el.innerHTML = salvati[via];
      pezzi.push(el);
    });
  }

  function quanti() {
    return pezzi.filter(function (el) {
      return el.innerHTML.trim() !== (el.getAttribute('data-redaz-era') || '').trim();
    }).length;
  }

  function aggiorna() {
    var n = quanti();
    conta.textContent = n ? n + ' ' + (n === 1 ? T.cambiato : T.cambiati) : T.nessuno;
    conta.classList.toggle('ci-sono', !!n);
    bSalva.disabled = !n;
    bAnnulla.disabled = !n;
    pezzi.forEach(function (el) {
      el.classList.toggle('redaz-tocco',
        el.innerHTML.trim() !== (el.getAttribute('data-redaz-era') || '').trim());
    });
  }

  function registra() {
    var m = {};
    pezzi.forEach(function (el) {
      if (el.innerHTML.trim() !== (el.getAttribute('data-redaz-era') || '').trim()) {
        m[el.getAttribute('data-redaz')] = el.innerHTML;
      }
    });
    try { localStorage.setItem(CHIAVE, JSON.stringify(m)); } catch (e) {}
    aggiorna();
  }

  /* ---------- la pagina da scaricare ---------- */
  function pagina() {
    var copia = document.documentElement.cloneNode(true);
    /* via ogni traccia della redazione: deve uscirne un file pulito */
    Array.prototype.forEach.call(copia.querySelectorAll('[data-redaz]'), function (el) {
      el.removeAttribute('data-redaz');
      el.removeAttribute('data-redaz-era');
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
      el.classList.remove('redaz-tocco');
      if (!el.className) el.removeAttribute('class');
    });
    /* Via anche tutto cio' che gli altri script della pagina hanno aggiunto
       mentre girava: la copia sottile della barra, la lente, il banner del
       consenso, le classi di stato. Deve uscire il file come e' scritto a
       mano, non una fotografia della pagina in funzione. */
    ['.redaz', '.topbar-fissa', '.lente', '.consenso', '.topbar-posto'].forEach(function (sel) {
      Array.prototype.forEach.call(copia.querySelectorAll(sel), function (e) { e.remove(); });
    });
    copia.className = '';
    if (!copia.getAttribute('class')) copia.removeAttribute('class');
    ['gal-pronta', 'viva', 'entrata', 'compatta', 'giu', 'on', 'uscita'].forEach(function (c) {
      Array.prototype.forEach.call(copia.querySelectorAll('.' + c), function (e) {
        e.classList.remove(c);
        if (!e.className) e.removeAttribute('class');
      });
    });
    /* le fotografie dello scorrevole tornano come partono */
    Array.prototype.forEach.call(copia.querySelectorAll('.slides img'), function (im) {
      im.style.transform = '';
      if (!im.getAttribute('style')) im.removeAttribute('style');
    });
    Array.prototype.forEach.call(copia.querySelectorAll('[style=""]'), function (e) {
      e.removeAttribute('style');
    });
    Array.prototype.forEach.call(copia.querySelectorAll('script[src*="redazione.js"]'), function (s) { s.remove(); });
    return '<!doctype html>\n' + copia.outerHTML + '\n';
  }

  function scarica() {
    var nome = (location.pathname.split('/').pop() || 'index.html');
    var b = new Blob([pagina()], { type: 'text/html;charset=utf-8' });
    var u = URL.createObjectURL(b);
    var a = document.createElement('a');
    a.href = u; a.download = nome;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
    avvisa(T.scaricata);
  }

  function annulla() {
    if (!window.confirm(T.conferma)) return;
    pezzi.forEach(function (el) { el.innerHTML = el.getAttribute('data-redaz-era') || ''; });
    try { localStorage.removeItem(CHIAVE); } catch (e) {}
    aggiorna();
  }

  function avvisa(testo) {
    nota.textContent = testo;
    nota.hidden = false;
    clearTimeout(avvisa.t);
    avvisa.t = setTimeout(function () { nota.hidden = true; }, 7000);
  }

  /* ---------- la barra della redazione ---------- */
  var barra = document.createElement('div');
  barra.className = 'redaz';
  barra.innerHTML =
    '<div class="redaz-dentro">' +
      '<div class="redaz-chi"><b>' + T.titolo + '</b><span>' + T.sotto + '</span></div>' +
      '<span class="redaz-conta" data-conta></span>' +
      '<button type="button" data-annulla class="redaz-piano">' + T.annulla + '</button>' +
      '<button type="button" data-salva class="redaz-forte">' + T.salva + '</button>' +
      '<a class="redaz-piano" href="' + location.pathname + '">' + T.esci + '</a>' +
    '</div>' +
    '<p class="redaz-nota" data-nota hidden></p>';
  document.body.appendChild(barra);
  document.documentElement.classList.add('in-redazione');

  var conta = barra.querySelector('[data-conta]');
  var nota = barra.querySelector('[data-nota]');
  var bSalva = barra.querySelector('[data-salva]');
  var bAnnulla = barra.querySelector('[data-annulla]');

  /* lo scorrere delle fotografie si ferma: una foto che cambia sotto il
     cursore mentre si scrive e' solo un fastidio */
  var pausa = document.querySelector('.hero-ctl [data-pausa]');
  if (pausa && pausa.getAttribute('aria-pressed') !== 'true') pausa.click();

  raccogli();
  aggiorna();

  var ripresi = Object.keys(salvati).length;
  if (ripresi) avvisa(T.ripreso.replace('%d', ripresi));

  var attesa;
  document.addEventListener('input', function (e) {
    if (!e.target.closest || !e.target.closest('[data-redaz]')) return;
    clearTimeout(attesa);
    attesa = setTimeout(registra, 400);
  });

  document.addEventListener('keydown', function (e) {
    var el = e.target.closest && e.target.closest('[data-redaz]');
    if (!el) return;
    if (e.key === 'Escape') { el.blur(); registra(); }
  });

  barra.addEventListener('click', function (e) {
    if (e.target.closest('[data-salva]')) { registra(); scarica(); }
    else if (e.target.closest('[data-annulla]')) annulla();
  });

  /* non si esce per sbaglio con del lavoro non scaricato */
  window.addEventListener('beforeunload', function (e) {
    if (quanti()) { e.preventDefault(); e.returnValue = ''; }
  });

  /* i collegamenti restano nella redazione invece di uscirne */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || a.closest('.redaz')) return;
    var h = a.getAttribute('href');
    if (!h || /^(https?:|mailto:|tel:|#)/.test(h)) return;
    e.preventDefault();
    location.href = h + (h.indexOf('?') >= 0 ? '&' : '?') + 'redazione';
  });
})();
