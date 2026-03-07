<script lang="ts">
	import { IconArrowDown, IconArrowUp, IconPencil, IconTrash } from '@tabler/icons-svelte';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import invariant from 'tiny-invariant';

	import Button from '$lib/components/ui/Button.svelte';
	import Menu from '$lib/components/ui/Menu.svelte';
	import { swapExerciseOrder } from '$lib/entities/exercises/mutations';
	import { getExercisesQueryOptions } from '$lib/entities/exercises/queries';
	import type { Program } from '$lib/entities/programs/types';
	import type { Routine } from '$lib/entities/routines/types';
	import { getNotifierContext } from '$lib/features/notifier/context';

	import type { Exercise } from '../types';
	import EditExerciseModal from './EditExerciseModal.svelte';
	import RemoveExerciseModal from './RemoveExerciseModal.svelte';

	type Props = {
		exercise: Exercise;
		exercises: Exercise[];
		programId: Program['id'];
		routineId: Routine['id'];
	};

	function applyExerciseOrderSwap(
		exercises: Exercise[],
		{ exerciseA, exerciseB }: { exerciseA: Exercise; exerciseB: Exercise }
	): Exercise[] {
		return exercises
			.map((e) => {
				if (e.id === exerciseA.id) {
					return { ...e, order: exerciseB.order };
				}
				if (e.id === exerciseB.id) {
					return { ...e, order: exerciseA.order };
				}
				return e;
			})
			.sort((a, b) => a.order - b.order);
	}

	let { exercise, exercises, programId, routineId }: Props = $props();
	let menu = $state<Menu | undefined>(undefined);

	let isEditExerciseModalOpen = $state(false);
	let isRemoveExerciseModalOpen = $state(false);

	const { notifyError } = getNotifierContext();

	const queryClient = useQueryClient();

	const swapExerciseOrderMutation = createMutation(() => ({
		mutationFn: swapExerciseOrder,
		onMutate: (payload) => {
			const exercisesQueryKey = getExercisesQueryOptions({ programId, routineId }).queryKey;
			const exercisesData = queryClient.getQueryData(exercisesQueryKey);
			invariant(exercisesData, 'Exercises data should be in the query cache');
			const updatedExercises = applyExerciseOrderSwap(exercisesData, payload);
			queryClient.setQueryData(exercisesQueryKey, updatedExercises);
			menu?.close();
			return { previousExercises: exercisesData };
		},
		onError: (_, __, context) => {
			invariant(context && context.previousExercises, 'Previous exercises should be defined');
			notifyError(`Couldn't move exercise. Please try again.`);
			queryClient.setQueryData(
				getExercisesQueryOptions({ programId, routineId }).queryKey,
				context.previousExercises
			);
		}
	}));

	const index = $derived(exercises.findIndex((e) => e.id === exercise.id));
	const canMoveUp = $derived(index > 0);
	const canMoveDown = $derived(index >= 0 && index < exercises.length - 1);

	function move(direction: -1 | 1) {
		const otherIndex = index + direction;
		if (otherIndex < 0 || otherIndex >= exercises.length) return;
		swapExerciseOrderMutation.mutate({
			exerciseA: exercises[index],
			exerciseB: exercises[otherIndex],
			programId,
			routineId
		});
	}
</script>

<Menu bind:this={menu}>
	<Button variant="secondary-ghost" onclick={() => (isEditExerciseModalOpen = true)}>
		<IconPencil size={16} stroke={2.5} aria-hidden="true" />
		Edit
	</Button>
	<Button variant="secondary-ghost" disabled={!canMoveUp} onclick={() => move(-1)}>
		<IconArrowUp size={16} stroke={2.5} aria-hidden="true" />
		Move up
	</Button>
	<Button variant="secondary-ghost" disabled={!canMoveDown} onclick={() => move(1)}>
		<IconArrowDown size={16} stroke={2.5} aria-hidden="true" />
		Move down
	</Button>
	<Button variant="tertiary-destructive" onclick={() => (isRemoveExerciseModalOpen = true)}>
		<IconTrash size={16} stroke={2.5} aria-hidden="true" />
		Remove
	</Button>
</Menu>

<EditExerciseModal bind:isOpen={isEditExerciseModalOpen} {exercise} {programId} {routineId} />
<RemoveExerciseModal bind:isOpen={isRemoveExerciseModalOpen} {exercise} {programId} {routineId} />
