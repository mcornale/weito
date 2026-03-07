<script lang="ts">
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import FormModal from '$lib/components/FormModal.svelte';
	import { deleteProgram } from '$lib/entities/programs/mutations';
	import { getProgramsQueryOptions } from '$lib/entities/programs/queries';
	import { getNotifierContext } from '$lib/features/notifier/context';

	import type { Program } from '../types';

	type Props = {
		program: Program;
		isOpen: boolean;
	};

	let { program, isOpen = $bindable() }: Props = $props();

	const { notifyError } = getNotifierContext();

	const queryClient = useQueryClient();
	const deleteProgramMutation = createMutation(() => ({
		mutationFn: deleteProgram,
		onSuccess: () => {
			const programsData = queryClient.getQueryData(getProgramsQueryOptions().queryKey);
			const filteredProgramsData = (programsData ?? []).filter((p) => p.id !== program.id);
			queryClient.setQueryData(getProgramsQueryOptions().queryKey, filteredProgramsData);
			const lastVisitedRoutineId = localStorage.getItem('last-visited-routine-id');

			if (filteredProgramsData.length === 0) {
				localStorage.removeItem('last-visited-routine-id');
				goto(resolve('/(app)'));
			} else if (program.routines.some((r) => r.id === lastVisitedRoutineId)) {
				const routines = filteredProgramsData.flatMap((p) => p.routines);
				const nextRoutineId = routines[0].id;

				goto(resolve('/(app)/[routineId]', { routineId: nextRoutineId }));
			}
			isOpen = false;
		},
		onError: () => {
			notifyError(`Couldn't delete program. Please try again.`);
		}
	}));
</script>

<FormModal
	title="Delete program"
	bind:isOpen
	onSubmit={() => deleteProgramMutation.mutate({ id: program.id })}
	isLoading={deleteProgramMutation.isPending}
	isSubmitDisabled={deleteProgramMutation.isPending}
	intent="delete"
>
	<p class="confirmation-text">
		Are you sure? All routines, exercises, and logs inside "{program.name}" will be deleted.
	</p>
</FormModal>

<style>
	.confirmation-text {
		font-size: 1.5rem;
		color: var(--neutral-11);
	}
</style>
