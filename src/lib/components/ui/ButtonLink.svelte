<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	import type { BaseButtonProps } from './ButtonBase.svelte';
	import ButtonBase from './ButtonBase.svelte';

	type Props = HTMLAnchorAttributes & BaseButtonProps;

	const props: Props = $props();
</script>

<ButtonBase as="a" {...props} />
