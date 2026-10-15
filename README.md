# nestjs-hexagonal

API REST de gestion d’utilisateurs construite avec NestJS et TypeScript. Le projet sert de base à une architecture hexagonale : le domaine et les cas d’utilisation dépendent d’un port de dépôt, tandis que l’infrastructure fournit son implémentation PostgreSQL avec Drizzle ORM.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation et configuration](#installation-et-configuration)
- [Base de données et migrations](#base-de-données-et-migrations)
- [Lancer le serveur](#lancer-le-serveur)
- [API utilisateurs](#api-utilisateurs)
- [Tests et qualité](#tests-et-qualité)
- [Scripts disponibles](#scripts-disponibles)
- [Licence](#licence)

## Fonctionnalités

- Création d’un utilisateur avec un identifiant UUID généré par l’application.
- Consultation d’un utilisateur par identifiant et liste de tous les utilisateurs.
- Mise à jour et suppression d’un utilisateur.
- Modèle de domaine `User`, avec les objets-valeurs `UserId` et `Email`.
- Persistance PostgreSQL avec Drizzle ORM.
- Interface de dépôt permettant de substituer l’adaptateur de persistance, notamment par un dépôt en mémoire dans les tests ou le développement.
- Validation des variables de configuration au démarrage.

La réponse utilisateur comprend l’identifiant, le nom, l’adresse e-mail, les dates de création et de mise à jour ainsi que l’ancienneté du compte en jours (`accountAge`).

## Technologies

- [NestJS](https://nestjs.com/) et TypeScript
- [PostgreSQL](https://www.postgresql.org/)
- [Drizzle ORM](https://orm.drizzle.team/) et Drizzle Kit
- `pg` pour la connexion PostgreSQL
- Joi pour la validation de configuration
- Jest et Supertest pour les tests
- pnpm comme gestionnaire de paquets (un fichier `pnpm-lock.yaml` est fourni)

## Architecture

Le code métier est organisé par fonctionnalité, ici `user`, puis séparé selon les responsabilités hexagonales :

```text
src/
├── main.ts
├── app.module.ts
├── infrastructure/
│   ├── config/
│   │   └── env.validation.ts
│   └── database/
│       ├── client.ts
│       └── schema/
└── user/
    ├── domain/
    │   ├── entities/
    │   └── value-objects/
    ├── application/
    │   ├── ports/
    │   └── use-cases/
    ├── infrastructure/
    │   └── adapters/
    ├── presentation/
    └── user.module.ts

drizzle/                   # migrations SQL générées
test/                      # tests end-to-end
```

- **Domaine** (`domain/`) : entité `User` et objets-valeurs `UserId` et `Email`; contient les règles métier.
- **Application** (`application/`) : cas d’utilisation de création, lecture, liste, mise à jour et suppression. `UserRepositoryPort` définit le contrat de persistance.
- **Présentation** (`presentation/`) : contrôleur HTTP NestJS qui reçoit les requêtes et transforme les entités en réponses JSON.
- **Infrastructure** (`infrastructure/`) : adaptateur `DrizzleUserRepository`, connexion PostgreSQL et schéma Drizzle.
- **Module** (`user.module.ts`) : relie le port `USER_REPOSITORY` à l’adaptateur PostgreSQL.

`InMemoryUserRepository` est également disponible comme adaptateur en mémoire, mais l’application configure actuellement `DrizzleUserRepository` comme dépôt par défaut.

## Prérequis

- Node.js et pnpm installés.
- Une instance PostgreSQL accessible depuis l’application.
- `psql` (client PostgreSQL), si vous appliquez les migrations depuis le terminal.

## Installation et configuration

À la racine du dépôt, installez les dépendances :

```bash
pnpm install
```

Créez un fichier `.env` à la racine du projet :

```dotenv
DATABASE_URL=postgresql://UTILISATEUR:MOT_DE_PASSE@HOTE:5432/NOM_DE_BASE
PORT=3000
```

Remplacez les éléments de connexion par ceux de votre instance PostgreSQL. `DATABASE_URL` et `PORT` sont obligatoires : la configuration Joi vérifie leur présence au démarrage. Le fichier `.env` est ignoré par Git ; ne commitez pas de secrets ni de vrais identifiants de connexion.

## Base de données et migrations

Le schéma Drizzle de la table `users` est défini dans `src/infrastructure/database/schema/users.schema.ts`. Il contient :

| Colonne      | Type                          | Contraintes                            |
| ------------ | ----------------------------- | -------------------------------------- |
| `id`         | UUID                          | Clé primaire                           |
| `name`       | `varchar(100)`                | Obligatoire                            |
| `email`      | `varchar(255)`                | Obligatoire, unique                    |
| `created_at` | timestamp avec fuseau horaire | Obligatoire, valeur par défaut `now()` |
| `updated_at` | timestamp avec fuseau horaire | Obligatoire, valeur par défaut `now()` |

Une migration SQL initiale est présente dans `drizzle/0000_careful_maria_hill.sql`. La connexion de l’application ne crée pas automatiquement les tables : appliquez la migration une fois sur une base vide avant le premier démarrage :

```bash
psql "postgresql://UTILISATEUR:MOT_DE_PASSE@HOTE:5432/NOM_DE_BASE" \
  -f drizzle/0000_careful_maria_hill.sql
```

Vous pouvez aussi exécuter le contenu de ce fichier avec l’outil d’administration PostgreSQL de votre choix. Cette migration initiale crée la table `users`; ne la rejouez pas sur une base où cette table existe déjà.

La configuration Drizzle Kit est dans `drizzle.config.ts` et utilise `DATABASE_URL`. Pour générer une migration à partir du schéma :

```bash
pnpm exec drizzle-kit generate
```

Vérifiez le SQL généré avant de l’appliquer à la base. Le projet ne définit pas de script pnpm dédié à l’application des migrations ; appliquez les fichiers SQL avec votre outil PostgreSQL habituel.

## Lancer le serveur

En développement, avec redémarrage automatique :

```bash
pnpm run start:dev
```

Autres modes disponibles :

```bash
# Démarrage simple
pnpm run start

# Mode debug avec surveillance des fichiers
pnpm run start:debug

# Compiler puis démarrer la version compilée
pnpm run build
pnpm run start:prod
```

Le serveur écoute sur le port indiqué par `PORT` (3000 dans l’exemple). Les routes de l’API sont préfixées par `/users`.

## API utilisateurs

Les exemples supposent que l’API est disponible sur `http://localhost:3000`.

| Méthode  | Route        | Description                       |
| -------- | ------------ | --------------------------------- |
| `POST`   | `/users`     | Créer un utilisateur              |
| `GET`    | `/users`     | Lister tous les utilisateurs      |
| `GET`    | `/users/:id` | Récupérer un utilisateur par UUID |
| `PATCH`  | `/users/:id` | Mettre à jour un utilisateur      |
| `DELETE` | `/users/:id` | Supprimer un utilisateur          |

### Créer un utilisateur

```bash
curl -i -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada Lovelace","email":"ada@example.com"}'
```

Corps attendu : `name` et `email`. En cas de succès, l’API renvoie l’utilisateur créé :

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "createdAt": "2026-01-01T12:00:00.000Z",
  "updatedAt": "2026-01-01T12:00:00.000Z",
  "accountAge": 1
}
```

L’identifiant et les dates ci-dessus sont des exemples ; ils sont générés au moment de la création. Une adresse e-mail déjà utilisée entraîne une réponse `409 Conflict`.

### Lire les utilisateurs

```bash
# Tous les utilisateurs
curl http://localhost:3000/users

# Un utilisateur
curl http://localhost:3000/users/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

La liste est renvoyée sous forme de tableau JSON. Un identifiant UUID invalide sur `GET /users/:id` entraîne une réponse `400 Bad Request`; un utilisateur inexistant entraîne une réponse `404 Not Found`.

### Mettre à jour un utilisateur

```bash
curl -i -X PATCH http://localhost:3000/users/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada Byron","email":"ada.byron@example.com"}'
```

Le contrat TypeScript attend `email` et accepte `name` de manière facultative. La réponse contient l’utilisateur mis à jour. Un utilisateur inexistant entraîne une réponse `404 Not Found`.

### Supprimer un utilisateur

```bash
curl -i -X DELETE http://localhost:3000/users/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

La suppression ne renvoie pas de représentation d’utilisateur.

## Tests et qualité

```bash
# Tests unitaires
pnpm run test

# Tests unitaires en mode surveillance
pnpm run test:watch

# Tests avec rapport de couverture
pnpm run test:cov

# Tests end-to-end
pnpm run test:e2e

# Vérification statique avec Oxlint
pnpm run lint
```

Les tests end-to-end utilisent la configuration `test/jest-e2e.json`. Le dépôt ne fournit pas de configuration de base PostgreSQL de test ; adaptez ou remplacez le fournisseur de dépôt dans les tests selon le scénario testé.

## Scripts disponibles

| Script        | Commande               | Rôle                                                 |
| ------------- | ---------------------- | ---------------------------------------------------- |
| `build`       | `pnpm run build`       | Compile l’application avec Nest CLI                  |
| `start`       | `pnpm run start`       | Démarre l’application                                |
| `start:dev`   | `pnpm run start:dev`   | Démarre en développement avec surveillance           |
| `start:debug` | `pnpm run start:debug` | Démarre avec le débogueur et surveillance            |
| `start:prod`  | `pnpm run start:prod`  | Démarre le code compilé dans `dist/`                 |
| `lint`        | `pnpm run lint`        | Exécute Oxlint sur `src/` et `test/`                 |
| `test`        | `pnpm run test`        | Exécute Jest                                         |
| `test:watch`  | `pnpm run test:watch`  | Exécute Jest en mode surveillance                    |
| `test:cov`    | `pnpm run test:cov`    | Exécute Jest avec couverture                         |
| `test:e2e`    | `pnpm run test:e2e`    | Exécute les tests end-to-end                         |
| `format`      | `pnpm run format`      | Formate les fichiers TypeScript de `src/` et `test/` |

## Licence

Le paquet est configuré comme privé et indique `UNLICENSED` dans `package.json`. Aucune licence de redistribution n’est déclarée.
