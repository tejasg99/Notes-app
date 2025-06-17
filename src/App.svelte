<script>
  import { onMount } from 'svelte';
  import * as api from './api.js';

  // Component imports
  import NoteCard from './components/NoteCard.svelte';
  import Spinner from './components/Spinner.svelte';
  import NoteModal from './components/NoteModal.svelte';
  import ConfirmModal from './components/ConfirmModal.svelte';

  // State management
  let allNotes = []; // Holds the complete list of notes from the API
  let paginatedNotes = []; // The 20 notes currently visible on the page
  let filteredNoteCount = 0; // Total notes after searching, for pagination logic

  let isLoading = true;
  let error = null;

  // Modal states
  let isNoteModalOpen = false;
  let isConfirmModalOpen = false;
  let isSaving = false;
  let currentNote = null; // note being edited or deleted

  // Search and pagination states
  let searchTerm = '';
  let currentPage = 1;
  const limit = 20; // items per page

  // Data fetching
  async function fetchAllNotes() {
    isLoading = true;
    error = null;
    try {
      // modify getNotes to fetch all notes
      allNotes = await api.getNotes({ search: searchTerm });
    } catch (err) {
      error = err;
    } finally {
      isLoading = false;
    }
  }

  // Initial data load
  onMount(() => {
    fetchAllNotes();
  })

  // Reactive statement - 
  $: {
    // full list of notes
    let notesToProcess = allNotes;

    // Filter based on the search Term
    if(searchTerm) {
      notesToProcess = allNotes.filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Sort the filtered list by most recently updated
    notesToProcess.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Store the count for the pagination Next button logic
    filteredNoteCount = notesToProcess.length;

    // Slice the sorted array to get current page notes
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    paginatedNotes = notesToProcess.slice(startIndex, endIndex);
  }

  // Reactive statement to reset page when search term changes
  $: if(searchTerm) {
    currentPage = 1;
  }

  // Event handlers
  async function handleSaveNote(event) {
    isSaving = true;
    const noteToSave = event.detail;
    try {
      const now = new Date().toISOString(); // Get current timestamp
      if (noteToSave.id) {
        await api.updateNote(noteToSave.id, { ...noteToSave, updatedAt: now });
      } else {
        await api.createNote({ ...noteToSave, createdAt: now, updatedAt: now });
      }

      isNoteModalOpen = false; // Close modal after saving
      currentPage = 1; // Reset to first page
      await fetchAllNotes();
    } catch (err) {
      error = err;
			alert('Could not save note. Please try again.');
    } finally {
      isSaving = false; // Reset saving state
    }
  }

  async function handleConfirmDelete() {
    if(!currentNote) return;

    try {
      await api.deleteNote(currentNote.id);

      // fetch all notes again after deleting
      const maxPage = Math.ceil((filteredNoteCount - 1) / limit) || 1;
      if(currentPage > maxPage) {
        currentPage = maxPage;
      }
      await fetchAllNotes();
    } catch (err) {
      error = err;
      alert('Could not delete note. Please try again.');
    } finally {
      isConfirmModalOpen = false;
      currentNote = null;
    }
  }
  
  // Other handlers
  function handleOpenNewNoteModal() {
    currentNote = null; // Reset current note for new note creation
    isNoteModalOpen = true;
  }

  function handleEditRequest(event) {
    currentNote = event.detail; // Get the note to edit
    isNoteModalOpen = true;
  }

  function handleDeleteRequest(event) {
    currentNote = event.detail;
    isConfirmModalOpen = true;
  }

  function goToNextPage() {
    currentPage++;
    // Fetch notes for the next page
  }

  function goToPreviousPage() {
    if(currentPage > 1) {
      currentPage--;
      // Fetch notes for the previous page
    }
  }

  // Dark Mode
  let isDarkMode = false;
  onMount(() => {
    isDarkMode = localStorage.getItem('theme') === 'dark' || (localStorage.getItem('theme') === null && window.matchMedia('(prefers-color-scheme: dark)').matches); // Check local storage or system preference
  });

  // Another reactive statement to apply the theme change and save it.
  $: {
    if(typeof document !== 'undefined') {
      if(isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }
</script>

<div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 transition-colors duration-300 dark:bg-zinc-900 dark:text-zinc-50">
  <!-- Sticky header for modern feel -->
  <header class="sticky top-0 z-10 border-b border-zinc-200 bg-white/70 backdrop-blur-lg dark:border-zinc-700 dark:bg-zinc-900/70">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <h1 class="text-2xl font-bold bg-gradient-to-b from-indigo-500 via-indigo-700 to-cyan-400 bg-clip-text text-transparent">NoteItDown</h1>
        <div class="flex items-center gap-4">
          <button on:click={() => (isDarkMode = !isDarkMode)} title="Toggle theme" class="rounded-full p-2 text-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
            {#if isDarkMode} 🌞 {:else} 🌙 {/if}
          </button>
          <button on:click={handleOpenNewNoteModal} class="hidden rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:block cursor-pointer">
            New Note
          </button>
        </div>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Search input bound to searchTerm variable-->
    <div class="mb-8">
      <input 
        type="search"
        bind:value={searchTerm}
        placeholder="Search notes by title..."
        class="w-full max-w-lg rounded-md border-zinc-300 bg-white p-3 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
      >
    </div>

    
    {#if isLoading}
      <!-- Show a centered spinner -->
			<div class="flex h-64 items-center justify-center">
				<Spinner />
			</div>
    {:else if error}
      <!-- show error message -->
			<div class="rounded-md border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
				<h3 class="font-bold">Oops! Something went wrong.</h3>
				<p>{error.message}</p>
			</div>

    {:else if paginatedNotes.length === 0}
      <div class="text-center text-zinc-500 dark:text-zinc-400">
        <p>{searchTerm ? `No notes found for "${searchTerm}".` : 'No notes yet. Create one!'}</p>
      </div>
    {:else}
      <!-- A responsive grid for the note cards -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Keyed each block for efficient DOM updates -->
        {#each paginatedNotes as note (note.id)}
          <NoteCard {note} on:edit={handleEditRequest} on:delete={handleDeleteRequest} />
        {/each}
      </div>

      <!-- Pagination controls -->
      <div class="mt-8 flex justify-center gap-4">
        <button
          on:click={goToPreviousPage}
          disabled={currentPage === 1}
          class="rounded-md bg-zinc-200 px-4 py-2 font-semibold text-zinc-800 hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 cursor-pointer"
        >
          Previous
        </button>
        <span class="flex items-center font-medium">Page {currentPage}</span>
        <button
          on:click={goToNextPage}
          disabled={currentPage * limit >= filteredNoteCount}
          class="rounded-md bg-zinc-200 px-4 py-2 font-semibold text-zinc-800 hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 cursor-pointer"
        >
          Next
        </button>
      </div>
    {/if}
  </main>

	<!-- Floating Action Button for mobile -->
	<button on:click={handleOpenNewNoteModal} class="fixed bottom-6 right-6 flex size-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 sm:hidden"
  >
		<span class="text-4xl font-bold mb-2">+</span>
	</button>

  <!-- Modals are placed here at the end. They are only visible when their `isOpen` prop is true. -->
    <NoteModal 
      bind:isOpen={isNoteModalOpen} 
      {isSaving} 
      note={currentNote} 
      on:save={handleSaveNote}
      on:close={() => isNoteModalOpen = false}
    />
    <ConfirmModal 
      bind:isOpen={isConfirmModalOpen} 
      on:confirm={handleConfirmDelete}
      on:close={() => isConfirmModalOpen = false}
    />
</div>
