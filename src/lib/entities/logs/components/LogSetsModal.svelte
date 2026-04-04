<script lang="ts">
	import { IconArrowLeft, IconArrowRight, IconPlus, IconTrash } from '@tabler/icons-svelte';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { tick } from 'svelte';
	import invariant from 'tiny-invariant';

	import FormModal from '$lib/components/FormModal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import InputLabel from '$lib/components/ui/InputLabel.svelte';
	import type { Exercise } from '$lib/entities/exercises/schema';
	import { createLog, updateLog } from '$lib/entities/logs/mutations';
	import { getLogsQueryOptions } from '$lib/entities/logs/queries';
	import type { Log, LogSet } from '$lib/entities/logs/schema';
	import type { Program } from '$lib/entities/programs/types';
	import type { Routine } from '$lib/entities/routines/types';
	import { getNotifierContext } from '$lib/features/notifier/context';
	import { listItemSlideIn, listItemSlideOut } from '$lib/transitions';

	type Props = {
		programId: Program['id'];
		routineId: Routine['id'];
		exerciseId: Exercise['id'];
		log?: Log;
		isOpen?: boolean;
	};

	let { programId, routineId, exerciseId, log, isOpen = $bindable(false) }: Props = $props();

	type Set = Partial<LogSet> & {
		id: number;
	};

	let sets = $state<Set[]>([]);
	let nextSetId = $state(0);
	let note = $state('');
	let shouldSkipAnimation = $state(false);

	function resetForm() {
		sets = [];
		nextSetId = 0;
		note = '';
	}

	$effect(() => {
		if (isOpen && log) {
			shouldSkipAnimation = true;
			sets = log.sets.map((s, i) => ({ id: i, weight: s.weight, reps: s.reps }));
			nextSetId = log.sets.length;
			note = log.note ?? '';
			tick().then(() => (shouldSkipAnimation = false));
		}
	});

	const queryClient = useQueryClient();

	const { notifyError } = getNotifierContext();

	const createLogMutation = createMutation(() => ({
		mutationFn: createLog,
		onSuccess: (createdLog) => {
			queryClient.setQueryData(
				getLogsQueryOptions({ programId, routineId, exerciseId }).queryKey,
				(data) => [createdLog, ...(data ?? [])]
			);
			isOpen = false;
			resetForm();
		},
		onError: () => {
			notifyError(`Couldn't log sets. Please try again.`);
		}
	}));

	const updateLogMutation = createMutation(() => ({
		mutationFn: updateLog,
		onSuccess: (updatedLog) => {
			queryClient.setQueryData(
				getLogsQueryOptions({ programId, routineId, exerciseId }).queryKey,
				(data) => data?.map((l) => (l.id === updatedLog.id ? updatedLog : l)) ?? []
			);
			isOpen = false;
			resetForm();
		},
		onError: () => {
			notifyError(`Couldn't update log. Please try again.`);
		}
	}));

	const isPending = $derived(createLogMutation.isPending || updateLogMutation.isPending);
	const areFieldsInvalid = $derived(
		sets.length === 0 || sets.some((s) => s.weight === null || s.reps === null)
	);
	const isLogging = $derived(sets.length > 0 || note.trim() !== '');
</script>

<div class="log-sets-modal">
	{#if !log}
		<Button
			variant="secondary-ghost"
			size="big"
			class="add-log-button"
			onclick={() => (isOpen = true)}
		>
			{#if isLogging}
				<IconArrowRight size={14} stroke={2.5} aria-hidden="true" />
				Resume log
			{:else}
				<IconPlus size={14} stroke={2.5} aria-hidden="true" />
				Add log
			{/if}
		</Button>
	{/if}
	<FormModal
		bind:isOpen
		title={log ? 'Edit log' : 'Add log'}
		onSubmit={() => {
			const mappedSets = sets.map((s) => {
				invariant(s.weight !== null && s.reps !== null, 'Set must have weight and reps');
				return { weight: s.weight, reps: s.reps };
			});
			const noteValue = note.trim() ? note.trim() : undefined;
			if (log) {
				updateLogMutation.mutate({
					programId,
					routineId,
					exerciseId,
					id: log.id,
					createdAt: log.createdAt,
					sets: mappedSets,
					note: noteValue
				});
			} else {
				createLogMutation.mutate({
					programId,
					routineId,
					exerciseId,
					sets: mappedSets,
					...(noteValue ? { note: noteValue } : {})
				});
			}
		}}
		onClose={() => {
			if (log) resetForm();
		}}
		isLoading={isPending}
		isSubmitDisabled={isPending || areFieldsInvalid}
		hasNoBackdrop
	>
		{#snippet closeIcon()}
			<IconArrowLeft size={18} stroke={2.5} aria-hidden="true" />
		{/snippet}
		<Input type="text" placeholder="Note" bind:value={note} name="note" class="note-input" />
		<div class="set-log-rows">
			{#each sets as set, index (set.id)}
				<div
					in:listItemSlideIn={{ duration: shouldSkipAnimation ? 0 : 250 }}
					out:listItemSlideOut
					class="set-log-row"
				>
					<div class="set-log-number">
						{index + 1}
					</div>
					<InputLabel>
						reps
						<Input
							type="number"
							inputmode="numeric"
							name="reps"
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
							step="0.1"
							inputmode="decimal"
							name="weight"
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
		<Button
			variant="secondary-ghost"
			size="big"
			onclick={() => {
				sets = [...sets, { id: nextSetId++, weight: undefined, reps: undefined }];
			}}
			class="add-set-button"
			autofocus
		>
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
