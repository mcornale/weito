<script lang="ts">
	import { IconChevronRight } from '@tabler/icons-svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	import { portalToAppHeader, portalToMainTop } from '$lib/attachments.js';
	import ScrollableContent from '$lib/components/ScrollableContent.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import AddExerciseModal from '$lib/entities/exercises/components/AddExerciseModal.svelte';
	import ExerciseItem from '$lib/entities/exercises/components/ExerciseItem.svelte';
	import ExerciseMenu from '$lib/entities/exercises/components/ExerciseMenu.svelte';
	import { getExercisesQueryOptions } from '$lib/entities/exercises/queries.js';
	import LogsModal from '$lib/entities/logs/components/LogsModal.svelte';
	import { getProgramsQueryOptions } from '$lib/entities/programs/queries';

	let { params } = $props();
	let isEditing = $state(false);
	let hasAppliedInitialEditState = $state(false);

	onMount(() => {
		localStorage.setItem('last-visited-routine-id', params.routineId);
	});

	const programsQuery = createQuery(getProgramsQueryOptions);
	const program = $derived(
		programsQuery.data?.find((p) => p.routines.some((r) => r.id === params.routineId))
	);
	const routine = $derived(program?.routines.find((r) => r.id === params.routineId));
	const exercisesQuery = createQuery(() =>
		getExercisesQueryOptions({
			programId: program?.id,
			routineId: params.routineId
		})
	);
	const exercises = $derived(exercisesQuery.data);

	$effect(() => {
		if (exercisesQuery.isLoading || hasAppliedInitialEditState) return;

		hasAppliedInitialEditState = true;
		requestAnimationFrame(() => {
			isEditing = !exercises || exercises.length === 0;
		});
	});
</script>

<div class="routine-title-wrapper" {@attach portalToAppHeader}>
	{#if routine}
		<span class="routine-title">
			{routine.name}
		</span>
	{/if}
	{#if program}
		<span class="routine-program">
			{program.name}
		</span>
	{/if}
</div>

<Toggle
	label="Manage exercises"
	bind:checked={isEditing}
	disabled={!exercises || exercises.length === 0}
	{@attach portalToMainTop}
/>
<ScrollableContent>
	{#if !exercisesQuery.isLoading && exercises}
		<div class="exercise-list" in:fade={{ duration: 200 }}>
			{#each exercises as exercise, index (exercise.id)}
				<div class="exercise-item">
					{#if program}
						<ExerciseItem programId={program.id} routineId={params.routineId} {exercise} {index} />
					{/if}
					{#if isEditing}
						<div class="exercise-item-menu">
							{#if program}
								<ExerciseMenu
									{exercise}
									{exercises}
									programId={program.id}
									routineId={params.routineId}
								/>
							{/if}
						</div>
					{:else}
						<span class="exercise-item-icon" aria-hidden="true">
							<IconChevronRight size={20} />
						</span>
						{#if program}
							<LogsModal
								programId={program.id}
								routineId={params.routineId}
								{exercise}
								exerciseIndex={index}
							/>
						{/if}
					{/if}
				</div>
			{/each}
			{#if isEditing && program}
				<div>
					<AddExerciseModal programId={program.id} routineId={params.routineId} {exercises} />
				</div>
			{/if}
		</div>
	{/if}
</ScrollableContent>

<style>
	.exercise-list {
		padding-inline: 2rem;
		padding-block: 0;
		transition: padding-block 0.2s;

		@container (width >= 720px) {
			padding-block: 2rem;
		}
	}

	.exercise-item {
		position: relative;
		padding-block: 2.2rem 2.4rem;
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1.2rem;
		align-items: center;

		:global(.exercise-item-icon) {
			height: 4rem;
			width: 4rem;
			display: grid;
			place-content: center;
			color: var(--neutral-10);
			position: relative;
			left: 1rem;
		}

		&::before {
			content: '';
			position: absolute;
			bottom: 0;
			left: 50%;
			width: calc(100% + 4rem);
			transform: translateX(-50%);
			border-bottom: 1px solid var(--neutral-5);
		}

		&:last-child::before {
			display: none;
		}
	}

	.exercise-item-menu {
		position: relative;
		left: 1rem;
	}

	.routine-title-wrapper {
		display: grid;
		grid-template-columns: 1fr auto;
		width: 100%;
		overflow: hidden;
		align-items: baseline;
		gap: 1.2rem;
	}

	.routine-title {
		font-weight: 600;
		color: var(--neutral-12);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.routine-program {
		font-size: 1.4rem;
		color: var(--neutral-11);
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
