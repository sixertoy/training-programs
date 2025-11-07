# Règles Importantes (Référence rapide)

1. **Yarn obligatoire** - Jamais npm
2. **CSS Modules uniquement** - Jamais styled-components ou CSS-in-JS
3. **Fichiers en kebab-case** - Tous les fichiers
4. **React Router** - Pour toutes les navigations
5. **TypeScript strict** - Types explicites partout
6. **ESLint + Prettier** - Doivent passer avant tout commit
7. **PAS de Redux** - Contexts React et hooks personnalisés
8. **Logique dans les hooks** - Toute logique métier dans un hook dédié
9. **React.memo avec discernement** - Utiliser uniquement si nécessaire (voir 09-optimizations.md)
10. **useMemo pour les calculs complexes** - Optimiser les performances
11. **useCallback pour les fonctions** - Quand passées à des composants mémorisés
12. **Accessibilité (a11y) prioritaire** - Respecter WCAG 2.1 AA minimum (navigation clavier, ARIA, contraste, sémantique HTML)
13. **Modale** -  Utiliser l'élément <dialog> de l'API HTML pour les modales
14. **useId pour les IDs uniques** - Utiliser le hook `useId()` de React pour générer des IDs uniques dans les composants (éviter `Math.random()` ou `substr`)
15. **Props spreading** - Lorsque des props sont spreadées avec `{...props}`, ajouter `// eslint-disable-next-line react/jsx-props-no-spreading` juste avant
