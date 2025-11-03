# Conventions de Code

## Naming

- **Dossiers** : kebab-case (ex: `home/`, `my-application/`)
- **Fichiers** : kebab-case avec extensions spécifiques
  - Pages : `home.page.tsx`, `my-page.page.tsx`
  - Composants : `button.component.tsx`, `my-component.component.tsx`
  - Layouts : `app.layout.tsx`, `my-layout.layout.tsx`
  - Utils : `api.util.ts`, `format.util.ts`
  - Hooks : `home.hook.ts`, `my-component.hook.ts`
  - Styles : `home.module.css`, `component.module.css`
- **Composants React** : PascalCase dans le code, fichiers en kebab-case
- **displayName obligatoire** - Tous les composants React doivent avoir un `displayName` pour faciliter le débogage (ex: `ComponentName.displayName = 'ComponentName'`)

## Imports et Exports

- **PAS d'exports par défaut** - Utiliser uniquement les exports nommés
- **Export direct** - Déclarer directement le composant comme export nommé : `export const Component = () => {}` (pas de `const Component = () => {}` puis `export { Component }`)
- **Barrel files obligatoires** - Créer des fichiers `index.ts` dans chaque dossier pour réexporter
  - **Dossiers contenant des sous-dossiers** : Créer un `index.ts` principal qui exporte tous les sous-dossiers (ex: `src/pages/index.ts` avec `export * from './home'`, `export * from './about'`, etc.)
  - **Sous-dossiers** : Créer un `index.ts` dans chaque sous-dossier qui exporte le composant (ex: `src/pages/home/index.ts` exporte `Home`)
- Imports : `import { Component } from './path'` plutôt que `import Component from './path'`
- Exception : fichiers de configuration (`.config.{js,ts}`) peuvent utiliser des exports par défaut

**Exemple de barrel file principal :**

```ts
// src/pages/index.ts
export * from './home';
export * from './about';
export * from './contact';
```

```ts
// src/components/index.ts
export * from './button';
export * from './input';
export * from './modal';
```

## TypeScript

- Interfaces/types explicites, éviter `any`
- Types stricts partout
- **Interfaces** : dans `src/interfaces/` (fichiers en kebab-case, ex: `user.interface.ts`)
- **Types** : dans `src/types/` (fichiers en kebab-case, ex: `api.types.ts`)
- **Enums** : dans `src/enums/` (fichiers en kebab-case, ex: `status.enum.ts`)
- Exporter les types/interfaces dans ces dossiers dédiés si réutilisés

## Fonctions et Syntaxe

- **Fonctions fléchées par défaut** - Syntaxe préférée dans la quasi-totalité des cas
- Composants fonctionnels : définis avec des fonctions fléchées
- Callbacks : fonctions fléchées pour `useEffect`, `useCallback`, `onClick`, gestionnaires d'événements, etc.
- Avantages : syntaxe concise, pas de problème de `this` (même si obsolète avec les composants fonctionnels)
- Exception : fonctions exportées nommées peuvent utiliser `function` si nécessaire pour la clarté

## CSS Modules

- Importer : `import styles from './component-name.module.css'`
- Utiliser : `className={styles.container}`
- Classes CSS en camelCase dans TypeScript

## React Router et Layouts

- Utiliser `BrowserRouter` dans `main.tsx`
- Définir les routes dans `application.router.tsx` avec `<Routes>` et `<Route>`
- Utiliser `useNavigate` ou `<Link>` pour la navigation
- **Layouts** : Créer les layouts dans `src/layouts/` avec extension `.layout.tsx` (ex: `app.layout.tsx`, `auth.layout.tsx`)
- Utiliser `<Outlet />` dans les layouts pour rendre les pages enfants
- Appliquer les layouts avec `<Route element={<Layout />}>` pour grouper plusieurs routes

## Gestion d'État

- **PAS de Redux** - Utiliser React Context API et hooks personnalisés
- États globaux : Contexts React dans `src/contexts/`
- États locaux : `useState` dans les composants
- Logique complexe : hooks personnalisés

## Logique Métier et Hooks

- Toute logique (fetch API, gestion d'événements souris/clavier, calculs complexes) dans un hook personnalisé
- Nom du fichier hook : `[page-name].hook.ts` ou `[component-name].hook.ts` (kebab-case avec extension `.hook.ts`)
- Nom de la fonction hook : `use[PageName]` ou `use[ComponentName]` (camelCase avec préfixe `use`)
- Hook dans le même dossier que le composant/page

## Performance

- **React.memo** - Utiliser judicieusement (voir [09-optimizations.md](./09-optimizations.md))
  - Ne pas utiliser par défaut sur tous les composants
  - Utiliser uniquement si le composant se re-rend souvent avec les mêmes props
  - Toujours combiner avec `useCallback`/`useMemo` pour les props de type référence
- **useMemo** - Mémoriser les opérations/computations complexes uniquement
- **useCallback** - Mémoriser les fonctions passées à des composants mémorisés
- Optimiser les listes avec des clés stables (uuid si nécessaire)
