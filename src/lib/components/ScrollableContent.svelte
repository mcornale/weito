<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';

	type Props = {
		children: Snippet;
		fadeColor?: string;
	};

	let { children, fadeColor }: Props = $props();

	let isTopFadeVisible = $state(false);
	let isBottomFadeVisible = $state(false);

	const scrollFadeVisibility: Attachment = (node) => {
		function update() {
			const { scrollTop, clientHeight, scrollHeight } = node;
			isTopFadeVisible = scrollTop > 0;
			isBottomFadeVisible = scrollTop + clientHeight < scrollHeight;
		}

		update();
		const observer = new ResizeObserver(update);

		observer.observe(node);
		node.addEventListener('scroll', update);

		return () => {
			observer.disconnect();
			node.removeEventListener('scroll', update);
		};
	};
</script>

<div
	class="scrollable-content"
	{@attach scrollFadeVisibility}
	data-top-fade={isTopFadeVisible}
	data-bottom-fade={isBottomFadeVisible}
	style={`--fade-color: ${fadeColor ?? 'var(--neutral-1)'}`}
>
	{@render children()}
</div>

<style>
	.scrollable-content {
		--content-fade-height: 2rem;
		--content-fade-color: var(--fade-color);
		overflow-y: auto;
		overflow-x: hidden;
		height: 100%;
		touch-action: pan-y;

		&::before,
		&::after {
			content: '';
			position: sticky;
			left: 0;
			right: 0;
			display: block;
			height: var(--content-fade-height);
			pointer-events: none;
			z-index: 1;
			opacity: 0;
			transition: opacity 0.15s ease;
		}

		&::before {
			top: -1px;
			margin-bottom: calc(-1 * var(--content-fade-height));
			background: linear-gradient(to bottom, var(--content-fade-color), transparent);
		}

		&::after {
			bottom: -1px;
			margin-top: calc(-1 * var(--content-fade-height));
			background: linear-gradient(to top, var(--content-fade-color), transparent);
		}

		&[data-top-fade='true']::before {
			opacity: 1;
		}

		&[data-bottom-fade='true']::after {
			opacity: 1;
		}
	}
</style>
