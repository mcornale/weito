<script lang="ts">
	import { IconCheck, IconClock, IconRepeat } from '@tabler/icons-svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { scale } from 'svelte/transition';

	import type { Exercise } from '$lib/entities/exercises/types';
	import { getLogsQueryOptions } from '$lib/entities/logs/queries';
	import type { Program } from '$lib/entities/programs/types';
	import type { Routine } from '$lib/entities/routines/types';

	import { formatSetsAndReps } from '../utils';

	type Props = {
		programId: Program['id'];
		routineId: Routine['id'];
		exercise: Exercise;
		index: number;
		hasDarkerBottomItems?: boolean;
	};

	let { programId, routineId, exercise, index, hasDarkerBottomItems = false }: Props = $props();

	const lastLogQuery = createQuery(() => ({
		...getLogsQueryOptions({ programId, routineId, exerciseId: exercise.id }),
		select: (data) => data.at(0)
	}));

	const isLoggedToday = $derived.by(() =>
		lastLogQuery.data
			? new Date(lastLogQuery.data.createdAt).toDateString() === new Date().toDateString()
			: false
	);
</script>

<div class="exercise">
	<div class="exercise-top">
		<span class="exercise-number">{index + 1}</span>
		<span class="exercise-name">{exercise.name}</span>
		{#if isLoggedToday}
			<span class="exercise-logged-icon" in:scale>
				<IconCheck size={10} stroke={4} aria-hidden="true" />
				<span class="sr-only">Logged today</span>
			</span>
		{/if}
	</div>
	<div class="exercise-bottom">
		<span class={['exercise-bottom-item', hasDarkerBottomItems && 'exercise-bottom-item-darker']}>
			<IconRepeat size={14} aria-hidden="true" />
			{formatSetsAndReps(exercise.setsAndReps)}
		</span>
		<span class={['exercise-bottom-item', hasDarkerBottomItems && 'exercise-bottom-item-darker']}>
			<IconClock size={14} aria-hidden="true" />
			{exercise.restTime.minutes}:{exercise.restTime.seconds.toString().padStart(2, '0')}
		</span>
	</div>
</div>

<style>
	.exercise {
		overflow: hidden;
	}

	.exercise-top {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		margin-block-end: 0.8rem;
	}

	.exercise-number {
		flex-shrink: 0;
		font-size: 1.4rem;
		color: var(--neutral-10);
		white-space: nowrap;
		font-weight: 500;
		display: flex;
		align-items: center;

		&::before {
			content: '#';
			font-size: 1.2rem;
			margin-inline-end: 0.2rem;
		}
	}

	.exercise-name {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		font-weight: 600;
		font-size: 1.6rem;
		line-height: normal;
	}

	.exercise-logged-icon {
		flex-shrink: 0;
		background-color: var(--accent-9);
		color: var(--accent-1);
		border-radius: 50%;
		padding: 0.3rem;
	}

	.exercise-bottom {
		display: flex;
		gap: 0.4rem;
		margin-block-start: 0.4rem;
	}

	.exercise-bottom-item {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		font-size: 1.5rem;
		color: var(--neutral-11);
		font-weight: 500;
		line-height: normal;
		height: 2.8rem;
		background-color: var(--neutral-3);
		padding-inline: 0.8rem;
		border-radius: 0.8rem;
	}

	.exercise-bottom-item-darker {
		background-color: var(--neutral-4);
	}
</style>
