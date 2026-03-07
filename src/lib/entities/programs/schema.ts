import * as v from 'valibot';

import type { Program } from './types';

/** Schema for a program document as stored in Firestore (without routines). */
export const ProgramDocSchema = v.object({
	id: v.string(),
	name: v.string(),
	createdAt: v.string()
});

export function parseProgramDoc(data: unknown): Omit<Program, 'routines'> {
	return v.parse(ProgramDocSchema, data);
}
