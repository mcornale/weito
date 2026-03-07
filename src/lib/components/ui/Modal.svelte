<script lang="ts">
	import { IconX } from '@tabler/icons-svelte';
	import type { Snippet } from 'svelte';

	import ScrollableContent from '../ScrollableContent.svelte';
	import Button from './Button.svelte';

	type Props = {
		isOpen: boolean;
		onClose?: () => void;
		children: Snippet;
		header: Snippet;
		actions?: Snippet;
		hasNoBackdrop?: boolean;
	};

	let dialog = $state<HTMLDialogElement | undefined>(undefined);

	let {
		children,
		isOpen = $bindable(),
		onClose,
		header,
		actions,
		hasNoBackdrop = false
	}: Props = $props();

	$effect(() => {
		if (!dialog) return;
		if (isOpen) {
			dialog.showModal();
		} else dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	closedby="any"
	ontoggle={(e) => {
		if (e.newState === 'closed') {
			onClose?.();
			isOpen = false;
		}
	}}
	data-no-backdrop={hasNoBackdrop}
>
	<div class="content-wrapper">
		{#if header}
			<div class="header">
				{@render header()}
			</div>
		{/if}
		<ScrollableContent fadeColor="var(--neutral-3)">
			<div class="content">
				{@render children()}
			</div>
		</ScrollableContent>
		<div class="actions">
			{#if actions}
				{@render actions()}
			{:else}
				<Button
					variant="tertiary"
					class="close-button"
					isIconOnly
					onclick={() => (isOpen = false)}
					size="small"
				>
					<IconX size={18} stroke={2.5} aria-hidden="true" />
					<span class="sr-only">Close</span>
				</Button>
			{/if}
		</div>
	</div>
</dialog>

<style>
	dialog {
		border: none;
		background-color: var(--neutral-3);
		position: fixed;
		top: 0.8rem;
		inset-inline: 0;
		max-height: 100dvh;
		height: 100%;
		max-width: 100vw;
		width: 100vw;
		border-radius: 2rem 2rem 0 0;
		z-index: 1000;

		transition:
			opacity 0.15s var(--ease-quad-out),
			transform 0.3s var(--ease-quad-out);

		opacity: 1;
		transform: translateY(0) scale(1);
		filter: blur(0);

		@starting-style {
			opacity: 0;
			transform: translateY(1rem) scale(0.99);
			filter: blur(4px);
		}

		@media (width >= 576px) {
			width: 44rem;
			top: 50%;
			left: 50%;
			bottom: auto;
			right: auto;
			max-height: 50dvh;
			min-height: 44rem;
			border-radius: 2.4rem;

			transition:
				opacity 0.15s var(--ease-quad-out),
				transform 0.2s var(--ease-quad-out);

			transform: translate(-50%, -50%) scale(1);
			opacity: 1;

			@starting-style {
				opacity: 0;
				transform: translate(-50%, -50%) scale(0.97);
			}
		}

		&::backdrop {
			background-color: rgba(0, 0, 0, 0.2);
			backdrop-filter: blur(2px);
			opacity: 1;
			transition: opacity 0.3s var(--ease-quad-out);

			@media (width >= 576px) {
				transition: opacity 0.2s var(--ease-quad-out);
			}

			@starting-style {
				opacity: 0;
			}
		}

		&[data-no-backdrop='true']::backdrop {
			opacity: 0;
		}
	}

	.content-wrapper {
		display: grid;
		grid-template-rows: auto 1fr;
		height: 100%;
		position: relative;
	}

	.content {
		padding: 2rem;
		padding-block-start: 1.2rem;
	}

	.header {
		padding: 2rem;
	}

	.actions {
		position: absolute;
		top: 0;
		inset-inline: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.4rem;

		& > :global(button) {
			border-radius: 50%;
		}

		& > :global(button[type='submit']) {
			order: 1;
		}
	}
</style>
