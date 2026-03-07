<script lang="ts">
	import { type Snippet } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	import { setNotifierContext } from './context';

	export type Toast = {
		id: string;
		message: string;
		duration: number;
		variant: 'success' | 'error';
		isExiting: boolean;
	};

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	setNotifierContext({ notifyError: (message) => showToast(message, 'error') });

	let toasts = $state<Toast[]>([]);

	const toastTimeouts = new SvelteMap<string, ReturnType<typeof setTimeout>>();

	function clearToastTimeout(toastId: string) {
		const timeoutId = toastTimeouts.get(toastId);
		if (timeoutId) {
			clearTimeout(timeoutId);
			toastTimeouts.delete(toastId);
		}
	}

	function showToast(
		message: Toast['message'],
		variant: Toast['variant'] = 'success',
		duration = 5000
	) {
		const id = crypto.randomUUID();
		toasts.push({ id, message, duration, variant, isExiting: false });

		if (toasts.length > 1) {
			const oldest = toasts.find((t) => !t.isExiting);
			if (oldest) startExit(oldest.id);
		}

		const timeoutId = setTimeout(() => {
			startExit(id);
		}, duration);

		toastTimeouts.set(id, timeoutId);
	}

	function startExit(toastId: string) {
		clearToastTimeout(toastId);
		toasts = toasts.map((t) => (t.id === toastId ? { ...t, isExiting: true } : t));
	}

	function removeToast(toastId: string) {
		toasts = toasts.filter((t) => t.id !== toastId);
	}
</script>

{@render children()}
{#each toasts as toast (toast.id)}
	<div
		popover="manual"
		class="toast-popover"
		role="status"
		aria-live="polite"
		aria-atomic="true"
		data-exit={toast.isExiting}
		ontransitionend={() => toast.isExiting && removeToast(toast.id)}
		{@attach (node) => {
			node.showPopover();
			return () => {
				node.hidePopover();
			};
		}}
	>
		<div class="toast" data-variant={toast.variant}>
			{toast.message}
		</div>
	</div>
{/each}

<style>
	.toast-popover {
		pointer-events: auto;
		position: fixed;
		inset-inline: 0.8rem;
		bottom: calc(1.6rem + env(safe-area-inset-bottom));
		top: auto;
		width: 100%;
		max-width: calc(100vw - 1.6rem);
		transform: scale(1);
		border: none;
		background-color: transparent;

		transition:
			opacity 0.3s var(--ease-quad-out),
			transform 0.3s var(--ease-quad-out);

		opacity: 1;

		@starting-style {
			opacity: 0;
			transform: translateY(100%) scale(0.95);
		}

		&[data-exit='true'] {
			opacity: 0;
			transform: scale(0.95);
		}

		@media (width >= 576px) {
			top: 1.6rem;
			bottom: auto;

			@starting-style {
				opacity: 0;
				transform: translateY(-100%) scale(0.95);
			}

			&[data-exit='true'] {
				opacity: 0;
				transform: scale(0.95);
			}
		}
	}

	.toast {
		box-shadow: 0 0.2rem 1rem 0 rgb(from var(--neutral-12) r g b / 0.1);
		background-color: var(--neutral-1);
		border-radius: 2rem;
		padding: 0.8rem 1.4rem;
		line-height: 1;
		font-size: 1.5rem;
		font-weight: 500;
		width: fit-content;
		margin-inline: auto;

		&[data-variant='success'] {
			background-color: var(--green);
			color: var(--neutral-1);
		}

		&[data-variant='error'] {
			background-color: var(--red);
			color: var(--neutral-1);
		}
	}
</style>
