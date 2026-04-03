<script lang="ts">
	import type { Snippet } from 'svelte';

	import Button from './Button.svelte';

	type Props = {
		onSelect: () => void;
		isDisabled?: boolean;
		isLoading?: boolean;
		variant?: 'default' | 'destructive';
		children: Snippet;
	};

	let { children, onSelect, isDisabled, isLoading = false, variant = 'default' }: Props = $props();
</script>

<Button
	role="menuitem"
	tabindex={-1}
	variant={variant === 'default' ? 'secondary-ghost' : 'tertiary-destructive'}
	disabled={isDisabled || isLoading}
	{isLoading}
	onclick={onSelect}
>
	{@render children()}
</Button>
