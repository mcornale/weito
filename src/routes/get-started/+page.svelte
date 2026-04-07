<script lang="ts">
	import { IconBrandGoogleFilled, IconChevronLeft, IconChevronRight } from '@tabler/icons-svelte';
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import screenAddLogImage from '$lib/assets/screen-add-log.jpg';
	import screenAnalyzeImage from '$lib/assets/screen-analyze.jpg';
	import screenLogsImage from '$lib/assets/screen-logs.jpg';
	import screenRoutineImage from '$lib/assets/screen-routine.jpg';
	import Logo from '$lib/components/Logo.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { showAppLoader } from '$lib/features/app-loader';
	import { signInWithGoogle } from '$lib/features/auth';
	import { getNotifierContext } from '$lib/features/notifier/context';

	const { notifyError } = getNotifierContext();

	const features = [
		{
			title: 'Build your own program.',
			description:
				'Create routines built around how you train — exercises, sets, reps, and rest times, exactly as you need them.',
			image: screenRoutineImage,
			alt: 'Routine view'
		},
		{
			title: 'Log every set.',
			description:
				'Weight, reps, notes — captured mid-workout in seconds. Keep your focus on lifting.',
			image: screenAddLogImage,
			alt: 'Add log view'
		},
		{
			title: 'Review past sessions.',
			description:
				'Every session saved and ready. Check past weights before you load the bar — anytime, in seconds.',
			image: screenLogsImage,
			alt: 'Session history view'
		},
		{
			title: 'Measure real progress.',
			description:
				'Analyze volume and estimated 1RM over time. Know when you\u2019re progressing or due for a deload.',
			image: screenAnalyzeImage,
			alt: 'Progress analytics view'
		}
	];

	let isFeaturesScrollAtStart = $state(true);
	let isFeaturesScrollAtEnd = $state(false);
	let featuresScroll: HTMLElement;
	let featureCards: HTMLElement[] = [];

	onMount(() => {
		function calculateCarouselPosition() {
			const el = featuresScroll;

			isFeaturesScrollAtStart = Math.floor(el.scrollLeft) <= 0;
			isFeaturesScrollAtEnd = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth;
		}

		calculateCarouselPosition();
		featuresScroll.addEventListener('scrollend', calculateCarouselPosition);

		return () => {
			featuresScroll.removeEventListener('scrollend', calculateCarouselPosition);
		};
	});

	function scrollFeatures(direction: 'left' | 'right') {
		const scrollPadding = parseFloat(getComputedStyle(featuresScroll).paddingInlineStart);
		const snapPositions = featureCards.map((card) => card.offsetLeft - scrollPadding);

		let currentIndex = snapPositions.findLastIndex(
			(position) => position <= featuresScroll.scrollLeft + 1
		);

		const delta = direction === 'left' ? 1 : -1;
		const targetIndex = currentIndex + delta;

		featuresScroll.scrollTo({ left: snapPositions[targetIndex], behavior: 'smooth' });
	}

	async function handleSignIn() {
		try {
			await signInWithGoogle();
			showAppLoader();
			goto(resolve('/(app)'), { replaceState: true });
		} catch (err: unknown) {
			const code = (err as { code?: string }).code;
			if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
			notifyError("Couldn't sign in. Please try again.");
		}
	}
</script>

<svelte:head>
	<link rel="preload" as="image" href={screenRoutineImage} />
</svelte:head>

