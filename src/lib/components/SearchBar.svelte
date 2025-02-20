<script>
  import { goto } from '$app/navigation';
  import { productApi } from '$lib/services/productApi';
  import { onMount, onDestroy } from 'svelte';

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();


  let searchQuery = '';
  let suggestions = [];
  let showSuggestions = false;
  let timeoutId;
  let isLoading = false;
  let isSearchOpen = false;
  let searchContainer;
  let searchHistory = [];

  function clickOutside(node) {
    const handleClick = (event) => {
      if (node && !node.contains(event.target) && !event.defaultPrevented) {
        node.dispatchEvent(new CustomEvent('outclick'));
      }
    };

    document.addEventListener('click', handleClick, true);

    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }

  onMount(() => {
    loadSearchHistory();
  });

  onDestroy(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });

  function loadSearchHistory() {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      searchHistory = JSON.parse(savedHistory);
    }
  }

  function saveSearchHistory() {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }

  function saveToHistory(query) {
    if (query.trim() && !searchHistory.includes(query)) {
      searchHistory = [query, ...searchHistory.slice(0, 4)];
      saveSearchHistory();
    }
  }

  function removeFromHistory(query) {
    searchHistory = searchHistory.filter(item => item !== query);
    saveSearchHistory();
  }

  function clearAllHistory() {
    searchHistory = [];
    saveSearchHistory();
  }

  async function searchProducts(query) {
    if (query.length < 2) {
      suggestions = [];
      showSuggestions = false;
      return;
    }
    
    try {
      isLoading = true;
      const response = await productApi.getProducts({
        search: query,
        page_size: 5
      });

      if (response && response.results) {
        suggestions = response.results;
        showSuggestions = suggestions.length > 0;
      }
    } catch (error) {
      console.error('Search error:', error);
      suggestions = [];
      showSuggestions = false;
    } finally {
      isLoading = false;
    }
  }

  function handleInput(e) {
    searchQuery = e.target.value;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => searchProducts(searchQuery), 300);
  }

  function handleSuggestionClick(product) {
    searchQuery = product.name;
    saveToHistory(searchQuery);
    showSuggestions = false;
    closeSearch();
    goto(`/product/${product.slug}`);
  }

  function handleHistoryClick(query) {
    searchQuery = query;
    searchProducts(query);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveToHistory(searchQuery);
      goto(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      showSuggestions = false;
      closeSearch();
    }
  }

  // function toggleSearch() {
  //   isSearchOpen = !isSearchOpen;
  //   if (isSearchOpen) {
  //     setTimeout(() => document.querySelector('input').focus(), 300);
  //   } else {
  //     closeSearch();
  //   }
  // }

  function closeSearch() {
    isSearchOpen = false;
    searchQuery = '';
    showSuggestions = false;
    dispatch("closeSearch", "close");
    // console.log("Search Closed");
  }

  function handleClickOutside() {
    closeSearch();
  }
</script>

<div 
  class="relative w-full"
  bind:this={searchContainer}
  use:clickOutside
  on:outclick={handleClickOutside}
>
  <!-- Desktop Search -->
  <form 
    class="flex items-center w-full bg-gray-100 rounded-full overflow-hidden shadow-sm"
    on:submit|preventDefault={handleSearchSubmit}
  >
    <input
      type="text"
      class="flex-1 px-6 py-3 bg-transparent focus:outline-none text-sm"
      placeholder="Search products..."
      bind:value={searchQuery}
      on:input={handleInput}
      on:focus={() => showSuggestions = true}
      autocomplete="off"
    />
    <button 
      type="submit" 
      class="h-full px-6 py-3 bg-gray-200 hover:bg-gray-300 transition-colors"
      disabled={isLoading}
    >
      {#if isLoading}
        <span class="loading loading-spinner loading-xs"></span>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      {/if}
    </button>
  </form>

  <!-- Suggestions and History Dropdown -->
  {#if (showSuggestions && suggestions.length > 0) || (showSuggestions && !searchQuery && searchHistory.length > 0)}
    <div 
      class="absolute top-14 w-full bg-white rounded-lg shadow-lg z-50 border border-gray-200"
      on:mousedown|stopPropagation
    >
      {#if showSuggestions && suggestions.length > 0}
        <!-- Search Suggestions -->
        <ul class="py-2">
          {#each suggestions as product}
            <li
              class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              on:mousedown={() => handleSuggestionClick(product)}
            >
              <div class="flex items-center gap-3">
                {#if product.main_image}
                  <img 
                    src={product.main_image} 
                    alt={product.name} 
                    class="h-10 w-10 object-cover rounded"
                    loading="lazy"
                  />
                {/if}
                <div class="flex-1">
                  <span class="text-sm font-medium">{product.name}</span>
                  {#if product.category}
                    <p class="text-xs text-gray-500">{product.category.name}</p>
                  {/if}
                </div>
              </div>
            </li>
          {/each}
        </ul>
      {:else if showSuggestions && !searchQuery && searchHistory.length > 0}
        <!-- Recent Search History -->
        <div class="p-3 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-sm font-medium text-gray-900">Recent Searches</h3>
          <button 
            class="text-sm text-blue-600 hover:text-blue-800"
            on:click|stopPropagation={clearAllHistory}
          >
            Clear all
          </button>
        </div>
        <ul class="py-2">
          {#each searchHistory as query}
            <li
              class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div 
                class="flex items-center gap-3 flex-grow"
                on:mousedown={() => handleHistoryClick(query)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span class="text-sm text-gray-700">{query}</span>
              </div>
              <button 
                class="text-gray-400 hover:text-gray-600"
                on:click|stopPropagation={() => removeFromHistory(query)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}

</div>
<style>
  /* Prevent body scroll when mobile search is open */
  @media (max-width: 768px) {
    :global(body.search-open) {
      overflow: hidden;
    }
  }

  /* Smooth transitions */
  .fixed {
    transition: all 0.3s ease-in-out;
  }

  input::placeholder {
    color: #9CA3AF;
  }

  /* Add subtle hover effects */
  button:hover {
    opacity: 0.8;
  }
</style>

