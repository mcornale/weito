<script lang="ts">
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import invariant from 'tiny-invariant';

	import FormModal from '$lib/components/FormModal.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { getProgramsQueryOptions } from '$lib/entities/programs/queries';
	import { updateRoutine } from '$lib/entities/routines/mutations';
	import type { Routine } from '$lib/entities/routines/types';

	type Props = {
		routine: Routine;
		isOpen: boolean;
	};

	let { routine, isOpen = $bindable() }: Props = $props();

	let name = $state('');

	const queryClient = useQueryClient();
	const updateRoutineMutation = createMutation(() => ({
		mutationFn: updateRoutine,
		onSuccess: (_, payload) => {
			const updatedRoutine = {
				...routine,
				name: payload.name ?? routine.name
			} satisfies Routine as Routine;

			queryClient.setQueryData(getProgramsQueryOptions().queryKey, (data) => {
				invariant(data, 'Programs data should be in the query cache');
				return data.map((p) =>
					p.id === routine.programId
						? {
								...p,
								routines: p.routines.map((r) => (r.id === routine.id ? updatedRoutine : r))
							}
						: p
				);
			});
		},
		onSettled: () => {
			isOpen = false;
		}
	}));

	$effect(() => {
		if (isOpen) {
			name = routine.name;
		}
	});
</script>

<div class="edit-routine-name-modal">
	<FormModal
		title="Rename routine"
		bind:isOpen
		onSubmit={() => {
			const trimmedName = name.trim();

			if (!trimmedName || trimmedName === routine.name) {
				isOpen = false;
				return;
			}

			updateRoutineMutation.mutate({
				id: routine.id,
				programId: routine.programId,
				name: trimmedName
			});
		}}
		isLoading={updateRoutineMutation.isPending}
		isSubmitDisabled={updateRoutineMutation.isPending || !name.trim()}
	>
		<Input
			class="routine-name-input"
			type="text"
			placeholder="Routine name"
			name="routine-name"
			bind:value={name}
		/>
	</FormModal>
</div>

<style>
	.edit-routine-name-modal {
		display: contents;
	}

	.edit-routine-name-modal :global(.routine-name-input) {
		font-size: 1.7rem;
		background-color: var(--neutral-3);
		font-weight: 600;
		padding-inline: 0;
		margin-block-end: 0.4rem;
	}
</style>
