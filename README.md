# EjeRide Live V4

Structure Netlify/GitHub :

- `public/` : site public, admin et suivi client
- `netlify/functions/` : statut, réservations, suivi GPS, ETA
- `netlify.toml` : configuration Netlify

Variables Netlify à conserver :

- `EJERIDE_ADMIN_PIN` (secret)
- `EJERIDE_WHATSAPP`
- `EJERIDE_DRIVER_NAME`
- `EJERIDE_VEHICLE`
- `EJERIDE_GOOGLE_REVIEW_URL` (optionnel)
- `MAPBOX_ACCESS_TOKEN` (optionnel ; si absent, le système essaie un routage OSRM puis une estimation de secours)

URLs :

- `/` site public
- `/admin` tableau chauffeur
- `/s/<token>` suivi privé client
