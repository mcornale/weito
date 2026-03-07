<script lang="ts">
	import { IconArrowDown, IconArrowUp, IconPencil } from '@tabler/icons-svelte';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import invariant from 'tiny-invariant';

	import Button from '$lib/components/ui/Button.svelte';
	import Menu from '$lib/components/ui/Menu.svelte';
	import { getProgramsQueryOptions } from '$lib/entities/programs/queries';
	import type { Program } from '$lib/entities/programs/types';
	import { swapRoutineOrder } from '$lib/entities/routines/mutations';
	import { getNotifierContext } from '$lib/features/notifier/context';

	import type { Routine } from '../types';
	import RenameRoutineModal from './RenameRoutineModal.svelte';

	type Props = {
		routine: Routine;
		program: Program;
	};

	type SwapPayload = { routineA: Routine; routineB: Routine };

	function applyRoutineOrderSwap(
		programs: Program[],
		programId: Program['id'],
		{ routineA, routineB }: SwapPayload
	): Program[] {
		const currentProgram = programs.find((p) => p.id === programId);
		invariant(currentProgram, 'Program should be in the data');

		const updatedRoutines = currentProgram.routines
			.map((r) => {
				if (r.id === routineA.id) {
					return { ...r, order: routineB.order };
				}
				if (r.id === routineB.id) {
					return { ...r, order: routineA.order };
				}
				return r;
			})
			.sort((a, b) => a.order - b.order);

		return programs.map((p) => (p.id === programId ? { ...p, routines: updatedRoutines } : p));
	}

	let { routine, program }: Props = $props();
	let menu = $state<{ close(): void } | undefined>(undefined);

	let isRenameRoutineModalOpen = $state(false);
	let pendingDirection = $state<-1 | 1 | null>(null);

	const { notifyError } = getNotifierContext();

	const queryClient = useQueryClient();

	const swapOrderMutation = createMutation(() => ({
		mutationFn: swapRoutineOrder,
		onSuccess: (_, payload) => {
			queryClient.setQueryData(getProgramsQueryOptions().queryKey, (data) => {
				invariant(data, 'Programs data should be in the query cache');
				return applyRoutineOrderSwap(data, program.id, payload);
			});
			menu?.close();
		},
		onError: () => {
			notifyError(`Couldn't move routine. Please try again.`);
		},
		onSettled: () => {
			pendingDirection = null;
		}
	}));

	const index = $derived(program.routines.findIndex((r) => r.id === routine.id));
	const canMoveUp = $derived(index > 0);
	const canMoveDown = $derived(index >= 0 && index < program.routines.length - 1);
	const isMovePending = $derived(swapOrderMutation.isPending);
	const isMoveUpPending = $derived(isMovePending && pendingDirection === -1);
	const isMoveDownPending = $derived(isMovePending && pendingDirection === 1);

	function move(direction: -1 | 1) {
		const otherIndex = index + direction;
		if (otherIndex < 0 || otherIndex >= program.routines.length) return;
		pendingDirection = direction;
		swapOrderMutation.mutate({
			programId: program.id,
			routineA: program.routines[index],
			routineB: program.routines[otherIndex]
		});
	}
</script>

<Menu bind:this={menu}>
	<Button variant="secondary-ghost" onclick={() => (isRenameRoutineModalOpen = true)}>
		<IconPencil size={16} stroke={2.5} aria-hidden="true" />
		Rename
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
	<!-- <Button variant="secondary-ghost" disabled>
		<IconCopy size={16} stroke={2.5} aria-hidden="true" />
		Copy exercises
	</Button>
	<Button variant="secondary-ghost" disabled>
		<IconClipboard size={16} stroke={2.5} aria-hidden="true" />
		Paste exercises
	</Button>
	<Button variant="tertiary-destructive" disabled>
		<IconEraser size={16} stroke={2.5} aria-hidden="true" />
		Clear exercises
	</Button> -->
</Menu>

<RenameRoutineModal bind:isOpen={isRenameRoutineModalOpen} {routine} />
