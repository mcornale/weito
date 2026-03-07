import { collection, deleteDoc, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore';

import { requireCurrentUser } from '$lib/features/auth';
import { db, deleteCollectionInBatches } from '$lib/firebase';

import type { Routine } from '../routines/types';
import type { Program } from './types';

type CreateProgramPayload = Pick<Program, 'name'> & {
	routineNames: Routine['name'][];
};

export async function createProgram(payload: CreateProgramPayload) {
	const user = requireCurrentUser();
	const now = new Date().toISOString();

	const programsRef = collection(db, 'users', user.uid, 'programs');
	const programRef = doc(programsRef);
	const routinesRef = collection(db, 'users', user.uid, 'programs', programRef.id, 'routines');
	const programData = {
		name: payload.name,
		createdAt: now
	};

	const routineRefs = payload.routineNames.map(() => doc(routinesRef));
	const routinesData = payload.routineNames.map((name, index) => ({
		name,
		order: index + 1,
		programId: programRef.id,
		createdAt: now
	}));

	const batch = writeBatch(db);

	batch.set(programRef, programData);
	routineRefs.forEach((ref, i) => batch.set(ref, routinesData[i]));

	await batch.commit();

	const createdRoutines = routineRefs.map((ref, i) => ({
		id: ref.id,
		...routinesData[i]
	})) satisfies Routine[];

	return {
		id: programRef.id,
		...programData,
		routines: createdRoutines
	} satisfies Program as Program;
}

export type UpdateProgramPayload = Pick<Program, 'id'> & Partial<Omit<Program, 'id' | 'createdAt'>>;

export async function updateProgram(payload: UpdateProgramPayload) {
	const user = requireCurrentUser();

	const { id: programId, ...programData } = payload;

	await setDoc(doc(db, 'users', user.uid, 'programs', programId), programData, {
		merge: true
	});
}

type DeleteProgramPayload = Pick<Program, 'id'>;

export async function deleteProgram(payload: DeleteProgramPayload) {
	const { id: programId } = payload;

	const user = requireCurrentUser();
	const uid = user.uid;
	const userDoc = (...path: string[]) => doc(db, 'users', uid, ...path);
	const userCollection = (...path: string[]) => collection(db, 'users', uid, ...path);

	const routinesSnap = await getDocs(userCollection('programs', programId, 'routines'));

	for (const routineDoc of routinesSnap.docs) {
		const routineId = routineDoc.id;
		const exercisesSnap = await getDocs(
			userCollection('programs', programId, 'routines', routineId, 'exercises')
		);

		for (const exerciseDoc of exercisesSnap.docs) {
			const logsRef = userCollection(
				'programs',
				programId,
				'routines',
				routineId,
				'exercises',
				exerciseDoc.id,
				'logs'
			);
			await deleteCollectionInBatches(logsRef);
		}

		const exercisesRef = userCollection('programs', programId, 'routines', routineId, 'exercises');
		await deleteCollectionInBatches(exercisesRef);
	}

	const routinesRef = userCollection('programs', programId, 'routines');
	await deleteCollectionInBatches(routinesRef);

	await deleteDoc(userDoc('programs', programId));
}
