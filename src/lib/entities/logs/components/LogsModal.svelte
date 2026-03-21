<script lang="ts">
	import { IconArrowLeft, IconPencil } from '@tabler/icons-svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import invariant from 'tiny-invariant';

	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import ExerciseItem from '$lib/entities/exercises/components/ExerciseItem.svelte';
	import type { Exercise } from '$lib/entities/exercises/types';
	import { getLogsQueryOptions } from '$lib/entities/logs/queries';
	import type { Log } from '$lib/entities/logs/types';
	import type { Program } from '$lib/entities/programs/types';
	import type { Routine } from '$lib/entities/routines/types';
	import { capitalize } from '$lib/utils';

	import LogSetsModal from './LogSetsModal.svelte';
	import VolumeChart from './VolumeChart.svelte';

	type Props = {
		programId: Program['id'];
		routineId: Routine['id'];
		exercise: Exercise;
		exerciseIndex: number;
	};

	let { programId, routineId, exercise, exerciseIndex }: Props = $props();
	let isOpen = $state(false);
	let isAnalyzeVolumeMode = $state(false);
	let editingLog = $state<Log | null>(null);
	let isEditModalOpen = $state(false);

	function isSameDate(...dates: string[]) {
		invariant(dates.length >= 2, 'At least two dates are required');
		return dates.every(
			(date) => new Date(date).toLocaleDateString() === new Date(dates[0]).toLocaleDateString()
		);
	}

	function formatRelativeDate(date: string) {
		const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
		const logDate = new Date(date);
		const now = new Date();
		const logDay = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const diffDays = Math.round((logDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
		if (Math.abs(diffDays) < 7) {
			return formatter.format(diffDays, 'day');
		}
		const diffWeeks = Math.round(diffDays / 7);
		return formatter.format(diffWeeks, 'week');
	}

	const logsQuery = createQuery(() =>
		getLogsQueryOptions({ programId, routineId, exerciseId: exercise.id })
	);

	const logs = $derived(logsQuery.data ?? []);
</script>

<div class="logs-modal">
	<Button
		variant="tertiary"
		isIconOnly
		class="open-logs-modal-button"
		onclick={() => (isOpen = true)}
	>
		<span class="sr-only">Open logs modal</span>
	</Button>
	<Modal bind:isOpen onClose={() => (isAnalyzeVolumeMode = false)}>
		{#snippet actions()}
			<Button variant="tertiary" isIconOnly onclick={() => (isOpen = false)} size="small">
				<IconArrowLeft size={18} stroke={2.5} aria-hidden="true" />
				<span class="sr-only">Close</span>
			</Button>
		{/snippet}
		{#snippet header()}
			<div class="exercise-item-wrapper">
				<ExerciseItem
					{programId}
					{routineId}
					{exercise}
					index={exerciseIndex}
					hasDarkerBottomItems
				/>
			</div>
			<div class="volume-chart-toggle">
				<!-- There is a bug on Safari mobile that shows the focus-visible outline on the toggle when the modal is opened,
				 so we need to add a hidden focusable div to prevent it -->
				<div tabindex="-1" aria-hidden="true"></div>
				<Toggle label="Analyze volume" bind:checked={isAnalyzeVolumeMode} />
			</div>
		{/snippet}
		{#if isAnalyzeVolumeMode}
			<VolumeChart {logs} />
		{:else}
			<div class="section-list">
				{#if logs.length === 0 || !logs.some( (log) => isSameDate(log.createdAt, new Date().toISOString()) )}
					<div class="section section-with-button">
						<p class="section-title">{capitalize(formatRelativeDate(new Date().toISOString()))}</p>
						<LogSetsModal {programId} {routineId} exerciseId={exercise.id} />
					</div>
				{/if}
				{#each logs as log (log.id)}
					<div class="section">
						<p class="section-title">{capitalize(formatRelativeDate(log.createdAt))}</p>
						<Button
							variant="secondary-ghost"
							isIconOnly
							size="small"
							class="edit-log-button"
							onclick={() => {
								editingLog = log;
								isEditModalOpen = true;
							}}
						>
							<IconPencil size={14} stroke={2.5} aria-hidden="true" />
							<span class="sr-only">Edit log</span>
						</Button>
						{#if log.note}
							<p class="log-note">{log.note}</p>
						{/if}
						<div class="log-sets">
							{#each log.sets as set, index (index)}
								<div class="log-sets-item">
									<span class="log-sets-item-number">#{index + 1}</span>
									<span class="log-sets-item-value">
										<span class="log-sets-item-unit">reps</span>
										{set.reps}
									</span>
									<span class="log-sets-item-value">
										<span class="log-sets-item-unit">kg</span>
										{set.weight}
									</span>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Modal>
	{#if editingLog}
		<LogSetsModal
			{programId}
			{routineId}
			exerciseId={exercise.id}
			log={editingLog}
			bind:isOpen={isEditModalOpen}
		/>
	{/if}
</div>

<style>
	.logs-modal {
		display: contents;
	}

	.exercise-item-wrapper {
		padding-block-start: 5rem;
	}

	.section-list {
		display: flex;
		flex-direction: column;
		gap: 2.8rem;
	}

	.section {
		position: relative;
	}

	.section-with-button {
		margin-block-end: -1rem;

		.section-title {
			margin-block-end: 0;
		}
	}

	.section-title {
		font-size: 1.4rem;
		font-weight: 600;
		color: var(--neutral-12);
		margin-block-end: 0.8rem;
	}

	.logs-modal :global(.edit-log-button) {
		color: var(--neutral-10);
		position: absolute;
		top: 0;
		right: 0;
		margin-inline-end: -0.6rem;
		margin-block-start: -0.8rem;
	}

	.log-sets-item {
		display: grid;
		grid-template-columns: auto 1fr 1fr;
		gap: 0.4rem;

		margin-block-end: 0.4rem;

		&:first-child {
			margin-block-start: 0.8rem;
		}

		&:last-child {
			margin-block-end: 0;
		}
	}

	.log-sets-item-number {
		font-size: 1.4rem;
		color: var(--neutral-10);
		font-weight: 500;
		background-color: var(--neutral-4);
		width: 4.5rem;
		height: 4rem;
		border-radius: 0.8rem;
		display: grid;
		place-content: center;
		letter-spacing: 0.2em;
	}

	.log-sets-item-value {
		background-color: var(--neutral-4);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.4rem;
		border-radius: 0.8rem;
		font-size: 1.5rem;
		padding-inline: 1.2rem;
		font-weight: 500;
	}

	.log-sets-item-unit {
		color: var(--neutral-10);
		font-weight: 600;
		font-size: 1.4rem;
	}

	.log-note {
		font-size: 1.4rem;
		color: var(--neutral-11);
		font-weight: 500;
		margin-block-start: -0.6rem;
		margin-block-end: 0.8rem;
	}

	.logs-modal :global(.open-logs-modal-button) {
		background-color: transparent;
		position: absolute;
		width: 110%;
		height: 100%;
		inset-inline: -5%;
	}

	.volume-chart-toggle {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 1;
		height: 6.4rem;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-inline-end: 0.2rem;
	}
</style>
