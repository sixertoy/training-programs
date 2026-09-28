import type { CircuitTiming } from '../interfaces/circuit-timing.interface';

export function circuitDurationMin(circuit: CircuitTiming): number {
  return Math.max(
    1,
    Math.round(
      (circuit.prepTime +
        circuit.cycles *
          (circuit.rounds * (circuit.exerciseTime + circuit.restBetweenExercises) +
            circuit.restBetweenCycles) +
        circuit.recoveryTime) /
        60,
    ),
  );
}
