<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import invariant from 'tiny-invariant';

	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import ExerciseItem from '$lib/entities/exercises/components/ExerciseItem.svelte';
	import type { Exercise } from '$lib/entities/exercises/types';
	import { getLogsQueryOptions } from '$lib/entities/logs/queries';
	import type { Program } from '$lib/entities/programs/types';
	import type { Routine } from '$lib/entities/routines/types';
	import { capitalize } from '$lib/utils';

	import LogSetsModal from './LogSetsModal.svelte';

	type Props = {
		programId: Program['id'];
		routineId: Routine['id'];
		exercise: Exercise;
		exerciseIndex: number;
	};

	let { programId, routineId, exercise, exerciseIndex }: Props = $props();
	let isOpen = $state(false);

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
	<Modal bind:isOpen>
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
		{/snippet}
		<div class="logs">
			{#if logsQuery.data && !logsQuery.data.some( (log) => isSameDate(log.createdAt, new Date().toISOString()) )}
				<div class="log log-with-button">
					<p class="log-date">{capitalize(formatRelativeDate(new Date().toISOString()))}</p>
					<LogSetsModal {programId} {routineId} exerciseId={exercise.id} />
				</div>
			{/if}
			{#each logsQuery.data as log (log.id)}
				<div class="log">
					<p class="log-date">{capitalize(formatRelativeDate(log.createdAt))}</p>
					{#if log.note}
						<p class="log-note">{log.note}</p>
					{/if}
					<div class="log-sets">
						{#each log.sets as set, index (index)}
							<div class="set-log">
								<span class="set-log-number">#{index + 1}</span>
								<span class="set-log-value">
									<span class="set-log-unit">reps</span>
									{set.reps}
								</span>
								<span class="set-log-value">
									<span class="set-log-unit">kg</span>
									{set.weight}
								</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</Modal>
</div>

<style>
	.logs-modal {
		display: contents;
	}

	.exercise-item-wrapper {
		padding-block-start: 5rem;
	}

	.logs {
		display: flex;
		flex-direction: column;
		gap: 2.2rem;
	}

	.log-with-button {
		margin-block-end: -1rem;
	}

	.log-date {
		font-size: 1.4rem;
		font-weight: 600;
		color: var(--neutral-12);
	}

	.set-log {
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

	.set-log-number {
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

	.set-log-value {
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

	.set-log-unit {
		color: var(--neutral-10);
		font-weight: 600;
		font-size: 1.4rem;
	}

	.log-note {
		font-size: 1.4rem;
		color: var(--neutral-11);
		font-weight: 500;
	}

	.logs-modal :global(.open-logs-modal-button) {
		background-color: transparent;
		position: absolute;
		width: 110%;
		height: 100%;
		inset-inline: -5%;
	}
</style>
