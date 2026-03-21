<script lang="ts">
	import { IconBrandGoogleFilled } from '@tabler/icons-svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Logo from '$lib/components/Logo.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { showAppLoader } from '$lib/features/app-loader';
	import { signInWithGoogle } from '$lib/features/auth';
</script>

<main>
	<Logo />
	<div class="actions">
		<Button
			variant="primary"
			size="big"
			onclick={async () => {
				await signInWithGoogle();
				showAppLoader();
				goto(resolve('/(app)'), { replaceState: true });
			}}
			class="actions-button"
		>
			<IconBrandGoogleFilled size={16} aria-hidden="true" />
			Continue with Google
		</Button>
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: start;
		padding: 4rem;
		max-width: 44rem;
		margin-inline: auto;
	}

	.actions {
		margin-block-start: 4rem;
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: 0.4rem;
	}

	.actions :global(.actions-button) {
		flex-direction: row-reverse;
		width: 100%;
		justify-content: space-between;
	}
</style>
