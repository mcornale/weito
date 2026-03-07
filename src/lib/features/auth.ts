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
	const listenToAuthStateChanges = new Promise((res) => {
		firebaseAuth.onAuthStateChanged(auth, async (user) => {
			res(user);
		});
	}) as Promise<firebaseAuth.User | null>;

	return listenToAuthStateChanges;
}

export function signInWithGoogle() {
	return firebaseAuth.signInWithPopup(auth, googleProvider);
}

export function signOut() {
	return firebaseAuth.signOut(auth);
}
