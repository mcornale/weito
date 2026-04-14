<script lang="ts">
	import { IconArrowLeft } from '@tabler/icons-svelte';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { tick } from 'svelte';
	import invariant from 'tiny-invariant';

	import FormModal from '$lib/components/FormModal.svelte';
	import type { Exercise } from '$lib/entities/exercises/schema';
	import { updateLog } from '$lib/entities/logs/mutations';
	import { getLogsQueryOptions } from '$lib/entities/logs/queries';
	import type { Log } from '$lib/entities/logs/schema';
	import type { Program } from '$lib/entities/programs/schema';
	import type { Routine } from '$lib/entities/routines/schema';
	import { getNotifierContext } from '$lib/features/notifier/context';

	import LogSetsForm, { type FormSet } from './LogSetsForm.svelte';

	type Props = {
		programId: Program['id'];
		routineId: Routine['id'];
		exerciseId: Exercise['id'];
		log: Log;
		isOpen?: boolean;
	};

	let { programId, routineId, exerciseId, log, isOpen = $bindable(false) }: Props = $props();

	let sets = $state<FormSet[]>([]);
	let nextSetId = $state(0);
	let note = $state('');
	let shouldSkipAnimation = $state(false);

	function resetForm() {
		sets = [];
		nextSetId = 0;
		note = '';
	}

	$effect(() => {
		if (isOpen) {
			sets = log.sets.map((s, i) => ({ id: i, weight: s.weight, reps: s.reps }));
			nextSetId = log.sets.length;
			note = log.note ?? '';
			shouldSkipAnimation = true;
			tick().then(() => (shouldSkipAnimation = false));
		}
	});

	const queryClient = useQueryClient();

	const { notifyError } = getNotifierContext();

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

	const areFieldsInvalid = $derived(
		sets.length === 0 || sets.some((s) => s.weight === undefined || s.reps === undefined)
	);
</script>

<FormModal
	bind:isOpen
	title="Edit logged sets"
	onSubmit={() => {
		const mappedSets = sets.map((s) => {
			invariant(
				s.weight !== undefined && s.reps !== undefined,
				'All sets must have weight and reps'
			);
			return { weight: s.weight, reps: s.reps };
		});
		const noteValue = note.trim() ? note.trim() : undefined;
		updateLogMutation.mutate({
			programId,
			routineId,
			exerciseId,
			id: log.id,
			createdAt: log.createdAt,
			sets: mappedSets,
			note: noteValue
		});
	}}
	onClose={resetForm}
	isLoading={updateLogMutation.isPending}
	isSubmitDisabled={updateLogMutation.isPending || areFieldsInvalid}
	hasNoBackdrop
>
	{#snippet closeIcon()}
		<IconArrowLeft size={18} stroke={2.5} aria-hidden="true" />
	{/snippet}
	<LogSetsForm bind:sets bind:note bind:nextSetId {shouldSkipAnimation} />
</FormModal>
