<script lang="ts">
	import { IconPencil, IconStack2, IconTrash } from '@tabler/icons-svelte';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';

	import Button from '$lib/components/ui/Button.svelte';
	import Menu from '$lib/components/ui/Menu.svelte';
	import { duplicateProgram } from '$lib/entities/programs/mutations';
	import { getProgramsQueryOptions } from '$lib/entities/programs/queries';
	import { getNotifierContext } from '$lib/features/notifier/context';

	import type { Program } from '../types';
	import DeleteProgramModal from './DeleteProgramModal.svelte';
	import RenameProgramModal from './RenameProgramModal.svelte';

	type Props = {
		program: Program;
	};

	let { program }: Props = $props();

	let isRenameProgramModalOpen = $state(false);
	let isDeleteProgramModalOpen = $state(false);
	let menu = $state<Menu | undefined>(undefined);

	const { notifyError } = getNotifierContext();
	const queryClient = useQueryClient();

	function getNextDuplicateName(sourceName: string, existingNames: string[]): string {
		const baseMatch = sourceName.match(/^(.*?)\s*\(\d+\)$/);
		const baseName = baseMatch ? baseMatch[1] : sourceName;
		let n = 1;
		while (existingNames.includes(`${baseName} (${n})`)) n++;
		return `${baseName} (${n})`;
	}

	const duplicateProgramMutation = createMutation(() => ({
		mutationFn: duplicateProgram,
		onSuccess: (newProgram) => {
			const programsQueryKey = getProgramsQueryOptions().queryKey;
			const programsData = queryClient.getQueryData(programsQueryKey) ?? [];
			queryClient.setQueryData(programsQueryKey, [newProgram, ...programsData]);
			menu?.close();
		},
		onError: () => {
			notifyError("Couldn't duplicate program. Please try again.");
		}
	}));
</script>

<Menu bind:this={menu}>
	<Button variant="secondary-ghost" onclick={() => (isRenameProgramModalOpen = true)}>
		<IconPencil size={16} stroke={2.5} aria-hidden="true" />
		Rename
	</Button>
	<Button
		variant="secondary-ghost"
		isLoading={duplicateProgramMutation.isPending}
		onclick={() => {
			const programsQueryKey = getProgramsQueryOptions().queryKey;
			const existingNames = (queryClient.getQueryData(programsQueryKey) ?? []).map((p) => p.name);
			const name = getNextDuplicateName(program.name, existingNames);
			duplicateProgramMutation.mutate({ id: program.id, name });
		}}
		disabled={duplicateProgramMutation.isPending}
	>
		<IconStack2 size={16} stroke={2.5} aria-hidden="true" />
		Duplicate
	</Button>
	<Button variant="tertiary-destructive" onclick={() => (isDeleteProgramModalOpen = true)}>
		<IconTrash size={16} stroke={2.5} aria-hidden="true" />
		Delete
	</Button>
</Menu>

<RenameProgramModal bind:isOpen={isRenameProgramModalOpen} {program} />
<DeleteProgramModal bind:isOpen={isDeleteProgramModalOpen} {program} />
