# EjeRide MapLibre V6

Version 100 % sans Google Maps et sans clé de carte.

## Carte
- MapLibre GL JS
- OpenFreeMap (style vectoriel Liberty)
- aucune clé API
- aucune carte bancaire

## Suivi
- le chauffeur partage sa position depuis `admin.html`
- le client peut partager sa position en direct avec le GPS
- si Safari refuse, le client peut choisir son point en touchant la carte
- le client voit la voiture EjeRide, la distance et l'ETA
- l'admin voit également le point du client
- boutons de test Armenia dans l'admin pour tester depuis la France

## Variables Netlify
Obligatoires :
- `EJERIDE_ADMIN_PIN`
- `EJERIDE_WHATSAPP`

Optionnelles :
- `EJERIDE_DRIVER_NAME`
- `EJERIDE_VEHICLE`
- `EJERIDE_GOOGLE_REVIEW_URL`

Aucune variable Google Maps ou Mapbox n'est nécessaire.

## Structure GitHub
```
public/
  index.html
  admin.html
  track.html
  robots.txt
netlify/functions/
  booking.mjs
  config.mjs
  route.mjs
  status.mjs
  trip.mjs
netlify.toml
package.json
README.md
```

## Test rapide
1. Déployer sur Netlify.
2. Ouvrir `/admin.html`.
3. Créer un lien client.
4. Ouvrir ce lien sur un autre téléphone.
5. Côté client : partager le GPS ou toucher la carte.
6. Côté admin : `Test Armenia`, puis `Avancer le test` pour voir la voiture bouger même depuis la France.
