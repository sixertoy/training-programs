import { CardColor } from '../enums';
import type { Exercise } from '../interfaces/exercise.interface';

export const initialExercises: Exercise[] = [
  {
    color: CardColor.ORANGE,
    description: 'Exercice full-body explosif enchaînant squat, pompe et saut vertical.',
    id: '1',
    name: 'Burpees',
    tags: ['15', '14', '1'],
  },
  {
    color: CardColor.PURPLE,
    description: 'Tirage vertical en suspension à la barre, travail du dos et biceps.',
    id: '2',
    name: 'Tractions',
    tags: ['10', '6'],
  },
  {
    color: CardColor.GREEN,
    description: 'Descente en squat profond avec impulsion explosive vers le haut.',
    id: '3',
    name: 'Squat sauté',
    tags: ['15', '9'],
  },
  {
    color: CardColor.CRIMSON,
    description: 'Poussée verticale avec haltères ou barre depuis les épaules.',
    id: '4',
    name: 'Développé militaire',
    tags: ['7', '17'],
  },
  {
    color: CardColor.BLUE,
    description: 'Maintien du corps en position rigide, renforcement profond des abdos.',
    id: '5',
    name: 'Gainage planche',
    tags: ['1'],
  },
  {
    color: CardColor.AMBER,
    description: 'Pas en avant avec descente du genou arrière, travail unilatéral.',
    id: '6',
    name: 'Fentes marchées',
    tags: ['15', '9'],
  },
];
