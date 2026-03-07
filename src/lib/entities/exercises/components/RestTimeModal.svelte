<script lang="ts">
	import { IconArrowLeft, IconClock } from '@tabler/icons-svelte';

	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import InputLabel from '$lib/components/ui/InputLabel.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';

	type Props = {
		minutes: number | null;
		seconds: number | null;
		defaultMinutes: number;
		defaultSeconds: number;
	};

	let {
		minutes = $bindable(),
		seconds = $bindable(),
		defaultMinutes,
		defaultSeconds
	}: Props = $props();
	let isOpen = $state(false);
</script>

<div class="rest-time-modal">
	<Button
		variant="secondary"
		size="small"
		class="exercise-info-button"
		onclick={() => (isOpen = true)}
	>
		<IconClock size={14} aria-hidden="true" />
		{minutes ?? defaultMinutes}:{(seconds ?? defaultSeconds).toString().padStart(2, '0')}
		<span class="sr-only">Edit rest time</span>
	</Button>
	<Modal bind:isOpen hasNoBackdrop>
		{#snippet header()}
			<h2 class="title">Rest time</h2>
		{/snippet}
		<div class="rest-time-modal-content">
			<InputLabel>
				min
				<Input
					placeholder="3"
					name="minutes"
					bind:value={minutes}
					type="number"
					inputmode="numeric"
					class="minutes-input"
				/>
			</InputLabel>
			<InputLabel>
				sec
				<Input
					placeholder="0"
					name="seconds"
					bind:value={seconds}
					type="number"
					inputmode="numeric"
					class="seconds-input"
				/>
			</InputLabel>
		</div>
		{#snippet actions()}
			<Button variant="tertiary" size="small" isIconOnly onclick={() => (isOpen = false)}>
				<IconArrowLeft size={18} stroke={2.5} aria-hidden="true" />
				<span class="sr-only">Close</span>
			</Button>
		{/snippet}
	</Modal>
</div>

<style>
	.rest-time-modal {
		display: contents;
	}

	.rest-time-modal :global(.exercise-info-button) {
		gap: 0.8rem;
		font-weight: 500;
		height: 2.8rem;
		padding-inline: 0.8rem;
		border-radius: 0.8rem;
	}

	.title {
		font-size: 1.5rem;
		font-weight: 600;
		display: grid;
		place-content: center;
	}

	.rest-time-modal-content {
		display: flex;
		gap: 0.4rem;
	}

	.rest-time-modal :global(.minutes-input),
	.rest-time-modal :global(.seconds-input) {
		text-align: right;
		font-size: 1.5rem;
	}
</style>
