<script lang="ts">
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import invariant from 'tiny-invariant';

	import { getNotifierContext } from '$lib/features/notifier/context';

	import { updateExercise } from '../mutations';
	import { getExercisesQueryOptions } from '../queries';
	import type { Exercise } from '../schema';
	import ExerciseModal from './ExerciseModal.svelte';

	type Props = {
		isOpen: boolean;
		exercise: Exercise;
		programId: string;
		routineId: string;
	};

	let { exercise, programId, routineId, isOpen = $bindable() }: Props = $props();

	const initialData = $derived({
		name: exercise.name,
		setsAndReps: exercise.setsAndReps,
		restTime: exercise.restTime
	});

	const { notifyError } = getNotifierContext();

	const queryClient = useQueryClient();
	const updateExerciseMutation = createMutation(() => ({
		mutationFn: updateExercise,
		onSuccess: (_, payload) => {
			const updatedExercise = {
				...exercise,
				name: payload.name ?? exercise.name,
				setsAndReps: payload.setsAndReps ?? exercise.setsAndReps,
				restTime: payload.restTime ?? exercise.restTime
			} satisfies Exercise as Exercise;

			queryClient.setQueryData(
				getExercisesQueryOptions({ programId, routineId }).queryKey,
				(data) => {
					invariant(data, 'Exercises data should be in the query cache');
					return data.map((e) => (e.id === exercise.id ? updatedExercise : e));
				}
			);
			isOpen = false;
		},
		onError: () => {
			notifyError(`Couldn't edit exercise. Please try again.`);
		}
	}));
</script>

<ExerciseModal
	title="Edit exercise"
	bind:isOpen
	{initialData}
	isLoading={updateExerciseMutation.isPending}
	onSubmit={(data) => {
		updateExerciseMutation.mutate({
			id: exercise.id,
			name: data.name,
			setsAndReps: data.setsAndReps,
			restTime: data.restTime,
			programId,
			routineId
		});
	}}
/>
