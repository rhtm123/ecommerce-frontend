<script>
  import { goto } from '$app/navigation';
  import { productApi } from '$lib/services/productApi';
  import { onMount, onDestroy } from 'svelte';

  let { autoFocus = false, closeSearch: closeSearchProp, asButton = false } = $props();

  let searchQuery = '';
  let suggestions = [];
  let showSuggestions = false;
  let timeoutId;
  let isLoading = false;
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
    if (autoFocus && searchContainer) {
      const input = searchContainer.querySelector('input');
      if (input) {
        setTimeout(() => input.focus(), 100);
      }
    }
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
    goto(`/search?q=${encodeURIComponent(query)}`);
    closeSearch();
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

  function closeSearch() {
    searchQuery = '';
    showSuggestions = false;
    closeSearchProp("close");
  }

  function handleClickOutside() {
    showSuggestions = false;
  }

  function handleFocus() {
    if (searchQuery.length >= 2) {
      searchProducts(searchQuery);
    } else if (searchHistory.length > 0) {
      showSuggestions = true;
    }
  }

  function handleDropdownMousedown(event) {
    event.stopPropagation();
  }

  function handleClearAllHistoryClick(event) {
    event.stopPropagation();
    clearAllHistory();
  }

  function handleRemoveFromHistoryClick(event, query) {
    event.stopPropagation();
    removeFromHistory(query);
  }
</script>

<!-- Main Search Container -->
<div 
  class="relative w-full"
  bind:this={searchContainer}
  use:clickOutside
  onoutclick={handleClickOutside}
  onclick={asButton ? () => goto('/search') : undefined}
  style={asButton ? 'cursor:pointer;' : ''}
>
  <!-- Desktop Search -->
  <form 
    class="flex items-center w-full bg-gray-100 rounded-full overflow-hidden shadow-sm"
    onsubmit={handleSearchSubmit}
  >
    <input
      type="text"
      class="flex-1 px-4 py-2 md:px-6 md:py-3 bg-transparent focus:outline-none text-sm"
      placeholder="Search products and services..."
      bind:value={searchQuery}
      oninput={handleInput}
      onfocus={handleFocus}
      autocomplete="off"
      readonly={asButton}
      tabindex={asButton ? -1 : 0}
    />
    <button 
      type="submit" 
      class="h-full px-4 py-2 md:px-6 md:py-3 bg-gray-200 hover:bg-gray-300 transition-colors"
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
      class="absolute top-12 md:top-14 left-0 right-0 mx-2 md:mx-0 w-auto md:w-full bg-white rounded-lg shadow-lg z-50 border border-gray-200 max-h-96 overflow-y-auto"
      onmousedown={handleDropdownMousedown}
    >
      {#if showSuggestions && suggestions.length > 0}
        <!-- Search Suggestions -->
        <ul class="py-2">
          {#each suggestions as product}
            <li
              class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onmousedown={() => handleSuggestionClick(product)}
              role="option"
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
            onclick={handleClearAllHistoryClick}
          >
            Clear all
          </button>
        </div>
        <ul class="py-2">
          {#each searchHistory as query}
            <li
              class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
              role="option"
            >
              <div 
                class="flex items-center gap-3 flex-grow"
                onmousedown={() => handleHistoryClick(query)}
                role="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span class="text-sm text-gray-700">{query}</span>
              </div>
              <button 
                class="text-gray-400 hover:text-gray-600"
                onclick={(e) => handleRemoveFromHistoryClick(e, query)}
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
