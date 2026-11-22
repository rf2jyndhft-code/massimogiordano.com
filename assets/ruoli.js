/* LE FOTOGRAFIE CHE GIRANO DIETRO AL REPERTORIO
   Otto scatti di scena scelti da Massimo, uno ogni otto secondi, in
   dissolvenza. Stanno dentro la loro sezione e non escono: lezione
   della biografia, dove uno sfondo fisso finiva sempre per coprire
   qualcos'altro. */
(function () {
  'use strict';
  var fondo = document.querySelector('.rep-sfondo');
  if (!fondo) return;
  var foto = [].slice.call(fondo.querySelectorAll('img'));
  if (foto.length < 2) return;
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) {
    foto[0].classList.add('viva');
    return;
  }
  var i = 0;
  foto[0].classList.add('viva');
  setInterval(function () {
    foto[i].classList.remove('viva');
    i = (i + 1) % foto.length;
    foto[i].classList.add('viva');
  }, 8000);
})();
