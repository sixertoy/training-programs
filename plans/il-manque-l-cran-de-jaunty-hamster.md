# Plan — Création de circuits & affectation aux jours (v2)

## Contexte

L'onglet **Exercices** est remplacé par un onglet **Circuits**. L'utilisateur crée d'abord des circuits (avec leurs paramètres de timing), puis y affecte des exercices issus d'une bibliothèque prédéfinie. Les circuits sont ensuite assignables à chaque jour de la semaine courante.

---

## Modèle de données

### Circuit (nouveau)
```ts
interface Circuit {
  id: string;
  name: string;
  color: string;
  // Timing
  prepTime: number;          // secondes avant le premier exercice
  exerciseTime: number;      // secondes par exercice
  restBetweenExercises: number; // secondes de repos entre chaque exercice
  rounds: number;            // nb de rounds par cycle (1 round = 1 exercice + repos)
  cycles: number;            // nb de cycles
  restBetweenCycles: number; // secondes de repos entre cycles
  recoveryTime: number;      // secondes de récupération après l'entraînement
  exerciseIds: string[];     // IDs des exercices affectés (ordre d'exécution)
}
```

### Données initiales
3 circuits prédéfinis (Force Upper, Cardio HIIT, Full Body) avec des valeurs réalistes et des exercices préaffectés depuis `initialExercises`.

---

## Changements sur les types et l'état App

- Ajouter type `Circuit`
- `Screen` : retirer `"library"`, ajouter `"circuits"` et `"create-circuit"` et `"edit-circuit"`
- State `circuits: Circuit[]` dans App
- State `currentWeekDays: DayProgram[]` (remplace la lecture statique de WEEK_HISTORY[0].days)
- Passer `exercises` (bibliothèque) à `CreateCircuitScreen` pour le picker

---

## Onglet Circuits (remplace Exercices)

**CircuitsScreen** — liste des circuits existants :
- Header "Mes Circuits" + bouton `+` → navigate `"create-circuit"`
- Chaque carte circuit : barre de couleur + nom + résumé timing ("45s · 4 rounds · 3 cycles") + nb d'exercices + bouton éditer → navigate `"edit-circuit"` avec l'id

---

## Écran Créer / Éditer un Circuit

Unique composant `CreateCircuitScreen` (utilisé pour créer et éditer).
Cache la BottomNav. Props : `onBack`, `onSave(circuit)`, `exercises: Exercise[]`, `initial?: Circuit`.

### Sections du formulaire

**1. Identité**
- Nom du circuit (input texte)
- Sélecteur de couleur (palette CARD_COLORS)

**2. Paramètres de timing** — 7 champs numériques avec stepper +/− :
| Champ | Unité | Défaut |
|---|---|---|
| Préparation | sec | 10 |
| Temps d'exercice | sec | 45 |
| Repos entre exercices | sec | 15 |
| Rounds par cycle | nb | 4 |
| Nombre de cycles | nb | 3 |
| Repos entre cycles | sec | 60 |
| Récupération finale | sec | 90 |

**3. Exercices affectés**
- Liste ordonnée des exercices sélectionnés (drag-to-reorder non requis — boutons ↑↓ ou simple liste avec ×)
- Bouton "＋ Ajouter un exercice" → ouvre un overlay/bottom sheet de sélection depuis la bibliothèque `exercises`
- Le picker affiche les exercices non encore ajoutés au circuit

**4. Bouton Enregistrer**

---

## Affectation d'un jour (WeeklyScreen)

Semaine courante uniquement : chaque ligne de jour devient cliquable → bottom sheet `DayAssignSheet`.

Bottom sheet contient :
- Titre du jour + bouton fermeture `×`
- Option **Repos** (icône canapé)
- Liste des circuits disponibles (carte compacte : couleur + nom + résumé timing)
- Bouton **"＋ Nouveau circuit"** → navigate `"create-circuit"`

La sélection met à jour `currentWeekDays[i]`.

---

## Navigation BottomNav

| id | Label | Icône |
|---|---|---|
| `"home"` | Accueil | IconHome |
| `"weekly"` | Programme | IconCalendar |
| `"circuits"` | Circuits | IconDumbbell |
| `"timer"` | Séance | IconFlash |

`"create-circuit"` et `"edit-circuit"` cachent la BottomNav (comme `"create"` aujourd'hui).

---

## Fichier modifié

Un seul fichier : `src/App.tsx`

Ordre des ajouts :
1. Type `Circuit` + données initiales `initialCircuits`
2. State `circuits` + `currentWeekDays` dans App
3. `CircuitsScreen` (remplace `LibraryScreen`)
4. `CreateCircuitScreen` (formulaire complet)
5. `DayAssignSheet` (bottom sheet overlay dans WeeklyScreen)
6. WeeklyScreen : rows cliquables + bouton sheet
7. Routing App + BottomNav mis à jour

L'ancienne `LibraryScreen` et `ExerciseCard` sont supprimés (la bibliothèque d'exercices est accessible uniquement depuis le picker dans CreateCircuitScreen). `Tag` et les données `initialExercises`/`BODY_PARTS`/`TAG_COLORS` sont conservés.

---

## Écran Profil & Configuration (accessible depuis l'Accueil)

**Accès** : icône engrenage ou avatar en haut à droite de `HomeScreen` → navigate `"profile"`. Cache la BottomNav.

### Sections

**1. Identité**
- Prénom / Nom (inputs texte)
- Âge (stepper ou input numérique)
- Taille en cm (stepper)
- Poids en kg (stepper)

**2. Couleur d'accent**
Palette de 6-8 couleurs proposées (lime actuel `#cbff47`, orange, cyan, rose, violet, rouge…). La sélection met à jour une CSS custom property `--accent` globale via `document.documentElement.style.setProperty`. Toutes les occurrences de `#cbff47` dans les composants utilisent déjà une variable — à migrer vers `var(--accent)` ou une valeur lue depuis le state `accentColor`.

**3. Données calculées (lecture seule)**
Calculées en temps réel depuis âge/taille/poids :
- **IMC** = poids / (taille/100)² — avec catégorie colorée (Insuffisance, Normal, Surpoids, Obésité)
- **Poids idéal** (formule de Lorentz)
- **Métabolisme de base** kcal/j (formule de Harris-Benedict)
- **Fréquence cardiaque max** estimée = 220 − âge

### State dans App
```ts
interface UserProfile {
  firstName: string;
  lastName: string;
  age: number;
  heightCm: number;
  weightKg: number;
  accentColor: string; // hex, défaut "#cbff47"
}
```
State `profile: UserProfile` dans App. Le prénom alimente le greeting de HomeScreen ("Bonjour, Alexandre 👊" → dynamique).

### Propagation de la couleur d'accent
Passer `accentColor` depuis App via props aux composants qui hardcodent `#cbff47`, ou plus simple : stocker dans un CSS custom property mis à jour à chaque changement.

---

## Vérification

1. `npx tsc --noEmit` passe sans erreur
2. Créer un circuit : nommer, régler les 7 timings, ajouter 3 exercices → enregistrer → apparaît dans la liste Circuits
3. Affecter au planning : Programme → tapper Mercredi → choisir le nouveau circuit → la ligne affiche le nom
4. Marquer repos : tapper un jour actif → Repos → icône canapé
5. Le Timer (Séance) utilise les valeurs du circuit du jour (exerciseTime, rounds, cycles…)
