<script lang="ts">
	import FormModal from '$lib/components/FormModal.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	import RestTimeModal from './RestTimeModal.svelte';
	import SetsAndRepsModal from './SetsAndRepsModal.svelte';

	export type ExerciseFormData = {
		name: string;
		setsAndReps: { sets: number; reps: string }[];
		restTime: { minutes: number; seconds: number };
	};

	type SetsAndRepsItem = {
		id: number;
		sets: number | null;
		reps: string;
	};

	type Props = {
		title: string;
		isOpen: boolean;
		initialData?: ExerciseFormData | null;
		onSubmit: (data: ExerciseFormData) => void;
		isLoading: boolean;
	};

	let { title, isOpen = $bindable(), initialData = null, onSubmit, isLoading }: Props = $props();

	const defaultSets = 3;
	const defaultReps = '7-10';
	const defaultRestTime = { minutes: 3, seconds: 0 };

	let exerciseName = $state('');
	let setsAndReps = $state<SetsAndRepsItem[]>([{ id: 0, sets: defaultSets, reps: defaultReps }]);
	let restTime = $state<{ minutes: number | null; seconds: number | null }>(defaultRestTime);

	const isSubmitDisabled = $derived(isLoading || !exerciseName);

	function setDefaults() {
		exerciseName = '';
		setsAndReps = [{ id: 0, sets: defaultSets, reps: defaultReps }];
		restTime = defaultRestTime;
	}

	function fillFromInitialData(data: ExerciseFormData) {
		exerciseName = data.name;
		setsAndReps = data.setsAndReps.map((item, i) => ({
			id: i,
			...item
		}));
		restTime = data.restTime;
	}

	function resetForm() {
		if (initialData) {
			fillFromInitialData(initialData);
		} else {
			setDefaults();
		}
	}

	$effect(() => {
		if (isOpen) {
			if (initialData) {
				fillFromInitialData(initialData);
			} else {
				setDefaults();
			}
		}
	});
</script>

<div class="exercise-modal">
	<FormModal
		bind:isOpen
		{title}
		onSubmit={() => {
			const data: ExerciseFormData = {
				name: exerciseName,
				setsAndReps: setsAndReps.map(({ sets, reps }) => ({
					sets: sets ?? defaultSets,
					reps: reps || defaultReps
				})),
				restTime: {
					minutes: restTime.minutes ?? defaultRestTime.minutes,
					seconds: restTime.seconds ?? defaultRestTime.seconds
				}
			};

			onSubmit(data);
		}}
		onClose={resetForm}
		{isLoading}
		{isSubmitDisabled}
	>
		<label>
			<span class="sr-only">Exercise name</span>
			<Input
				type="text"
				placeholder="Exercise name"
				name="exercise-name"
				class="exercise-name-input"
				bind:value={exerciseName}
			/>
		</label>
		<div class="exercise-info-list">
			<SetsAndRepsModal bind:setsAndReps {defaultSets} {defaultReps} />
			<RestTimeModal
				bind:minutes={restTime.minutes}
				bind:seconds={restTime.seconds}
				defaultMinutes={defaultRestTime.minutes}
				defaultSeconds={defaultRestTime.seconds}
			/>
		</div>
	</FormModal>
</div>

<style>
	.exercise-modal {
		display: contents;
	}

	.exercise-modal :global(.exercise-name-input) {
		font-size: 1.7rem;
		background-color: var(--neutral-3);
		font-weight: 600;
		padding-inline: 0;
		margin-block-end: 0.8rem;
	}

	.exercise-info-list {
		display: flex;
		gap: 0.4rem;
	}
</style>
