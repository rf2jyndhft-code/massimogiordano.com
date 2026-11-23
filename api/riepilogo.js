/* Il riepilogo settimanale degli iscritti agli avvisi.
 *
 * Massimo non vuole una mail a ogni iscrizione — gli indirizzi stanno
 * nell'elenco su Resend — ma vuole sapere una volta alla settimana chi
 * e' arrivato. Questo lo fa da solo: Vercel chiama questo indirizzo il
 * lunedi' mattina (vedi "crons" in vercel.json) e noi gli mandiamo una
 * mail sola, con i nuovi della settimana e il totale.
 *
 * Si puo' chiamare anche a mano per provarlo, ma solo conoscendo il
 * segreto: /api/riepilogo?chiave=<CRON_SECRET>.
 */

const DESTINATARIO = "info@massimogiordano.com";
const ELENCO = process.env.RESEND_AUDIENCE_ID || "866c950c-de77-431f-b205-b23e5dbf4323";

export default async function handler(req, res) {
  const chiave = process.env.RESEND_API_KEY;
  if (!chiave) return res.status(503).json({ ok: false, errore: "non configurato" });

  /* Chi puo' chiamarlo: Vercel (manda l'intestazione con il segreto) oppure
     noi a mano con ?chiave=. Se CRON_SECRET non e' impostato si lascia
     passare la chiamata di Vercel, che e' l'unica che arriva. */
  const segreto = process.env.CRON_SECRET;
  const daVercel = (req.headers.authorization || "") === "Bearer " + segreto;
  const aMano = segreto && req.query && req.query.chiave === segreto;
  if (segreto && !daVercel && !aMano) return res.status(401).json({ ok: false });

  const h = { "Authorization": "Bearer " + chiave };

  let contatti = [];
  try {
    const r = await fetch("https://api.resend.com/audiences/" + ELENCO + "/contacts", { headers: h });
    if (!r.ok) {
      const t = await r.text();
      return res.status(502).json({ ok: false, errore: "elenco non leggibile", dettaglio: t.slice(0, 200) });
    }
    const d = await r.json();
    contatti = d.data || [];
  } catch (e) {
    return res.status(502).json({ ok: false, errore: "rete" });
  }

  const ora = Date.now();
  const settimana = 7 * 24 * 60 * 60 * 1000;
  const nuovi = contatti.filter((c) => c.created_at && (ora - new Date(c.created_at).getTime()) < settimana);
  const attivi = contatti.filter((c) => !c.unsubscribed);

  /* Se non si e' iscritto nessuno non si manda niente: una casella non si
     riempie di mail che dicono "zero". */
  const soloConto = req.query && req.query.sempre === "1";
  if (!nuovi.length && !soloConto) {
    return res.status(200).json({ ok: true, nuovi: 0, totale: attivi.length, spedito: false });
  }

  const data = (v) => new Date(v).toLocaleDateString("it-IT",
    { timeZone: "Europe/Rome", day: "numeric", month: "long" });

  const INK = "#1c1a18", GRIGIO = "#6b6560", FILO = "#e4ded6", CARTA = "#faf8f5";
  const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

  const righe = nuovi.map((c) =>
    '<tr><td style="padding:10px 16px 10px 0;font:15px/1.5 ' + SANS + ';color:' + INK + '">' +
    String(c.email).replace(/</g, "&lt;") + '</td>' +
    '<td style="padding:10px 0;font:13px/1.5 ' + SANS + ';color:' + GRIGIO + ';white-space:nowrap">' +
    data(c.created_at) + '</td></tr>').join("");

  const html =
    '<!doctype html><html><body style="margin:0;background:' + CARTA + '">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fff;border:1px solid ' + FILO + '">' +
    '<tr><td style="padding:28px 28px 8px">' +
    '<p style="margin:0;font:600 11px/1 ' + SANS + ';letter-spacing:.14em;text-transform:uppercase;color:' + GRIGIO + '">Avvisi &middot; riepilogo della settimana</p>' +
    '<p style="margin:14px 0 0;font:400 26px/1.2 Georgia,serif;color:' + INK + '">' +
    (nuovi.length === 1 ? "Un nuovo iscritto" : nuovi.length + " nuovi iscritti") + '</p>' +
    '<p style="margin:8px 0 0;font:14px/1.6 ' + SANS + ';color:' + GRIGIO + '">In tutto sono ' + attivi.length + '.</p>' +
    '</td></tr>' +
    (righe ? '<tr><td style="padding:12px 28px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ' + FILO + '">' + righe + '</table></td></tr>' : '') +
    '<tr><td style="padding:0 28px 28px"><p style="margin:0;font:13px/1.6 ' + SANS + ';color:' + GRIGIO + '">L&rsquo;elenco completo sta su Resend, nell&rsquo;audience &laquo;Sito massimogiordano.com&raquo;.</p></td></tr>' +
    '</table></td></tr></table></body></html>';

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.MITTENTE || "Sito massimogiordano.com <sito@send.massimogiordano.com>",
        to: [DESTINATARIO],
        subject: "AVVISI — " + (nuovi.length === 1 ? "un nuovo iscritto" : nuovi.length + " nuovi iscritti") +
                 " (in tutto " + attivi.length + ")",
        text: "Nuovi iscritti della settimana:\n" +
              (nuovi.map((c) => "· " + c.email + " — " + data(c.created_at)).join("\n") || "nessuno") +
              "\n\nIn tutto: " + attivi.length,
        html: html,
      }),
    });
    if (!r.ok) return res.status(502).json({ ok: false, errore: "invio non riuscito" });
  } catch (e) {
    return res.status(502).json({ ok: false, errore: "rete" });
  }

  return res.status(200).json({ ok: true, nuovi: nuovi.length, totale: attivi.length, spedito: true });
}
