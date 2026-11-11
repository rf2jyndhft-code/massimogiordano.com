# Farsi trovare — cosa fare dopo aver pubblicato il sito

Scritto per Massimo. Niente gergo. Fai le cose nell'ordine in cui stanno scritte:
sono messe dalla più importante alla meno importante, non dalla più facile.

Data: 11 novembre 2026.

---

## Prima di tutto: le cose che nessuno può fare al posto tuo

Queste quattro valgono più di tutto il resto di questo documento messo insieme.
Sono anche le uniche che richiedono che **tu** scriva a qualcuno.

### 1. Metti il sito nella tua scheda Wikidata — 10 minuti, e conta moltissimo

Wikidata è l'archivio che Google legge per sapere **chi sei**. La tua scheda esiste
già: `www.wikidata.org/wiki/Q8441859`. Ho controllato, e **le manca il collegamento
al tuo sito**, e le mancano tutti i profili social.

È questo che tiene insieme tutto il resto: finché Wikidata non dice "il suo sito è
massimogiordano.com", Google non ha una conferma indipendente che quel sito sia tuo.

Cosa fare:

1. Vai su `www.wikidata.org/wiki/Q8441859`
2. In alto a destra, **Crea un'utenza** (serve solo una mail)
3. Fatto l'accesso, scorri l'elenco delle proprietà e clicca **+ aggiungi dichiarazione**
4. Aggiungi queste, una per volta — scrivi il nome della proprietà nel primo campo e il
   valore nel secondo:

   | Proprietà da cercare | Valore da scrivere |
   |---|---|
   | `official website` | `https://www.massimogiordano.com/` |
   | `Instagram username` | `massimo__giordano` |
   | `Facebook ID` | `tenor.massimogiordano` |
   | `X username` | `TheItalianTenor` |
   | `YouTube channel ID` | il codice che inizia per `UC`, vedi punto 5 qui sotto |
   | `Operabase ID` | `a11887` |

5. Per il codice YouTube: apri il tuo canale, clicca sul tuo nome, poi su **Condividi
   canale → Copia ID canale**. È una stringa che inizia per `UC`.

**Mentre sei lì, guarda la data di nascita.** Wikidata dice 19 febbraio **1971**.
La biografia ufficiale che hai mandato dice 19 febbraio **1970**. Una delle due è
sbagliata e non so quale. Dimmi qual è quella giusta: se è il 1970, va corretta su
Wikidata *e* sulle due voci di Wikipedia, altrimenti Google continuerà a mostrare
quella sbagliata. **Fino ad allora il sito non dichiara nessuna data**, di proposito.

### 2. Fatti linkare dai teatri e dai festival

Questa è la cosa che sposta di più, e nessuna ottimizzazione la sostituisce. Un
collegamento dalla pagina artisti della Wiener Staatsoper, o dal sito del Minthis,
vale più di cento aggiustamenti al codice.

Quando un teatro ti scrittura, nel giro di mail dove mandi biografia e foto, aggiungi
una riga:

> *Per la pagina artista: il sito ufficiale è https://www.massimogiordano.com — vi
> sarei grato se poteste linkarlo insieme alla biografia.*

Chiedilo in particolare a:

- **Minthis Music Festival / Minthis Resort** — sei il direttore artistico, è il più
  facile da ottenere e il più legittimo
- **Conservatorio di Cagliari** — la pagina dei docenti della classe di canto
- i teatri dove canti nella prossima stagione, uno alla volta, quando scrivi per altro
- **Operabase** — nel tuo profilo c'è un campo per il sito ufficiale: compilalo

### 3. Sistema il link su Wikipedia italiana

La voce italiana `Massimo Giordano (tenore)` ti linka già, ma con un indirizzo vecchio:
`http://www.massimogiordano.com/it` — in `http` e senza la barra finale.
Va cambiato in `https://www.massimogiordano.com/it/`.

Si modifica senza registrarsi: apri la voce, clicca **modifica** nella sezione
*Collegamenti esterni*, correggi l'indirizzo, scrivi nel riquadro del riassunto
"aggiornato il collegamento al sito ufficiale", salva.

La voce inglese è già a posto.

### 4. Metti il sito ovunque ci sia il tuo nome

Dove c'è un campo "sito web", compilalo. Ogni volta che lo fai, confermi a Google che
quei profili e quel sito sono la stessa persona:

- **Instagram** `@massimo__giordano` → nella bio, il link
- **Facebook** `tenor.massimogiordano` → nelle informazioni della pagina
- **X** `@TheItalianTenor` → nel profilo
- **YouTube** → nella descrizione e nei link del canale
- **Operabase** → campo sito ufficiale
- la firma della tua mail

