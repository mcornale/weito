<script lang="ts">
	import '$lib/styles/index.css';

	import { onMount } from 'svelte';

	import { onNavigate } from '$app/navigation';
	import { hideAppLoader } from '$lib/features/app-loader';

	let { children } = $props();

	onMount(hideAppLoader);
	onNavigate(() => {
		return () => {
			hideAppLoader();
		};
	});
</script>

{@render children()}
