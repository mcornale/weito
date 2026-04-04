<script lang="ts">
	import { IconPlus, IconTrash } from '@tabler/icons-svelte';

	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import InputLabel from '$lib/components/ui/InputLabel.svelte';
	import type { LogSet } from '$lib/entities/logs/schema';
	import { listItemSlideIn, listItemSlideOut } from '$lib/transitions';

	export type FormSet = Partial<LogSet> & { id: number };

	type Props = {
		sets: FormSet[];
		note: string;
		nextSetId: number;
		shouldSkipAnimation?: boolean;
	};

	let {
		sets = $bindable(),
		note = $bindable(),
		nextSetId = $bindable(),
		shouldSkipAnimation = false
	}: Props = $props();
</script>

<div class="log-sets-form">
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
</div>

<style>
	.log-sets-form {
		display: contents;
	}

	.log-sets-form :global(.note-input) {
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

	.log-sets-form :global(.set-log-input) {
		text-align: end;
	}

	.log-sets-form :global(.remove-set-button) {
		color: var(--neutral-10);
	}

	.log-sets-form :global(.add-set-button) {
		font-size: 1.4rem;
		padding-inline: 0;
		width: 100%;
		justify-content: start;
	}
</style>
