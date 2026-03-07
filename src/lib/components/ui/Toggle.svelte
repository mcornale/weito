<script lang="ts">
	import type { HTMLLabelAttributes } from 'svelte/elements';

	type Props = HTMLLabelAttributes & {
		label: string;
		checked?: boolean;
		disabled?: boolean;
	};

	let {
		label,
		checked: isChecked = $bindable(false),
		disabled: isDisabled = false,
		...props
	}: Props = $props();
</script>

<label class="toggle" {...props}>
	{label}
	<div class="toggle-control">
		<span class="toggle-inner" aria-hidden="true"></span>
		<input type="checkbox" class="sr-only" bind:checked={isChecked} disabled={isDisabled} />
	</div>
</label>

<style>
	.toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.2rem;
		font-size: 1.4rem;
		color: var(--neutral-11);
		cursor: pointer;
		width: 100%;
		user-select: none;
		height: 4rem;
		position: relative;
		overflow: hidden;
		padding-inline: 1.2rem;

		&:has(input:disabled) {
			cursor: not-allowed;
		}
	}

	.toggle-control {
		background-color: var(--neutral-8);
		--padding: 0.2rem;
		--inner-size: 1.8rem;
		--height: calc(var(--inner-size) + calc(var(--padding) * 2));
		height: var(--height);
		width: calc(var(--inner-size) * 2 + var(--padding) * 2);
		padding: var(--padding);
		border-radius: calc(var(--height) / 2);
		display: flex;
		align-items: center;
		transform: scale(1);
		opacity: 1;
		transition: background-color 0.2s var(--ease-quad-out);

		&:has(input:checked) {
			background-color: var(--neutral-12);
		}

		&:has(input:disabled) {
			opacity: 0.5;
		}

		&:has(input:not(:disabled):focus-visible) {
			outline: 2px solid var(--outline-color);
			outline-offset: -2px;
		}
	}

	.toggle-inner {
		color: var(--neutral-9);
		background-color: var(--neutral-1);
		height: var(--inner-size);
		--inner-width-multiplier: 1.5;
		--inner-width: calc(var(--inner-size) * var(--inner-width-multiplier));
		width: var(--inner-width);
		border-radius: calc(var(--inner-size) / 2);
		display: grid;
		place-items: center;
		transition: transform 0.2s var(--ease-quad-out);
	}

	.toggle:has(input:checked) .toggle-inner {
		color: var(--neutral-12);
		transform: translateX(calc(var(--inner-size) * 2 - var(--inner-width)));
	}
</style>
