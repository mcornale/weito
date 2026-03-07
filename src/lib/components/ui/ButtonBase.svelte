<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Variant =
		| 'primary'
		| 'primary-destructive'
		| 'secondary'
		| 'secondary-ghost'
		| 'tertiary'
		| 'tertiary-destructive';
	type Size = 'big' | 'small';

	export type BaseButtonProps = {
		variant?: Variant;
		size?: Size;
		isIconOnly?: boolean;
		children: Snippet;
	};

	type Props = BaseButtonProps &
		(({ as?: 'button' } & HTMLButtonAttributes) | ({ as: 'a' } & HTMLAnchorAttributes));

	let {
		children,
		as = 'button',
		variant = 'primary',
		size,
		isIconOnly = false,
		class: customClass,
		...props
	}: Props = $props();
</script>

<svelte:element
	this={as}
	class={['button-base', customClass]}
	data-variant={variant}
	data-size={size}
	data-icon-only={isIconOnly}
	{...props}
>
	{@render children()}
</svelte:element>

<style>
	.button-base {
		text-decoration: none;
		font-size: 1.5rem;
		border: none;
		height: 4rem;
		display: inline-flex;
		justify-content: start;
		align-items: center;
		line-height: 1;
		gap: 0.8rem;
		padding-inline: 1.2rem;
		border-radius: 0.8rem;
		position: relative;
		user-select: none;
		font-weight: 600;
		overflow: hidden;

		&[data-variant='primary'] {
			background-color: var(--neutral-12);
			color: var(--neutral-1);
		}

		&[data-variant='primary-destructive'] {
			background-color: var(--red);
			color: var(--neutral-1);
		}

		&[data-variant='secondary'] {
			background-color: var(--neutral-4);
			color: var(--neutral-11);
		}

		&[data-variant='secondary-ghost'] {
			background-color: transparent;
			color: var(--neutral-10);
		}

		&[data-variant='tertiary'] {
			background-color: var(--neutral-1);
			color: var(--neutral-10);
		}

		&[data-variant='tertiary-destructive'] {
			background-color: var(--neutral-1);
			color: var(--red);
		}

		&[data-size='big'] {
			height: 4.4rem;
			padding-inline: 1.4rem;
		}

		&[data-size='small'] {
			height: 3.6rem;
		}

		&[data-icon-only='true'] {
			padding-inline: 0;
			aspect-ratio: 1;

			justify-content: center;
			align-items: center;
		}
	}
</style>
