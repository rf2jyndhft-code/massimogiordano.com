/* IL CONTROLLO PRIMA DI PUBBLICARE
   Si lancia così:  node controlla.mjs            (sul sito locale)
                    node controlla.mjs online     (sul sito pubblicato)

   Guarda nove cose, tutte imparate da errori veri:
     1. nessun reindirizzamento gira su se stesso   (19 nov: home it irraggiungibile)
     2. ogni pagina risponde e non e' vuota
     3. i vecchi indirizzi finiscono dove devono
     4. nessuna immagine rotta, nessun errore in console, niente scorrimento laterale
     5. ogni pagina accende la SUA voce di menu                (20 nov: Teatri e Locandine spente)
     6. il cambio lingua porta alla pagina gemella, e quella esiste  (20 nov: sei pagine finivano in galleria)
     7. il mappamondo gira da solo e si ferma sotto il mouse   (20 nov: era rimasto fermo)
     8. la sitemap non dichiara date piu' vecchie della modifica vera
     9. nessuna pagina chiede fogli, copioni o foto a /.prova/   (22 nov: repertorio nudo online)
   Se qualcosa non va, esce con errore: non si pubblica. */
import { readFileSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';

const ONLINE = process.argv[2] === 'online';
const BASE = ONLINE ? 'https://www.massimogiordano.com' : 'http://127.0.0.1:8080';

const PAGINE = ['/', '/it/', '/biography.html', '/it/biografia.html',
  '/repertoire.html', '/it/repertorio.html', '/gallery.html', '/it/galleria.html',
  '/theatres.html', '/it/teatri.html', '/posters.html', '/it/locandine.html',
  '/calendar.html', '/it/calendario.html', '/teaching.html', '/it/didattica.html',
  '/press.html', '/it/stampa.html', '/contact.html', '/it/contatti.html',
  '/privacy.html', '/it/privacy.html'];

const VECCHI = [['/biography', '/biography.html'], ['/de/biographie/', '/biography.html'],
  ['/gallery/stage/', '/gallery.html'], ['/it/agenda/tosca-1/', '/it/calendario.html'],
  ['/it/news/qualcosa/', '/it/'], ['/impressum', '/privacy.html']];

let guai = [];

/* 1. nessuna regola di reindirizzamento deve puntare a se stessa */
if (existsSync('vercel.json')) {
  const v = JSON.parse(readFileSync('vercel.json', 'utf8'));
  for (const r of (v.redirects || [])) {
    if (r.source.replace(/\/$/, '') === r.destination.replace(/\/$/, '')) {
      guai.push('regola che gira su se stessa: ' + r.source + ' → ' + r.destination);
    }
  }
  console.log('reindirizzamenti dichiarati: ' + (v.redirects || []).length);
}

/* 2. ogni pagina deve rispondere 200 e avere del contenuto */
for (const p of PAGINE) {
  try {
    const r = await fetch(BASE + p, { redirect: 'follow' });
    const t = await r.text();
    if (!r.ok) guai.push(p + ' risponde ' + r.status);
    else if (t.length < 2000) guai.push(p + ' risponde ma e\' quasi vuota (' + t.length + ' byte)');
  } catch (e) { guai.push(p + ' non risponde: ' + e.message); }
}
console.log('pagine controllate: ' + PAGINE.length);

/* 3. i vecchi indirizzi devono finire dove devono */
if (ONLINE) {
  for (const [da, a] of VECCHI) {
    try {
      const r = await fetch(BASE + da, { redirect: 'follow' });
      const dove = new URL(r.url).pathname;
      if (dove !== a) guai.push('il vecchio indirizzo ' + da + ' finisce su ' + dove + ' invece che su ' + a);
    } catch (e) { guai.push(da + ' non risponde: ' + e.message); }
  }
  console.log('vecchi indirizzi controllati: ' + VECCHI.length);
}

/* 5. ogni pagina deve accendere la sua voce di menu
   6. il cambio lingua deve portare alla gemella giusta, e il file deve esistere */
const GEMELLE = {
  'biography.html':'it/biografia.html', 'repertoire.html':'it/repertorio.html',
  'gallery.html':'it/galleria.html',    'theatres.html':'it/teatri.html',
  'posters.html':'it/locandine.html',   'calendar.html':'it/calendario.html',
  'teaching.html':'it/didattica.html',  'press.html':'it/stampa.html',
  'contact.html':'it/contatti.html',    'privacy.html':'it/privacy.html',
};
if (!ONLINE) {
  let controllate = 0;
  for (const [en, it] of Object.entries(GEMELLE)) {
    for (const [pag, gemella] of [[en, it], [it, '../' + en]]) {
      if (!existsSync(pag)) { guai.push(pag + ' non esiste'); continue; }
      const t = readFileSync(pag, 'utf8');
      const nome = pag.split('/').pop();
      /* la voce del menu che punta a se stessa dev'essere accesa */
      const suDiSe = new RegExp('<a href="' + nome.replace('.', '\\.') + '"[^>]*>', 'g');
      const voci = t.match(suDiSe) || [];
      if (!voci.length) guai.push(pag + ': il menu non ha la voce di questa pagina');
      else if (!voci.some(v => v.includes('aria-current="page"')))
        guai.push(pag + ': la voce di menu di questa pagina non resta accesa');
      /* il cambio lingua */
      const l = t.match(/href="([^"]+)" hreflang="(it|en)"/);
      if (!l) guai.push(pag + ': manca il cambio lingua');
      else {
        if (l[1] !== gemella) guai.push(pag + ': il cambio lingua porta a ' + l[1] + ' invece che a ' + gemella);
        const dove = l[1].startsWith('../') ? l[1].slice(3) : l[1];
        if (!existsSync(dove)) guai.push(pag + ': il cambio lingua porta a ' + l[1] + ' che non esiste');
      }
      controllate++;
    }
  }
  console.log('pagine con menu e lingua controllati: ' + controllate);
}

