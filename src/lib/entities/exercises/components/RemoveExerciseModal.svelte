<script lang="ts">
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import invariant from 'tiny-invariant';

	import FormModal from '$lib/components/FormModal.svelte';
	import { deleteExercise } from '$lib/entities/exercises/mutations';
	import { getExercisesQueryOptions } from '$lib/entities/exercises/queries';
	import type { Program } from '$lib/entities/programs/types';
	import type { Routine } from '$lib/entities/routines/types';

	import type { Exercise } from '../types';

	type Props = {
		exercise: Exercise;
		programId: Program['id'];
		routineId: Routine['id'];
		isOpen: boolean;
	};

	let { exercise, programId, routineId, isOpen = $bindable() }: Props = $props();

	const queryClient = useQueryClient();
	const deleteExerciseMutation = createMutation(() => ({
		mutationFn: deleteExercise,
		onSuccess: () => {
			const queryKey = getExercisesQueryOptions({ programId, routineId }).queryKey;
			const exercisesData = queryClient.getQueryData(queryKey);
			invariant(exercisesData, 'Exercises data should be in the query cache');
			const filteredData = exercisesData.filter((e) => e.id !== exercise.id);
			queryClient.setQueryData(queryKey, filteredData);
		},
		onSettled: () => {
			isOpen = false;
		}
	}));
</script>

<FormModal
	title="Remove exercise"
	bind:isOpen
	onSubmit={() => deleteExerciseMutation.mutate({ programId, routineId, id: exercise.id })}
	isLoading={deleteExerciseMutation.isPending}
	isSubmitDisabled={deleteExerciseMutation.isPending}
	intent="delete"
>
	<p class="confirmation-text">
		Are you sure? “{exercise.name}” and its logs will be removed from this routine.
	</p>
</FormModal>

<style>
	.confirmation-text {
		font-size: 1.5rem;
		color: var(--neutral-11);
	}
</style>
