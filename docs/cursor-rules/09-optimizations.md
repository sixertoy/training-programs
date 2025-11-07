# Optimisations React

Cette section couvre les meilleures pratiques pour optimiser les performances de vos composants React.

## Sections détaillées

- [React.memo - Guide d'utilisation](./09-01-react-memo.md)
- [useMemo - Mémorisation des calculs](./09-02-usememo.md)
- [useCallback - Mémorisation des fonctions](./09-03-usecallback.md)

## Vue d'ensemble

Les optimisations React (`React.memo`, `useMemo`, `useCallback`) doivent être utilisées avec discernement et uniquement à des fins d'optimisation de performance ciblée, non comme pratique par défaut.

### Principes généraux

- **Ne pas utiliser l'index d'un tableau comme valeur de la prop `key`** lors de la création des composants multiples dans une boucle (conformément à la règle ESLint `react/no-array-index-key`).
- **Ne pas optimiser prématurément** - Mesurer d'abord, optimiser ensuite
- **Utiliser uniquement si nécessaire** - Chaque optimisation a un coût
- **Combiner intelligemment** - React.memo nécessite souvent useCallback/useMemo pour être efficace
- **Tableaux de dépendances complets** - Toujours inclure toutes les dépendances

Pour plus de détails, consultez les sections spécifiques ci-dessus.
