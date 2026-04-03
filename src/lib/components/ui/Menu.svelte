<script lang="ts">
	import { IconDots } from '@tabler/icons-svelte';
	import type { Snippet } from 'svelte';
	import invariant from 'tiny-invariant';

	import Button from './Button.svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	let menuId = $props.id();
	let menu = $state<HTMLDivElement | undefined>(undefined);
	let isOpen = $state(false);

	export function close() {
		invariant(menu, 'Menu should be defined');
		menu.hidePopover();
	}

	function getItems() {
		invariant(menu, 'Menu should be defined');
		return Array.from(menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
	}
</script>

<Button
	variant="secondary-ghost"
	isIconOnly
	popovertarget={menuId}
	popovertargetaction="toggle"
	aria-haspopup="menu"
	aria-expanded={isOpen}
>
	<IconDots size={16} aria-hidden="true" />
	<span class="sr-only">Open menu</span>
</Button>
<div
	bind:this={menu}
	popover="auto"
	id={menuId}
	role="menu"
	tabindex="-1"
	ontoggle={(e) => {
		isOpen = e.newState === 'open';
		if (e.newState === 'open') {
			setTimeout(() => {
				const first = getItems().find((el) => el.getAttribute('disabled') !== 'true');
				invariant(first, 'Menu should have at least one enabled MenuItem');
				first.focus();
			});
		}
	}}
	onkeydown={(e) => {
		if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
			e.preventDefault();
		}

		if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			e.preventDefault();
			const items = getItems();
			console.log(items);
			const current = items.indexOf(document.activeElement as HTMLButtonElement);
			const step = e.key === 'ArrowDown' ? 1 : -1;
			let next = (current + step + items.length) % items.length;

			while (items[next].disabled && next !== current) {
				next = (next + step + items.length) % items.length;
			}
			items[next].focus();
		}

		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			const focused = document.activeElement as HTMLButtonElement;
			if (focused?.getAttribute('role') === 'menuitem' && !focused.disabled) {
				focused.click();
			}
		}

		if (e.key === 'Tab') {
			close();
		}
	}}
>
	<div class="content">
		{@render children()}
	</div>
</div>

<style>
	div[popover] {
		border: none;
		background-color: var(--neutral-1);
		border-radius: 1.2rem;
		padding: 0.4rem;
		border: 1px solid var(--neutral-4);
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

	div[popover] .content {
		display: flex;
		flex-direction: column;
	}
</style>
