import { MUSCLE_GROUPS } from '../mocks';

export const BODY_PARTS = MUSCLE_GROUPS.map((group) => group.id);

export const CIRCUIT_MUSCLES: Record<string, string[]> = {
  CARDIO_HIIT: ['15', '12', '1'],
  FORCE_LOWER: ['15', '11', '12', '9'],
  FORCE_UPPER: ['7', '10', '6', '17', '14', '16'],
  FULL_BODY: BODY_PARTS,
  LEG_DAY: ['15', '11', '12', '9'],
  MOBILITY: ['5', '7', '8'],
  PULL_DAY: ['10', '6', '16', '4'],
  PUSH_DAY: ['7', '14', '17'],
};

export const TODAY_INDEX = 0;
