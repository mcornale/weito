import * as v from 'valibot';

import type { Routine } from './types';

export const RoutineSchema = v.object({
	id: v.string(),
	order: v.number(),
	name: v.string(),
	createdAt: v.string(),
	programId: v.string()
});

export function parseRoutine(data: unknown): Routine {
	return v.parse(RoutineSchema, data);
}
