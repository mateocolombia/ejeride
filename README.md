# EjeRide Location Share V12

Version simplifiée :

## Site public
- un seul bouton WhatsApp ;
- un bouton indépendant « Partager ma position » ;
- le bouton de position utilise le GPS du navigateur puis ouvre le menu de partage natif du téléphone ;
- le client peut choisir Messages, Telegram, WhatsApp, Mail, AirDrop, etc. ;
- le message contient un lien Apple Maps sur iPhone ou Google Maps ailleurs ;
- aucun compte Google Maps, aucune API cartographique et aucune carte bancaire ne sont nécessaires.

## Admin
`/admin.html` sert uniquement à publier :
- Disponible ;
- Occupé avec délai ;
- Indisponible.

## Limite importante
La position partagée n'arrive pas automatiquement dans l'admin EjeRide. Elle arrive dans l'application choisie par le client sous forme de lien cartographique cliquable. Pour une remontée automatique dans un tableau de bord, il faudrait reconnecter WhatsApp Business Platform ou développer une application dédiée.

## Variables Netlify utiles
- EJERIDE_ADMIN_PIN
- EJERIDE_WHATSAPP
- EJERIDE_DRIVER_NAME
- EJERIDE_VEHICLE

Les anciennes variables Meta peuvent être supprimées ou simplement laissées inutilisées.
