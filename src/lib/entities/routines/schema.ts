import * as v from 'valibot';

export const RoutineSchema = v.object({
	id: v.string(),
	order: v.number(),
	name: v.string(),
	createdAt: v.string(),
	programId: v.string()
});

export type Routine = v.InferInput<typeof RoutineSchema>;

export function parseRoutine(data: unknown): Routine {
	return v.parse(RoutineSchema, data);
}
