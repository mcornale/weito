<script lang="ts">
	import { IconLogout2 } from '@tabler/icons-svelte';
	import type { User } from 'firebase/auth';

	import { signOut } from '$lib/features/auth';

	import Button from './ui/Button.svelte';

	type Props = {
		user: User;
	};

	let { user }: Props = $props();

	const firstName = $derived(user.displayName?.split(' ')[0] ?? '');
	const initials = $derived((firstName[0] ?? '').toUpperCase() || '?');
</script>

<div class="user">
	<span class="initials">{initials}</span>
	<span class="name">{user.displayName}</span>
	<Button
		class="logout-button"
		variant="secondary-ghost"
		isIconOnly
		onclick={async () => {
			await signOut();
			window.location.reload();
		}}
	>
		<IconLogout2 size={18} stroke={2.5} aria-hidden="true" />
		<span class="sr-only">Logout</span>
	</Button>
</div>

<style>
	.user {
		position: sticky;
		bottom: 0;
		background-color: var(--neutral-3);
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.initials {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.8rem;
		height: 2.8rem;
		border-radius: 50%;
		background-color: var(--neutral-9);
		color: var(--neutral-1);
		font-size: 1.4rem;
		font-weight: 700;
	}

	.name {
		font-size: 1.5rem;
		font-weight: 600;
	}

	.user :global(.logout-button) {
		margin-inline-start: auto;
	}
</style>
