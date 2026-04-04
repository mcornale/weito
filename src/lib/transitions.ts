import { quadIn, quadOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

type CreateListItemSlideTransition = (
	type: 'in' | 'out'
) => (node: Element, options?: { duration?: number }) => TransitionConfig;

const createListItemSlideTransition: CreateListItemSlideTransition =
	(type) =>
	(node, { duration = 250 } = {}) => {
		const style = getComputedStyle(node);
		const height = parseFloat(style.height);
		const marginTop = parseFloat(style.marginTop || '0');
		const marginBottom = parseFloat(style.marginBottom || '0');

		return {
			duration,
			css: (t) => {
				const eased = type === 'in' ? quadOut(t) : quadIn(t);
				const u = 1 - eased;

				return `
					height: ${eased * height}px;
					margin-top: ${eased * marginTop}px;
					margin-bottom: ${eased * marginBottom}px;
					transform: scale(${0.97 + 0.03 * eased});
					opacity: ${eased};
					filter: blur(${4 * u}px);
				`;
			}
		};
	};

export const listItemSlideIn = createListItemSlideTransition('in');
export const listItemSlideOut = createListItemSlideTransition('out');
