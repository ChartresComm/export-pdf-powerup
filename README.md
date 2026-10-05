# Power-Up « Export PDF du tableau »

Crée un PDF d'un tableau Trello : vous choisissez les colonnes (listes), et le PDF met en avant
**la date** (échéance), **le titre** de la carte et **le support** (étiquettes colorées).

## Installation (environ 10 minutes)

### 1. Créer le dépôt GitHub
1. Sur github.com (compte ChartresComm) : **New repository**, nom : `export-pdf-powerup`, Public, **Create repository**.
2. **uploading an existing file** → glissez TOUT le contenu du dossier décompressé
   (`index.html`, `export.html`, dossiers `js`, `css`, `icons`), pas le zip ni le dossier parent.
3. **Commit changes**.

### 2. Activer GitHub Pages
**Settings → Pages → Branch : main, dossier / (root) → Save.** Après 1 à 2 minutes, l'adresse
`https://chartrescomm.github.io/export-pdf-powerup/index.html` doit afficher une page blanche (c'est normal).

> Si vous avez choisi un autre nom de dépôt, modifiez la ligne `var BASE = ...` en haut de `js/client.js`.

### 3. Déclarer le Power-Up dans Trello
1. https://trello.com/power-ups/admin → **Créer un nouveau Power-Up**.
2. Nom : *Export PDF*, URL du connecteur iframe : `https://chartrescomm.github.io/export-pdf-powerup/index.html`.
3. Onglet **Capacités** : activer **board-buttons**, enregistrer.
4. Dans le tableau : **Power-Ups → Personnalisé** → ajouter *Export PDF*.

## Utilisation
Bouton **Export PDF** en haut du tableau → choisissez titre, colonnes, étiquettes, période, orientation → **Générer le PDF**.
Vos choix sont mémorisés pour vos prochains exports. Les titres du PDF sont cliquables (ouvrent la carte).

## Notes
- Aucune clé API nécessaire. Le PDF est créé dans votre navigateur (rien n'est envoyé ailleurs).
- Les émojis et caractères non latins sont retirés des titres (limite des polices PDF standard).
- Dates en rouge = échéance dépassée et non terminée.
