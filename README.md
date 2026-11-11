# massimogiordano.com — sito statico

HTML e CSS scritti a mano. **Nessun framework, nessun CMS, nessuna build, nessuna libreria
esterna, nessun font remoto.** Si apre con un doppio clic e si mette online copiando una cartella.

Il motivo è concreto: `laimtee.art` è prigioniero di `mywebsitebuilder.com`, da cui non si esporta
niente. Qui ogni riga è un file di testo che si versiona e si porta via.

---

## Come guardarlo in locale

```sh
cd ~/sito-massimogiordano
python3 -m http.server 8080
```

Poi apri **http://localhost:8080/** (inglese) o **http://localhost:8080/it/** (italiano).

Basta anche aprire `index.html` con un doppio clic, ma con il server i link assoluti si comportano
come online.

---

## Com'è fatto

```
index.html          EN — home
biography.html      EN — biografia corta, media, lunga + cronologia
repertoire.html     EN — repertorio per compositore
it/index.html       IT — home
it/biografia.html   IT — biografia
it/repertorio.html  IT — repertorio
assets/style.css    tutto lo stile, un file solo
assets/img/         immagini già compresse per il web (~820 KB in tutto)
press-kit/          originali ad alta risoluzione (NON ancora pubblicabili: vedi SERVE-DA-MASSIMO)
robots.txt
sitemap.xml
```

L'inglese sta alla radice perché chi cerca un tenore è un teatro o un agente, spesso non italiano.
L'italiano sta in `/it/`. Le due versioni si rimandano a vicenda con `hreflang`, così Google
mostra la lingua giusta a ciascuno.

### Le cose da sapere se qualcuno ci mette mano

- **Tutti i segnaposto da riempire sono riquadri rossi tratteggiati** nella pagina (classe `.todo`).
  Sono visibili apposta: nessun testo finto che sembra vero. Vanno **tolti tutti** prima di pubblicare.
- Il colore, i margini e i caratteri stanno tutti in cima a `assets/style.css`, nelle variabili `:root`.
- Le immagini sono già ridimensionate. Se se ne aggiungono: lato lungo 1600 px per le grandi,
  1200 px per i ritratti, qualità 50–60. `sips -Z 1600 foto.jpg --out web.jpg -s formatOptions 55`.

---

## Pubblicare — quello che NON è stato fatto

**Niente è online. Nessun DNS è stato toccato. Niente è stato comprato.** La zona DNS del dominio
porta anche la posta (`info@`, `press@`, `office@`) ed è delicata: vedi `~/dns-massimogiordano-com.md`.
Il dominio inoltre è in trasferimento, con il blocco ICANN di 60 giorni fino a circa il 18 dicembre 2026.

Quando il sito sarà pronto e approvato, bastano due record DNS cambiati. L'ordine giusto:

1. Riempire i riquadri rossi e togliere la classe `.todo`.
2. Caricare la cartella su un hosting statico — va bene qualunque: Netlify, Cloudflare Pages,
   GitHub Pages, o lo spazio web di OVH. Non serve PHP, non serve un database.
3. Provare il sito sull'indirizzo provvisorio dell'hosting, da telefono e da computer.
4. **Solo allora** spostare i record `A` di `@` e `www` sul nuovo hosting.
   **Non toccare i record MX, TXT/SPF, DKIM e SRV**: sono la posta.
5. Verificare che la posta arrivi ancora prima di spegnere il vecchio hosting Network Solutions
   (scade comunque il 01/07/2027).

Il passo 4 lo fa Massimo, o lo fa qualcuno con il suo sì esplicito.
