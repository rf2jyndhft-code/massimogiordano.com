/* Lente della galleria: finestra <dialog> nativa, nessuna libreria.
   Esc chiude (comportamento nativo), frecce per scorrere, il fuoco torna
   alla miniatura da cui si e' partiti. */
(function () {
  var griglie = document.querySelectorAll('[data-gal]');
  if (!griglie.length || !window.HTMLDialogElement) return;

  var scatti = [];
  griglie.forEach(function (g) {
    Array.prototype.forEach.call(g.querySelectorAll('button.shot'), function (b) {
      scatti.push(b);
    });
  });
  if (!scatti.length) return;

  var dlg = document.createElement('dialog');
  dlg.className = 'lens';
  dlg.innerHTML =
    '<img alt="">' +
    '<p class="lens-cap"></p>' +
    '<div class="lens-bar">' +
      '<button type="button" data-l>&#8592; <span data-t-prev>Previous</span></button>' +
      '<button type="button" data-c><span data-t-close>Close</span></button>' +
      '<button type="button" data-r><span data-t-next>Next</span></button>' +
    '</div>';
  document.body.appendChild(dlg);

  var im = dlg.querySelector('img');
  var cap = dlg.querySelector('.lens-cap');
  var attivo = 0, tornaA = null;

  var t = document.documentElement.lang === 'it'
    ? { prev: 'Precedente', close: 'Chiudi', next: 'Successiva' }
    : { prev: 'Previous', close: 'Close', next: 'Next' };
  dlg.querySelector('[data-t-prev]').textContent = t.prev;
  dlg.querySelector('[data-t-close]').textContent = t.close;
  dlg.querySelector('[data-t-next]').textContent = t.next;

  function apri(n) {
    attivo = (n + scatti.length) % scatti.length;
    var b = scatti[attivo];
    im.src = b.dataset.full;
    im.alt = b.querySelector('img').alt;
    im.width = b.dataset.fw; im.height = b.dataset.fh;
    cap.innerHTML = b.dataset.cap || '';
    if (!dlg.open) { tornaA = b; dlg.showModal(); }
  }

  scatti.forEach(function (b, k) {
    b.addEventListener('click', function () { apri(k); });
  });
  dlg.querySelector('[data-l]').addEventListener('click', function () { apri(attivo - 1); });
  dlg.querySelector('[data-r]').addEventListener('click', function () { apri(attivo + 1); });
  dlg.querySelector('[data-c]').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { apri(attivo - 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { apri(attivo + 1); e.preventDefault(); }
  });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { if (tornaA) tornaA.focus(); });
})();