---

## Google Search Console — registrare il sito

Serve perché Google ti dica cosa trova, cosa no, e quando qualcosa si rompe.
È gratis. Serve un account Google qualunque.

1. Vai su **search.google.com/search-console**
2. Entra con il tuo account Google
3. Ti chiede di scegliere fra due riquadri. Scegli quello di **sinistra**, intitolato
   **Dominio**, e scrivi dentro: `massimogiordano.com` (senza `https://`, senza `www`)
4. Clicca **Continua**

### Dimostrare che il sito è tuo

Google ti mostra una riga lunga che comincia per `google-site-verification=`.
Va messa nelle impostazioni del dominio, dove si gestiscono i DNS — lo stesso posto da
cui il dominio è stato comprato.

1. Clicca **Copia** accanto a quella riga
2. Entra nel pannello di chi ti ha venduto il dominio, cerca **DNS** o
   **Gestione DNS**
3. Aggiungi un record nuovo:
   - **Tipo**: `TXT`
   - **Nome** (o *Host*): scrivi `@` — se non accetta la chiocciola, lascia vuoto
   - **Valore**: incolla la riga copiata
   - **TTL**: lascia come sta
4. Salva
5. Torna su Search Console e clicca **Verifica**

Se dice che non trova niente, **non è un errore**: i DNS impiegano da qualche minuto a
qualche ora. Riprova dopo un'ora e poi il giorno dopo.

> Se questo passaggio ti blocca, fermati e chiedimi: lo guardiamo insieme. È l'unico
> punto di tutto il documento dove si può fare un danno vero sbagliando.

### Mandare la mappa del sito

La mappa del sito è l'elenco di tutte le pagine, già pronta nel file `sitemap.xml`.

1. Nel menù a sinistra di Search Console, clicca **Sitemap**
2. Nel campo scrivi soltanto: `sitemap.xml`
3. Clicca **Invia**
4. Dopo qualche minuto deve comparire **Riuscita** e il numero `10` nelle pagine trovate

### Chiedere a Google di guardare subito

Senza questo passaggio Google ci arriva lo stesso, ma può metterci settimane.

1. In cima alla pagina di Search Console c'è una barra di ricerca lunga, con scritto
   *Esamina qualsiasi URL*
