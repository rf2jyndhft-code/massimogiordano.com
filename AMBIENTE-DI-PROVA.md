# Dove si lavora, e dove no

**`main`** → è il sito vero, *massimogiordano.com*. Ci si arriva solo quando una
cosa è finita e approvata.

**`lavori`** → il ramo di prova. Ogni push qui genera un indirizzo di anteprima
su Vercel, visibile solo a chi ha il link e **con il divieto di indicizzazione**:
Google non lo vedrà mai.

## Come si porta una cosa dal ramo di prova al sito vero

    git checkout main
    git merge lavori
    git push origin main
    git checkout lavori

## Perché

Fino al 18 novembre 2026 si è lavorato direttamente sul sito pubblico: ogni
tentativo, anche quello sbagliato, finiva online per qualche minuto. Su un sito
che Google sta indicizzando non si fa.
