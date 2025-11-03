# Exemples de Code

## Exemple de Composant avec Hook

Structure : `src/pages/index.ts` (barrel file principal) + `src/pages/my-page/my-page.page.tsx` + `src/pages/my-page/my-page.hook.ts` + `src/pages/my-page/index.ts`

### Composant principal

```tsx
// my-page.page.tsx
import React from 'react';
import styles from './my-page.module.css';
import { useMyPage } from './my-page.hook';

interface MyPageProps {
  title: string;
}

// Note: React.memo est utilisé ici car le composant reçoit une prop primitive (title)
// qui est généralement stable. Pour plus de détails, voir 09-optimizations.md
export const MyPage = React.memo(({ title }: MyPageProps) => {
  const { data, handleClick } = useMyPage();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <button onClick={handleClick}>Action</button>
    </div>
  );
});

MyPage.displayName = 'MyPage';
```

### Barrel file dans le sous-dossier

```tsx
// src/pages/my-page/index.ts (barrel file du sous-dossier)
export { MyPage } from './my-page.page';
export * from './my-page.hook'; // Export du hook si nécessaire
```

### Barrel file principal

```tsx
// src/pages/index.ts (barrel file principal)
export * from './my-page';
export * from './home';
export * from './about';
// ... autres pages
```

Utilisation : `import { MyPage } from './pages'` ou `import { MyPage } from './pages/my-page'`

### Hook personnalisé

```tsx
// my-page.hook.ts
import { useState, useMemo } from 'react';

export const useMyPage = () => {
  const [data, setData] = useState<string[]>([]);

  const handleClick = () => {
    // Logique de gestion d'événement
  };

  const expensiveComputation = useMemo(() => {
    // Opération complexe à mémoriser
    return data.map(/* ... */);
  }, [data]);

  return {
    data,
    handleClick,
    expensiveComputation,
  };
};
```

### Styles CSS Module

```css
/* my-page.module.css */
.container {
  padding: 1rem;
}

.title {
  font-size: 2rem;
  color: #213547;
}
```
