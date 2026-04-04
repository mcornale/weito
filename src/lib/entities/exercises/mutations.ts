import { collection, deleteDoc, doc, setDoc, writeBatch } from 'firebase/firestore';

import { requireCurrentUser } from '$lib/features/auth';
import { db } from '$lib/firebase';

import type { Program } from '../programs/schema';
import type { Routine } from '../routines/schema';
import type { Exercise } from './schema';

type CreateExercisePayload = Omit<Exercise, 'id' | 'createdAt'> & {
	programId: Program['id'];
	routineId: Routine['id'];
};

export async function createExercise(payload: CreateExercisePayload) {
	const user = requireCurrentUser();
	const now = new Date().toISOString();

	const { programId, routineId, ...exerciseData } = payload;

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
	const exerciseRef = doc(exercisesRef);

	const docData = { ...exerciseData, createdAt: now };
	await setDoc(exerciseRef, docData);

	return {
		id: exerciseRef.id,
		...docData
	} satisfies Exercise as Exercise;
}

type UpdateExercisePayload = Pick<Exercise, 'id'> &
	Partial<Omit<Exercise, 'id' | 'createdAt'>> & {
		programId: Program['id'];
		routineId: Routine['id'];
	};

export async function updateExercise(payload: UpdateExercisePayload) {
	const user = requireCurrentUser();

	const { programId, routineId, id: exerciseId, ...exerciseData } = payload;

	const exerciseRef = doc(
		db,
		'users',
		user.uid,
		'programs',
		programId,
		'routines',
		routineId,
		'exercises',
		exerciseId
	);

	await setDoc(exerciseRef, exerciseData, { merge: true });
}

type SwapExerciseOrderPayload = {
	programId: Program['id'];
	routineId: Routine['id'];
	exerciseA: Exercise;
	exerciseB: Exercise;
};

export async function swapExerciseOrder(payload: SwapExerciseOrderPayload) {
	const user = requireCurrentUser();

	const { programId, routineId, exerciseA, exerciseB } = payload;

	const batch = writeBatch(db);

	const exercisesCollection = collection(
		db,
		'users',
		user.uid,
		'programs',
		programId,
		'routines',
		routineId,
		'exercises'
	);

	batch.update(doc(exercisesCollection, exerciseA.id), { order: exerciseB.order });
	batch.update(doc(exercisesCollection, exerciseB.id), { order: exerciseA.order });

	await batch.commit();
}
type DeleteExercisePayload = {
	programId: Program['id'];
	routineId: Routine['id'];
	id: Exercise['id'];
};

export async function deleteExercise(payload: DeleteExercisePayload) {
	const user = requireCurrentUser();
	const { programId, routineId, id: exerciseId } = payload;

	const exerciseRef = doc(
		db,
		'users',
		user.uid,
		'programs',
		programId,
		'routines',
		routineId,
		'exercises',
		exerciseId
	);
	await deleteDoc(exerciseRef);
}
