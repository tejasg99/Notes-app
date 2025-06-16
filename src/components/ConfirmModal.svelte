<script>
    import { createEventDispatcher } from "svelte";
    export let isOpen = false;
    let dialog;
    $: if (dialog) { isOpen ? dialog.showModal() : dialog.close(); }
	const dispatch = createEventDispatcher();
</script>
<dialog bind:this={dialog} on:close={() => dispatch('close')} class="w-11/12 max-w-md rounded-xl p-0 shadow-2xl backdrop:bg-black/50 dark:bg-zinc-800">
	<div class="p-6 sm:p-8">
		<h3 class="mb-4 text-xl font-bold text-zinc-900 dark:text-white">Are you sure?</h3>
		<p class="mb-6 text-zinc-600 dark:text-zinc-300">This will permanently delete the note. This action cannot be undone.</p>
		<div class="flex justify-end gap-4">
			<button on:click={() => dispatch('close')} class="rounded-md px-4 py-2 font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700">Cancel</button>
			<button on:click={() => dispatch('confirm')} class="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">Delete</button>
		</div>
	</div>
</dialog>