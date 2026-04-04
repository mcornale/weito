import * as v from 'valibot';

import type { Routine } from '../routines/schema';

/** Schema for a program document as stored in Firestore (without routines). */
export const ProgramDocSchema = v.object({
	id: v.string(),
	name: v.string(),
	createdAt: v.string()
});

type ProgramDocSchema = v.InferInput<typeof ProgramDocSchema>;

export function parseProgramDoc(data: unknown): ProgramDocSchema {
	return v.parse(ProgramDocSchema, data);
}

export type Program = ProgramDocSchema & {
	routines: Routine[];
};
