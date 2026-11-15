/* La barra alta — nome grande e menu sotto — vive in cima alla pagina e se ne
   va scorrendo, come qualunque altra cosa. Quando e' uscita, dall'alto scende
   una barra sottile GIA' FATTA.

   Perche' due barre e non una che si trasforma: una barra sola che passa da
   due righe a una deve spostare il nome dal centro a sinistra e il menu da
   sotto a destra, tutto mentre la guardi. Quel rimescolio e' sgradevole anche
   fatto bene (segnalato il 12 novembre 2026: "impazzisce nella transizione").
   Cosi' invece non si muove niente: una esce, l'altra entra. */
(function () {
  var alta = document.querySelector('.topbar');
  if (!alta || alta.classList.contains('topbar-fissa')) return;

  var telefono = window.matchMedia('(max-width:760px)');

  /* la copia sottile: stessa barra, gia' in forma compatta */
  var fissa = alta.cloneNode(true);
  fissa.classList.add('topbar-fissa', 'compatta');
  fissa.setAttribute('aria-hidden', 'true');
  /* da tastiera si usa quella vera, in cima: la copia non intercetta il giro */
  Array.prototype.forEach.call(fissa.querySelectorAll('a,button'), function (e) {
    e.setAttribute('tabindex', '-1');
  });
  document.body.appendChild(fissa);

  var giu = false;

  /* La sottile scende nell'istante in cui l'alta esce dallo schermo: una
     passa il testimone all'altra, senza attesa in mezzo. */
  function guarda() {
    if (telefono.matches) {
      if (giu) { fissa.classList.remove('giu'); giu = false; }
      return;
    }
    var alt = alta.offsetHeight || 120;
    var y = window.scrollY || window.pageYOffset || 0;
    if (!giu && y > alt - 2) { fissa.classList.add('giu'); giu = true; }
    else if (giu && y < alt - 26) { fissa.classList.remove('giu'); giu = false; }
  }

  var inCoda = false;
  function alProssimoFotogramma() {
    if (inCoda) return;
    inCoda = true;
    requestAnimationFrame(function () { inCoda = false; guarda(); });
  }

  window.addEventListener('scroll', alProssimoFotogramma, { passive: true });
  window.addEventListener('resize', alProssimoFotogramma, { passive: true });
  if (telefono.addEventListener) telefono.addEventListener('change', guarda);

  document.documentElement.classList.add('barra-viva');
  guarda();
})();