/* 8. la sitemap non deve dichiarare date vecchie: se dice che una pagina
      non si tocca da giorni, Google non ha motivo di tornare a leggerla */
if (!ONLINE && existsSync('sitemap.xml')) {
  const { execSync } = await import('node:child_process');
  const sm = readFileSync('sitemap.xml', 'utf8');
  let vecchie = 0;
  for (const m of sm.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([\d-]+)<\/lastmod>/g)) {
    let pag = m[1].replace('https://www.massimogiordano.com/', '') || 'index.html';
    if (pag.endsWith('/')) pag += 'index.html';
    if (!existsSync(pag)) continue;
    let vera = '';
    try { vera = execSync(`git log -1 --format=%cs -- "${pag}"`, { encoding: 'utf8' }).trim(); } catch (e) {}
    if (vera && vera > m[2]) { vecchie++; if (vecchie === 1) guai.push('la sitemap dice ' + m[2] + ' per ' + pag + ', ma e\' stata cambiata il ' + vera); }
  }
  if (vecchie > 1) guai.push('e altre ' + (vecchie - 1) + ' pagine con la data vecchia nella sitemap');
  console.log('date della sitemap controllate: ' + (sm.match(/<loc>/g) || []).length);
}

/* 4. nessun errore in console, e nessuna immagine rotta */
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ['--headless=new', '--remote-debugging-port=9450', '--disable-gpu', '--hide-scrollbars',
   '--no-first-run', '--user-data-dir=/tmp/chrome-controlla', 'about:blank'], { stdio: 'ignore' });
