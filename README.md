# 🩺 Mediplan

[![Language](https://img.shields.io/badge/language-JavaScript-yellow.svg)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/license-Unspecified-lightgrey.svg)](#)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](#)
[![Status](https://img.shields.io/badge/status-active-brightgreen.svg)](#)

Gestionnaire de rendez-vous médicaux — Application Web locale & GitHub Pages

Mediplan est une application légère conçue pour suivre :

- vos spécialistes médicaux
- leurs fréquences de consultation
- vos rendez-vous passés et futurs
- les examens et préparations à réaliser avant un RDV

L’application fonctionne entièrement dans le navigateur, sans serveur externe et sans base de données. Les données sont stockées localement dans `localStorage`.

💻 Version en ligne disponible sur GitHub Pages : https://domiq44.github.io/mediplan/

---

## 🌟 Pourquoi utiliser Mediplan ?

- très simple d’utilisation
- fonctionne sans connexion Internet
- pas de dépendance à installer
- design moderne avec sélection de thème à 3 positions : système, clair ou sombre
- expérience mobile améliorée : texte agrandi, dashboard prioritaire et header allégé sur smartphone
- sauvegarde automatique
- export/import pour sauvegarder ou restaurer vos données

---

## 📂 Structure du projet

```
mediplan/
├── docs/                     # Racine de l'application (GitHub Pages)
│   ├── index.html            # Page principale
│   ├── style.css             # Styles, thème, mise en page et responsive
│   ├── app.js                # Initialisation, thème, chargement et stockage des données
│   ├── dashboard.js          # Vue d’ensemble et calcul des prochains RDV
│   ├── specialistes.js       # Gestion des spécialistes (CRUD, édition, suppression)
│   ├── rdv.js                # Gestion des rendez-vous et dépendances
│   ├── dates.js              # Validation et calculs de dates
│   ├── utils.js              # Fonctions utilitaires et sécurité HTML
│   ├── ui.js                 # Affichage des notifications et messages dans l’interface
│   ├── data.js               # Gestion centralisée des données et du stockage local
│   └── data.json             # Données initiales utilisées au premier lancement
│
├── start.sh                  # Démarrage du serveur HTTP local Python
├── stop.sh                   # Arrêt du serveur local
└── README.md                 # Documentation du projet
```

---

## 🚀 Prérequis

Aucun **Node.js** n’est nécessaire.

Vous avez besoin de :

- `python3`
- un navigateur moderne (Chrome, Firefox, Edge…)

---

## ▶️ Démarrage local

Pour lancer Mediplan :

```bash
./start.sh
```

Le site s’ouvre automatiquement à :

```text
http://localhost:9000
```

Si le port `9000` est déjà utilisé, vous pouvez lancer le serveur sur un autre port :

```bash
./start.sh 8080
```

Puis ouvrez :

```text
http://localhost:8080
```

### Arrêter le serveur

```bash
./stop.sh
```

Le script termine le serveur local et supprime le fichier de PID.

---

## 🧠 Comment les données sont gérées

### 1. Chargement initial

- l’application charge `docs/data.json`
- si `localStorage` contient des données, elles remplacent `data.json`
- sinon, `data.json` sert de base

### 2. Sauvegarde automatique

Chaque modification est enregistrée dans `localStorage` :

- ajout ou édition d’un spécialiste
- suppression d’un spécialiste
- ajout ou suppression d’un rendez-vous
- ajout d’une dépendance
- préférence de thème (système / clair / sombre)

> Note : cette sauvegarde est locale au navigateur et à l’URL `http://localhost:9000`.
> Certaines versions de navigateur peuvent aussi demander une autorisation de stockage durable.
> Si vous changez de navigateur, de machine ou que vous voulez une sauvegarde sûre,
> utilisez l’export/import.

### 3. Export / Import

- **Exporter** crée un fichier JSON contenant l’intégralité des données
- **Importer** remplace les données actuelles par celles du fichier sélectionné
- l’import vérifie maintenant la structure du JSON et refuse les fichiers invalides
- les erreurs et confirmations s’affichent directement dans l’interface

### 4. Sauvegarde recommandée avant fermeture

- avant de fermer l’application ou de redémarrer le serveur, exportez vos données
- après redémarrage, réimportez le fichier JSON pour restaurer l’état
- cette étape est recommandée si vous voulez conserver vos données sans risque

---

## 📘 Guide utilisateur détaillé

### 1. Voir le tableau de bord

- l’onglet **Dashboard** affiche des cartes de synthèse (nombre de spécialistes, rendez-vous à venir, dépendances, prochain RDV)
- il présente une liste des prochains rendez-vous et des spécialistes les plus proches
- cliquez sur **Voir** pour ouvrir la fiche d’un spécialiste
- utilisez le sélecteur de thème dans l’en-tête pour choisir **Système**, **Clair** ou **Sombre**
- si vous n’avez pas encore choisi, le thème suit automatiquement la préférence de votre système

### 2. Ajouter un spécialiste

- cliquez sur **Ajouter un spécialiste**
- remplissez la spécialité, le prénom, le nom et la fréquence en mois
- la fréquence est utilisée pour calculer le prochain RDV à partir du dernier RDV enregistré
- cliquez sur **Ajouter**

### 3. Modifier un spécialiste

- sur la fiche d’un spécialiste, cliquez sur **Modifier**
- mettez à jour les champs
- cliquez sur **Enregistrer**
- si vous ne souhaitez pas sauvegarder, utilisez **Annuler**

### 4. Ajouter un rendez-vous

- ouvrez la fiche du spécialiste
- utilisez le champ date/heure (`datetime-local`)
- le format attendu est `YYYY-MM-DDTHH:MM`
- cliquez sur **Ajouter**

### 5. Supprimer un rendez-vous

- cliquez sur **Supprimer** à côté du rendez-vous dans l’historique
- la suppression est immédiate après confirmation

### 6. Ajouter une dépendance

- choisissez un rendez-vous existant dans la liste
- entrez le type d’examen ou la préparation
- indiquez le nombre de jours avant ce rendez-vous
- la date calculée s’affiche automatiquement en fonction du RDV sélectionné

### 7. Supprimer un spécialiste

- possible uniquement s’il n’a aucun rendez-vous futur
- cela évite de supprimer un spécialiste qui a encore des RDV à venir

---

## 📌 Format des données

Exemple de spécialiste :

```json
{
  "id": "uuid-v4",
  "specialite": "Dentiste",
  "prenom": "Jean",
  "nom": "Dupont",
  "frequence_mois": 6,
  "telephone": "06 12 34 56 78",
  "adresse": "12 rue Exemple, 44000 Nantes",
  "rdv": ["2026-07-10T09:30"],
  "rdv_dependances": [
    {
      "type": "Radio panoramique",
      "delai_jours": 10,
      "rdv_date": "2026-07-10T09:30"
    }
  ]
}
```

> Les rendez-vous doivent être au format ISO local `YYYY-MM-DDTHH:MM` pour inclure la date et l’heure.
> 
> Chaque valeur de la liste `rdv` est une chaîne de date/heure locale au format :
> `2026-07-10T09:30`.

---

## 🧩 Description des fichiers importants

### `docs/style.css`
- style moderne et accessible
- sélecteur de thème à 3 positions : système / clair / sombre
- mise en page responsive
- design amélioré pour les cartes, les boutons et les formulaires

### `docs/app.js`
- initialise le thème
- gère l’affichage des onglets
- charge les données
- exporte et importe les données JSON

### `docs/dashboard.js`
- calcule le prochain RDV global
- génère un tableau de bord avec des cartes de synthèse
- affiche la liste des prochains rendez-vous
- trie les spécialistes par date

### `docs/specialistes.js`
- affiche la liste des spécialistes
- gère l’ajout, l’édition et la suppression
- protège la suppression en cas de RDV futur

### `docs/rdv.js`
- gère les rendez-vous et les dépendances
- crée, supprime et valide les RDV
- propose des annulations de saisie

### `docs/dates.js`
- validation des dates et des heures
- conversion vers des objets `Date`
- calcul du prochain RDV et des dépendances
- fonctions de tri

### `docs/utils.js`
- échapement du HTML pour sécuriser l’affichage
- évite les problèmes liés aux contenus dynamiques

### `docs/data.js`
- centralise l’état `DATA`
- gère les lectures et écritures dans `localStorage`
- fournit des helpers pour la recherche de spécialistes

---

## 🛠️ Corrections et améliorations récentes

- support des rendez-vous avec heure (`HH:MM`)
- suppression de spécialiste interdite si des RDV futurs existent
- boutons `Annuler` ajoutés pour les formulaires
- interface plus claire et plus lisible
- messages d’erreur et de confirmation affichés dans l’interface
- validation stricte des données importées
- centralisation du stockage des données
- sécurisation des affichages HTML

---

## 👩‍🏫 Conseils pour un débutant

- si le site n’apparaît pas, vérifiez que `python3` est installé.
- si le navigateur ne s’ouvre pas, ouvrez manuellement `http://localhost:9000`.
- si vous souhaitez repartir de zéro, supprimez la clé `mediplanData` dans le stockage local du navigateur.
- exportez vos données avant de faire des modifications importantes.

---

## 🔧 Améliorations possibles

- rappels et notifications
- version mobile dédiée
- synchronisation cloud
- gestion de documents et ordonnances

---

## 📜 Licence

Projet personnel — libre d’utilisation, de modification et d’amélioration.
