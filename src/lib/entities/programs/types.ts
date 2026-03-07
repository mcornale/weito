import type { Routine } from '../routines/types';

export type Program = {
	id: string;
	name: string;
	createdAt: string;
	routines: Routine[];
};
