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
  var VERSIONE = 1;                 // alzala se cambi cosa viene raccolto

  /* ---------- memoria della scelta ---------- */

  function leggi() {
    try {
      var g = window.localStorage.getItem(CHIAVE);
      if (!g) return null;
      var o = JSON.parse(g);
      if (!o || o.v !== VERSIONE) return null;
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
      titolo: 'Cookie e misurazione',
      corpo: 'Questo sito funziona senza tracciamento. Se accetti, carichiamo il pixel di Meta ' +
             'per capire quali pagine interessano e per le campagne pubblicitarie su Facebook e ' +
             'Instagram. Se rifiuti, non parte nessuno script e il sito funziona lo stesso.',
      si: 'Accetto', no: 'Rifiuto', scegli: 'Cosa comporta',
      dettaglio: [
        'Sempre attivo: la memoria della tua scelta, salvata solo nel tuo browser.',
        'Solo se accetti: Meta Pixel (Facebook, Instagram) — misura le visite e i clic sui biglietti.',
        'I video sono serviti da youtube-nocookie.com e partono solo se li avvii tu.',
        'Puoi cambiare idea quando vuoi: il collegamento "Cookie" in fondo a ogni pagina.'
      ],
      privacy: 'Privacy e cookie', privacyHref: '/it/privacy.html'
    },
    en: {
      titolo: 'Cookies and measurement',
      corpo: 'This site runs without tracking. If you accept, we load the Meta pixel to see which ' +
             'pages are of interest and to run advertising on Facebook and Instagram. If you ' +
             'decline, nothing is loaded and the site works exactly the same.',
      si: 'Accept', no: 'Decline', scegli: 'What this means',
      dettaglio: [
        'Always on: the memory of your choice, kept only in your own browser.',
        'Only if you accept: Meta Pixel (Facebook, Instagram) — measures visits and ticket clicks.',
        'Videos are served from youtube-nocookie.com and only start when you press play.',
        'You can change your mind at any time: the "Cookies" link at the foot of every page.'
      ],
      privacy: 'Privacy and cookies', privacyHref: '/privacy.html'
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
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-labelledby', 'consenso-tit');
    banner.hidden = true;

    var wrap = document.createElement('div');
    wrap.className = 'wrap';

    var h = document.createElement('h2');
    h.id = 'consenso-tit';
    h.textContent = t.titolo;

    var p = document.createElement('p');
    p.textContent = t.corpo + ' ';
    var link = document.createElement('a');
    link.href = t.privacyHref;
    link.textContent = t.privacy;
    p.appendChild(link);

    var scelte = document.createElement('div');
    scelte.className = 'consenso-scelte';

    var bSi = document.createElement('button');
    bSi.type = 'button';
    bSi.setAttribute('data-consenso', 'si');
    bSi.textContent = t.si;

    var bNo = document.createElement('button');
    bNo.type = 'button';
    bNo.setAttribute('data-consenso', 'no');
    bNo.textContent = t.no;

    var dett = document.createElement('details');
    dett.className = 'consenso-dettaglio';
    var sum = document.createElement('summary');
    sum.textContent = t.scegli;
    var ul = document.createElement('ul');
    t.dettaglio.forEach(function (riga) {
      var li = document.createElement('li');
      li.textContent = riga;
      ul.appendChild(li);
    });
    dett.appendChild(sum);
    dett.appendChild(ul);

    scelte.appendChild(bSi);
    scelte.appendChild(bNo);
    wrap.appendChild(h);
    wrap.appendChild(p);
    wrap.appendChild(scelte);
    wrap.appendChild(dett);
    banner.appendChild(wrap);
    document.body.appendChild(banner);

    scelte.addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-consenso]');
      if (!b) return;
      var scelta = b.getAttribute('data-consenso');
      scrivi(scelta);
      chiudi();
      if (scelta === 'si') accendiPixel();
    });

    /* Esc = rifiuto, come il pulsante */
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
