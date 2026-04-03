<script lang="ts">
	import { IconArrowDown, IconArrowUp, IconPencil } from '@tabler/icons-svelte';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import invariant from 'tiny-invariant';

	import Menu from '$lib/components/ui/Menu.svelte';
	import MenuItem from '$lib/components/ui/MenuItem.svelte';
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

	const { notifyError } = getNotifierContext();

	const queryClient = useQueryClient();

	const swapOrderMutation = createMutation(() => ({
		mutationFn: swapRoutineOrder,
		onMutate: (payload) => {
			const programsQueryKey = getProgramsQueryOptions().queryKey;
			const programsData = queryClient.getQueryData(programsQueryKey);
			invariant(programsData, 'Programs data should be in the query cache');
			const updatedPrograms = applyRoutineOrderSwap(programsData, program.id, payload);
			queryClient.setQueryData(programsQueryKey, updatedPrograms);
			menu?.close();
			return { previousPrograms: programsData };
		},
		onError: (_, __, context) => {
			invariant(context && context.previousPrograms, 'Previous programs should be defined');
			notifyError(`Couldn't move routine. Please try again.`);
			queryClient.setQueryData(getProgramsQueryOptions().queryKey, context.previousPrograms);
		}
	}));

	const index = $derived(program.routines.findIndex((r) => r.id === routine.id));
	const canMoveUp = $derived(index > 0);
	const canMoveDown = $derived(index >= 0 && index < program.routines.length - 1);

	function move(direction: -1 | 1) {
		const otherIndex = index + direction;
		if (otherIndex < 0 || otherIndex >= program.routines.length) return;
		swapOrderMutation.mutate({
			programId: program.id,
			routineA: program.routines[index],
			routineB: program.routines[otherIndex]
		});
	}
</script>

<Menu bind:this={menu}>
	<MenuItem onSelect={() => (isRenameRoutineModalOpen = true)}>
		<IconPencil size={16} stroke={2.5} aria-hidden="true" />
		Rename
	</MenuItem>
	<MenuItem isDisabled={!canMoveUp} onSelect={() => move(-1)}>
		<IconArrowUp size={16} stroke={2.5} aria-hidden="true" />
		Move up
	</MenuItem>
	<MenuItem isDisabled={!canMoveDown} onSelect={() => move(1)}>
		<IconArrowDown size={16} stroke={2.5} aria-hidden="true" />
		Move down
	</MenuItem>
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
