/* In home il nome non compare due volte.
   La barra parte senza, e lo fa salire quando la fotografia esce dalla vista.
   Nelle altre pagine la barra ha il nome da subito: li' serve a orientarsi. */
(function () {
  var barra = document.querySelector('.topbar[data-home]');
  if (!barra) return;

  var eroe = document.querySelector('.hero');
  if (!eroe) return;

  barra.classList.add('nome-nascosto');

  function mostra(si) {
    barra.classList.toggle('nome-visibile', si);
  }

  /* Se il visitatore ha chiesto meno animazioni, il nome c'e' e basta. */
  var lento = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (lento.matches) { barra.classList.remove('nome-nascosto'); return; }

  if ('IntersectionObserver' in window) {
    /* scatta quando l'ultimo filo di fotografia esce da sotto la barra */
    new IntersectionObserver(function (voci) {
      mostra(!voci[0].isIntersecting);
    }, { rootMargin: '-72px 0px 0px 0px', threshold: 0 }).observe(eroe);
  } else {
    var controlla = function () {
      mostra(window.scrollY > eroe.offsetHeight - 72);
    };
    window.addEventListener('scroll', controlla, { passive: true });
    controlla();
  }
})();
