<script lang="ts">
	import { IconDots } from '@tabler/icons-svelte';
	import type { Snippet } from 'svelte';
	import invariant from 'tiny-invariant';

	import Button from './Button.svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	let dialogId = $props.id();
	let dialog = $state<HTMLDialogElement | undefined>(undefined);

	export function close() {
		invariant(dialog, 'Dialog should be defined');
		dialog.hidePopover();
	}
</script>

<Button variant="secondary-ghost" isIconOnly popovertarget={dialogId} popovertargetaction="toggle">
	<IconDots size={16} aria-hidden="true" />
	<span class="sr-only">Open menu</span>
</Button>
<dialog bind:this={dialog} popover="auto" id={dialogId}>
	<div class="content">
		{@render children()}
	</div>
</dialog>

<style>
	dialog[popover] {
		border: none;
		background-color: var(--neutral-1);
		border-radius: 1.2rem;
		padding: 0.4rem;
		border: 1px solid var(--neutral-5);
		min-width: 20rem;

		margin: 0;
		inset: auto;
		right: anchor(right);
		top: anchor(bottom);
		position-try-fallbacks: flip-block, flip-inline;

		transition:
			opacity 0.15s var(--ease-quad-out),
			transform 0.15s var(--ease-quad-out);

		opacity: 1;
		transform: translateY(0) scale(1);

		@starting-style {
			opacity: 0;
			transform: translateY(-1rem) scale(0.9);
		}
	}

	dialog[popover] .content {
		display: flex;
		flex-direction: column;
	}
</style>
