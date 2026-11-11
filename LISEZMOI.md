# Mes courses — guide d'installation

Application de liste de courses et de menus de la semaine, pour téléphone.
Aucun serveur : tout est enregistré **sur le téléphone**. Les fichiers ci-dessous ne servent
qu'à « livrer » l'application ; ils ne contiennent aucune donnée personnelle.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Page de départ |
| `style.css` | Couleurs, tailles, mise en page |
| `app.js` | Tout le fonctionnement de l'application |
| `manifest.json` | Nom et icône de l'application sur l'écran d'accueil |
| `sw.js` | Permet d'ouvrir l'application sans réseau |
| `favicon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Icône de l'application |

## 1. Mettre les fichiers sur GitHub (une seule fois)

1. Dézippez l'archive sur votre ordinateur.
2. Connectez-vous sur **github.com**, puis cliquez sur **+** (en haut à droite) > **New repository**.
3. Nom : `mes-courses`. Choisissez **Public** (nécessaire pour l'hébergement gratuit). Cliquez sur **Create repository**.
4. Sur la page suivante, cliquez sur le lien **uploading an existing file**.
5. Glissez **tous les fichiers** (pas le dossier lui-même) dans la page, puis cliquez sur **Commit changes**.
6. Allez dans **Settings** > **Pages**. Sous « Build and deployment », choisissez **Deploy from a branch**, la branche **main**, le dossier **/ (root)**, puis **Save**.
7. Attendez environ deux minutes. L'adresse apparaît en haut de la page :
   `https://VOTRE-IDENTIFIANT.github.io/mes-courses/`

## 2. Installer sur le téléphone (Brave ou Firefox)

1. Ouvrez l'adresse ci-dessus dans Brave (ou Firefox).
2. Menu **⋮** > **Installer l'application** (ou **Ajouter à l'écran d'accueil**).
3. Ouvrez ensuite l'application avec son icône : elle s'ouvre en plein écran, sans barre d'adresse.

### Changer de navigateur sans perdre vos données

Les données sont propres à chaque navigateur. Pour passer de Firefox à Brave :
1. Dans Firefox, ouvrez l'application, puis **Réglages** > **Sauvegarder maintenant**.
2. Ouvrez l'adresse dans Brave, installez l'application.
3. À l'ouverture, touchez **Restaurer une sauvegarde** et choisissez le fichier le plus récent de Téléchargements.

## 3. Quoi tester en premier

- Ajouter quelques produits, les cocher dans un ordre, puis **Terminer les courses** (l'ordre du magasin s'apprend après quelques sorties).
- Créer un plat, planifier un repas avec ce plat et un repas avec des ingrédients seuls, puis **Générer la liste**.
- Toucher un article pour changer la quantité ou le libellé, ou régler « J'en ai pris moins ».
- **Sauvegarde** : au plus une fois par jour, à la première utilisation si vous avez modifié quelque chose, un fichier `courses-sauvegarde-AAAA-MM-JJ.json` apparaît dans Téléchargements. Une **pastille orange** sur l'onglet Réglages signale des modifications pas encore sauvegardées : touchez « Sauvegarder maintenant » avant de nettoyer le navigateur.
- **Restauration** : nettoyez les cookies et données de sites, rouvrez l'application, touchez « Restaurer une sauvegarde » et choisissez le fichier le plus récent.

Points à me signaler après l'essai : la sauvegarde automatique (Firefox peut afficher une notification de téléchargement), la présence du choix « Installer », et tout ce qui paraît petit, serré ou peu clair.

## 4. Important après un nettoyage des cookies

Effacer les « cookies et données de sites » supprime les données de l'application **et** sa copie hors ligne.
Pour rouvrir l'application après un nettoyage, le téléphone doit donc avoir du réseau une fois ; il suffit ensuite de toucher
« Restaurer une sauvegarde ».

## 5. Mettre à jour l'application plus tard

1. Sur GitHub, ouvrez le fichier à modifier, ou renvoyez les nouveaux fichiers (**Add file** > **Upload files**, ils remplacent les anciens).
2. Dans `sw.js`, changez le numéro de la ligne `const CACHE = 'mes-courses-v1';` (v4 devient v5, puis v6…). Sans cela, les téléphones gardent l'ancienne version.
3. Patientez environ deux minutes, puis ouvrez l'application sur le téléphone : la nouvelle version se charge d'elle-même (la page se recharge une fois). Pour vérifier, le numéro de version est affiché en bas de l'écran **Réglages**.
4. Si l'ancienne version reste affichée : dans **Réglages**, touchez « Sauvegarder maintenant », nettoyez les cookies et données de sites, rouvrez l'adresse, puis touchez « Restaurer une sauvegarde ».

## 6. Essai rapide sur l'ordinateur (facultatif)

Dans le dossier de l'application, ouvrez un terminal et lancez `python3 -m http.server 8000`, puis ouvrez `http://localhost:8000`.

## Crédits

Les icônes sont issues de **Lucide** (https://lucide.dev), sous licence ISC.

## Historique

- **1.3.0** : pastille « modifications non sauvegardées » ; une seule sauvegarde automatique par jour ; couleurs à boutons clairs et texte foncé (turquoise #6BD8EC) ; barre d'état crème.
- **1.4.1** : réglage « Liste de courses » pour placer la ligne d’ajout et les produits habituels en bas ; suppression du texte « touchez un article pour le modifier ».
- **1.5.0** : avec l'option « En bas », la ligne d'ajout et les produits habituels restent collés au-dessus des onglets (fond en dégradé à 150°, bouton « + » blanc) ; la liste défile au-dessus.
- **1.5.1** : bouton « + » à côté de la recherche dans la liste des plats.
- **1.2.1** : mise à jour plus fiable (la dernière version est toujours récupérée, puis la page se recharge toute seule).
- **1.2.0** : icône de l'application et favicon (panier Lucide) ; couleurs rose, vert, orange (FF7F00), turquoise, taupe, plus une couleur au choix.
- **1.1.0** : icônes plates (Lucide) à la place des émojis ; couleurs rose, vert, turquoise et taupe ; fond de la semaine en taupe clair, jours en blanc avec bordure taupe ; repère du jour dans la couleur choisie.
- **1.0.0** : première version.
