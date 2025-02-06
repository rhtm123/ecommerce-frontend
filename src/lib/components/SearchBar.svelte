<script>
  import { goto } from '$app/navigation';
  import { productApi } from '$lib/services/productApi';
  import { onMount, onDestroy } from 'svelte';

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
    goto(`/product/${product.slug}`);
    closeSearch();
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

  function toggleSearch() {
    isSearchOpen = !isSearchOpen;
    if (isSearchOpen) {
      setTimeout(() => document.querySelector('input').focus(), 300);
    } else {
      closeSearch();
    }
  }

  function closeSearch() {
    isSearchOpen = false;
    searchQuery = '';
    showSuggestions = false;
  }

  function handleClickOutside() {
    closeSearch();
  }
</script>

<div 
  class="relative ml-auto" 
  bind:this={searchContainer}
  use:clickOutside
  on:outclick={handleClickOutside}
>
  <button
    class="btn btn-ghost btn-circle hover:bg-gray-100"
    on:click|stopPropagation={toggleSearch}
    aria-label="Toggle search"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </button>

  <!-- Mobile Search View -->
  {#if isSearchOpen}
    <div class="md:hidden fixed inset-0 bg-white z-50">
      <!-- Top Header -->
      <div class="flex items-center p-4 bg-white">
        
        <!-- Search Container -->
        <div class="flex-1 flex items-center bg-gray-100 rounded-full mx-2">
          <button 
            type="button"
            class="p-2"
            on:click={closeSearch}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <input
            type="text"
            class="flex-1 px-2 py-2 bg-transparent focus:outline-none text-sm"
            placeholder="Search products..."
            bind:value={searchQuery}
            on:input={handleInput}
            autocomplete="off"
          />
        </div>
        
      </div>

      <!-- Mobile Search Content -->
      <div class="p-4">
        {#if !searchQuery && searchHistory.length > 0}
          <!-- Recent Searches -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-gray-900">Recent Searches</h3>
              <button 
                class="text-sm text-blue-600"
                on:click={clearAllHistory}
              >
                Clear all
              </button>
            </div>
            <div class="space-y-2">
              {#each searchHistory as query}
                <div class="flex items-center justify-between py-2">
                  <button 
                    class="flex items-center text-gray-700"
                    on:click={() => handleHistoryClick(query)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {query}
                  </button>
                  <button 
                    class="text-gray-400"
                    on:click={() => removeFromHistory(query)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        {#if showSuggestions && suggestions.length > 0}
          <!-- Mobile Search Results -->
          <div class="space-y-4">
            {#each suggestions as product}
              <button
                class="flex items-center w-full text-left"
                on:click={() => handleSuggestionClick(product)}
              >
                {#if product.main_image}
                  <img 
                    src={product.main_image} 
                    alt={product.name}
                    class="w-16 h-16 object-cover rounded-lg mr-4"
                  />
                {/if}
                <div>
                  <h4 class="text-sm font-medium text-gray-900">{product.name}</h4>
                  <p class="text-sm text-gray-500">{product.category}</p>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Desktop Search View (Original) -->
  <form 
    class="hidden md:block absolute top-0 right-0 transition-all duration-300 ease-in-out origin-right {isSearchOpen ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}"
    on:submit|preventDefault={handleSearchSubmit}
    style="min-width: 320px;"
  >
    <div class="flex items-center bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden">
      <input
        type="text"
        class="px-4 py-2 w-full focus:outline-none text-sm"
        placeholder="Search products..."
        bind:value={searchQuery}
        on:input={handleInput}
        autocomplete="off"
      />
      <button 
        type="submit" 
        class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
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
    </div>

    {#if (showSuggestions && suggestions.length > 0) || (!showSuggestions && searchHistory.length > 0)}
      <div 
        class="absolute top-12 right-0 w-full bg-white shadow-lg rounded-lg z-50 border border-gray-200"
        on:mousedown|stopPropagation
      >
        {#if showSuggestions && suggestions.length > 0}
          <ul class="py-2">
            {#each suggestions as product}
              <li
                class="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                on:mousedown={() => handleSuggestionClick(product)}
              >
                <div class="flex items-center gap-3">
                  {#if product.main_image}
                    <img 
                      src={product.main_image || "/placeholder.svg"} 
                      alt={product.name} 
                      class="h-10 w-10 object-cover rounded"
                      loading="lazy"
                    />
                  {/if}
                  <div class="flex-1">
                    <span class="text-sm font-medium">{product.name}</span>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        {:else if searchHistory.length > 0}
          <div class="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-xs font-semibold text-gray-500 uppercase">Recent Searches</h3>
            <button 
              class="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              on:click|stopPropagation={clearAllHistory}
            >
              Clear All
            </button>
          </div>
          <ul class="py-2">
            {#each searchHistory as query}
              <li
                class="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div 
                  class="flex items-center gap-3 flex-grow"
                  on:mousedown={() => handleHistoryClick(query)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-sm text-gray-600">{query}</span>
                </div>
                <button 
                  class="text-gray-400 hover:text-gray-600 transition-colors"
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
  </form>
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

