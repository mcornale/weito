import type { Attachment } from 'svelte/attachments';
import invariant from 'tiny-invariant';

type CreatePortalAttachment = (selector: string) => Attachment;
const createPortalAttachment: CreatePortalAttachment = (selector) => (element) => {
	const target = document.querySelector(selector);
	if (target) target.appendChild(element);
	return () => element.remove();
};

export const portalToAppHeader = createPortalAttachment('#app-header');
export const portalToMainTop = createPortalAttachment('#main-top');

const swipeThreshold = 50;
const swipeMaxTime = 500;

type Direction = 'left' | 'right' | 'up' | 'down';
type CreateSwipeAttachment = (direction: Direction, onSwipe: () => void) => Attachment;
const createSwipeAttachment: CreateSwipeAttachment = (direction, onSwipe) => (element) => {
	invariant(element instanceof HTMLElement, 'Element must be an HTMLElement');

	let startX: number | false = false;
	let startY: number | false = false;
	let startTime: number | false = false;
	let tracking = false;

	function down(e: PointerEvent) {
		if (e.pointerType !== 'touch') return;
		startX = e.clientX;
		startY = e.clientY;
		startTime = Date.now();
		tracking = true;
	}

	function up(e: PointerEvent) {
		if (!tracking) return;
		tracking = false;

		const dx = e.clientX - (startX as number);
		const dy = e.clientY - (startY as number);
		const elapsed = Date.now() - (startTime as number);

		const isHorizontal = Math.abs(dx) > Math.abs(dy);
		const isVertical = Math.abs(dy) > Math.abs(dx);
		const isFast = elapsed <= swipeMaxTime;
		const isLeftSwipe = dx < -swipeThreshold;
		const isRightSwipe = dx > swipeThreshold;
		const isUpSwipe = dy < -swipeThreshold;
		const isDownSwipe = dy > swipeThreshold;

		const matchesDirection =
			(direction === 'left' && isHorizontal && isLeftSwipe) ||
			(direction === 'right' && isHorizontal && isRightSwipe) ||
			(direction === 'up' && isVertical && isUpSwipe) ||
			(direction === 'down' && isVertical && isDownSwipe);

		if (isFast && matchesDirection) {
			onSwipe();
		}
	}

	element.addEventListener('pointerdown', down);
	element.addEventListener('pointerup', up);

	return () => {
		element.removeEventListener('pointerdown', down);
		element.removeEventListener('pointerup', up);
	};
};

type SwipeAttachment = (onSwipe: () => void) => Attachment;
export const swipeLeft: SwipeAttachment = (onSwipe) => createSwipeAttachment('left', onSwipe);
export const swipeRight: SwipeAttachment = (onSwipe) => createSwipeAttachment('right', onSwipe);
export const swipeUp: SwipeAttachment = (onSwipe) => createSwipeAttachment('up', onSwipe);
export const swipeDown: SwipeAttachment = (onSwipe) => createSwipeAttachment('down', onSwipe);
