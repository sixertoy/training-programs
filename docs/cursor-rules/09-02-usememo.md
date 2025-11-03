# useMemo - Mémorisation des calculs

### ⚙️ Principe de base

Utiliser `useMemo` uniquement pour mémoïser des calculs coûteux ou des valeurs de référence et non comme pratique par défaut. L'objectif est d'éviter une refonte inutile lorsque le composant se rend.

### ✅ Conditions d'utilisation (Quand l'utiliser)

Utilisez `useMemo` si, et seulement si :

**1. Calcul coûteux**

La fonction de calcul prend un temps notable à s'exécuter (filtrage complexe sur un grand tableau, transformations de données lourdes, etc.).

```tsx
// ✅ BON - Calcul coûteux mémorisé
const ExpensiveComponent = ({ items }: { items: Item[] }) => {
  const processedItems = useMemo(() => {
    return items
      .filter(/* Filtrage complexe */)
      .sort(/* Tri complexe */)
      .map(/* Transformation lourde */);
  }, [items]);

  return <div>{/* Utiliser processedItems */}</div>;
};
```

**2. Stabilité de référence**

La valeur renvoyée est un objet, un tableau, ou un autre type de référence (y compris des éléments React) et est passée en tant que prop à un composant enfant optimisé avec `React.memo`.

```tsx
// ✅ BON - Objet stable pour composant mémorisé
const Parent = () => {
  const [filter, setFilter] = useState('');

  const config = useMemo(() => ({
    filter,
    sortBy: 'name',
  }), [filter]);

  return <MemoizedChild config={config} />;
};

const MemoizedChild = React.memo(({ config }: { config: Config }) => {
  return <div>{/* Utiliser config */}</div>;
});
```

```tsx
// ✅ BON - Tableau stable pour composant mémorisé
const Parent = ({ rawData }: { rawData: Data[] }) => {
  const processedData = useMemo(() => {
    return rawData.map(/* Transformation */);
  }, [rawData]);

  return <MemoizedList items={processedData} />;
};
```

**3. Dépendance de Hook**

La valeur est placée dans le tableau de dépendances d'un autre Hook (`useEffect`, `useCallback`, etc.) et doit être stable pour éviter une réexécution fréquente.

```tsx
// ✅ BON - Valeur stable dans les dépendances d'useEffect
const Component = ({ items }: { items: Item[] }) => {
  const sortedItems = useMemo(() => {
    return items.sort(/* ... */);
  }, [items]);

  useEffect(() => {
    // Effect ne se réexécute que si sortedItems change vraiment
    performAction(sortedItems);
  }, [sortedItems]);
};
```

### ❌ Interdictions (Quand NE PAS l'utiliser)

**1. Valeurs primitives simples**

```tsx
// ❌ MAUVAIS - Valeur primitive simple
const Component = ({ a, b }: { a: number; b: number }) => {
  const sum = useMemo(() => a + b, [a, b]); // Coût de useMemo > coût du calcul

  return <div>{sum}</div>;
  // Mieux : const sum = a + b;
};
```

**2. Calculs triviaux**

```tsx
// ❌ MAUVAIS - Calcul trivial
const Component = ({ name }: { name: string }) => {
  const greeting = useMemo(() => `Hello, ${name}!`, [name]);

  return <div>{greeting}</div>;
  // Mieux : const greeting = `Hello, ${name}!`;
};
```

**3. Tableau de dépendances qui change à chaque rendu**

```tsx
// ❌ MAUVAIS - Dépendances qui changent constamment
const Component = ({ items }: { items: Item[] }) => {
  // Si items change à chaque rendu (nouvelle référence), useMemo est inefficace
  const processed = useMemo(() => {
    return items.map(/* ... */);
  }, [items]); // L'optimisation est annulée par la surcharge

  return <div>{/* ... */}</div>;
};
```

### 🔑 Meilleure pratique

**Tableau de dépendances complet et correct**

```tsx
// ✅ BON - Dépendances complètes
const Component = ({ items, filter, sortBy }: Props) => {
  const processedItems = useMemo(() => {
    return items
      .filter(item => item.category === filter)
      .sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
  }, [items, filter, sortBy]); // Toutes les dépendances sont incluses

  return <MemoizedList items={processedItems} />;
};
```

```tsx
// ✅ BON - Éléments React stables
const Component = ({ count }: { count: number }) => {
  const header = useMemo(() => (
    <header>
      <h1>Count: {count}</h1>
    </header>
  ), [count]); // Élément React stable

  return (
    <div>
      {header}
      {/* Reste du composant */}
    </div>
  );
};
```

**Résumé des règles :**

- ✅ Utiliser pour calculs coûteux (filtrage, tri, transformations lourdes)
- ✅ Utiliser pour valeurs de référence (objets, tableaux) passées à composants mémorisés
- ✅ Utiliser pour valeurs dans les dépendances d'autres Hooks
- ❌ NE PAS utiliser pour valeurs primitives simples (strings, numbers, booleans)
- ❌ NE PAS utiliser pour calculs triviaux
- ❌ NE PAS utiliser si dépendances changent constamment
- 🔑 Toujours inclure toutes les dépendances dans le tableau `deps`
