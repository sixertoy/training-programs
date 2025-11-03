# Technologies et Outils

## Framework et Build

- **React 19** - Bibliothèque UI principale
- **TypeScript** - Typage statique obligatoire
- **Vite** - Build tool et serveur de développement (gère automatiquement les CSS Modules)

## Gestionnaire de Paquets

- **Yarn** - OBLIGATOIRE, ne jamais utiliser `npm`
- Toutes les commandes : `yarn install`, `yarn add`, `yarn start`, `yarn build`, `yarn lint`, etc.

## Qualité de Code

- **ESLint V9** - Linting avec flat config (eslint.config.js)
- **Prettier** - Formatage automatique (point-virgule obligatoire en fin de ligne, guillemets simples, 2 espaces)
- ESLint et Prettier doivent passer avant tout commit

## Styles

- **CSS Modules uniquement** - Fichier `.module.css` pour chaque composant (si nécessaire)
- **PAS de styled-components** ou autres frameworks CSS-in-JS
- **PAS de fichiers CSS globaux** sauf `index.css` pour les styles de base

## Bibliothèques Principales

- **react-router** - Gestion des routes et layouts (BrowserRouter dans main.tsx, Routes dans application.router.tsx)
- **luxon** - Gestion des dates et heures
- **react-hook-form** - Gestion des formulaires
- **react-icons** - Bibliothèque d'icônes
- **uuid** - Génération d'identifiants uniques
- **usehooks-ts** - Hooks TypeScript réutilisables (ex: `useToggle`)
