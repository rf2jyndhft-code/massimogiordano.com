/* ---------------------------------------------------------------
   video.js — i video partono solo quando li chiedi tu.

   Prima questa pagina incorporava due <iframe> di YouTube. Anche con
   youtube-nocookie.com, l'iframe contatta i server di Google appena la
   pagina si apre: e' una richiesta a un terzo fatta senza consenso, e
   sono due file pesanti che nessuno ha chiesto.

   Adesso al loro posto c'e' un riquadro disegnato in CSS. L'iframe
   viene creato solo al clic, e solo allora parte la prima richiesta.
   --------------------------------------------------------------- */
(function () {
  'use strict';
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('[data-video]') : null;
    if (!b) return;
    var id = b.getAttribute('data-video');
    if (!/^[A-Za-z0-9_-]{6,20}$/.test(id)) return;

    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id +
            '?autoplay=1&rel=0&modestbranding=1';
    f.title = b.getAttribute('data-titolo') || 'Video';
    f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.setAttribute('allowfullscreen', '');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    b.replaceWith(f);
    f.focus();

    if (window.MG && window.MG.evento) {
      window.MG.evento('ViewContent', {content_type: 'video', content_name: f.title});
    }
  });
})();
