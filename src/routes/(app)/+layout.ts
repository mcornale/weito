import { redirect } from '@sveltejs/kit';
import { QueryClient } from '@tanstack/svelte-query';

import { getCurrentUser } from '$lib/features/auth';

export const load = async () => {
	const currentUser = await getCurrentUser();

	if (!currentUser) redirect(302, '/login');

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: Infinity,
				gcTime: Infinity
			}
		}
	});

	return {
		currentUser,
		queryClient
	};
};
