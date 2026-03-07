import { collection, deleteDoc, doc, setDoc } from 'firebase/firestore';

import { requireCurrentUser } from '$lib/features/auth';
import { db } from '$lib/firebase';

import type { Exercise } from '../exercises/types';
import type { Program } from '../programs/types';
import type { Routine } from '../routines/types';
import type { Log } from './types';

type CreateLogPayload = Omit<Log, 'id' | 'createdAt'> & {
	programId: Program['id'];
	routineId: Routine['id'];
	exerciseId: Exercise['id'];
};

export async function createLog(payload: CreateLogPayload) {
	const user = requireCurrentUser();
	const now = new Date().toISOString();

	const { programId, routineId, exerciseId, ...rest } = payload;

	const logData = {
		...rest,
		createdAt: now
	};

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
	const logRef = doc(logsRef);

	await setDoc(logRef, logData);

	return {
		id: logRef.id,
		...logData
	} satisfies Log as Log;
}

type DeleteLogPayload = {
	programId: Program['id'];
	routineId: Routine['id'];
	exerciseId: Exercise['id'];
	id: Log['id'];
};
export async function deleteLog(payload: DeleteLogPayload) {
	const user = requireCurrentUser();

	const { programId, routineId, exerciseId, id: logId } = payload;

	const logRef = doc(
		db,
		'users',
		user.uid,
		'programs',
		programId,
		'routines',
		routineId,
		'exercises',
		exerciseId,
		'logs',
		logId
	);

	await deleteDoc(logRef);
}
