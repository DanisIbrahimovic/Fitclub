# FitClub

Bienvenue sur le dépôt de **FitClub**, une application web complète (Full-Stack) dédiée à la gestion d'un club de fitness.

Ce projet permet aux utilisateurs de s'inscrire, de consulter les plannings et les activités proposées, et dispose également d'un tableau de bord administrateur pour la gestion complète du contenu (ajout, modification, suppression d'activités).

---

## Fonctionnalités

### Côté Utilisateur

- **Authentification sécurisée** : Inscription, connexion, et modification de mot de passe.
- **Catalogue d'activités** : Consultation des différentes activités et cours proposés par le club.
- **Planning** : Visualisation claire du planning des cours (jour/heure).
- **Interface responsive** : Navigation fluide sur ordinateur, tablette et mobile.

### Côté Administrateur

- **Tableau de bord dédié** : Espace sécurisé pour les administrateurs.
- **Gestion des activités (CRUD)** : Création, lecture, mise à jour et suppression des activités sportives.
- **Gestion des médias** : Upload sécurisé des images illustrant les activités.

---

## Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **Backend** : Node.js, Express.js
- **Base de données** : (Gérée via `config/db.js`)
- **Authentification** : JSON Web Tokens (JWT).
- **Gestion des fichiers** : Middleware d'upload (ex: Multer) pour les images.

---

## Architecture du Projet

```text
FitClub/
├── app.js / server.js   # Points d'entrée de l'application Serveur
├── config/              # Configuration globale (Base de données, etc.)
├── controllers/         # Logique métier (Auth, Activités, Cours)
├── middleware/          # Middlewares Express (Protection des routes, Uploads)
├── public/              # Fichiers statiques Frontend (HTML, CSS, JS clients)
│   ├── admin/           # Vues spécifiques pour le panel d'administration
│   ├── assets/          # Images, Icônes, Logos
│   └── uploads/         # Images téléchargées dynamiquement
└── routes/              # Définition des points d'API (Endpoints)
```

---

## Installation & Démarrage

### Prérequis

- [Node.js](https://nodejs.org/) installé sur votre machine.
- Un gestionnaire de paquets (`npm` ou `yarn`).

### Étapes pour lancer le projet en local :

1. **Cloner le dépôt** (si applicable) ou extraire les fichiers :

   ```bash
   git clone <url-du-repo>
   cd FitClub
   ```

2. **Installer les dépendances** :

   ```bash
   npm install
   ```

3. **Variables d'environnement** :
   - Créez un fichier `.env` à la racine du projet.
   - Ajoutez-y vos variables nécessaires (port, URI de base de données, secrets pour JWT, etc.).

   _Exemple de `.env` :_

   ```env
   PORT=3000
   DB_URI=votre_chaine_de_connexion
   JWT_SECRET=votre_cle_secrète
   ```

4. **Démarrer le serveur** :
   - Pour le développement (avec rechargement automatique) :
     ```bash
     npm run dev
     ```
   - Pour la production :
     ```bash
     npm start
     ```

5. **Accéder à l'application** :
   Ouvrez votre navigateur et allez sur `http://localhost:3000` (ou le port défini dans votre `.env`).

---

## Auteurs

- **Danis Ibrahimovic**

---
