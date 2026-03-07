import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, getFirestore, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export async function deleteCollectionInBatches(
	ref: ReturnType<typeof collection>,
	batchSize = 500
) {
	const snapshot = await getDocs(ref);
	if (snapshot.empty) return;

	for (let i = 0; i < snapshot.docs.length; i += batchSize) {
		const batch = writeBatch(db);
		const chunk = snapshot.docs.slice(i, i + batchSize);
		chunk.forEach((d) => batch.delete(d.ref));
		await batch.commit();
	}
}
