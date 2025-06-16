<script>
    import { createEventDispatcher } from "svelte";
    import Spinner from "./Spinner.svelte";

    export let isOpen = false;
    export let note = null;
    export let isSaving = false;

    let title = '';
    let content = '';
    let dialog;

    $: if(note) { title = note.title; content = note.content; } else { title = ''; content = '';}
    $: if(dialog) { isOpen ? dialog.showModal() : dialog.close(); }

    const dispatch = createEventDispatcher();
</script>
<dialog bind:this={dialog} on:close={() => dispatch('close')} class="w-11/12 max-w-lg rounded-xl p-0 shadow-2xl backdrop:bg-black/50 dark:bg-zinc-800 m-auto">
    <div class="p-6 sm:p-8">
        <h2 class="mb-4 text-2xl font-bold text-zinc-800 dark:text-white">
            {note ? 'Edit Note' : 'Create New Note'}
        </h2>
        <form on:submit|preventDefault={() => dispatch('save', {...note, title, content})} class="flex flex-col gap-4">
            <div>
                <label for="title" class="mb-1 block font-medium text-zinc-600 dark:text-zinc-300">Title</label>
                <input id="title" type="text" bind:value={title} class="w-full rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white" required>
            </div>
            <div>
                <label for="content" class="mb-1 block font-medium text-zinc-600 dark:text-zinc-300">Content</label>
                <textarea id="content" rows="4" bind:value={content} class="w-full rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white" required></textarea>
            </div>
            <div class="mt-4 flex justify-end gap-4">
                <button type="button" on:click={() => dispatch('close')} class="rounded-md px-4 py-2 font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700 cursor-pointer">
                    Cancel
                </button>
                <button type="submit" class="flex min-w-[100px] items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400 cursor-pointer" disabled={isSaving}>
                    {#if isSaving} <Spinner /> {:else} Save {/if}
                </button>
            </div>
        </form>
    </div>
</dialog>