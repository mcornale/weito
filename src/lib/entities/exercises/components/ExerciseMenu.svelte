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
	let pendingDirection = $state<-1 | 1 | null>(null);

	const { notifyError } = getNotifierContext();

	const queryClient = useQueryClient();

	const swapExerciseOrderMutation = createMutation(() => ({
		mutationFn: swapExerciseOrder,
		onSuccess: (_, payload) => {
			const queryKey = getExercisesQueryOptions({
				programId: payload.programId,
				routineId: payload.routineId
			}).queryKey;

			queryClient.setQueryData(queryKey, (data) => {
				invariant(data, 'Exercises data should be in the query cache');
				return applyExerciseOrderSwap(data, payload);
			});
			menu?.close();
		},
		onError: () => {
			notifyError(`Couldn't move exercise. Please try again.`);
		},
		onSettled: () => {
			pendingDirection = null;
		}
	}));

	const index = $derived(exercises.findIndex((e) => e.id === exercise.id));
	const canMoveUp = $derived(index > 0);
	const canMoveDown = $derived(index >= 0 && index < exercises.length - 1);
	const isMovePending = $derived(swapExerciseOrderMutation.isPending);
	const isMoveUpPending = $derived(isMovePending && pendingDirection === -1);
	const isMoveDownPending = $derived(isMovePending && pendingDirection === 1);

	function move(direction: -1 | 1) {
		const otherIndex = index + direction;
		if (otherIndex < 0 || otherIndex >= exercises.length) return;
		pendingDirection = direction;
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
	<Button
		variant="secondary-ghost"
		disabled={!canMoveUp || isMovePending}
		isLoading={isMoveUpPending}
		onclick={() => move(-1)}
	>
		<IconArrowUp size={16} stroke={2.5} aria-hidden="true" />
		Move up
	</Button>
	<Button
		variant="secondary-ghost"
		disabled={!canMoveDown || isMovePending}
		isLoading={isMoveDownPending}
		onclick={() => move(1)}
	>
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
