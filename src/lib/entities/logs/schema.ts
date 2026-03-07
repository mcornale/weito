import * as v from 'valibot';

import type { Log } from './types';

const LogSetSchema = v.object({
	weight: v.number(),
	reps: v.number()
});

export const LogSchema = v.object({
	id: v.string(),
	sets: v.array(LogSetSchema),
	createdAt: v.string(),
	note: v.optional(v.string())
});

export function parseLog(data: unknown): Log {
	return v.parse(LogSchema, data);
}
