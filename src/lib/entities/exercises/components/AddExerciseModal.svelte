<script lang="ts">
	import { IconPlus } from '@tabler/icons-svelte';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';

	import Button from '$lib/components/ui/Button.svelte';

	import { createExercise } from '../mutations';
	import { getExercisesQueryOptions } from '../queries';
	import type { Exercise } from '../types';
	import ExerciseModal from './ExerciseModal.svelte';

	type Props = {
		programId: string;
		routineId: string;
		exercises: Exercise[];
	};

	let { programId, routineId, exercises }: Props = $props();

	let isOpen = $state(false);

	const queryClient = useQueryClient();
	const createExerciseMutation = createMutation(() => ({
		mutationFn: createExercise,
		onSuccess: (createdExercise) => {
			queryClient.setQueryData(
				getExercisesQueryOptions({ programId, routineId }).queryKey,
				(data) => [...(data ?? []), createdExercise]
			);
		},
		onSettled: () => {
			isOpen = false;
		}
	}));
</script>

<div class="add-exercise-modal">
	<Button variant="tertiary" size="big" class="add-exercise-button" onclick={() => (isOpen = true)}>
		<IconPlus size={14} stroke={2.5} aria-hidden="true" />
		Add exercise
	</Button>
	<ExerciseModal
		title="Add exercise"
		bind:isOpen
		isLoading={createExerciseMutation.isPending}
		onSubmit={(data) => {
			const lastExercise = exercises.at(-1);
			createExerciseMutation.mutate({
				order: lastExercise ? lastExercise.order + 1 : 1,
				name: data.name,
				setsAndReps: data.setsAndReps,
				restTime: data.restTime,
				programId,
				routineId
			});
		}}
	/>
</div>

<style>
	.add-exercise-modal {
		display: contents;
	}

	.add-exercise-modal :global(.add-exercise-button) {
		font-size: 1.4rem;
		margin-block-start: 0.8rem;
		padding-inline: 0;
		width: 100%;
		justify-content: start;
		margin-block-end: 0.8rem;
	}
</style>
