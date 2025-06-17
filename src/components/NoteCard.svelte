<script>
    import { createEventDispatcher } from "svelte";
    export let note; // prop passed from parent
    const dispatch = createEventDispatcher();
</script>

<div
    class="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
>
    <div class="flex-grow">
        <h3 class="mb-2 text-xl font-semibold text-zinc-800 dark:text-zinc-100">{note.title}</h3>
        <p class="mb-4 text-zinc-600 dark:text-zinc-300">{note.content}</p>
    </div>
    <div class="mt-auto flex items-center justify-between pt-4 text-sm text-zinc-500 dark:text-zinc-400">
        <span>
            { new Date(note.createdAt).toLocaleDateString() }
        </span>
        <div class="flex gap-4">
            <button on:click={() => dispatch('edit', note)} class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400 cursor-pointer">
                Edit
            </button>
            <button on:click={() => dispatch('delete', note)} class="font-medium text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400 cursor-pointer">
                Delete
            </button>
        </div>
    </div>
</div>