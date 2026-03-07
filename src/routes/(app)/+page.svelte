<script lang="ts">
	import { portalToAppHeader } from '$lib/attachments';
	import NewProgramModal from '$lib/entities/programs/components/NewProgramModal.svelte';
	import { requireCurrentUser } from '$lib/features/auth';

	const user = requireCurrentUser();
	const firstName = user.displayName?.split(' ')[0];
</script>

<div {@attach portalToAppHeader}>
	<p>Welcome, {firstName}!</p>
</div>
<div class="content">
	<p class="subtitle">You don't have any programs yet.</p>
	<p class="title">
		Create your first workout program, structure your routines, and transform your training into
		data-driven progress.
	</p>
	<NewProgramModal />
</div>

<style>
	.content {
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: end;
		padding: 2rem;

		@media (width >= 576px) {
			justify-content: start;
			align-items: start;
			padding: 4rem;
		}

		@media (width >= 720px) {
			padding-block: 8rem;
		}
	}

	.subtitle {
		font-size: 1.6rem;
		font-weight: 600;
		color: var(--neutral-10);
	}

	.title {
		font-size: 2rem;
		font-weight: 900;
		margin-block-start: 0.4rem;
		margin-block-end: 1.6rem;
		text-wrap: pretty;
		letter-spacing: -0.03em;
	}
</style>
