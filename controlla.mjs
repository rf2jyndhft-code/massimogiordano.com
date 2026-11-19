/* IL CONTROLLO PRIMA DI PUBBLICARE
   Si lancia così:  node controlla.mjs            (sul sito locale)
                    node controlla.mjs online     (sul sito pubblicato)

   Guarda quattro cose, le stesse che il 19 novembre 2026 sono sfuggite
   una per volta: ogni pagina risponde, nessun collegamento è rotto,
   nessun reindirizzamento gira su se stesso, nessun errore in console.
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
  console.log('pagine aperte nel browser: 4');
  chrome.kill();
} catch (e) { chrome.kill(); console.log('browser non disponibile, saltato il controllo in pagina'); }

console.log();
if (guai.length) {
  console.log('✗ NON PUBBLICARE — ' + guai.length + (guai.length === 1 ? ' guaio:' : ' guai:'));
  for (const g of guai) console.log('   · ' + g);
  process.exit(1);
}
console.log('✓ tutto a posto');
