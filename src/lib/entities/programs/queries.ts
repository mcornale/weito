import { queryOptions } from '@tanstack/svelte-query';
import { collection, getDocs } from 'firebase/firestore';

import { requireCurrentUser } from '$lib/features/auth';
import { db } from '$lib/firebase';

import { getRoutines } from '../routines/queries';
import type { Routine } from '../routines/schema';
import type { Program } from './schema';
import { parseProgramDoc } from './schema';

export async function getPrograms(): Promise<Program[]> {
	const user = requireCurrentUser();
	const snapshot = await getDocs(collection(db, 'users', user.uid, 'programs'));

	const programs = snapshot.docs.map((doc) =>
		parseProgramDoc({
			id: doc.id,
			...doc.data()
		})
	);

	const sortedPrograms = programs.sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);

	const allRoutines = (await Promise.all(sortedPrograms.map((p) => getRoutines(p.id)))).flat();

	const routinesByProgramId = new Map<string, Routine[]>();
	for (const routine of allRoutines) {
		const list = routinesByProgramId.get(routine.programId) ?? [];
		list.push(routine);
		routinesByProgramId.set(routine.programId, list);
	}

	return sortedPrograms.map((program) => ({
		...program,
		routines: routinesByProgramId.get(program.id) ?? []
	}));
}

export const getProgramsQueryOptions = () =>
	queryOptions({
		queryKey: ['programs'],
		queryFn: () => getPrograms()
	});
