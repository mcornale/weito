import { redirect } from '@sveltejs/kit';

import { getCurrentUser } from '$lib/features/auth';

export async function load() {
	const currentUser = await getCurrentUser();

	if (currentUser) {
		redirect(302, '/');
	}
}
