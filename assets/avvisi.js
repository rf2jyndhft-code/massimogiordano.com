/* Iscrizione agli avvisi.

   Da quando il sito sta su Vercel la cosa funziona davvero: il modulo manda
   l'indirizzo a /api/modulo, una funzione che gira sul server e fa partire la
   mail. Prima il sito era fatto di sole pagine ferme e l'unica cosa possibile
   era aprire il programma di posta di chi legge — che su meta' dei telefoni
   non succede, e sembra che il sito sia rotto.

   Se la funzione non risponde (chiave mancante, rete giu'), si torna al
   programma di posta: meglio un giro in piu' che un messaggio perso. */

(function () {
  var aperta = Date.now();   /* quando la pagina e' stata caricata */
  'use strict';

  var POSTA = 'info@massimogiordano.com';

  function parole(it) {
    return it ? {
      oggetto: 'Iscrizione agli avvisi',
      corpo: 'Vorrei ricevere gli avvisi su concerti, incisioni e Minthis Music Festival.\n\nIndirizzo: ',
      manca: 'Scrivi il tuo indirizzo e spunta il consenso.',
      invio: 'Un momento…',
      fatto: 'Fatto: sei iscritto. Ti scrivo io quando c’è qualcosa da dire.',
      posta: 'Non sono riuscito a registrarti da qui. Si apre la posta: scrivi a'
    } : {
      oggetto: 'Mailing list',
      corpo: 'I would like to receive news about concerts, recordings and the Minthis Music Festival.\n\nEmail address: ',
      manca: 'Enter your address and tick the box.',
      invio: 'One moment…',
      fatto: 'Done — you are on the list. I’ll write when there is something to say.',
      posta: 'I couldn’t sign you up from here. Opening your mail app instead — write to'
    };
  }

  function avvia(form) {
    var email = form.querySelector('input[type=email]');
    var ok = form.querySelector('input[type=checkbox]');
    var tasto = form.querySelector('button[type=submit]');
    var p = parole(document.documentElement.lang === 'it');

    var voce = document.createElement('p');
    voce.className = 'nota';
    voce.setAttribute('role', 'status');
    voce.hidden = true;
    form.appendChild(voce);

    function dire(testo) {
      voce.textContent = testo;
      voce.hidden = false;
    }

    /* Ripiego: si apre il programma di posta con il messaggio gia' scritto, e
       l'indirizzo resta anche in pagina per chi la posta la tiene altrove. */
    function perLaPosta(indirizzo) {
      var href = 'mailto:' + POSTA
        + '?subject=' + encodeURIComponent(p.oggetto)
        + '&body=' + encodeURIComponent(p.corpo + indirizzo);

      var a = document.createElement('a');
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      voce.textContent = p.posta + ' ';
      var link = document.createElement('a');
      link.href = href;
      link.textContent = POSTA;
      link.target = '_blank';
      link.rel = 'noopener';
      voce.appendChild(link);
      voce.hidden = false;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!email.value || !email.checkValidity() || !ok.checked) {
        dire(p.manca);
        (email.value && email.checkValidity() ? ok : email).focus();
        return;
      }

      var indirizzo = email.value;
      if (tasto) tasto.disabled = true;
      dire(p.invio);

      fetch('/api/modulo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'avvisi',
          email: indirizzo,
          consenso: !!ok.checked,
          lingua: document.documentElement.lang === 'it' ? 'it' : 'en',
          sito: '',                     /* trappola antispam: resta vuota */
          /* da quanto e' aperta la pagina: un robot manda in zero secondi */
          ms: Date.now() - aperta
        })
      })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (esito) {
          if (esito && esito.ok) {
            form.reset();
            dire(p.fatto);
            if (window.fbq) window.fbq('track', 'Lead', { content_name: 'avvisi-email' });
          } else {
            perLaPosta(indirizzo);
          }
        })
        .catch(function () { perLaPosta(indirizzo); })
        .then(function () { if (tasto) tasto.disabled = false; });
    });
  }

  var f = document.querySelectorAll('form[data-avvisi]');
  for (var i = 0; i < f.length; i++) avvia(f[i]);
})();
