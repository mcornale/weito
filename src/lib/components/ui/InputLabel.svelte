<script lang="ts">
	import type { HTMLLabelAttributes } from 'svelte/elements';

	let { children, ...props }: HTMLLabelAttributes = $props();
</script>

<label {...props}>
	{@render children?.()}
</label>

<style>
	label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		color: var(--neutral-10);
		font-size: 1.4rem;
		font-weight: 600;
		background-color: var(--neutral-4);
		border-radius: 0.8rem;
		padding-inline-start: 1.2rem;
	}
</style>
