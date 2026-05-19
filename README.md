# Documentation du Projet FitClub

## Vue d'ensemble

**FitClub** est une application web de gestion d'un club de fitness, développée dans le cadre du **TPI CFC Informaticien 2026** par **Danis Ibrahimovic**.

L'application permet aux clients de consulter les activités, de s'inscrire, de se connecter et de gérer leurs réservations de cours (planning). Une partie "Admin" permet aux gérants de la salle de gérer les activités (CRUD).

---

## Stack Technologique (Règles strictes imposées)

Ce projet respecte un cahier des charges très strict, sans l'utilisation de frameworks front-end lourds.

**Backend :**

- **Node.js** (avec `type: "module"` obligatoire pour utiliser les imports ES6).
- **Express.js** (Routage et Middlewares).
- **PostgreSQL** avec la librairie `pg` (Utilisation d'un Pool de connexion).
- **Sécurité & Auth :** `bcrypt` (hachage des mots de passe), `jsonwebtoken` (JWT pour l'authentification).
- **Fichiers :** `multer` (Upload des photos des activités).
- **Environnement :** `dotenv` pour les variables d'environnement.

**Frontend :**

- **HTML5 sémantique pur** (Aucun framework comme React, Vue, ou Angular).
- **CSS3 pur** (Aucun framework CSS comme Bootstrap ou Tailwind).
- **Vanilla JavaScript ES Modules** (utilisation de `type="module"` dans les balises script).
- **Appels API :** `Fetch API` en appels asynchrones.

---

## Architecture et Structure des Dossiers

L'application adopte une architecture Modèle-Contrôleur-Route classique pour l'API REST, combinée avec des fichiers statiques servis par Express.

```text
FitClub/
├── server.js              # Point d'entrée de l'application (lance le serveur sur un port défini)
├── app.js                 # Configuration Express, initialisation des middlewares et montage des routes
├── package.json           # Dépendances et scripts ("type": "module" défini ici)
├── .env                   # Variables d'environnement de configuration (Port, URL DB, Sécrêts JWT)
│
├── config/
│   └── db.js              # Configuration et initialisation du Pool PostgreSQL
│
├── controllers/           # Logique métier et requêtes SQL liées à chaque fonctionnalité
│   ├── auth.js            # Inscription, connexion, génération des JWT
│   ├── activities.js      # Opérations CRUD sécurisées par les administrateurs
│   ├── courses.js         # Logique liés au planning et aux réservations
│   └── public.js          # Accès global sans authentification
│
├── middleware/            # Intercepteurs de requêtes HTTP
│   ├── auth.js            # Vérifie la validité du Token JWT
│   └── upload.js          # Configure `multer` pour réceptionner et uploader des fichiers
│
├── routes/                # Faisceau liant les points d'entrée (Endpoints API) & leurs Contrôleurs
│   ├── auth.js
│   ├── activities.js
│   ├── courses.js
│   └── public.js
│
└── public/                # Arborescence Frontend (fichiers servis tels quels)
    ├── css/               # Feuilles de style principales et des composants
    ├── js/                # Scripts d'actions et interactions front
    │   ├── api.js         # Gère tous les Fetch vers l'API et attache le token JWT automatiquement
    │   ├── auth.js        # Gère la connexion et l'inscription
    │   └── admin/         # Scripts du tableau de bord d'administration
    ├── assets/            # Logos, Images et Icônes de base
    ├── uploads/           # Photos uploadées par multer via l'application
    ├── index.html         # Page vitrine/Accueil
    ├── activities.html    # Liste publique d'activités
    ├── planning.html      # Calendrier et Réservations
    ├── login.html & register.html  # Authentification
    └── admin/             # Pages sécurisées liées au back-office
```

---

## Fonctionnement et Flux de Données (Dataflow)

### 1. Authentification & Sécurité

1. L'utilisateur saisit ses informations sur `login.html`.
2. Le fichier Front `js/auth.js` lance une requête POST sur `/api/auth/login`.
3. Le backend (`controllers/auth.js`) vérifie en BDD par requêtes paramétrées (sécurité anti Injection SQL).
4. Un mot de passe `bcrypt` est comparé. En cas de succès, un token **JWT** est créé et renvoyé.
5. Côté Front, la gestion de l'état utilisateur est gérée via `sessionStorage` (pour l'affichage conditionnel) et le token de session est géré automatiquement et de manière sécurisée par le navigateur via un cookie `httpOnly`.

### 2. Communication API

Toutes les intéractions avec la base de données PostgreSQL ne se font **JAMAIS** en direct depuis le Frontend.

- Le Front (JavaScript) utilise l'API Fetch.
- Le Backend réceptionne la route dans `app.js` → `routes/*.js`.
- La route passe par un potentiel `middleware/auth.js` pour filtrer si l'utilisateur est admin/connecté.
- L'action se termine dans `controllers/*.js`, où se déroulent la structure algorithmique et la requête asynchrone DB (`pool.query`).

### 3. Gestion des Fichiers Joints (Uploads)

Pour qu'un administrateur puisse ajouter une activité avec image:

- Le formulaire HTML utilise `enctype="multipart/form-data"`.
- La route API correspondante (dans `routes/activities.js`) appelle le middleware `middleware/upload.js`.
- Celui-ci utilise **Multer** pour sauvegarder physiquement le fichier dans `public/uploads/`.
- Le chemin local du fichier texte est ensuite gardé dans PostgreSQL pour l'afficher plus tard en balise `<img src="...">`.

---

## API - Plan des Routes (Endpoints Principaux)

| Endpoint                 | Méthode      | Protégé ? | Description                                           |
| ------------------------ | ------------ | --------- | ----------------------------------------------------- |
| `/api/auth/register`     | POST         | Non       | Inscription d'un nouveau membre                       |
| `/api/auth/login`        | POST         | Non       | Connexion, retourne un token JWT                      |
| `/api/public/activities` | GET          | Non       | Liste toutes les activités de manière publique        |
| `/api/activities`        | GET / POST   | Admin     | Liste ou Crée une activité (nécessite JWT Admin)      |
| `/api/activities/:id`    | PUT / DELETE | Admin     | Modifie ou Supprime une activité spécifique           |
| `/api/courses`           | GET / POST   | Oui       | Liste le planning / Ajoute des cours pour réservation |
| `/api/health`            | GET          | Non       | Route Santé (`Health check`) de l'API                 |
| `/api/health/db`         | GET          | Non       | Route Santé vérifiant la connexion physique PGSQL     |

> **Règle absolue** : Les mots de passe ne transitent jamais en texte clair. Les requêtes BDD n'utilisent jamais la concaténation simple: uniquement des requêtes paramétrées `await pool.query("SELECT * FROM table WHERE id = $1", [id])`.

---

## Lancer le projet

### Prérequis

- **Node.js** d'installé
- **PostgreSQL** démarré avec une base de données fonctionnelle

### Étape 1 : Mettre en place l'environnement

Copiez le fichier `.env.example` en `.env` (si applicable) et modifiez ses valeurs, ex:

```env
PORT=3000
DB_USER=postgres
DB_PASSWORD=secret
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fitclub_db
JWT_SECRET=super_secret_token_1234
```

### Étape 2 : Installer les packages

Dans le terminal (à la racine) :

```bash
npm install
```

### Étape 3 : Démarrer le serveur

En cours de développement (rechargement automatique) :

```bash
npm run dev
```

Ou en mode production :

```bash
npm start
```
