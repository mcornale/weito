<script lang="ts">
	import { IconPencil, IconStack2, IconTrash } from '@tabler/icons-svelte';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';

	import Menu from '$lib/components/ui/Menu.svelte';
	import MenuItem from '$lib/components/ui/MenuItem.svelte';
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
	<MenuItem onSelect={() => (isRenameProgramModalOpen = true)}>
		<IconPencil size={16} stroke={2.5} aria-hidden="true" />
		Rename
	</MenuItem>
	<MenuItem
		isLoading={duplicateProgramMutation.isPending}
		onSelect={() => {
			const programsQueryKey = getProgramsQueryOptions().queryKey;
			const existingNames = (queryClient.getQueryData(programsQueryKey) ?? []).map((p) => p.name);
			const name = getNextDuplicateName(program.name, existingNames);
			duplicateProgramMutation.mutate({ id: program.id, name });
		}}
	>
		<IconStack2 size={16} stroke={2.5} aria-hidden="true" />
		Duplicate
	</MenuItem>
	<MenuItem variant="destructive" onSelect={() => (isDeleteProgramModalOpen = true)}>
		<IconTrash size={16} stroke={2.5} aria-hidden="true" />
		Delete
	</MenuItem>
</Menu>

<RenameProgramModal bind:isOpen={isRenameProgramModalOpen} {program} />
<DeleteProgramModal bind:isOpen={isDeleteProgramModalOpen} {program} />
