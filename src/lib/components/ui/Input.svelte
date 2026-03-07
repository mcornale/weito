<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = HTMLInputAttributes;

	let { value = $bindable(), spellcheck = false, autocomplete = 'off', ...props }: Props = $props();
</script>

<input bind:value {spellcheck} {autocomplete} {...props} />

<style>
	input {
		height: 4rem;
		width: 100%;
		font-size: 1.5rem;
		font-weight: 500;
		padding-inline: 1.2rem;
		border-radius: 0.8rem;
		border: none;
		background-color: var(--neutral-4);
		color: var(--neutral-12);
		outline: none;
		cursor: auto;

		&::placeholder {
			color: oklch(from var(--neutral-9) l c h / 0.6);
		}
	}
</style>
