/* Iscrizione agli avvisi.

   Due modi, e il modulo sceglie da solo.

   1. SERVIZIO VERO (Brevo e simili). Se sul <form> c'e' data-endpoint con un
      indirizzo che comincia per https, l'iscrizione parte da sola: il servizio
      manda la mail di conferma, tiene l'elenco e mette il tasto di disiscrizione
      in fondo a ogni messaggio. La risposta del servizio non si puo' leggere da
      un altro dominio, quindi non si finge di saperla: si dice a chi si iscrive
      di aspettare la mail di conferma, che e' la cosa vera che deve succedere.

   2. SENZA SERVIZIO. Finche' data-endpoint e' vuoto, il tasto apre il programma
      di posta di chi legge con la richiesta gia' scritta. Non si raccoglie un
      indirizzo per poi buttarlo via.

   PER ACCENDERE IL SERVIZIO: su Brevo, Moduli -> crea il modulo -> "Condividi" ->
   copia l'indirizzo che finisce per sibforms.com/serve/... e mettilo dentro
   data-endpoint nei due contatti (contact.html e it/contatti.html). Nient'altro.
   Il nome del campo lo si cambia con data-campo se il servizio ne vuole un altro
   (Brevo usa EMAIL). */

(function () {
  'use strict';

  var POSTA = 'info@massimogiordano.com';

  function parole(it) {
    return it ? {
      oggetto: 'Iscrizione agli avvisi',
      corpo: 'Vorrei ricevere gli avvisi su concerti, incisioni e Minthis Music Festival.\n\nIndirizzo: ',
      manca: 'Scrivi il tuo indirizzo e spunta il consenso.',
      posta: 'Per ora le iscrizioni si prendono per posta: scrivi a',
      invio: 'Un momento…',
      conferma: 'Ci siamo quasi: controlla la posta e apri il collegamento di conferma.',
      guasto: 'Qualcosa non ha funzionato. Scrivi a ' + POSTA + ' e ti iscrivo io.'
    } : {
      oggetto: 'Mailing list',
      corpo: 'I would like to receive news about concerts, recordings and the Minthis Music Festival.\n\nEmail address: ',
      manca: 'Enter your address and tick the box.',
      posta: 'For now subscriptions are taken by email: write to',
      invio: 'One moment…',
      conferma: 'Almost there: check your inbox and open the confirmation link.',
      guasto: 'Something went wrong. Write to ' + POSTA + ' and I will add you myself.'
    };
  }

  function avvia(form) {
    var email = form.querySelector('input[type=email]');
    var ok = form.querySelector('input[type=checkbox]');
    var tasto = form.querySelector('button[type=submit]');
    var dove = (form.getAttribute('data-endpoint') || '').trim();
    var campo = form.getAttribute('data-campo') || 'EMAIL';
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

    function offriLaPosta(indirizzo) {
      voce.textContent = p.posta + ' ';
      var a = document.createElement('a');
      a.href = 'mailto:' + POSTA
        + '?subject=' + encodeURIComponent(p.oggetto)
        + '&body=' + encodeURIComponent(p.corpo + indirizzo);
      a.textContent = POSTA;
      a.target = '_blank';
      a.rel = 'noopener';
      voce.appendChild(a);
      voce.hidden = false;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!email.value || !email.checkValidity() || !ok.checked) {
        dire(p.manca);
        (email.value && email.checkValidity() ? ok : email).focus();
        return;
      }

      if (dove.indexOf('https://') !== 0) {
        /* Nessun servizio collegato. NON si fa saltare la pagina a un mailto:
           dentro un riquadro protetto quella navigazione muore e sembra che il
           sito si sia rotto. Si mette in pagina un collegamento, e decide chi
           legge se aprirlo. */
        offriLaPosta(email.value);
        return;
      }

      var dati = new FormData();
      dati.append(campo, email.value);
      dati.append('OPT_IN', '1');
      dati.append('email_address_check', '');   /* trappola antispam di Brevo: va vuota */
      dati.append('locale', document.documentElement.lang || 'en');

      if (tasto) tasto.disabled = true;
      dire(p.invio);

      /* la risposta arriva da un altro dominio ed e' opaca: non si puo' leggere.
         Quello che conta e' che la richiesta sia partita; la conferma vera la da'
         il servizio con la sua mail. */
      fetch(dove, { method: 'POST', mode: 'no-cors', body: dati })
        .then(function () {
          form.reset();
          dire(p.conferma);
          if (window.fbq) window.fbq('track', 'Lead', { content_name: 'avvisi-email' });
        })
        .catch(function () {
          dire(p.guasto);
        })
        .then(function () {
          if (tasto) tasto.disabled = false;
        });
    });
  }

  var f = document.querySelectorAll('form[data-avvisi-mailto]');
  for (var i = 0; i < f.length; i++) avvia(f[i]);
})();
