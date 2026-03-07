import type { Program } from '../programs/types';

export type Routine = {
	id: string;
	order: number;
	name: string;
	createdAt: string;
	programId: Program['id'];
};
