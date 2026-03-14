<script lang="ts">
	import { IconArrowLeft, IconPlus, IconTrash } from '@tabler/icons-svelte';

	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import InputLabel from '$lib/components/ui/InputLabel.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { listItemSlideIn, listItemSlideOut } from '$lib/transitions';

	type SetsAndRepsItem = {
		id: number;
		sets: number | null;
		reps: string;
	};

	type Props = {
		setsAndReps: SetsAndRepsItem[];
		isOpen: boolean;
	};

	let { setsAndReps = $bindable(), isOpen = $bindable() }: Props = $props();

	let nextId = $state(0);

	function addVariation() {
		nextId++;
		setsAndReps = [...setsAndReps, { id: nextId, sets: 1, reps: '10' }];
	}
</script>

<div class="sets-and-reps-modal">
	<Modal bind:isOpen hasNoBackdrop>
		{#snippet header()}
			<h2 class="title">Sets and reps</h2>
		{/snippet}
		<div class="variation-rows">
			{#each setsAndReps as variation (variation.id)}
				<div in:listItemSlideIn out:listItemSlideOut class="variation-row">
					<InputLabel>
						sets
						<Input
							placeholder="3"
							inputmode="numeric"
							name="sets"
							type="number"
							class="sets-input"
							bind:value={variation.sets}
							{@attach (node) => {
								node.focus();
							}}
						/>
					</InputLabel>
					<InputLabel>
						reps
						<Input
							placeholder="7-10"
							inputmode="text"
							name="reps"
							bind:value={variation.reps}
							class="reps-input"
						/>
					</InputLabel>
					<Button
						variant="secondary"
						isIconOnly
						class="remove-variation-button"
						onclick={() => (setsAndReps = setsAndReps.filter((v) => v.id !== variation.id))}
						disabled={setsAndReps.length <= 1}
					>
						<IconTrash size={14} aria-hidden="true" />
						<span class="sr-only">Remove variation</span>
					</Button>
				</div>
			{/each}
		</div>
		<Button
			variant="secondary-ghost"
			size="big"
			class="add-variation-button"
			onclick={addVariation}
		>
			<IconPlus size={14} stroke={2.5} aria-hidden="true" />
			Add variation
		</Button>
		{#snippet actions()}
			<Button variant="tertiary" size="small" isIconOnly onclick={() => (isOpen = false)}>
				<IconArrowLeft size={18} stroke={2.5} aria-hidden="true" />
				<span class="sr-only">Close</span>
			</Button>
		{/snippet}
	</Modal>
</div>

<style>
	.sets-and-reps-modal {
		display: contents;
	}

	.title {
		font-size: 1.5rem;
		font-weight: 600;
		display: grid;
		place-content: center;
	}

	.variation-rows {
		display: flex;
		flex-direction: column;
	}

	.variation-row {
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		align-items: center;
		gap: 0.4rem;
		margin-block-end: 0.4rem;
	}

	.sets-and-reps-modal :global(.remove-variation-button) {
		flex-shrink: 0;
		color: var(--neutral-10);
	}

	.sets-and-reps-modal :global(.sets-input),
	.sets-and-reps-modal :global(.reps-input) {
		text-align: right;
		font-size: 1.5rem;
	}

	.sets-and-reps-modal :global(.add-variation-button) {
		font-size: 1.4rem;
		padding-inline: 0;
		width: 100%;
		justify-content: start;
	}
</style>