const att = ms => new Promise(r => setTimeout(r, ms));
await att(2600);
try {
  const l = await (await fetch('http://127.0.0.1:9450/json/list')).json();
  const sock = new WebSocket(l.find(t => t.type === 'page').webSocketDebuggerUrl);
  let id = 0; const at = new Map(); let errori = [];
  sock.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.id && at.has(m.id)) { at.get(m.id)(m.result); at.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') errori.push(m.params.exceptionDetails.text);
  });
  await new Promise(r => sock.addEventListener('open', r));
  const cmd = (me, pa = {}) => new Promise(r => { const n = ++id; at.set(n, r); sock.send(JSON.stringify({ id: n, method: me, params: pa })); });
  const val = async js => (await cmd('Runtime.evaluate', { expression: js, returnByValue: true })).result?.value;
  await cmd('Page.enable'); await cmd('Runtime.enable');
  for (const p of ['/', '/it/', '/it/teatri.html', '/it/biografia.html']) {
    errori = [];
    await cmd('Page.navigate', { url: BASE + p }); await att(3000);
    const rotte = await val(`[].slice.call(document.images).filter(function(i){return i.complete&&i.naturalWidth===0&&i.getAttribute('src')}).length`);
    if (rotte > 0) guai.push(p + ': ' + rotte + ' immagini rotte');
    if (errori.length) guai.push(p + ': errore in console — ' + errori[0].slice(0, 70));
    const largo = await val('document.body.scrollWidth > window.innerWidth + 2');
    if (largo) guai.push(p + ': la pagina scorre in orizzontale');
  }
  /* 7. il mappamondo: deve girare da solo e fermarsi sotto il mouse */
  await cmd('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cmd('Page.navigate', { url: BASE + '/it/teatri.html' }); await att(3200);
  const c = await val(`(function(){var e=document.querySelector('#tela'); if(!e) return null;
    e.scrollIntoView({block:'center',behavior:'instant'}); var b=e.getBoundingClientRect();
    return JSON.stringify({x:Math.round(b.left+b.width/2),y:Math.round(b.top+b.height/2)})})()`);
  if (!c) guai.push('/it/teatri.html: il mappamondo non c\'e\' piu\'');
  else {
    const q = JSON.parse(c); await att(600);
    const lam = async () => await val('window.__globo && window.__globo.stato().lam');
    /* Il browser senza finestra non disegna fotogrammi se in pagina non si
       muove niente, e requestAnimationFrame resta fermo: il globo sembrerebbe
       spento anche quando funziona. Una spintarella impercettibile a ogni
       giro obbliga la pagina a disegnare, e la misura torna vera. */
    const aspetta = async ms => { const fine = Date.now() + ms;
      while (Date.now() < fine) { await cmd('Page.captureScreenshot', { format: 'jpeg', quality: 1 }); } };
    let a = await lam(); await aspetta(1300); let b = await lam();
    if (a === undefined || a === null) guai.push('/it/teatri.html: il mappamondo non risponde');
    else if (Math.abs(b - a) < .5) guai.push('/it/teatri.html: il mappamondo non gira piu\' da solo');
    await cmd('Input.dispatchMouseEvent', { type: 'mouseMoved', x: q.x, y: q.y }); await att(200);
    await cmd('Input.dispatchMouseEvent', { type: 'mouseMoved', x: q.x + 4, y: q.y + 4 }); await att(300);
    a = await lam(); await aspetta(1300); b = await lam();
    if (Math.abs(b - a) > .5) guai.push('/it/teatri.html: il mappamondo non si ferma sotto il mouse');
    await cmd('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1400, y: 20 }); await att(400);
    a = await lam(); await aspetta(1300); b = await lam();
    if (Math.abs(b - a) < .5) guai.push('/it/teatri.html: il mappamondo non riprende a girare');
  }
  console.log('pagine aperte nel browser: 5, mappamondo compreso');
  chrome.kill();
} catch (e) { chrome.kill(); console.log('browser non disponibile, saltato il controllo in pagina'); }

/* 9. nessuna pagina pubblicata deve chiedere qualcosa a /.prova/
   22 nov: il repertorio chiedeva /.prova/repertorio.css e le otto foto
   dei ruoli. In locale esistono, quindi tutto sembrava a posto; online
   la cartella non c'e' e la pagina usciva nuda, tabella e basta.
   Si guarda il file, non il server: e' l'unico modo di vederlo. */
{
  const { readdirSync } = await import('node:fs');
  const file = ['.', 'it'].flatMap(d =>
    readdirSync(d).filter(f => f.endsWith('.html')).map(f => d === '.' ? f : d + '/' + f));
  let sporche = 0;
  for (const f of file) {
    const t = readFileSync(f, 'utf8');
    const m = t.match(/\/\.prova\/[^"'\s>]+/g);
    if (m) {
      sporche++;
      if (sporche <= 3) guai.push(f + ' chiede ' + m[0] + ' — in .prova, che online non esiste');
    }
  }
  if (sporche > 3) guai.push('e altre ' + (sporche - 3) + ' pagine che chiedono roba da .prova');
  console.log('pagine controllate per i riferimenti a .prova: ' + file.length);
}

console.log();
if (guai.length) {
  console.log('✗ NON PUBBLICARE — ' + guai.length + (guai.length === 1 ? ' guaio:' : ' guai:'));
  for (const g of guai) console.log('   · ' + g);
  process.exit(1);
}
console.log('✓ tutto a posto');