2. Incolla `https://www.massimogiordano.com/` e premi Invio
3. Aspetta il riquadro e clicca **Richiedi indicizzazione**
4. Ripeti per ognuno di questi, uno alla volta (fra uno e l'altro aspetta che finisca):

   ```
   https://www.massimogiordano.com/
   https://www.massimogiordano.com/biography.html
   https://www.massimogiordano.com/repertoire.html
   https://www.massimogiordano.com/gallery.html
   https://www.massimogiordano.com/it/
   https://www.massimogiordano.com/it/biografia.html
   https://www.massimogiordano.com/it/repertorio.html
   https://www.massimogiordano.com/it/galleria.html
   ```

   (le due pagine privacy non serve chiederle: le trova da sole)

5. Dopo tre o quattro giorni, cerca su Google: `site:massimogiordano.com`
   Devono comparire le pagine. Se non c'è niente dopo una settimana, dimmelo.

### Due controlli da fare una volta sola, dopo una settimana

- **Prestazioni** (menù a sinistra): mostra con quali ricerche la gente ti trova.
  All'inizio sarà quasi solo il tuo nome. È normale.
- **Pagine**: se qualcosa è segnato in rosso, mandami la schermata.

---

## Il pixel di Meta — per le campagne

Il sito è già predisposto. Il codice sta in `assets/consenso.js` e oggi **non carica
niente**: aspetta che tu gli dia il numero del pixel.

⚠️ Il pixel di Laimtee (`1038688217630210`) **non va messo qui**: è di un'altra società
e di un altro dominio. Per massimogiordano.com ne serve uno nuovo.

### Crearlo

1. Vai su **business.facebook.com**
2. Menù a sinistra → **Gestione eventi** (*Events Manager*)
3. Pulsante verde **Collega origini dati** → **Web** → **Collega**
4. Dai un nome: `massimogiordano.com`
5. Scrivi l'indirizzo del sito quando lo chiede
6. Quando chiede come installarlo, scegli **Installa il codice manualmente**
7. Nel codice che mostra, cerca una riga così: `fbq('init', '1234567890123456');`
   **Il numero fra virgolette è il tuo pixel.** Copialo.

### Metterlo nel sito

Apri `assets/consenso.js`. Alla riga 26 circa c'è:

```js
var PIXEL_ID = 'META_PIXEL_ID';   // <-- il solo valore da cambiare
```

Sostituisci `META_PIXEL_ID` con il numero, **tenendo le virgolette**:

```js
var PIXEL_ID = '1234567890123456';
```

Non toccare nient'altro. Salva, ricarica il sito.

### Cosa misura già da solo

Non devi configurare niente: gli eventi sono già agganciati.

| Evento in Meta | Quando scatta |
|---|---|
| `PageView` | apertura di una pagina |
| `InitiateCheckout` | clic su un pulsante Biglietti |
| `Lead` | iscrizione agli avvisi |
| `Contact` | clic su una mail o su un profilo social |
| `ViewContent` | avvio di un video |

### Il consenso non è un optional

Tu sei residente italiano e Laimtee è cipriota: siamo dentro le regole europee.
**Il pixel non parte finché il visitatore non accetta.** Il banner è già scritto,
senza librerie esterne, e il "rifiuto" costa un clic esattamente come l'accettazione —
lo impone la norma.

Chi rifiuta non viene più disturbato. Chi vuole cambiare idea usa il link **Cookie**
in fondo a ogni pagina.

**Prima di pubblicare** va completata la pagina `privacy.html` (e `it/privacy.html`):
manca solo il nome per esteso del titolare del trattamento — se sei tu come persona
o Laimtee Ltd, con la sede — e il nome di chi fa l'hosting. Sono dati legali e non li
ho indovinati.

---

## Le cose già pronte nel sito che aspettano solo un dato

Sono tutte segnate nel codice con un commento che spiega cosa fare. Nessuna di queste
funziona oggi, e nessuna è rotta: sono spente di proposito.

| Cosa | Dove | Cosa manca |
|---|---|---|
| Pulsanti **Biglietti** | `index.html` e `it/index.html`, sezione Calendario | EraTickets è ancora chiuso al pubblico: oggi chiede una password. Quando apre, l'indirizzo dell'evento al posto di `ERATICKETS_URL` |
| Scheda **evento** per Google | stesso punto, nel commento sotto | le date vere. Senza una data certa il blocco non va messo |
| Modulo **avvisi** | sezione *Mailing list* / *Avvisi* | scegliere il servizio di invio (Mailchimp, Brevo, MailerLite) e metterne l'indirizzo al posto di `MAILING_LIST_ENDPOINT` |
| **Cartella stampa** scaricabile | sezione *Press kit* / *Stampa* | il file `press-kit/massimo-giordano-press-kit.zip` |

---

## Il riquadro a destra nei risultati di Google

Quando si cerca il tuo nome, Google può mostrare un riquadro con foto, ruolo e
collegamenti. Non si compra e non si chiede: Google lo mostra quando è **sicuro** di
chi sei.

Cosa serve, e dove siamo:

| Serve | Stato |
|---|---|
| Una voce di Wikipedia | ✅ c'è, in italiano, inglese, tedesco e arabo |
| Una scheda Wikidata | ⚠️ c'è ma **le manca il collegamento al sito** — è il punto 1 di questo documento |
| Un sito ufficiale che dichiara chi sei alle macchine | ✅ fatto adesso, in tutte le pagine |
| Che i profili social confermino il sito | ⚠️ da fare tu, punto 4 |
| Che altri siti autorevoli linkino il sito | ⚠️ da chiedere, punto 2 |

Se fai i punti 1, 2 e 4, il riquadro arriva. Non subito: di solito fra uno e tre mesi.

**Quando compare**, puoi chiederne la proprietà: cerca il tuo nome, in fondo al riquadro
clicca *Rivendica questa scheda informativa*. Da lì puoi segnalare un errore — per
esempio la data di nascita.

---

## Su quali ricerche puoi realisticamente comparire

Oggi il sito risponde bene a **"Massimo Giordano tenore"** e poco altro, perché è
l'unica cosa di cui parla per esteso. Il resto si guadagna scrivendo pagine che oggi
non esistono. Non servono pagine finte: serve contenuto che **hai già** e che non è
ancora scritto.

### Quello che puoi già vincere con poco

| Chi cerca | Cosa manca |
|---|---|
| `Massimo Giordano tenore` | niente: ci sei |
| `Amore e Tormento Massimo Giordano` | un link dove il disco si ascolta o si compra — quello vecchio è morto |
| `Minthis Music Festival` | una pagina tua sul festival, non due righe nel calendario |

### Quello che richiede una pagina nuova, e vale la pena

**1. Una pagina sulla classe di canto a Cagliari.**
Chi cerca *"lezioni di canto lirico Cagliari"*, *"masterclass canto"*, *"come entrare
in conservatorio canto"* oggi non ti trova. Sono persone che cercano un insegnante e
non sanno che esisti. Ti serve una pagina che dica: com'è la classe, cosa cerchi in un
allievo, come si entra, se prendi allievi esterni. Nel sito c'è già un riquadro che
chiede proprio queste righe — mancano le tue parole.

**2. Una pagina per ruolo, sui tre o quattro che hai cantato di più.**
Chi cerca *"Cavaradossi tenore"* o *"Des Grieux Manon Lescaut"* sta cercando quel
ruolo, non te — ma se la pagina è tua e racconta il ruolo da dentro (quante volte,
in quali teatri, con quali direttori, cosa chiede alla voce), è a te che arriva.
Ne hai il materiale: Cavaradossi, Rodolfo, Alfredo, Des Grieux. Non è contenuto
inventato, è la tua carriera scritta per esteso.

**3. Le recensioni, con la data e la testata.**
Hai quattro ritagli del 2014. Servono quelli degli ultimi dieci anni: Stoccarda,
il Bolshoi, Amburgo, Minthis. Cercali e mandameli: le citazioni di critica sono
esattamente ciò che un teatro cerca prima di scritturare.

**4. Il calendario pieno.**
È la cosa che in assoluto fa comparire un cantante nelle ricerche: ogni data diventa
una scheda che Google può mostrare con luogo, orario e biglietti. Il sito è già
predisposto per riceverle. Mancano solo le date.

> Il mio consiglio, se devi sceglierne una sola: **la pagina sulla classe di canto**.
> È l'unica dove c'è gente che cerca un servizio e non una persona, e dove non hai
> concorrenza.

---

## Come si controlla che tutto funzioni, dopo la pubblicazione

Tre indirizzi da aprire una volta sola, il giorno dopo aver pubblicato:

1. **I dati per Google**
   `search.google.com/test/rich-results` → incolla l'indirizzo del sito.
   Deve riconoscere *Persona*, *Album musicale* e *Percorso di navigazione*.

2. **L'anteprima quando condividi il link**
   `developers.facebook.com/tools/debug/` → incolla l'indirizzo, clicca
   *Scrape Again*. Deve uscire la fotografia con il viso, non un riquadro vuoto.
   Prova anche a mandarti il link su WhatsApp da solo: è il test vero.

3. **La velocità**
   `pagespeed.web.dev` → incolla l'indirizzo e guarda la colonna **Telefono**, non
   quella del computer.

---

## Manutenzione: tre cose, e poi basta

- **Quando aggiungi o togli una pagina**, va aggiornata anche `sitemap.xml`.
  Dimmelo e lo faccio io: è un file solo.
- **Quando cambi una foto** usata nelle anteprime social, rifai il giro al punto 2 qui
  sopra, altrimenti Facebook e WhatsApp mostrano per settimane quella vecchia.
- **Una volta all'anno** apri Search Console e guarda se c'è qualcosa in rosso.

Tutto il resto è già scritto nel sito e non si tocca.

---

## Quattro righe da far impostare a chi mette il sito online

Non sono cose da fare dentro il sito: sono impostazioni del server. Chiunque faccia
l'hosting le sa fare in cinque minuti. **Giragli questo elenco così com'è.**

1. **Tutto in `https`.** Chi arriva con `http://` deve essere rimandato a `https://`.
   Senza questo, Google segnala il sito come non sicuro.

2. **Una sola versione dell'indirizzo.** Decidere se il sito è
   `www.massimogiordano.com` o `massimogiordano.com` e rimandare l'altra alla scelta.
   Il sito è scritto per **con il www**. Se se ne lasciano attive due, Google le tratta
   come due siti diversi e si fanno concorrenza da soli.

3. **La pagina degli errori.** Quando un indirizzo non esiste, deve uscire il file
   `404.html` (e con il codice 404, non 200). È già scritto, in inglese con un rimando
   all'italiano.

4. **`/it` deve portare a `/it/`.** La voce di Wikipedia italiana linka
   `massimogiordano.com/it` senza la barra finale: se il server non la aggiunge da solo,
   quel collegamento finisce su un errore.

---

## Cose piccole già sistemate, perché tu lo sappia

- **L'icona del sito** (quella che Google mostra accanto a ogni risultato da telefono, e
  che compare nella linguetta del browser) non c'era: adesso c'è, un monogramma MG oro
  su blu notte. Se preferisci altro, si cambia in un minuto.
- **La pagina di errore** non c'era: adesso c'è, e invece di un messaggio bianco porta
  alle pagine vere.
- **La cartella `press-kit/`** contiene quattro fotografie da 1,5 MB l'una, raggiungibili
  da chiunque indovini l'indirizzo. Restano dove sono, ma ho detto ai motori di ricerca
  di non indicizzarle: non devono comparire nelle ricerche di immagini al posto delle
  foto buone.
