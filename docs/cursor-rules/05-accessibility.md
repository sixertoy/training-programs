# Accessibilité (a11y)

L'accessibilité est une priorité. Respecter les standards WCAG 2.1 niveau AA minimum.

## Attributs ARIA et sémantique HTML

- Utiliser des éléments HTML sémantiques (`<nav>`, `<header>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`)
- Ajouter des attributs ARIA appropriés (`aria-label`, `aria-labelledby`, `aria-describedby`, `aria-live`, etc.)
- Utiliser `role` uniquement quand nécessaire (préférer les éléments HTML natifs)
- Tous les éléments interactifs doivent avoir un label accessible

## Navigation au clavier

- Tous les éléments interactifs doivent être accessibles au clavier (tab, enter, espace, flèches)
- Ordre de tabulation logique et prévisible
- Gérer les événements clavier : `onKeyDown`, `onKeyPress`, `onKeyUp`
- Indicateurs de focus visibles pour tous les éléments interactifs
- Gérer les pièges au clavier pour les modales et menus

## Formulaires

- Associer chaque input à un `<label>` avec `htmlFor` ou utiliser `aria-label`
- Grouper les champs liés avec `<fieldset>` et `<legend>`
- Afficher les messages d'erreur avec `aria-describedby` et `aria-invalid`
- Valider les formulaires et afficher les erreurs de manière accessible
- Utiliser `required` et autres attributs HTML natifs

## Images et médias

- Toujours fournir un `alt` descriptif pour les images (vide si décoratif : `alt=""`)
- Décrire le contenu et la fonction de l'image, pas juste "image de..."
- Ajouter des sous-titres et transcriptions pour les vidéos/audios

## Contraste et couleurs

- Contraste minimum 4.5:1 pour le texte normal, 3:1 pour le texte large
- Ne pas utiliser uniquement la couleur pour transmettre des informations
- Tester avec des outils de vérification de contraste

## Focus et états

- Rendre visible le focus clavier (style personnalisé si nécessaire)
- Gérer les états visuels (hover, active, disabled) de manière accessible
- Utiliser `outline` ou alternative visible pour le focus (ne jamais désactiver complètement)

## Tests d'accessibilité

- Tester avec un lecteur d'écran (NVDA, JAWS, VoiceOver)
- Tester la navigation uniquement au clavier
- Utiliser des outils d'audit (axe DevTools, Lighthouse, WAVE)
- Vérifier la compatibilité avec les technologies d'assistance
