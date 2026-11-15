/* Tre fotografie accanto a una colonna di testo.

   Il foglio di stile da solo non ce la fa: un'immagine porta con se' la
   propria altezza e la impone alla riga, cosi' la colonna delle foto o
   sborda sotto il testo o lascia un buco. Qui misuriamo quanto e' alto il
   testo, togliamo lo spazio delle didascalie e degli stacchi, e dividiamo
   il resto in parti uguali. Si rifa' a ogni cambio di larghezza.

   Sotto i 900px le colonne vanno una sotto l'altra e non serve niente. */
(function () {
  var pile = document.querySelectorAll('.foto-pila');
  if (!pile.length) return;

  function sistema() {
    Array.prototype.forEach.call(pile, function (pila) {
      var testo = pila.parentElement && pila.parentElement.firstElementChild;
      if (!testo || testo === pila) return;
      var figure = pila.querySelectorAll('figure');
      var imgs = pila.querySelectorAll('figure > img');
      if (!imgs.length) return;

      if (window.innerWidth < 900) {
        Array.prototype.forEach.call(imgs, function (im) { im.style.height = ''; });
        return;
      }

      /* quanto spazio prendono didascalie e stacchi, senza le immagini */
      var extra = 0;
      Array.prototype.forEach.call(figure, function (fig, k) {
        var cap = fig.querySelector('figcaption');
        if (cap) extra += cap.getBoundingClientRect().height +
                          parseFloat(getComputedStyle(cap).marginTop || 0);
        if (k < figure.length - 1) extra += parseFloat(getComputedStyle(fig).marginBottom || 0);
      });

      /* ATTENZIONE: il riquadro del testo e' stirato quanto la riga, quindi
         misurarlo direttamente darebbe l'altezza delle foto stesse. Si misura
         invece il contenuto: dal primo paragrafo all'ultimo. */
      var figli = testo.children;
      var alto = 0;
      if (figli.length) {
        alto = figli[figli.length - 1].getBoundingClientRect().bottom
             - figli[0].getBoundingClientRect().top;
      }
      var spazio = alto - extra;
      var h = Math.floor(spazio / imgs.length);
      if (h < 140) h = 140;                 /* sotto questa misura non si capisce piu' nulla */
      Array.prototype.forEach.call(imgs, function (im) { im.style.height = h + 'px'; });

      /* Seconda passata: i conti su margini e didascalie non tornano mai al
         pixel, allora si guarda il risultato vero e si corregge. */
      var fs = pila.children;
      var altoPila = fs.length
        ? fs[fs.length - 1].getBoundingClientRect().bottom - fs[0].getBoundingClientRect().top
        : 0;
      var resto = altoPila - alto;
      if (Math.abs(resto) > 2) {
        h = Math.max(140, h - Math.ceil(resto / imgs.length));
        Array.prototype.forEach.call(imgs, function (im) { im.style.height = h + 'px'; });
      }
    });
  }

  if (document.readyState === 'complete') sistema();
  else window.addEventListener('load', sistema);
  document.addEventListener('DOMContentLoaded', sistema);

  var attesa = null;
  window.addEventListener('resize', function () {
    clearTimeout(attesa);
    attesa = setTimeout(sistema, 120);
  }, { passive: true });
})();
