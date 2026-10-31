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
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Icônes |

## 1. Mettre les fichiers sur GitHub (une seule fois)

1. Dézippez l'archive sur votre ordinateur.
2. Connectez-vous sur **github.com**, puis cliquez sur **+** (en haut à droite) > **New repository**.
3. Nom : `mes-courses`. Choisissez **Public** (nécessaire pour l'hébergement gratuit). Cliquez sur **Create repository**.
4. Sur la page suivante, cliquez sur le lien **uploading an existing file**.
5. Glissez **tous les fichiers** (pas le dossier lui-même) dans la page, puis cliquez sur **Commit changes**.
6. Allez dans **Settings** > **Pages**. Sous « Build and deployment », choisissez **Deploy from a branch**, la branche **main**, le dossier **/ (root)**, puis **Save**.
7. Attendez environ deux minutes. L'adresse apparaît en haut de la page :
   `https://VOTRE-IDENTIFIANT.github.io/mes-courses/`

## 2. Installer sur le téléphone (Firefox)

1. Ouvrez l'adresse ci-dessus dans Firefox.
2. Menu **⋮** > **Installer** (ou **Ajouter à l'écran d'accueil**).
3. Ouvrez ensuite l'application avec son icône : elle s'ouvre en plein écran, sans barre d'adresse.

## 3. Quoi tester en premier

- Ajouter quelques produits, les cocher dans un ordre, puis **Terminer les courses** (l'ordre du magasin s'apprend après quelques sorties).
- Créer un plat, planifier un repas avec ce plat et un repas avec des ingrédients seuls, puis **Générer la liste**.
- Toucher un article pour changer la quantité ou le libellé, ou régler « J'en ai pris moins ».
- **Sauvegarde** : à la première utilisation de la journée, un fichier `courses-sauvegarde-AAAA-MM-JJ.json` doit apparaître dans Téléchargements.
- **Restauration** : nettoyez les cookies et données de sites, rouvrez l'application, touchez « Restaurer une sauvegarde » et choisissez le fichier le plus récent.

Points à me signaler après l'essai : la sauvegarde automatique (Firefox peut afficher une notification de téléchargement), la présence du choix « Installer », et tout ce qui paraît petit, serré ou peu clair.

## 4. Important après un nettoyage des cookies

Effacer les « cookies et données de sites » supprime les données de l'application **et** sa copie hors ligne.
Pour rouvrir l'application après un nettoyage, le téléphone doit donc avoir du réseau une fois ; il suffit ensuite de toucher
« Restaurer une sauvegarde ».

## 5. Mettre à jour l'application plus tard

1. Sur GitHub, ouvrez le fichier à modifier, ou renvoyez les nouveaux fichiers (**Add file** > **Upload files**, ils remplacent les anciens).
2. Dans `sw.js`, changez le numéro de la ligne `const CACHE = 'mes-courses-v1';` (v1 devient v2, puis v3…). Sans cela, les téléphones gardent l'ancienne version.
3. Sur le téléphone, ouvrez l'application **deux fois** : la première ouverture télécharge la nouvelle version, la seconde l'affiche.

## 6. Essai rapide sur l'ordinateur (facultatif)

Dans le dossier de l'application, ouvrez un terminal et lancez `python3 -m http.server 8000`, puis ouvrez `http://localhost:8000`.
