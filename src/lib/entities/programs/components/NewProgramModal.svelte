<script lang="ts">
	import { IconPlus, IconTrash } from '@tabler/icons-svelte';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import FormModal from '$lib/components/FormModal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { createProgram } from '$lib/entities/programs/mutations';
	import { getProgramsQueryOptions } from '$lib/entities/programs/queries';
	import { listItemSlideIn, listItemSlideOut } from '$lib/transitions';

	import type { Program } from '../types';

	type RoutineState = {
		id: number;
		name: Program['name'];
	};

	let routineInputsPlaceholdersHints = ['Push', 'Pull', 'Legs'];

	let routines = $state<RoutineState[]>([]);
	let nextRoutineId = $state(0);
	let programName = $state('');

	let isOpen = $state(false);
	let isLoading = $state(false);

	function removeRoutine(id: number) {
		routines = routines.filter((r) => r.id !== id);
	}

	function resetForm() {
		programName = '';
		routines = [];
		nextRoutineId = 0;
	}

	async function addRoutine() {
		routines = [...routines, { id: nextRoutineId, name: '' }];
		nextRoutineId++;
	}

	const queryClient = useQueryClient();
	const createProgramMutation = createMutation(() => ({
		mutationFn: createProgram,
		onSuccess: (createdProgram) => {
			queryClient.setQueryData(getProgramsQueryOptions().queryKey, (data) => [
				createdProgram,
				...(data ?? [])
			]);
			goto(resolve('/(app)/[routineId]', { routineId: createdProgram.routines[0].id }));
		},
		onSettled: () => {
			isOpen = false;
			resetForm();
		}
	}));

	const areFieldsInvalid = $derived(
		!programName || routines.length === 0 || routines.some((r) => !r.name.trim())
	);
</script>

<div class="new-program-modal">
	<Button class="new-program-button" variant="primary" onclick={() => (isOpen = true)}>
		<IconPlus size={16} stroke={2.5} aria-hidden="true" />
		New program
	</Button>
	<FormModal
		bind:isOpen
		title="New program"
		onSubmit={() => {
			createProgramMutation.mutate({
				name: programName,
				routineNames: routines.map((r) => r.name.trim())
			});
		}}
		onClose={resetForm}
		isLoading={createProgramMutation.isPending}
		isSubmitDisabled={createProgramMutation.isPending || areFieldsInvalid}
	>
		<Input
			type="text"
			placeholder="Program name"
			name="program-name"
			bind:value={programName}
			class="program-name-input"
		/>
		<div class="routine-input-rows">
			{#each routines as routine (routine.id)}
				{@const placeholderHint = routineInputsPlaceholdersHints.at(routine.id)}
				<div class="routine-input-row" in:listItemSlideIn out:listItemSlideOut>
					<Input
						type="text"
						placeholder={placeholderHint
							? `Routine name (e.g. ${placeholderHint})`
							: 'Routine name'}
						name="routine-name"
						bind:value={routine.name}
					/>
					<Button
						variant="secondary"
						isIconOnly
						onclick={() => removeRoutine(routine.id)}
						class="remove-routine-button"
					>
						<IconTrash size={14} aria-hidden="true" />
						<span class="sr-only">Remove routine</span>
					</Button>
				</div>
			{/each}
		</div>
		<Button variant="secondary-ghost" size="big" onclick={addRoutine} class="add-routine-button">
			<IconPlus size={14} stroke={2.5} aria-hidden="true" />
			Add routine
		</Button>
	</FormModal>
</div>

<style>
	.new-program-modal {
		display: contents;
	}

	.new-program-modal :global(.new-program-button) {
		justify-content: center;
	}

	.new-program-modal :global(.program-name-input) {
		font-size: 1.7rem;
		background-color: var(--neutral-3);
		font-weight: 600;
		padding-inline: 0;
		margin-block-end: 0.4rem;
	}

	.routine-input-rows {
		display: flex;
		flex-direction: column;
	}

	.routine-input-row {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin-block-end: 0.4rem;
	}

	.new-program-modal :global(.add-routine-button) {
		font-size: 1.4rem;
		padding-inline: 0;
		width: 100%;
		justify-content: start;
	}

	.new-program-modal :global(.remove-routine-button) {
		flex-shrink: 0;
		color: var(--neutral-10);
	}
</style>
