<script lang="ts">
	import { IconPencil, IconTrash } from '@tabler/icons-svelte';

	import Button from '$lib/components/ui/Button.svelte';
	import Menu from '$lib/components/ui/Menu.svelte';

	import type { Program } from '../types';
	import DeleteProgramModal from './DeleteProgramModal.svelte';
	import RenameProgramModal from './RenameProgramModal.svelte';

	type Props = {
		program: Program;
	};

	let { program }: Props = $props();

	let isRenameProgramModalOpen = $state(false);
	let isDeleteProgramModalOpen = $state(false);
</script>

<Menu>
	<Button variant="secondary-ghost" onclick={() => (isRenameProgramModalOpen = true)}>
		<IconPencil size={16} stroke={2.5} aria-hidden="true" />
		Rename
	</Button>
	<!-- <Button variant="secondary-ghost" disabled>
		<IconStack2 size={16} stroke={2.5} aria-hidden="true" />
		Duplicate
	</Button> -->
	<Button variant="tertiary-destructive" onclick={() => (isDeleteProgramModalOpen = true)}>
		<IconTrash size={16} stroke={2.5} aria-hidden="true" />
		Delete
	</Button>
</Menu>

<RenameProgramModal bind:isOpen={isRenameProgramModalOpen} {program} />
<DeleteProgramModal bind:isOpen={isDeleteProgramModalOpen} {program} />
