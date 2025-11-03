# useCallback - Mémorisation des fonctions

### ⚙️ Principe de base

Utiliser `useCallback` uniquement à des fins d'optimisation de performance ciblée et non comme pratique par défaut.

### ✅ Conditions d'utilisation (Quand l'utiliser)

Utilisez `useCallback` si, et seulement si :

**1. La fonction est passée en tant que prop à un composant enfant mémorisé**

```tsx
// ✅ BON - Composant enfant mémorisé avec React.memo
const Parent = () => {
  const handleClick = useCallback(() => {
    // Logique
  }, []);

  return <MemoizedChild onClick={handleClick} />;
};

const MemoizedChild = React.memo(({ onClick }: { onClick: () => void }) => {
  return <button onClick={onClick}>Click</button>;
});
```

**2. La fonction est placée dans le tableau de dépendances d'un autre Hook**

```tsx
// ✅ BON - Fonction dans les dépendances d'useEffect
const Component = () => {
  const fetchData = useCallback(async () => {
    // Fetch
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData est stable grâce à useCallback
};
```

```tsx
// ✅ BON - Fonction dans les dépendances d'useMemo
const Component = () => {
  const processData = useCallback((data: Data[]) => {
    return data.map(/* ... */);
  }, []);

  const processed = useMemo(() => {
    return processData(rawData);
  }, [rawData, processData]); // processData est stable grâce à useCallback
};
```

### ❌ Interdictions (Quand NE PAS l'utiliser)

**1. Fonctions utilisées uniquement localement**

```tsx
// ❌ MAUVAIS - Fonction non passée en prop
const Component = () => {
  const handleClick = useCallback(() => {
    // Utilisée uniquement localement
  }, []);

  return <button onClick={handleClick}>Click</button>;
  // Mieux : const handleClick = () => { ... }
};
```

**2. Composant enfant non mémorisé**

```tsx
// ❌ MAUVAIS - Enfant non mémorisé, useCallback inutile
const Parent = () => {
  const handleClick = useCallback(() => {
    // Logique
  }, []);

  return <Child onClick={handleClick} />; // Child n'est pas React.memo
};

const Child = ({ onClick }: { onClick: () => void }) => {
  return <button onClick={onClick}>Click</button>;
};
```

**3. Tableau de dépendances qui change à chaque rendu**

```tsx
// ❌ MAUVAIS - Dépendances qui changent constamment
const Component = ({ items }: { items: Item[] }) => {
  const handleItem = useCallback((item: Item) => {
    // Logique
  }, [items]); // Si items change à chaque rendu, useCallback est inefficace

  return items.map(item => (
    <MemoizedChild key={item.id} item={item} onHandle={handleItem} />
  ));
};
```

### 🔑 Meilleure pratique

**Tableau de dépendances complet et correct**

```tsx
// ✅ BON - Dépendances complètes
const Component = ({ id, filter }: { id: string; filter: string }) => {
  const handleClick = useCallback(() => {
    console.log(id, filter); // Utilise id et filter
  }, [id, filter]); // Toutes les dépendances sont incluses

  return <MemoizedChild onClick={handleClick} />;
};
```

```tsx
// ✅ BON - Tableau vide pour fonction stable
const Component = () => {
  const handleClick = useCallback(() => {
    console.log('click'); // Ne dépend d'aucune valeur du scope
  }, []); // Tableau vide = fonction stable

  return <MemoizedChild onClick={handleClick} />;
};
```

**Résumé des règles :**

- ✅ Utiliser si fonction passée à un composant mémorisé (`React.memo`)
- ✅ Utiliser si fonction dans les dépendances d'un autre Hook (`useEffect`, `useMemo`, etc.)
- ❌ NE PAS utiliser pour fonctions locales uniquement
- ❌ NE PAS utiliser si enfant non mémorisé
- ❌ NE PAS utiliser si dépendances changent constamment
- 🔑 Toujours inclure toutes les dépendances dans le tableau `deps`
