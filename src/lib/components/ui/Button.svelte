<script lang="ts">
	import { IconLoaderQuarter } from '@tabler/icons-svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	import ButtonBase, { type BaseButtonProps } from './ButtonBase.svelte';

	type Props = HTMLButtonAttributes &
		BaseButtonProps & {
			isLoading?: boolean;
		};

	let { children, isLoading = false, type = 'button', ...props }: Props = $props();
</script>

<ButtonBase {type} {...props}>
	{#if isLoading}
		<span class="spinner" aria-hidden="true">
			<IconLoaderQuarter size={18} />
		</span>
	{/if}
	<div class="content">
		{@render children()}
	</div>
</ButtonBase>

<style>
	.spinner {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		animation: spin 0.5s linear infinite;

		& + .content {
			visibility: hidden;
		}
	}

	@keyframes spin {
		to {
			transform: scale(1) rotate(360deg);
		}
	}

	.content {
		display: contents;
	}
</style>
