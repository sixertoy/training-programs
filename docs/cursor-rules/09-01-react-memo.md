# React.memo - Guide d'utilisation

### Vue d'ensemble

`React.memo` est un HOC (Higher Order Component) qui mémorise le résultat d'un composant et ne le re-rend que si ses props ont changé (comparaison superficielle).

### ❌ Quand NE PAS utiliser React.memo

**1. Composants qui se re-rendent souvent avec des props différentes**

Si un composant reçoit presque toujours des props différentes à chaque rendu, le coût de la vérification des props (comparaison superficielle) dépassera le gain potentiel de la mémoïsation.

```tsx
// ❌ MAUVAIS - Le composant se re-rend souvent avec des props différentes
export const Counter = React.memo(({ count }: { count: number }) => {
  return <div>{count}</div>;
});
```

**2. Props de type Référence non mémorisées**

Si vous passez des objets, tableaux ou fonctions non mémorisées à chaque rendu du parent, `React.memo` sera inefficace car la comparaison superficielle détectera toujours un changement.

```tsx
// ❌ MAUVAIS - Nouvelle fonction à chaque rendu du parent
const Parent = () => {
  const handleClick = () => console.log('click'); // Nouvelle fonction à chaque rendu
  
  return <Child onClick={handleClick} />; // React.memo sera inutile
};

const Child = React.memo(({ onClick }: { onClick: () => void }) => {
  return <button onClick={onClick}>Click</button>;
});
```

### ✅ Quand utiliser React.memo

**1. Composants qui se re-rendent souvent avec les mêmes props**

Utilisez `React.memo` pour des composants qui :
- Sont rendus fréquemment
- Reçoivent généralement les mêmes props
- Sont coûteux à re-rendre

```tsx
// ✅ BON - Composant coûteux qui peut bénéficier de la mémoïsation
export const ExpensiveComponent = React.memo(({ data }: { data: string[] }) => {
  const processed = useMemo(() => {
    // Traitement complexe
    return data.map(/* ... */);
  }, [data]);

  return <div>{/* Rendu complexe */}</div>;
});
```

**2. Composants avec props primitives stables**

Les props primitives (string, number, boolean) sont comparées efficacement.

```tsx
// ✅ BON - Props primitives
export const Button = React.memo(({ label, onClick }: { 
  label: string; 
  onClick: () => void;
}) => {
  return <button onClick={onClick}>{label}</button>;
});
```

### 🔧 Combiner avec les Hooks pour les props de type Référence

Si vous devez passer des objets, tableaux ou fonctions à un composant mémorisé, utilisez :

**useCallback pour les fonctions :**

```tsx
const Parent = () => {
  const [count, setCount] = useState(0);
  
  // ✅ Mémoriser la fonction avec useCallback
  const handleClick = useCallback(() => {
    console.log('click');
  }, []); // Dépendances vides si la fonction est stable

  return <Child onClick={handleClick} />;
};

const Child = React.memo(({ onClick }: { onClick: () => void }) => {
  return <button onClick={onClick}>Click</button>;
});
```

**useMemo pour les objets et tableaux :**

```tsx
const Parent = () => {
  const [filter, setFilter] = useState('');
  
  // ✅ Mémoriser l'objet avec useMemo
  const config = useMemo(() => ({
    filter,
    sortBy: 'name',
  }), [filter]);

  return <Child config={config} />;
};

const Child = React.memo(({ config }: { config: { filter: string; sortBy: string } }) => {
  return <div>{/* Utiliser config */}</div>;
});
```

### 📋 Checklist d'utilisation

Utilisez `React.memo` si **TOUS** ces critères sont remplis :

- ✅ Le composant est rendu fréquemment
- ✅ Il reçoit généralement les mêmes props
- ✅ Les props sont stables (primitives) ou mémorisées (useCallback/useMemo)
- ✅ Le re-rendu du composant est coûteux OU il se trouve dans une liste rendue souvent

N'utilisez **PAS** `React.memo` si :

- ❌ Le composant se re-rend presque toujours avec des props différentes
- ❌ Vous ne pouvez pas mémoriser les props de type référence
- ❌ Le composant est simple et son re-rendu est peu coûteux
- ❌ Le composant est rendu rarement

### 🔍 Exemple complet recommandé

```tsx
import React, { useCallback, useMemo, useState } from 'react';
import styles from './user-list.module.css';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserItemProps {
  user: User;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

// ✅ Composant mémorisé avec props stables
export const UserItem = React.memo(({ 
  user, 
  onSelect, 
  isSelected 
}: UserItemProps) => {
  const handleClick = useCallback(() => {
    onSelect(user.id);
  }, [user.id, onSelect]);

  return (
    <div 
      className={`${styles.item} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
    >
      <span>{user.name}</span>
      <span>{user.email}</span>
    </div>
  );
});

UserItem.displayName = 'UserItem';

// Composant parent qui mémorise les props
export const UserList = ({ users }: { users: User[] }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ✅ Mémoriser la fonction callback
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return (
    <div className={styles.list}>
      {users.map(user => (
        <UserItem
          key={user.id}
          user={user}
          onSelect={handleSelect}
          isSelected={user.id === selectedId}
        />
      ))}
    </div>
  );
};
```