<div class="landing">
	<section class="hero">
		<Logo />
		<h1 class="hero-title">Train with intent. <br />Track with precision.</h1>
		<p class="hero-description">
			A simple, powerful gym logbook to track workouts, measure progress, and improve consistently.
		</p>
		<Button variant="primary" size="big" onclick={handleSignIn} class="sign-in-button">
			<IconBrandGoogleFilled size={16} aria-hidden="true" />
			Continue with Google
		</Button>
	</section>
	<section aria-label="Features" class="features-section">
		<div class="features-header">
			<h2 class="features-heading">See it in action</h2>
			<div class="features-nav" aria-hidden="true">
				<Button
					variant="secondary-ghost"
					isIconOnly
					disabled={isFeaturesScrollAtStart}
					onclick={() => scrollFeatures('right')}
				>
					<IconChevronLeft size={24} aria-hidden="true" />
				</Button>
				<Button
					variant="secondary-ghost"
					isIconOnly
					disabled={isFeaturesScrollAtEnd}
					onclick={() => scrollFeatures('left')}
				>
					<IconChevronRight size={24} aria-hidden="true" />
				</Button>
			</div>
		</div>
		<div class="features-scroll" bind:this={featuresScroll}>
			{#each features as feature, i (i)}
				<div class="feature-card" bind:this={featureCards[i]}>
					<div class="feature-text">
						<h2>{feature.title}</h2>
						<p>{feature.description}</p>
					</div>
					<div class="feature-screenshot">
						<img
							src={feature.image}
							alt={feature.alt}
							width="750"
							height="1000"
							loading={i === 0 ? 'eager' : 'lazy'}
							fetchpriority={i === 0 ? 'high' : 'auto'}
						/>
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.landing {
		--page-padding: 2rem;
		width: 100vw;
		padding-block: 2rem;

		@media (width >= 576px) {
			padding-block: 4rem;
			--page-padding: 10vw;
		}
	}

	.hero {
		padding-block-end: 6rem;
		padding-inline: var(--page-padding);

		@media (width >= 576px) {
			padding-block-end: 8rem;
		}
	}

	.hero-title {
		font-size: 3.2rem;
		font-weight: 900;
		color: var(--neutral-12);
		margin-top: 5.2rem;
		line-height: 1.1;
		margin-block-end: 1rem;
		letter-spacing: -0.01em;

		@media (width >= 576px) {
			font-size: 5.2rem;
		}
	}

	.hero-description {
		font-size: 1.7rem;
		color: var(--neutral-10);
		text-wrap: pretty;

		@media (width >= 576px) {
			font-size: 1.8rem;
		}
	}

	.hero :global(.sign-in-button) {
		flex-direction: row-reverse;
		gap: 1.2rem;
		margin-top: 2.4rem;
	}

	.features-section {
		position: relative;
	}

	.features-header {
		display: flex;
		padding-inline: var(--page-padding);
		justify-content: space-between;
		align-items: center;
		margin-block-end: 1rem;
	}

	.features-heading {
		font-size: 1.6rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--neutral-10);
		text-transform: uppercase;

		@media (width >= 576px) {
			font-size: 1.8rem;
		}
	}

	.features-nav {
		display: flex;
		margin-inline-end: -1rem;
	}

	.features-scroll {
		display: flex;
		gap: 2rem;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scroll-padding-inline-start: var(--page-padding);
		padding-inline: var(--page-padding);
		padding-block-end: 1.2rem;
		scrollbar-width: none;
		flex-direction: row;
	}

	.feature-card {
		--card-padding: 2.4rem;

		flex-shrink: 0;
		scroll-snap-align: start;
		width: 100%;
		background-color: var(--neutral-1);
		border-radius: 1.6rem;
		padding: 3.6rem var(--card-padding) 0;
		display: flex;
		flex-direction: column;
		gap: 3.6rem;
		box-shadow: 0 0.4rem 0.8rem 0 rgb(from var(--neutral-10) r g b / 0.1);

		@media (width >= 450px) {
			--card-padding: 3.6rem;

			width: 40rem;
		}
	}

	.feature-text h2 {
		font-size: 2rem;
		letter-spacing: -0.03em;
		font-weight: 700;
		line-height: 1.1;
		color: var(--neutral-12);
		margin-block-end: 0.8rem;
	}

	.feature-text p {
		font-size: 1.6rem;
		color: var(--neutral-10);
	}

	.feature-screenshot {
		overflow: hidden;
		background-color: var(--neutral-8);
		border-radius: 1.2rem 1.2rem 0 0;
		position: relative;
		--screenshot-offset: calc(var(--card-padding) / 2);
		width: calc(100% + var(--screenshot-offset) * 2);
		margin-inline-start: calc(var(--screenshot-offset) * -1);
		height: 30rem;
		margin-block-start: auto;
	}

	.feature-screenshot img {
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
		border-radius: 0.6rem 0.6rem 0 0;
	}
</style>
