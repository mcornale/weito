<script lang="ts">
	import { IconCheck, IconTrash, IconX } from '@tabler/icons-svelte';
	import type { Snippet } from 'svelte';

	import Button from './ui/Button.svelte';
	import Modal from './ui/Modal.svelte';

	type Props = {
		title: string;
		isOpen: boolean;
		isLoading?: boolean;
		isSubmitDisabled?: boolean;
		onSubmit: () => void;
		onClose?: () => void;
		intent?: 'confirm' | 'delete';
		children: Snippet;
		closeIcon?: Snippet;
		hasNoBackdrop?: boolean;
	};

	let {
		isOpen = $bindable(),
		title,
		onSubmit,
		onClose,
		isLoading,
		isSubmitDisabled,
		children,
		intent = 'confirm',
		closeIcon,
		hasNoBackdrop
	}: Props = $props();

	const formId = $props.id();
</script>

<Modal bind:isOpen {onClose} {hasNoBackdrop}>
	{#snippet header()}
		<h2 class="title">{title}</h2>
	{/snippet}
	<form
		id={formId}
		onsubmit={async (e) => {
			e.preventDefault();
			onSubmit?.();
		}}
	>
		{@render children()}
	</form>
	{#snippet actions()}
		<Button
			variant={intent === 'confirm' ? 'primary' : 'primary-destructive'}
			isIconOnly
			type="submit"
			form={formId}
			size="small"
			disabled={isSubmitDisabled}
			{isLoading}
		>
			{#if intent === 'confirm'}
				<IconCheck size={18} stroke={2.5} aria-hidden="true" />
			{:else}
				<IconTrash size={18} stroke={2.5} aria-hidden="true" />
			{/if}
			<span class="sr-only">Submit</span>
		</Button>
		<Button
			variant="tertiary"
			isIconOnly
			onclick={() => {
				isOpen = false;
				onClose?.();
			}}
			size="small"
		>
			{#if closeIcon}
				{@render closeIcon()}
			{:else}
				<IconX size={18} stroke={2.5} aria-hidden="true" />
			{/if}
			<span class="sr-only">Close</span>
		</Button>
	{/snippet}
</Modal>

<style>
	.title {
		font-size: 1.5rem;
		font-weight: 600;
		display: grid;
		place-content: center;
	}
</style>
