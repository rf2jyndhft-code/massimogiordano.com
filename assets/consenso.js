/* ---------------------------------------------------------------
   consenso.js — banner di consenso e Meta Pixel
   massimogiordano.com

   REGOLA UNICA DI QUESTO FILE:
   finche' il visitatore non ha accettato, NON parte nessuno script
   di tracciamento e non viene fatta NESSUNA chiamata a server terzi.
   Massimo e' residente italiano, Laimtee e' cipriota: siamo dentro
   il GDPR e la direttiva ePrivacy. Il rifiuto deve costare un clic
   come l'accettazione.

   ------------------------------------------------------------------
   COME SI ACCENDE IL PIXEL — istruzioni per chi mette mano dopo
   ------------------------------------------------------------------
   1. Crea il pixel in Meta Business (vedi GOOGLE.md, sezione
      "Il pixel di Meta"). Ottieni un numero di 15-16 cifre.
   2. Sostituisci qui sotto la stringa META_PIXEL_ID con quel numero,
      virgolette comprese. Esempio:  var PIXEL_ID = '1234567890123456';
   3. Non toccare altro. Il resto si accende da solo.

   Finche' PIXEL_ID vale 'META_PIXEL_ID' lo script non carica niente,
   nemmeno dopo l'accettazione: scrive solo una riga in console.
   Cosi' il sito puo' essere pubblicato oggi senza rischi.

   Il pixel di Laimtee (1038688217630210) NON va messo qui: e' di
   un'altra societa' e di un altro dominio.
   --------------------------------------------------------------- */
