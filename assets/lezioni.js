/* La richiesta di una lezione, in tre passi.

   Perche' non un semplice modulo: chi scrive "vorrei studiare con lei" manda
   una mail che non dice la voce, il repertorio, il livello, dove si trova —
   e serve un secondo scambio per ognuna di quelle cose. Qui le domande sono
   poste prima, e alla fine la mail e' gia' scritta.

   Non c'e' nessun server: l'ultimo passo apre il programma di posta con il
   testo pronto. Chi riceve legge una richiesta completa, chi scrive non
   lascia dati su nessuna piattaforma. */
(function () {
  var modulo = document.querySelector('[data-lezioni]');
  if (!modulo) return;

  var IT = document.documentElement.lang.slice(0, 2) === 'it';
  var T = IT ? {
    passo: 'Passo', di: 'di', avanti: 'Avanti', indietro: 'Indietro',
    rivedi: 'Rivedi la richiesta', invia: 'Apri la mail già scritta',
    oggetto: 'Richiesta di lezione — %s',
    manca: 'Scegli una voce per andare avanti.',
    mancaCampo: 'Questo campo serve.',
    anteprima: 'Questo è il testo che partirà:',
    nota: 'Si apre il tuo programma di posta con il messaggio già scritto. Niente viene inviato prima che tu prema invio.'
  } : {
    passo: 'Step', di: 'of', avanti: 'Next', indietro: 'Back',
    rivedi: 'Review your request', invia: 'Open the email, ready to send',
    oggetto: 'Lesson request — %s',
    manca: 'Choose an option to continue.',
    mancaCampo: 'This field is needed.',
    anteprima: 'This is the message that will be sent:',
    nota: 'Your own mail programme opens with the message already written. Nothing is sent until you press send.'
  };

  var passi = Array.prototype.slice.call(modulo.querySelectorAll('[data-passo]'));
  var barra = modulo.querySelector('[data-avanzamento]');
  var eti = modulo.querySelector('[data-etichetta-passo]');
  var qui = 0;

  function disegna() {
    passi.forEach(function (p, i) {
      p.hidden = i !== qui;
      p.setAttribute('aria-hidden', i !== qui ? 'true' : 'false');
    });
    if (barra) barra.style.width = ((qui + 1) / passi.length * 100) + '%';
    if (eti) eti.textContent = T.passo + ' ' + (qui + 1) + ' ' + T.di + ' ' + passi.length;
    var primo = passi[qui].querySelector('input,select,textarea,button');
    if (primo && qui > 0) primo.focus();
  }

  function valori() {
    var v = {};
    Array.prototype.forEach.call(modulo.querySelectorAll('[name]'), function (c) {
      if (c.type === 'radio') { if (c.checked) v[c.name] = c.value; }
      else if (c.type === 'checkbox') { if (c.checked) (v[c.name] = v[c.name] || []).push(c.value); }
      else if (c.value.trim()) v[c.name] = c.value.trim();
    });
    return v;
  }

  function completo(i) {
    var p = passi[i];
    var mancanti = [];
    Array.prototype.forEach.call(p.querySelectorAll('[data-serve]'), function (gruppo) {
      var nome = gruppo.getAttribute('data-serve');
      var scelti = modulo.querySelectorAll('[name="' + nome + '"]:checked');
      /* il menu a tendina della voce non e' una casella da spuntare: va letto il valore */
      var campo = modulo.querySelector('input[name="' + nome + '"]:not([type=radio]), textarea[name="'
                  + nome + '"], select[name="' + nome + '"]');
      var ok = scelti.length || (campo && campo.value.trim());
      gruppo.classList.toggle('manca', !ok);
      if (!ok) mancanti.push(gruppo);
    });
    if (mancanti.length) {
      var avviso = p.querySelector('[data-avviso]');
      if (avviso) { avviso.textContent = T.manca; avviso.hidden = false; }
      mancanti[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
      return false;
    }
    var a = p.querySelector('[data-avviso]');
    if (a) a.hidden = true;
    return true;
  }

  function testo() {
    var v = valori();
    var r = [];
    function riga(eti, val) { if (val) r.push(eti + ': ' + (Array.isArray(val) ? val.join(', ') : val)); }
    if (IT) {
      riga('Nome', v.nome); riga('Da dove scrive', v.dove_vive);
      r.push('');
      riga('Che cosa chiede', v.tipo);
      riga('Voce', v.voce); riga('A che punto è', v.livello);
      riga('Dove', v.luogo); riga('Quando', v.quando);
      r.push('');
      if (v.repertorio) { r.push('Che cosa sta studiando:'); r.push(v.repertorio); r.push(''); }
      if (v.note) { r.push('Altro:'); r.push(v.note); r.push(''); }
      if (v.ascolto) { r.push('Si può ascoltare qui: ' + v.ascolto); r.push(''); }
    } else {
      riga('Name', v.nome); riga('Writing from', v.dove_vive);
      r.push('');
      riga('Request', v.tipo);
      riga('Voice', v.voce); riga('Where they are', v.livello);
      riga('Where', v.luogo); riga('When', v.quando);
      r.push('');
      if (v.repertorio) { r.push('Currently working on:'); r.push(v.repertorio); r.push(''); }
      if (v.note) { r.push('Anything else:'); r.push(v.note); r.push(''); }
      if (v.ascolto) { r.push('Recording: ' + v.ascolto); r.push(''); }
    }
    return r.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  function riepiloga() {
    var box = modulo.querySelector('[data-riepilogo]');
    if (box) box.textContent = testo();
    var v = valori();
    var a = modulo.querySelector('[data-manda]');
    if (a) {
      a.href = 'mailto:info@massimogiordano.com'
             + '?subject=' + encodeURIComponent(T.oggetto.replace('%s', v.nome || ''))
             + '&body=' + encodeURIComponent(testo());
    }
  }

  /* Il tasto finale: si prova a mandare dal server, e solo se non va si apre
     il programma di posta — che e' quello che si faceva prima e che su molti
     telefoni non succedeva affatto. */
  modulo.addEventListener('click', function (e) {
    var manda = e.target.closest('[data-manda]');
    if (manda) {
      var v = valori();
      var indirizzo = v.email || '';
      if (!indirizzo) return;                 /* senza indirizzo lascia fare al mailto */
      e.preventDefault();
      var etichetta = manda.textContent;
      manda.textContent = (document.documentElement.lang === 'it') ? 'Un momento…' : 'One moment…';
      manda.setAttribute('aria-disabled', 'true');

      fetch('/api/modulo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'lezione',
          email: indirizzo,
          nome: v.nome || '',
          richiesta: v.tipo || '',
          voce: v.voce || '',
          livello: v.livello || '',
          dove: v.dove || '',
          quando: v.quando || '',
          messaggio: testo(),
          lingua: document.documentElement.lang === 'it' ? 'it' : 'en',
          sito: ''
        })
      })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (esito) {
          if (esito && esito.ok) {
            manda.textContent = (document.documentElement.lang === 'it')
              ? 'Richiesta inviata. Ti rispondo io.'
              : 'Request sent. I’ll get back to you.';
            manda.classList.add('btn-fatto');
          } else {
            manda.textContent = etichetta;
            manda.removeAttribute('aria-disabled');
            window.location.href = manda.href;     /* ripiego: la posta */
          }
        })
        .catch(function () {
          manda.textContent = etichetta;
          manda.removeAttribute('aria-disabled');
          window.location.href = manda.href;
        });
      return;
    }

    var av = e.target.closest('[data-avanti]');
    if (av) {
      e.preventDefault();
      if (!completo(qui)) return;
      qui = Math.min(qui + 1, passi.length - 1);
      if (qui === passi.length - 1) riepiloga();
      disegna();
      modulo.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }
    var ind = e.target.closest('[data-indietro]');
    if (ind) {
      e.preventDefault();
      qui = Math.max(qui - 1, 0);
      disegna();
      modulo.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  });

  /* scegliendo una voce con il mouse si va avanti da soli: un passo in meno */
  modulo.addEventListener('change', function (e) {
    var g = e.target.closest('[data-serve]');
    if (g) g.classList.remove('manca');
  });

  modulo.classList.add('viva');
  disegna();
})();
