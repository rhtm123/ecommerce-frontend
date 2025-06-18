<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { fade, fly } from 'svelte/transition';
    import { productApi } from '$lib/services/productApi';
    import { serviceApi } from '$lib/services/serviceApi';
    import { categoryApi } from '$lib/services/categoryApi';
    import Product from '$lib/components/product/Product.svelte';
    import Service from '$lib/components/service/Service.svelte';
    import Icon from '@iconify/svelte';
  
    // State
    let searchQuery = $state('');
    let isSearching = $state(false);
    let searchResults = $state({
      categories: [],
      products: [],
      services: [],
      totalProducts: 0,
      totalServices: 0
    });
    let searchHistory = $state([]);
    let showSuggestions = $state(false);
    let searchTimeout;
    let searchInput;
  
    // Get initial search query from URL
    let initialQuery = $derived($page.url.searchParams.get('q') || '');
  
    onMount(() => {
      if (initialQuery) {
        searchQuery = initialQuery;
        performSearch(searchQuery);
      }
      loadSearchHistory();
      
      // Focus search input
      if (searchInput) {
        searchInput.focus();
      }
    });
  
    function loadSearchHistory() {
      try {
        const saved = localStorage.getItem('searchHistory');
        if (saved) {
          searchHistory = JSON.parse(saved);
        }
      } catch (error) {
        console.error('Error loading search history:', error);
        searchHistory = [];
      }
    }
  
    function saveToHistory(query) {
      if (query.trim() && !searchHistory.includes(query.trim())) {
        searchHistory = [query.trim(), ...searchHistory.slice(0, 9)]; // Keep last 10 searches
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
      }
    }
  
    function removeFromHistory(query) {
      searchHistory = searchHistory.filter(item => item !== query);
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
  
    function clearAllHistory() {
      searchHistory = [];
      localStorage.removeItem('searchHistory');
    }
  
    async function performSearch(query) {
      if (!query.trim()) {
        searchResults = {
          categories: [],
          products: [],
          services: [],
          totalProducts: 0,
          totalServices: 0
        };
        return;
      }
  
      isSearching = true;
      showSuggestions = false;
  
      try {
        // Search categories
        const categoriesPromise = categoryApi.getMainCategories().then(data => {
          return data.results.filter(cat => 
            cat.name.toLowerCase().includes(query.toLowerCase())
          );
        });
  
        // Search products
        const productsPromise = productApi.getProducts({
          search: query,
          page_size: 20
        });
  
        // Search services
        const servicesPromise = serviceApi.getServices({
          search: query,
          page_size: 20
        });
  
        const [categories, productsData, servicesData] = await Promise.all([
          categoriesPromise,
          productsPromise,
          servicesPromise
        ]);
  
        searchResults = {
          categories: categories || [],
          products: productsData.results || [],
          services: servicesData.results || [],
          totalProducts: productsData.count || 0,
          totalServices: servicesData.count || 0
        };
  
        // Save to history
        saveToHistory(query);
  
        // Update URL
        const url = new URL(window.location);
        url.searchParams.set('q', query);
        window.history.replaceState({}, '', url);
  
      } catch (error) {
        console.error('Search error:', error);
        searchResults = {
          categories: [],
          products: [],
          services: [],
          totalProducts: 0,
          totalServices: 0
        };
      } finally {
        isSearching = false;
      }
    }
  
    function handleSearchInput(event) {
      searchQuery = event.target.value;
      
      // Clear previous timeout
      clearTimeout(searchTimeout);
      
      // Show suggestions for non-empty queries
      showSuggestions = searchQuery.length > 0;
      
      // Debounce search
      if (searchQuery.trim()) {
        searchTimeout = setTimeout(() => {
          performSearch(searchQuery);
        }, 300);
      } else {
        searchResults = {
          categories: [],
          products: [],
          services: [],
          totalProducts: 0,
          totalServices: 0
        };
      }
    }
  
    function handleSearchSubmit(event) {
      event.preventDefault();
      if (searchQuery.trim()) {
        performSearch(searchQuery);
        showSuggestions = false;
      }
    }
  
    function handleHistoryClick(query) {
      searchQuery = query;
      performSearch(query);
      showSuggestions = false;
    }
  
    function handleCategoryClick(category) {
      goto(`/shop/${category.slug}`);
    }
  
    function goBack() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        goto('/');
      }
    }
  
    // Calculate total results
    let totalResults = $derived(
      searchResults.totalProducts + searchResults.totalServices + searchResults.categories.length
    );
  </script>
  
  <svelte:head>
    <title>{searchQuery ? `Search results for "${searchQuery}"` : 'Search'} | Naigaon Market</title>
    <meta name="description" content={searchQuery ? `Search results for "${searchQuery}" - Find products and services` : 'Search for products and services'} />
  </svelte:head>
  
  <!-- Search Results -->
  <div class="max-w-7xl mx-auto px-4 py-6">
    {#if searchQuery && !isSearching}
      <!-- Results Summary -->
      <div class="mb-6" in:fade={{ duration: 200 }}>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          Search results for "{searchQuery}"
        </h1>
        <p class="text-gray-600">
          Found {totalResults} results
          {#if searchResults.totalProducts > 0}
            ({searchResults.totalProducts} products
            {#if searchResults.totalServices > 0}
              , {searchResults.totalServices} services
            {/if}
            {#if searchResults.categories.length > 0}
              , {searchResults.categories.length} categories
            {/if})
          {:else if searchResults.totalServices > 0}
            ({searchResults.totalServices} services
            {#if searchResults.categories.length > 0}
              , {searchResults.categories.length} categories
            {/if})
          {:else if searchResults.categories.length > 0}
            ({searchResults.categories.length} categories)
          {/if}
        </p>
      </div>
  
      <!-- Category Suggestions -->
      {#if searchResults.categories.length > 0}
        <div class="mb-8" in:fly={{ y: 20, duration: 300 }}>
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon icon="mdi:tag-multiple" class="w-5 h-5 text-blue-600" />
            Related Categories
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {#each searchResults.categories as category}
              <button 
                onclick={() => handleCategoryClick(category)}
                class="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
              >
                <div class="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {#if category.image}
                    <img src={category.image || "/placeholder.svg"} alt={category.name} class="w-full h-full object-cover" />
                  {:else}
                    <Icon icon="mdi:tag" class="w-5 h-5 text-blue-600" />
                  {/if}
                </div>
                <span class="font-medium text-gray-900">{category.name}</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}
  
      <!-- Products Section -->
      {#if searchResults.products.length > 0}
        <div class="mb-8" in:fly={{ y: 20, duration: 300, delay: 100 }}>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Icon icon="mdi:package-variant" class="w-5 h-5 text-blue-600" />
              Products ({searchResults.totalProducts})
            </h2>
            {#if searchResults.totalProducts > searchResults.products.length}
              <a 
                href="/shop?q={encodeURIComponent(searchQuery)}"
                class="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all products →
              </a>
            {/if}
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {#each searchResults.products as product}
              <Product {product} />
            {/each}
          </div>
        </div>
      {/if}
  
      <!-- Services Section -->
      {#if searchResults.services.length > 0}
        <div class="mb-8" in:fly={{ y: 20, duration: 300, delay: 200 }}>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Icon icon="mdi:hand-heart" class="w-5 h-5 text-blue-600" />
              Services ({searchResults.totalServices})
            </h2>
            {#if searchResults.totalServices > searchResults.services.length}
              <a 
                href="/services?q={encodeURIComponent(searchQuery)}"
                class="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all services →
              </a>
            {/if}
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {#each searchResults.services as service}
              <Service service={service} />
            {/each}
          </div>
        </div>
      {/if}
  
      <!-- No Results -->
      {#if totalResults === 0 && !isSearching}
        <div class="text-center py-12" in:fade={{ duration: 300 }}>
          <Icon icon="mdi:magnify" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-xl font-medium text-gray-900 mb-2">No results found</h3>
          <p class="text-gray-600 mb-6">
            We couldn't find anything matching "{searchQuery}". Try different keywords or browse our categories.
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="/shop"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Products
            </a>
            <a 
              href="/services"
              class="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Services
            </a>
          </div>
        </div>
      {/if}
  
    {:else if isSearching}
      <!-- Loading State -->
      <div class="text-center py-12">
        <Icon icon="mdi:loading" class="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
        <p class="text-gray-600">Searching...</p>
      </div>
  
    {:else}
      <!-- Empty State -->
      
    {/if}
  </div>
  
<slot />
  