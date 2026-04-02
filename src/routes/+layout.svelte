<script lang="ts">
	import '$lib/styles/index.css';

	import { onMount } from 'svelte';

	import { onNavigate } from '$app/navigation';
	import { hideAppLoader } from '$lib/features/app-loader';
	import Notifier from '$lib/features/notifier/Notifier.svelte';

	let { children } = $props();

	onMount(hideAppLoader);
	onNavigate(() => {
		return () => {
			hideAppLoader();
		};
	});
</script>

<Notifier>
	{@render children()}
</Notifier>
