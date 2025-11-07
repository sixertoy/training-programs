# Description de l'application

Training Programs est une application de Génération de Programmes d'Exercices Personnalisés

- [Description de l'application](#description-de-lapplication)
  - [🎯 Objectif de l'Application](#-objectif-de-lapplication)
  - [💻 Technologies Cibles (Rappel des compétences utilisateur)](#-technologies-cibles-rappel-des-compétences-utilisateur)
  - [🔑 Fonctionnalités Clés](#-fonctionnalités-clés)
    - [1. Gestion de la Bibliothèque d'Exercices (CRUD)](#1-gestion-de-la-bibliothèque-dexercices-crud)
    - [2. Création de Programmes d'Entraînement (Écran Principal)](#2-création-de-programmes-dentraînement-écran-principal)
    - [3. Affichage et Lancement du Programme](#3-affichage-et-lancement-du-programme)
    - [4. Sauvegarde et Chargement des Programmes](#4-sauvegarde-et-chargement-des-programmes)
  - [🎨 Design et Ergonomie (UX/UI)](#-design-et-ergonomie-uxui)

## 🎯 Objectif de l'Application

Créer une application web moderne (SPA) permettant aux utilisateurs de définir un objectif de performance et de générer un programme d'entraînement structuré en séries et répétitions, basé sur une bibliothèque d'exercices.

L'application doit pouvoir être utilisée sur un téléphone ou une tablette en tant que PWA

## 💻 Technologies Cibles (Rappel des compétences utilisateur)

L'application doit être développée en utilisant les technologies suivantes :
* **Frontend :** React, Typescript, HTML5, CSS/SCSS, PWA
* **Gestion d'état :** Utilisation des hooks React (useState, useContext).
* **Persistance :** Utilisation du `localStorage` du navigateur pour sauvegarder la bibliothèque d'exercices et les programmes créés (via le hook useLocalStorage de la librairie usehooks-ts).
* **Navigation** dans l'application se fera grâce à la librairie react-router

## 🔑 Fonctionnalités Clés

### 1. Gestion de la Bibliothèque d'Exercices (CRUD)

* **Ajout :** Permettre à l'utilisateur d'ajouter un nouvel exercice.
    * Chaque exercice doit avoir : un **Nom** (ex : Pompes Pliométriques), un **Type** (ex : Jambes, Haut du Corps, Gainage), une **Description/Instruction** courte.
* **Affichage :** Afficher tous les exercices dans un tableau/liste triable par Nom ou Type.
* **Modification/Suppression :** Permettre d'éditer ou de retirer un exercice existant.

### 2. Création de Programmes d'Entraînement (Écran Principal)

* **Formulaire de Création :**
    * **Nom du Programme** (ex : Explosivité Pop-up Surfing).
    * **Nombre de Séries** (ex : 4).
    * **Temps de Repos entre les Séries** (ex : 90 secondes).
* **Sélection des Exercices :** L'utilisateur doit pouvoir ajouter un ou plusieurs exercices de la bibliothèque au programme.
* **Paramétrage par Exercice :** Pour chaque exercice ajouté au programme, l'utilisateur doit définir :
    * **Format :** Répétitions (Reps) ou Durée (Time).
    * **Valeur :** (ex : 12 Répétitions) ou (ex : 30 Secondes).

### 3. Affichage et Lancement du Programme

* **Visualisation :** Afficher clairement le programme structuré :
    * Titre, Nombre de Séries, Temps de Repos.
    * Liste des exercices avec leur format (ex : Pompes Pliométriques, 10 Répétitions).
* **Mode "Entraînement" (Optionnel - si simple à mettre en œuvre) :**
    * Un mode simple avec un **chronomètre/compte à rebours** pour guider l'utilisateur à travers les séries et les temps de repos (via un bouton "Start").

### 4. Sauvegarde et Chargement des Programmes

* **Sauvegarde Automatique :** Le programme créé doit être sauvegardé dans le `localStorage`.
* **Liste des Programmes :** Afficher une liste des programmes sauvegardés (permettant de les charger ou les supprimer).

## 🎨 Design et Ergonomie (UX/UI)

* Interface **claire, moderne et axée sur la fonctionnalité**.
* Design **responsive** (compatible mobile, tablette et desktop).
* Utilisation de **composants React réutilisables** (Input, Button, List/Card pour les exercices).
