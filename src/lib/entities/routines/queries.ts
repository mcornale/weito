import { collection, getDocs } from 'firebase/firestore';

import { requireCurrentUser } from '$lib/features/auth';
import { db } from '$lib/firebase';

import type { Program } from '../programs/types';
import { parseRoutine } from './schema';

export async function getRoutines(programId: Program['id']) {
	const user = requireCurrentUser();

	const snapshot = await getDocs(
		collection(db, 'users', user.uid, 'programs', programId, 'routines')
	);

	return snapshot.docs
		.map((doc) =>
			parseRoutine({
				id: doc.id,
				...doc.data()
			})
		)
		.sort((a, b) => a.order - b.order);
}
