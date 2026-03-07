<script lang="ts">
	import {
		IconArrowDown,
		IconArrowLeft,
		IconArrowUp,
		IconPlus,
		IconTrash
	} from '@tabler/icons-svelte';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { tick } from 'svelte';
	import invariant from 'tiny-invariant';

	import FormModal from '$lib/components/FormModal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import InputLabel from '$lib/components/ui/InputLabel.svelte';
	import type { Exercise } from '$lib/entities/exercises/types';
	import { createLog } from '$lib/entities/logs/mutations';
	import { getLogsQueryOptions } from '$lib/entities/logs/queries';
	import type { LogSet } from '$lib/entities/logs/types';
	import type { Program } from '$lib/entities/programs/types';
	import type { Routine } from '$lib/entities/routines/types';
	import { listItemSlideIn, listItemSlideOut } from '$lib/transitions';

	type Props = {
		programId: Program['id'];
		routineId: Routine['id'];
		exerciseId: Exercise['id'];
	};

	let { programId, routineId, exerciseId }: Props = $props();
	let isOpen = $state(false);

	type SetState = {
		id: number;
		weight: LogSet['weight'] | null;
		reps: LogSet['reps'] | null;
	};

	let sets = $state<SetState[]>([]);
	let nextSetId = $state(0);
	let note = $state('');

	function resetForm() {
		sets = [];
		nextSetId = 0;
		note = '';
	}

	async function addSet() {
		sets = [...sets, { id: nextSetId++, weight: null, reps: null }];
		await tick();
	}

	const queryClient = useQueryClient();

	const createLogMutation = createMutation(() => ({
		mutationFn: createLog,
		onSuccess: (createdLog) => {
			queryClient.setQueryData(
				getLogsQueryOptions({ programId, routineId, exerciseId }).queryKey,
				(data) => [createdLog, ...(data ?? [])]
			);
		},
		onSettled: () => {
			isOpen = false;
			resetForm();
		}
	}));

	const areFieldsInvalid = $derived(
		sets.length === 0 || sets.some((s) => s.weight === null || s.reps === null)
	);
	const isLogging = $derived(sets.length > 0 || note.trim() !== '');
</script>

<div class="log-sets-modal">
	<Button
		variant="secondary-ghost"
		size="big"
		class="add-log-button"
		onclick={() => (isOpen = true)}
	>
		{#if isLogging}
			<IconArrowUp size={14} stroke={2.5} aria-hidden="true" />
			Resume logging
		{:else}
			<IconPlus size={14} stroke={2.5} aria-hidden="true" />
			Log sets
		{/if}
	</Button>
	<FormModal
		bind:isOpen
		title="Log sets"
		onSubmit={() => {
			createLogMutation.mutate({
				programId,
				routineId,
				exerciseId,
				sets: sets.map((s) => {
					invariant(s.weight !== null && s.reps !== null, 'Set must have weight and reps');
					return { weight: s.weight, reps: s.reps };
				}),
				...(note.trim() ? { note: note.trim() } : {})
			});
		}}
		isLoading={createLogMutation.isPending}
		isSubmitDisabled={createLogMutation.isPending || areFieldsInvalid}
		hasNoBackdrop
	>
		{#snippet closeIcon()}
			{#if isLogging}
				<IconArrowDown size={18} stroke={2.5} aria-hidden="true" />
			{:else}
				<IconArrowLeft size={18} stroke={2.5} aria-hidden="true" />
			{/if}
		{/snippet}
		<Input type="text" placeholder="Note" bind:value={note} name="note" class="note-input" />
		<div class="set-log-rows">
			{#each sets as set, index (set.id)}
				<div in:listItemSlideIn out:listItemSlideOut class="set-log-row">
					<div class="set-log-number">
						{index + 1}
					</div>
					<InputLabel>
						reps
						<Input
							type="number"
							inputmode="numeric"
							class="set-log-input"
							bind:value={set.reps}
							{@attach (node) => {
								node.focus();
							}}
						/>
					</InputLabel>
					<InputLabel>
						kg
						<Input
							type="number"
							inputmode="decimal"
							bind:value={set.weight}
							class="set-log-input"
						/>
					</InputLabel>
					<Button
						variant="secondary"
						isIconOnly
						onclick={() => (sets = sets.filter((s) => s.id !== set.id))}
						class="remove-set-button"
					>
						<IconTrash size={14} aria-hidden="true" />
						<span class="sr-only">Remove set</span>
					</Button>
				</div>
			{/each}
		</div>
		<Button variant="secondary-ghost" size="big" onclick={addSet} class="add-set-button" autofocus>
			<IconPlus size={14} stroke={2.5} aria-hidden="true" />
			Add set
		</Button>
	</FormModal>
</div>

<style>
	.log-sets-modal {
		display: contents;
	}

	.log-sets-modal :global(.add-log-button) {
		font-size: 1.4rem;
		padding-inline: 0;
		width: 100%;
		justify-content: start;
	}

	.log-sets-modal :global(.note-input) {
		margin-block-end: 0.4rem;
		background-color: transparent;
		padding-inline: 0;
	}

	.set-log-rows {
		display: flex;
		flex-direction: column;
	}

	.set-log-row {
		display: grid;
		grid-template-columns: auto 1fr 1fr auto;
		gap: 0.4rem;
		margin-block-end: 0.4rem;
		align-items: center;
	}

	.set-log-number {
		font-size: 1.4rem;
		color: var(--neutral-10);
		font-weight: 500;
		background-color: var(--neutral-4);
		width: 4.5rem;
		height: 4rem;
		border-radius: 0.8rem;
		display: flex;
		align-items: center;
		justify-content: center;

		&::before {
			content: '#';
			font-size: 1.2rem;
			margin-inline-end: 0.2rem;
		}
	}

	.log-sets-modal :global(.set-log-input) {
		text-align: end;
	}

	.log-sets-modal :global(.remove-set-button) {
		color: var(--neutral-10);
	}

	.log-sets-modal :global(.add-set-button) {
		font-size: 1.4rem;
		padding-inline: 0;
		width: 100%;
		justify-content: start;
	}
</style>
