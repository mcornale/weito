<script lang="ts">
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import invariant from 'tiny-invariant';

	import FormModal from '$lib/components/FormModal.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { updateProgram } from '$lib/entities/programs/mutations';
	import { getProgramsQueryOptions } from '$lib/entities/programs/queries';
	import { getNotifierContext } from '$lib/features/notifier/context';

	import type { Program } from '../schema';

	type Props = {
		program: Program;
		isOpen: boolean;
	};

	let { program, isOpen = $bindable() }: Props = $props();

	let name = $state('');

	const { notifyError } = getNotifierContext();

	const queryClient = useQueryClient();
	const updateProgramMutation = createMutation(() => ({
		mutationFn: updateProgram,
		onSuccess: (_, payload) => {
			const updatedProgram = {
				...program,
				name: payload.name ?? program.name
			} satisfies Program as Program;

			queryClient.setQueryData(getProgramsQueryOptions().queryKey, (data) => {
				invariant(data, 'Programs data should be in the query cache');
				return data.map((p) => (p.id === program.id ? updatedProgram : p));
			});
			isOpen = false;
		},
		onError: () => {
			notifyError(`Couldn't rename program. Please try again.`);
		}
	}));

	const areFieldsInvalid = $derived(!name.trim() || name.trim() === program.name);

	$effect(() => {
		if (isOpen) {
			name = program.name;
		}
	});
</script>

<div class="edit-program-name-modal">
	<FormModal
		title="Rename program"
		bind:isOpen
		onSubmit={() => {
			const trimmedName = name.trim();

			if (!trimmedName || trimmedName === program.name) {
				isOpen = false;
				return;
			}

			updateProgramMutation.mutate({ id: program.id, name: trimmedName });
		}}
		isSubmitDisabled={updateProgramMutation.isPending || areFieldsInvalid}
		isLoading={updateProgramMutation.isPending}
	>
		<Input
			class="program-name-input"
			type="text"
			placeholder="Program name"
			name="program-name"
			bind:value={name}
		/>
	</FormModal>
</div>

<style>
	.edit-program-name-modal {
		display: contents;
	}

	.edit-program-name-modal :global(.program-name-input) {
		font-size: 1.7rem;
		background-color: var(--neutral-3);
		font-weight: 600;
		padding-inline: 0;
		margin-block-end: 0.4rem;
	}
</style>
