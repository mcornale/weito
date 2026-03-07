import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';

import { requireCurrentUser } from '$lib/features/auth';
import { db } from '$lib/firebase';

import type { Routine } from './types';

export type UpdateRoutinePayload = Pick<Routine, 'id' | 'programId'> &
	Partial<Omit<Routine, 'id' | 'programId' | 'createdAt'>>;

export async function updateRoutine(payload: UpdateRoutinePayload) {
	const user = requireCurrentUser();

	const { id: routineId, programId, ...routineData } = payload;

	await setDoc(
		doc(db, 'users', user.uid, 'programs', programId, 'routines', routineId),
		routineData,
		{
			merge: true
		}
	);
}

export type SwapRoutineOrderPayload = {
	programId: Routine['programId'];
	routineA: Routine;
	routineB: Routine;
};

export async function swapRoutineOrder(payload: SwapRoutineOrderPayload) {
	const user = requireCurrentUser();
	const batch = writeBatch(db);
	const { programId, routineA, routineB } = payload;
	const routinesCollection = collection(db, 'users', user.uid, 'programs', programId, 'routines');

	batch.update(doc(routinesCollection, routineA.id), {
		order: routineB.order
	});

	batch.update(doc(routinesCollection, routineB.id), {
		order: routineA.order
	});

	await batch.commit();
}
