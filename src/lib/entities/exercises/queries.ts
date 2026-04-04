import { queryOptions, skipToken } from '@tanstack/svelte-query';
import { collection, getDocs } from 'firebase/firestore';

import { requireCurrentUser } from '$lib/features/auth';
import { db } from '$lib/firebase';

import type { Program } from '../programs/schema';
import type { Routine } from '../routines/schema';
import { parseExercise } from './schema';

export async function getExercises(programId: Program['id'], routineId: Routine['id']) {
	const user = requireCurrentUser();

	const exercisesRef = collection(
		db,
		'users',
		user.uid,
		'programs',
		programId,
		'routines',
		routineId,
		'exercises'
	);
	const exercisesSnapshot = await getDocs(exercisesRef);

	const exercises = exercisesSnapshot.docs.map((doc) =>
		parseExercise({
			id: doc.id,
			...doc.data()
		})
	);

	return exercises.sort((a, b) => a.order - b.order);
}

export const getExercisesQueryOptions = ({
	programId,
	routineId
}: {
	programId?: Program['id'];
	routineId: Routine['id'];
}) =>
	queryOptions({
		queryKey: ['exercises', programId, routineId],
		queryFn: programId ? () => getExercises(programId, routineId) : skipToken
	});
