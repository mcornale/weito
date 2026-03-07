<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { scale } from 'svelte/transition';

	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import { getProgramsQueryOptions } from '$lib/entities/programs/queries';
	import RoutineMenu from '$lib/entities/routines/components/RoutineMenu.svelte';

	import ProgramMenu from './ProgramMenu.svelte';

	const currentRoutineId = $derived(page.params.routineId);
	let programsNavRef = $state<HTMLElement | undefined>(undefined);

	const programsQuery = createQuery(getProgramsQueryOptions);

	$effect(() => {
		if (programsQuery.isSuccess) {
			programsNavRef?.scrollTo({ top: 0, behavior: 'smooth' });
		}
	});
</script>

<nav bind:this={programsNavRef}>
	{#each programsQuery.data as program (program.id)}
		<div>
			<p class="program-name">
				{program.name}
				<ProgramMenu {program} />
			</p>
			<ul class="routine-list">
				{#each program.routines as routine (routine.id)}
					<li class="routine-item">
						<ButtonLink
							variant="secondary"
							class="routine-link"
							href={resolve('/(app)/[routineId]', { routineId: routine.id })}
						>
							<span class="routine-name">{routine.name}</span>
							{#if currentRoutineId === routine.id}
								<span class="current-indicator" transition:scale></span>
							{/if}
						</ButtonLink>
						<RoutineMenu {routine} {program} />
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>

<style>
	nav {
		display: flex;
		flex-direction: column;
		gap: 3.2rem;
		height: 100%;
		overflow-y: auto;
	}

	.program-name {
		font-size: 1.4rem;
		color: var(--neutral-11);

		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.routine-list {
		display: flex;
		flex-direction: column;
		border-radius: 0.8rem;
		overflow: hidden;
		gap: 0.4rem;
	}

	.routine-item {
		display: grid;
		grid-template-columns: 1fr auto;
		background-color: var(--neutral-4);
		border-radius: 0.8rem;
	}

	.routine-item :global(.routine-link) {
		overflow: hidden;
		color: var(--neutral-12);
		grid-template-columns: 1fr auto;

		.routine-name {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			line-height: normal;
		}
	}

	.routine-item .current-indicator {
		width: 0.7rem;
		height: 0.7rem;
		background-color: var(--accent-9);
		border-radius: 50%;
		position: absolute;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
	}
</style>
