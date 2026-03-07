<script lang="ts">
	import { IconLayoutSidebar } from '@tabler/icons-svelte';
	import { onMount, type Snippet } from 'svelte';

	import Button from './Button.svelte';

	type Props = {
		top: Snippet;
		center: Snippet;
		bottom: Snippet;
		isOpen: boolean;
	};

	let { top, center, bottom, isOpen = $bindable() }: Props = $props();
	let sidebar = $state<HTMLDialogElement | null>(null);
	let shouldAnimate = $state(false);

	onMount(() => {
		requestAnimationFrame(() => {
			shouldAnimate = true;
		});
	});

	$effect(() => {
		if (!sidebar) return;
		if (isOpen) {
			sidebar.show();
		} else {
			sidebar.close();
		}
	});
</script>

<div class="sidebar">
	<Button
		variant="secondary-ghost"
		isIconOnly
		class="toggle-button"
		onclick={() => (isOpen = !isOpen)}
	>
		<IconLayoutSidebar size={20} aria-hidden="true" />
		<span class="sr-only">Toggle sidebar</span>
	</Button>
	<dialog bind:this={sidebar} data-animate={shouldAnimate}>
		<div class="content">
			<div class="content-top">
				{@render top()}
			</div>
			<div class="content-center-wrapper">
				<div class="content-center">
					{@render center()}
				</div>
			</div>
			<div class="content-bottom">
				{@render bottom()}
			</div>
		</div>
	</dialog>
</div>

<style>
	.sidebar {
		display: contents;
	}

	.sidebar :global(.toggle-button) {
		position: absolute;
		top: 0.8rem;
		left: 0.8rem;
		z-index: 2;
	}

	dialog {
		z-index: 1;
		position: fixed;
		top: 0;
		left: 0;
		background-color: var(--sidebar-bg);
		border: none;
		width: var(--sidebar-width);
		margin-block-start: 5.6rem;
		height: calc(100% - 5.6rem);
		padding-block-end: env(safe-area-inset-bottom);

		&::backdrop {
			display: none;
		}

		&[open] {
			transform: translateX(0);

			@starting-style {
				transform: translateX(-100%);
			}
		}

		&:not([open]) {
			transform: translateX(-100%);

			@starting-style {
				transform: translateX(0);
			}
		}

		&[data-animate='true'] {
			transition:
				transform 0.3s ease-out,
				display 0.3s ease-out allow-discrete;
		}
	}

	.content {
		height: 100%;
		display: grid;
		grid-template-columns: 100%;
		grid-template-rows: auto 1fr auto;
	}

	.content-top {
		padding: 2rem;
		padding-block-start: 0;
		display: flex;
		flex-direction: column;
	}

	.content-center-wrapper {
		--sidebar-bg: var(--neutral-3);
		--sidebar-fade-height: 2rem;

		position: relative;
		padding-inline: 2rem;
		overflow: hidden;

		&::before,
		&::after {
			content: '';
			position: sticky;
			left: 0;
			right: 0;
			display: block;
			height: var(--sidebar-fade-height);
			pointer-events: none;
			z-index: 1;
		}

		&::before {
			top: 0;
			margin-bottom: calc(-1 * var(--sidebar-fade-height));
			background: linear-gradient(to bottom, var(--sidebar-bg), transparent);
		}

		&::after {
			bottom: 0;
			margin-top: calc(-1 * var(--sidebar-fade-height));
			background: linear-gradient(to top, var(--sidebar-bg), transparent);
		}
	}

	.content-center {
		height: 100%;
		:global(& > *) {
			padding-block: 2rem;
		}
	}

	.content-bottom {
		padding: 2rem;
		display: flex;
		flex-direction: column;
	}
</style>
