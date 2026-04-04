<script lang="ts">
	import { IconArrowLeft, IconArrowRight, IconPlus } from '@tabler/icons-svelte';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import invariant from 'tiny-invariant';

	import FormModal from '$lib/components/FormModal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { Exercise } from '$lib/entities/exercises/schema';
	import { createLog } from '$lib/entities/logs/mutations';
	import { getLogsQueryOptions } from '$lib/entities/logs/queries';
	import type { Program } from '$lib/entities/programs/schema';
	import type { Routine } from '$lib/entities/routines/schema';
	import { getNotifierContext } from '$lib/features/notifier/context';

	import LogSetsForm, { type FormSet } from './LogSetsForm.svelte';

	type Props = {
		programId: Program['id'];
		routineId: Routine['id'];
		exerciseId: Exercise['id'];
	};

	let { programId, routineId, exerciseId }: Props = $props();

	let isOpen = $state(false);
	let sets = $state<FormSet[]>([]);
	let nextSetId = $state(0);
	let note = $state('');

	function resetForm() {
		sets = [];
		nextSetId = 0;
		note = '';
	}

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

	const areFieldsInvalid = $derived(
		sets.length === 0 || sets.some((s) => s.weight === null || s.reps === null)
	);
	const isLogging = $derived(sets.length > 0 || note.trim() !== '');
</script>

<div class="add-log-modal">
	<Button
		variant="secondary-ghost"
		size="big"
		class="add-log-button"
		onclick={() => (isOpen = true)}
	>
		{#if isLogging}
			<IconArrowRight size={14} stroke={2.5} aria-hidden="true" />
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
			const mappedSets = sets.map((s) => {
				invariant(s.weight !== null && s.reps !== null, 'Set must have weight and reps');
				return { weight: s.weight, reps: s.reps };
			});
			const noteValue = note.trim() ? note.trim() : undefined;
			createLogMutation.mutate({
				programId,
				routineId,
				exerciseId,
				sets: mappedSets,
				...(noteValue ? { note: noteValue } : {})
			});
		}}
		isLoading={createLogMutation.isPending}
		isSubmitDisabled={createLogMutation.isPending || areFieldsInvalid}
		hasNoBackdrop
	>
		{#snippet closeIcon()}
			<IconArrowLeft size={18} stroke={2.5} aria-hidden="true" />
		{/snippet}
		<LogSetsForm bind:sets bind:note bind:nextSetId />
	</FormModal>
</div>

<style>
	.add-log-modal {
		display: contents;
	}

	.add-log-modal :global(.add-log-button) {
		font-size: 1.4rem;
		padding-inline: 0;
		width: 100%;
		justify-content: start;
	}
</style>
