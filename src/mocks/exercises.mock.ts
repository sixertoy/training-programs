import type { Exercise } from '../interfaces/exercise.interface';

export const initialExercises: Exercise[] = [
  {
    color: '#FF6B35',
    description: 'Exercice full-body explosif enchaînant squat, pompe et saut vertical.',
    id: '1',
    name: 'Burpees',
    tags: ['Cardio', 'Jambes', 'Poitrine'],
  },
  {
    color: '#7B2D8B',
    description: 'Tirage vertical en suspension à la barre, travail du dos et biceps.',
    id: '2',
    name: 'Tractions',
    tags: ['Dos', 'Bras'],
  },
  {
    color: '#1A936F',
    description: 'Descente en squat profond avec impulsion explosive vers le haut.',
    id: '3',
    name: 'Squat sauté',
    tags: ['Jambes', 'Fessiers', 'Cardio'],
  },
  {
    color: '#C62A47',
    description: 'Poussée verticale avec haltères ou barre depuis les épaules.',
    id: '4',
    name: 'Développé militaire',
    tags: ['Épaules', 'Bras'],
  },
  {
    color: '#2E86AB',
    description: 'Maintien du corps en position rigide, renforcement profond des abdos.',
    id: '5',
    name: 'Gainage planche',
    tags: ['Abdos'],
  },
  {
    color: '#F18F01',
    description: 'Pas en avant avec descente du genou arrière, travail unilatéral.',
    id: '6',
    name: 'Fentes marchées',
    tags: ['Jambes', 'Fessiers'],
  },
];
