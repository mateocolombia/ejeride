# EjeRide — WhatsApp Location V10

Cette version supprime tout le partage GPS client via Safari. Le client envoie son emplacement dans WhatsApp, et Meta WhatsApp Business Platform transmet la latitude/longitude au webhook Netlify. L'admin EjeRide affiche ensuite le client sur MapLibre/OpenFreeMap.

## Fichiers
- `public/index.html` : page publique, bouton "Partager ma localisation par WhatsApp".
- `public/admin.html` : disponibilité + carte clients WhatsApp.
- `netlify/functions/wa-session.mjs` : crée les codes de demande et liste les clients.
- `netlify/functions/whatsapp-webhook.mjs` : reçoit les messages WhatsApp et les positions.
- `netlify/functions/status.mjs` : statut Disponible / Occupé / Indisponible.
- `netlify/functions/config.mjs` : numéro WhatsApp et configuration de base.

## Variables Netlify déjà utilisées
- `EJERIDE_ADMIN_PIN`
- `EJERIDE_WHATSAPP` (numéro international sans `+`)
- `EJERIDE_DRIVER_NAME`
- `EJERIDE_VEHICLE`

## Nouvelles variables Meta
### Obligatoire
- `EJERIDE_META_VERIFY_TOKEN` : choisis toi-même une longue chaîne secrète. Elle doit être identique au Verify Token saisi dans Meta Webhooks.

### Recommandé
- `EJERIDE_META_APP_SECRET` : App Secret de ton application Meta. Permet de vérifier la signature `x-hub-signature-256` des webhooks.

### Optionnel : réponses automatiques WhatsApp
- `EJERIDE_META_ACCESS_TOKEN`
- `EJERIDE_META_PHONE_NUMBER_ID`
- `EJERIDE_META_GRAPH_VERSION` (optionnel, défaut `v23.0`)

Sans les deux variables Access Token + Phone Number ID, la localisation est quand même reçue et affichée dans l'admin ; EjeRide n'envoie simplement pas de réponse automatique.

## Webhook Meta à configurer
Callback URL :
`https://ejeride.netlify.app/.netlify/functions/whatsapp-webhook`

Verify Token : la valeur exacte de `EJERIDE_META_VERIFY_TOKEN`.

Abonne l'application au champ WhatsApp `messages` pour le WABA.

## Parcours client
1. Le client clique `Partager ma localisation par WhatsApp`.
2. EjeRide crée un code du type `ER-7K4PZ` et ouvre WhatsApp avec ce code prérempli.
3. Le client envoie ce message.
4. Il touche `+` → `Ubicación / Localisation` → `Enviar tu ubicación actual`.
5. Le webhook reçoit `latitude` + `longitude` et la position apparaît dans `/admin.html`.

Même si un client envoie directement une position au numéro WhatsApp Business sans code, le webhook crée automatiquement une nouvelle entrée dans l'admin.

## Important
Le bouton web ne peut pas ouvrir directement le sélecteur de localisation de WhatsApp. WhatsApp exige que l'utilisateur choisisse lui-même `+ → Localisation`. Cette version évite toutefois complètement la géolocalisation Safari.