(function () {
  'use strict';

  var PIXEL_ID = 'META_PIXEL_ID';   // <-- il solo valore da cambiare
  var CHIAVE = 'mg-consenso';       // dove si ricorda la scelta
  var VERSIONE = 2;                 // alzala se cambi cosa viene raccolto
  var MESI = 6;                     // dopo sei mesi la scelta va richiesta di nuovo

  /* ---------- memoria della scelta ---------- */

  function leggi() {
    try {
      var g = window.localStorage.getItem(CHIAVE);
      if (!g) return null;
      var o = JSON.parse(g);
      if (!o || o.v !== VERSIONE) return null;
      /* Le linee guida del Garante (9 giugno 2021) dicono di non riproporre il
         banner a chi ha gia' risposto, ma di tornare a chiedere dopo sei mesi.
         Una scelta vecchia vale come nessuna scelta. */
      var quando = Date.parse(o.data || '');
      if (quando) {
        var scade = new Date(quando);
        scade.setMonth(scade.getMonth() + MESI);
        if (Date.now() > scade.getTime()) return null;
      }
      return o.scelta === 'si' ? 'si' : 'no';
    } catch (e) { return null; }
  }

  function scrivi(scelta) {
    try {
      window.localStorage.setItem(CHIAVE, JSON.stringify({
        v: VERSIONE, scelta: scelta, data: new Date().toISOString()
      }));
    } catch (e) { /* navigazione privata: la scelta vale per questa visita */ }
  }

  /* ---------- il pixel ---------- */

  var pixelAcceso = false;

  function accendiPixel() {
    if (pixelAcceso) return;
    if (PIXEL_ID === 'META_PIXEL_ID' || !/^\d{10,20}$/.test(PIXEL_ID)) {
      console.info('[consenso] Consenso dato, ma il Meta Pixel non e\' ancora ' +
                   'configurato: in assets/consenso.js sostituisci META_PIXEL_ID ' +
                   'con il numero del pixel. Nessuna chiamata esterna effettuata.');
      return;
    }
    pixelAcceso = true;

    /* loader ufficiale di Meta — gira solo da qui, mai all'avvio */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
    svuotaCoda();
  }

  /* Eventi del sito. Si possono chiamare sempre: se il consenso non
     c'e', restano in coda e non escono dal browser; se non arriva
     mai, muoiono con la pagina. */
  var coda = [];

  function evento(nome, dati) {
    if (pixelAcceso && window.fbq) {
      window.fbq('track', nome, dati || {});
    } else {
      coda.push([nome, dati || {}]);
      if (coda.length > 40) coda.shift();
    }
  }

  function svuotaCoda() {
    if (!pixelAcceso || !window.fbq) return;
    /* PageView l'abbiamo gia' mandato in accendiPixel */
    coda.filter(function (c) { return c[0] !== 'PageView'; })
        .forEach(function (c) { window.fbq('track', c[0], c[1]); });
    coda = [];
  }

  /* resa pubblica: onclick="MG.evento('ViewContent',{...})" */
  window.MG = window.MG || {};
  window.MG.evento = evento;
  window.MG.consenso = leggi;

  /* ---------- aggancio automatico degli eventi utili ---------- */

  function agganciaEventi() {
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest ? ev.target.closest('a,button') : null;
      if (!a) return;

      /* clic sui biglietti */
      if (a.hasAttribute('data-biglietti')) {
        evento('InitiateCheckout', {
          content_name: a.getAttribute('data-evento') || a.textContent.trim(),
          content_category: 'biglietti'
        });
      }
      /* clic sui profili social */
      if (a.closest('.social')) {
        evento('Contact', { content_category: 'social' });
      }
      /* clic su un indirizzo email */
      if (a.getAttribute && (a.getAttribute('href') || '').indexOf('mailto:') === 0) {
        evento('Contact', { content_category: 'email' });
      }
    }, true);

    /* invio del modulo contatti e iscrizione agli avvisi */
    document.addEventListener('submit', function (ev) {
      var f = ev.target;
      if (!f || !f.getAttribute) return;
      if (f.hasAttribute('data-avvisi')) {
        evento('Lead', { content_name: 'avvisi-email' });
      } else if (f.hasAttribute('data-contatti')) {
        evento('Contact', { content_category: 'modulo' });
      }
    }, true);
  }

  /* ---------- il banner ---------- */

  var TESTI = {
    it: {
      titolo: 'Privacy e cookie',
      corpo: 'Questo sito non mette cookie pubblicitari propri e funziona per intero ' +
             'anche se rifiuti. Con il tuo consenso carica il pixel di Meta, per capire ' +
             'quali pagine interessano e per la pubblicit\u00e0 su Facebook e Instagram.',
      si: 'Accetta', no: 'Rifiuta', scegli: 'Scegli', salva: 'Salva le scelte',
      titolare: 'Titolare del trattamento: Massimo Giordano',
      privacy: 'Informativa completa', privacyHref: '/it/privacy.html',
      voci: [
        { id: 'tecnici', sempre: true,
          nome: 'Tecnici',
          stato: 'sempre attivi',
          testo: 'Solo la memoria della risposta che dai qui, salvata nel tuo browser ' +
                 'sotto il nome mg-consenso. Non esce dal tuo dispositivo e non arriva ' +
                 'a nessuno. Senza, il banner tornerebbe a ogni pagina.' },
        { id: 'misura', sempre: false,
          nome: 'Misurazione e pubblicit\u00e0',
          stato: 'facoltativi',
          testo: 'Pixel di Meta Platforms Ireland Limited. Registra le pagine viste e ' +
                 'alcuni clic (biglietti, contatti, social). Mette cookie propri e ' +
                 'condivide dati con Meta, che pu\u00f2 trattarli fuori dall\u2019Unione Europea. ' +
                 'Se lo lasci spento, verso Meta non parte nessuna richiesta.' }
      ],
      coda: 'Puoi cambiare idea quando vuoi dal collegamento Cookie in fondo a ogni pagina. ' +
            'Trascorsi sei mesi la domanda torna.'
    },
    en: {
      titolo: 'Privacy and cookies',
      corpo: 'This site sets no advertising cookies of its own and works in full even ' +
             'if you decline. With your consent it loads the Meta pixel, to see which ' +
             'pages draw interest and for advertising on Facebook and Instagram.',
      si: 'Accept', no: 'Decline', scegli: 'Choose', salva: 'Save choices',
      titolare: 'Data controller: Massimo Giordano',
      privacy: 'Full privacy notice', privacyHref: '/privacy.html',
      voci: [
        { id: 'tecnici', sempre: true,
          nome: 'Technical',
          stato: 'always on',
          testo: 'Only the answer you give here, kept in your browser under the name ' +
                 'mg-consenso. It never leaves your device and reaches no one. Without ' +
                 'it this banner would return on every page.' },
        { id: 'misura', sempre: false,
          nome: 'Measurement and advertising',
          stato: 'optional',
          testo: 'Meta pixel, from Meta Platforms Ireland Limited. It records pages ' +
                 'viewed and some clicks (tickets, contacts, social). It sets its own ' +
                 'cookies and shares data with Meta, which may process it outside the ' +
                 'European Union. Left off, no request reaches Meta at all.' }
      ],
      coda: 'You can change your mind at any time from the Cookies link at the foot of ' +
            'every page. After six months the question comes back.'
    }
  };

  function lingua() {
    return (document.documentElement.lang || 'en').slice(0, 2) === 'it' ? 'it' : 'en';
  }

  var banner = null;

  function costruisci() {
    if (banner) return banner;
    var t = TESTI[lingua()];

    banner = document.createElement('aside');
    banner.className = 'consenso';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'consenso-tit');
    banner.hidden = true;

    var wrap = document.createElement('div');
    wrap.className = 'wrap';

    var h = document.createElement('h2');
    h.id = 'consenso-tit';
    h.textContent = t.titolo;

    var p = document.createElement('p');
    p.textContent = t.corpo;

    /* il pannello con le due categorie, chiuso finche' non lo si apre */
    var dett = document.createElement('div');
    dett.className = 'consenso-dettaglio';
    dett.hidden = true;

    var interruttori = {};
    t.voci.forEach(function (v) {
      var riga = document.createElement('div');
      riga.className = 'consenso-voce';

      var testa = document.createElement('div');
      testa.className = 'consenso-voce-testa';

      var nome = document.createElement('b');
      nome.textContent = v.nome;

      var stato = document.createElement('span');
      stato.className = 'consenso-stato';

      if (v.sempre) {
        stato.textContent = v.stato;
        testa.appendChild(nome);
        testa.appendChild(stato);
      } else {
        var eti = document.createElement('label');
        eti.className = 'consenso-switch';
        var box = document.createElement('input');
        box.type = 'checkbox';
        box.setAttribute('data-voce', v.id);
        var pista = document.createElement('span');
        pista.className = 'consenso-pista';
        pista.setAttribute('aria-hidden', 'true');
        var testoEti = document.createElement('span');
        testoEti.className = 'sr-only';
        testoEti.textContent = v.nome;
        eti.appendChild(box);
        eti.appendChild(pista);
        eti.appendChild(testoEti);
        interruttori[v.id] = box;
        testa.appendChild(nome);
        testa.appendChild(eti);
      }

      var testo = document.createElement('p');
      testo.className = 'consenso-voce-testo';
      testo.textContent = v.testo;

      riga.appendChild(testa);
      riga.appendChild(testo);
      dett.appendChild(riga);
    });

    /* Il piede era tre righe di testo legale sotto i pulsanti: pesante da
       leggere e brutto da vedere. Resta il solo collegamento all'informativa,
       che e' l'unica cosa davvero richiesta nel banner. Il titolare del
       trattamento e il fatto che la scelta si possa cambiare stanno scritti
       dentro l'informativa, a un clic da qui. */
    var piede = document.createElement('p');
    piede.className = 'consenso-piede';
    var link = document.createElement('a');
    link.href = t.privacyHref;
    link.textContent = t.privacy;
    piede.appendChild(link);

    /* i pulsanti: accettare e rifiutare hanno lo stesso peso, come chiede il
       Garante. "Scegli" e' terziario e apre il pannello qui sopra. */
    var scelte = document.createElement('div');
    scelte.className = 'consenso-scelte';

    function tasto(valore, testo, classe) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-consenso', valore);
      b.textContent = testo;
      if (classe) b.className = classe;
      return b;
    }

    var bSi = tasto('si', t.si);
    var bNo = tasto('no', t.no);
    var bScegli = tasto('scegli', t.scegli, 'consenso-terzo');
    var bSalva = tasto('salva', t.salva);
    bSalva.hidden = true;

    scelte.appendChild(bSi);
    scelte.appendChild(bNo);
    scelte.appendChild(bScegli);
    scelte.appendChild(bSalva);

    wrap.appendChild(h);
    wrap.appendChild(p);
    wrap.appendChild(dett);
    /* Il link all'informativa sta nella stessa riga dei pulsanti, spinto
       all'altro capo: non e' una scelta, quindi non deve sembrare un tasto,
       ma nemmeno appiccicato sotto ad Accetta. */
    scelte.appendChild(piede);
    wrap.appendChild(scelte);
    banner.appendChild(wrap);
    document.body.appendChild(banner);

    scelte.addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-consenso]');
      if (!b) return;
      var quale = b.getAttribute('data-consenso');

      if (quale === 'scegli') {
        dett.hidden = false;
        bScegli.hidden = true;
        bSalva.hidden = false;
        document.body.style.paddingBottom = banner.offsetHeight + 'px';
        var primo = dett.querySelector('input[type=checkbox]');
        if (primo) primo.focus();
        return;
      }

      var scelta;
      if (quale === 'salva') {
        scelta = (interruttori.misura && interruttori.misura.checked) ? 'si' : 'no';
      } else {
        scelta = quale;
      }
      scrivi(scelta);
      chiudi();
      if (scelta === 'si') accendiPixel();
    });

    /* Esc chiude senza accettare: equivale a rifiutare, e si ricorda */
    banner.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { scrivi('no'); chiudi(); }
    });

    return banner;
  }

  var tornaA = null;

  function apri(origine) {
    costruisci();
    tornaA = origine || null;
    banner.hidden = false;
    /* lascia respirare il contenuto dietro al banner, telefono compreso */
    document.body.style.paddingBottom = banner.offsetHeight + 'px';
    var primo = banner.querySelector('button[data-consenso="si"]');
    if (primo) primo.focus();
  }

  function chiudi() {
    if (!banner) return;
    banner.hidden = true;
    document.body.style.paddingBottom = '';
    if (tornaA && document.contains(tornaA)) tornaA.focus();
    tornaA = null;
  }

  /* collegamento "Cookie" nel footer: riapre la scelta */
  function agganciaRiapertura() {
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest ? ev.target.closest('[data-riapri-consenso]') : null;
      if (!a) return;
      ev.preventDefault();
      apri(a);
    });
  }

  /* ---------- avvio ---------- */

  function avvia() {
    agganciaEventi();
    agganciaRiapertura();
    var scelta = leggi();
    if (scelta === 'si') { accendiPixel(); }
    else if (scelta === null) { apri(null); }
    /* scelta === 'no': non si fa niente e non si richiede piu' */
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', avvia);
  } else {
    avvia();
  }
})();
