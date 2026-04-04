import * as v from 'valibot';

export const ExerciseSchema = v.object({
	id: v.string(),
	order: v.number(),
	name: v.string(),
	setsAndReps: v.array(v.object({ sets: v.number(), reps: v.string() })),
	restTime: v.object({ minutes: v.number(), seconds: v.number() }),
	createdAt: v.string()
});

export type Exercise = v.InferInput<typeof ExerciseSchema>;

export function parseExercise(data: unknown): Exercise {
	return v.parse(ExerciseSchema, data);
}
