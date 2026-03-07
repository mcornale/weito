import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { getExercisesQueryOptions } from '$lib/entities/exercises/queries';
import { getProgramsQueryOptions } from '$lib/entities/programs/queries';

export const load = async ({ params, parent }) => {
	const { queryClient } = await parent();

	const programs = await queryClient.ensureQueryData(getProgramsQueryOptions());

	const program = programs.find((program) =>
		program.routines.some((r) => r.id === params.routineId)
	);

	const routine = program?.routines.find((r) => r.id === params.routineId);

	if (!routine) {
		const redirectRoutineId = programs.at(0)?.routines.at(0)?.id;
		if (redirectRoutineId) {
			goto(resolve('/(app)/[routineId]', { routineId: redirectRoutineId }));
		} else {
			goto(resolve('/(app)'));
		}
	}

	if (program && routine) {
		queryClient.prefetchQuery(
			getExercisesQueryOptions({ programId: program.id, routineId: routine.id })
		);
	}
};
