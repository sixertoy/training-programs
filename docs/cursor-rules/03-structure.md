# Structure du Projet

## Vue d'ensemble

```
src/
├── 🚀 main.tsx                    # Point d'entrée avec BrowserRouter
├── ⚛️ application.tsx              # Composant racine de l'application
├── 🌐 application.router.tsx      # Configuration des routes React Router
├── 🎨 application.module.css      # Styles CSS Module pour Application
├── 🎨 index.css                   # Styles globaux uniquement
│
├── 📄 pages/                      # Pages de l'application (une page = un dossier)
│   ├── 📦 index.ts                # Barrel file principal : export * from './[page-name]'
│   └── 📁 [page-name]/            # Dossier en kebab-case
│       ├── 📦 index.ts            # Barrel file : export * from './[page-name]'
│       ├── ⚛️ [page-name].page.tsx     # Composant de la page
│       ├── 🎨 [page-name].module.css (si nécessaire)
│       └── 🪝 [page-name].hook.ts  # Hook personnalisé pour la logique (si nécessaire)
│
├── 🧩 components/                 # Composants réutilisables
│   ├── 📦 index.ts                # Barrel file principal : export * from './[component-name]'
│   └── 📁 [component-name]/       # Dossier en kebab-case
│       ├── 📦 index.ts            # Barrel file : export * from './[component-name]'
│       ├── ⚛️ [component-name].component.tsx
│       ├── 🎨 [component-name].module.css
│       └── 🪝 [component-name].hook.ts  # Hook personnalisé pour la logique (si nécessaire)
│
├── 🏗️ layouts/                    # Layouts React Router pour la gestion des layouts
│   └── 📁 [layout-name]/
│       ├── ⚛️ [layout-name].layout.tsx
│       ├── 🎨 [layout-name].module.css
│       └── 📦 index.ts
│
├── 🌐 contexts/                   # Contexts React pour la gestion d'état globale
│   └── 📁 [context-name]/
│       ├── ⚛️ [context-name].provider.tsx
│       ├── 🪝 [context-name].hook.ts
│       └── 📦 index.ts
│
├── 🪝 hooks/                      # Hooks personnalisés réutilisables
│   ├── ⚛️ [hook-name].hook.ts
│   └── 📦 index.ts
│
├── 📋 interfaces/                 # Interfaces TypeScript
│   └── [interface-name].interface.ts
│
├── 🔤 types/                      # Types TypeScript
│   └── [type-name].type.ts
│
├── 🔢 enums/                      # Enums et constantes
│   └── [enum-name].enum.ts
│
├── 🛠️ utils/                      # Fonctions utilitaires
│   └── [utility-name].util.ts
│
├── ⚙️ configs/                    # Configuration des différents composants
│   └── [config-name].config.ts
│
└── 🖼️ assets/                     # Ressources statiques (images, fonts, etc.)
    └── ...
```

## Fichiers racine

- **`main.tsx`** : Point d'entrée de l'application, configure le BrowserRouter
- **`application.tsx`** : Composant racine, peut contenir des providers globaux
- **`application.router.tsx`** : Configuration centralisée de toutes les routes
- **`application.module.css`** : Styles spécifiques au composant Application
- **`index.css`** : Styles globaux (reset CSS, variables CSS, etc.)

## Conventions de nommage

- **Pages** : kebab-case avec extension `.page.tsx` (`my-page.page.tsx`)
- **Composants** : kebab-case avec extension `.component.tsx` (`my-component.component.tsx`)
- **Layouts** : kebab-case avec extension `.layout.tsx` (`my-layout.layout.tsx`)
- **Utils** : kebab-case avec extension `.util.ts` (`my-utility.util.ts`)
- **Hooks** : kebab-case avec extension `.hook.ts` (`my-page.hook.ts`, `my-component.hook.ts`)
- **Barrel files** : toujours nommés `index.ts`
- **Styles** : même nom que le composant avec extension `.module.css`
