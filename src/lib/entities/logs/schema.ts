import * as v from 'valibot';

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

export type LogSet = v.InferInput<typeof LogSetSchema>;
export type Log = v.InferInput<typeof LogSchema>;

export function parseLog(data: unknown): Log {
	return v.parse(LogSchema, data);
}
