<script lang="ts">
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';

	import FormModal from '$lib/components/FormModal.svelte';
	import { deleteExercise } from '$lib/entities/exercises/mutations';
	import { getExercisesQueryOptions } from '$lib/entities/exercises/queries';
	import type { Program } from '$lib/entities/programs/types';
	import type { Routine } from '$lib/entities/routines/types';
	import { getNotifierContext } from '$lib/features/notifier/context';

	import type { Exercise } from '../types';

	type Props = {
		exercise: Exercise;
		exercises: Exercise[];
		programId: Program['id'];
		routineId: Routine['id'];
		isOpen: boolean;
	};

	let { exercise, exercises, programId, routineId, isOpen = $bindable() }: Props = $props();

	const { notifyError } = getNotifierContext();

	const queryClient = useQueryClient();
	const deleteExerciseMutation = createMutation(() => ({
		mutationFn: deleteExercise,
		onSuccess: (_, payload) => {
			const filteredExercises = exercises.filter((e) => e.id !== payload.id);
			queryClient.setQueryData(
				getExercisesQueryOptions({ programId, routineId }).queryKey,
				filteredExercises
			);
			isOpen = false;
		},
		onError: () => {
			notifyError(`Couldn't remove exercise. Please try again.`);
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
