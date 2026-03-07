import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { getProgramsQueryOptions } from '$lib/entities/programs/queries';

export async function load({ parent }) {
	const { queryClient } = await parent();

	const programs = await queryClient.ensureQueryData(getProgramsQueryOptions());
	const redirectRoutineId =
		localStorage.getItem('last-visited-routine-id') ?? programs.at(0)?.routines.at(0)?.id;

	if (redirectRoutineId) {
		goto(resolve('/(app)/[routineId]', { routineId: redirectRoutineId }));
	}
}
