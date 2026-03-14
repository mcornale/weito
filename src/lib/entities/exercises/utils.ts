import type { Exercise } from './types';

export function formatSetsAndReps(setsAndReps: Exercise['setsAndReps']): string {
	if (setsAndReps.length > 1 && setsAndReps.every((set) => set.sets === 1))
		return setsAndReps.map((set) => set.reps).join(' · ');

	return setsAndReps.map((set) => `${set.sets}×${set.reps}`).join(' · ');
}
