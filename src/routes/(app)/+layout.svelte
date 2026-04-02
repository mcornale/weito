<script lang="ts">
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';

	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { swipeLeft, swipeRight } from '$lib/attachments';
	import Sidebar from '$lib/components/ui/Sidebar.svelte';
	import User from '$lib/components/User.svelte';
	import NewProgramModal from '$lib/entities/programs/components/NewProgramModal.svelte';
	import ProgramsList from '$lib/entities/programs/components/ProgramsList.svelte';
	let { children, data } = $props();

	let windowInnerWidth = $state(window.innerWidth);
	const isLargeScreen = $derived(windowInnerWidth >= 1024);

	let isSidebarOpen = $state(false);
	let shouldAnimateContent = $state(false);

	onMount(() => {
		if (isLargeScreen && page.params.routineId !== undefined) {
			isSidebarOpen = true;
		}

		requestAnimationFrame(() => {
			shouldAnimateContent = true;
		});
	});

	onNavigate(() => {
		return () => {
			isSidebarOpen = isLargeScreen;
		};
	});
</script>

<svelte:window bind:innerWidth={windowInnerWidth} />

<QueryClientProvider client={data.queryClient}>
	<div
		class="app-container"
		{@attach swipeLeft(() => (isSidebarOpen = false))}
		{@attach swipeRight(() => (isSidebarOpen = true))}
	>
		<Sidebar bind:isOpen={isSidebarOpen}>
			{#snippet top()}
				<NewProgramModal />
			{/snippet}
			{#snippet center()}
				<ProgramsList />
			{/snippet}
			{#snippet bottom()}
				<User user={data.currentUser} />
			{/snippet}
		</Sidebar>
		<header id="app-header">
			<!-- This is a portal element -->
		</header>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="app-content"
			data-sidebar-open={isSidebarOpen}
			onclick={() => !isLargeScreen && isSidebarOpen && (isSidebarOpen = false)}
			data-animate={shouldAnimateContent}
		>
			<div class="main-wrapper" inert={isSidebarOpen && !isLargeScreen}>
				<div id="main-top">
					<!-- This is a portal element -->
				</div>
				<main>
					<div class="main-content">
						{#key page.url.pathname}
							{@render children()}
						{/key}
					</div>
				</main>
			</div>
		</div>
	</div>
</QueryClientProvider>

<style>
	.app-container {
		overflow: hidden;
		position: fixed;
		width: 100vw;
		height: 100dvh;
		padding-block-end: env(safe-area-inset-bottom);
		touch-action: pan-y;
	}

	.app-content {
		height: 100%;
		padding-inline: 0.8rem;
		padding-block-start: 5.6rem;
		padding-block-end: 0.8rem;

		&[data-sidebar-open='true'] {
			--sidebar-offset: calc(var(--sidebar-width) - 0.8rem);
			transform: translateX(var(--sidebar-offset));

			@media (width >= 1024px) {
				--sidebar-offset: var(--sidebar-width);

				padding-inline-start: var(--sidebar-offset);
				transform: translateX(0);
			}
		}

		&[data-animate='true'] {
			transition:
				transform 0.3s var(--ease-quad-out),
				padding-inline-start 0.3s var(--ease-quad-out);
		}
	}

	#app-header {
		overflow: hidden;
		display: flex;
		align-items: center;
		color: var(--neutral-12);
		font-size: 1.5rem;
		font-weight: 600;

		position: fixed;
		top: 1.2rem;
		left: 5.2rem;
		width: calc(100% - 5.2rem);
		padding-block: 0;
		height: 3.2rem;
		padding-inline-end: 2rem;

		@media (width >= 1024px) {
			width: fit-content;
		}
	}

	.main-wrapper {
		width: 100%;
		height: 100%;
		background-color: var(--neutral-4);
		border-radius: 1.2rem;
		display: grid;
		grid-template-rows: auto 1fr;

		@media (width >= 1024px) {
			grid-template-rows: 1fr;
		}
	}

	#main-top {
		height: 4rem;
		display: flex;
		align-items: center;

		@media (width >= 1024px) {
			position: fixed;
			top: 0.8rem;
			right: 0;
		}

		&:empty {
			height: 0;
		}
	}

	main {
		width: 100%;
		height: 100%;
		background-color: var(--neutral-1);
		border: 1px solid var(--neutral-4);
		border-radius: 1.2rem;
		overflow-y: auto;
		container-type: inline-size;

		.main-content {
			max-width: 68rem;
			margin-inline: auto;
			height: 100%;
		}
	}
</style>
