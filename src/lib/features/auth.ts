import * as firebaseAuth from 'firebase/auth';
import invariant from 'tiny-invariant';

import { auth } from '$lib/firebase';

const googleProvider = new firebaseAuth.GoogleAuthProvider();

export function requireCurrentUser() {
	const user = firebaseAuth.getAuth().currentUser;
	invariant(user, 'User should be authenticated');

	return user;
}

export async function getCurrentUser() {
	return new Promise<firebaseAuth.User | null>((res) => {
		const unsubscribe = firebaseAuth.onAuthStateChanged(auth, (user) => {
			unsubscribe();
			res(user);
		});
	});
}

export function signInWithGoogle() {
	return firebaseAuth.signInWithPopup(auth, googleProvider);
}

export function signOut() {
	return firebaseAuth.signOut(auth);
}
