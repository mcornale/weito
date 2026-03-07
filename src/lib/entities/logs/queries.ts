import { queryOptions, skipToken } from '@tanstack/svelte-query';
import { collection, getDocs } from 'firebase/firestore';

import { requireCurrentUser } from '$lib/features/auth';
import { db } from '$lib/firebase';

import type { Exercise } from '../exercises/types';
import type { Program } from '../programs/types';
import type { Routine } from '../routines/types';
import { parseLog } from './schema';

export async function getLogs(
	programId: Program['id'],
	routineId: Routine['id'],
	exerciseId: Exercise['id']
) {
	const user = requireCurrentUser();

	const logsRef = collection(
		db,
		'users',
		user.uid,
		'programs',
		programId,
		'routines',
		routineId,
		'exercises',
		exerciseId,
		'logs'
	);
	const logsSnapshot = await getDocs(logsRef);

	const logs = logsSnapshot.docs.map((doc) =>
		parseLog({
			id: doc.id,
			...doc.data()
		})
	);

	return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const getLogsQueryOptions = ({
	programId,
	routineId,
	exerciseId
}: {
	programId?: Program['id'];
	routineId?: Routine['id'];
	exerciseId?: Exercise['id'];
}) =>
	queryOptions({
		queryKey: ['logs', programId, routineId, exerciseId],
		queryFn:
			programId && routineId && exerciseId
				? () => getLogs(programId, routineId, exerciseId)
				: skipToken
	});
