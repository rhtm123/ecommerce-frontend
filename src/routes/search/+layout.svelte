<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { productApi } from '$lib/services/productApi';
  import { serviceApi } from '$lib/services/serviceApi';
  import { categoryApi } from '$lib/services/categoryApi';
  import Product from '$lib/components/product/Product.svelte';
  import Service from '$lib/components/service/Service.svelte';
  import Icon from '@iconify/svelte';
  import { cart } from '$lib/stores/cart';
  import { page } from '$app/stores';
  import CartSidebar from '$lib/components/CartSidebar.svelte';
  let cartCount = 0;
  $: cartCount = $cart.reduce((total, item) => total + item.quantity, 0);
  let isCartOpen = false;

  // Search State
  let searchQuery = '';
  let isSearching = false;
  let searchResults = {
    categories: [],
    products: [],
    services: [],
    totalProducts: 0,
    totalServices: 0
  };
  let searchHistory = [];
  let searchTimeout;
  let searchInput;

  onMount(() => {
    loadSearchHistory();
    // Focus search input
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
    // If there is a query param, search
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      searchQuery = q;
      performSearch(searchQuery);
    }
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
      searchHistory = [query, ...searchHistory.slice(0, 9)];
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

  function handleSearchInput(e) {
    searchQuery = e.target.value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => performSearch(searchQuery), 300);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  }

  function handleHistoryClick(query) {
    searchQuery = query;
    performSearch(query);
  }

  function handleCategoryClick(category) {
    goto(`/shop/${category.slug}`);
  }

  function handleBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      goto('/');
    }
  }
  function handleCart() {
    isCartOpen = true;
  }
  let totalResults = () => searchResults.totalProducts + searchResults.totalServices + searchResults.categories.length;
</script>

<div class="bg-white border-b border-gray-200 fixed w-full left-0 top-0 z-30 shadow">
  <div class="max-w-7xl mx-auto px-2 py-2 flex items-center gap-2 md:gap-4">
    <!-- Back Button -->
    <button onclick={handleBack} class="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Go back">
      <Icon icon="mdi:arrow-left" class="w-6 h-6 text-gray-600" />
    </button>
    <!-- Logo (hidden on mobile) -->
    <a href="/" class="hidden md:flex flex-shrink-0 items-center">
      <img src="/img/naigaonmarketlogo1.png" alt="Naigaon Market" class="h-10" />
    </a>
    <!-- Search Bar -->
    <input
      bind:this={searchInput}
      type="text"
      class="flex-1 w-full px-4 py-2 md:py-3 bg-gray-100 rounded-full border border-blue-200 focus:border-blue-500 focus:outline-none text-base md:text-lg"
      placeholder="Search products and services..."
      value={searchQuery}
      oninput={handleSearchInput}
      autocomplete="off"
      onkeydown={(e) => { if (e.key === 'Enter') { handleSearchSubmit(e); } }}
    />
    <!-- Cart Icon (hidden on mobile) -->
    <button onclick={handleCart} class="hidden md:flex p-2 hover:bg-gray-100 rounded-full flex transition-colors relative" aria-label="Cart">
      <Icon icon="mdi:cart-outline" class="w-6 h-6 text-gray-600" />
      <span class="font-medium ml-1 hidden md:inline">Cart</span>
      {#if cartCount > 0}
        <span class="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>
      {/if}
    </button>
  </div>
</div>

<!-- Recent Searches (below navbar, only on empty state) -->
{#if !searchQuery && !isSearching && searchHistory.length > 0}
  <div class="max-w-7xl mx-auto pt-8 px-4 pb-2 flex flex-col md:flex-row md:items-center md:justify-between">
    <div>
      <h3 class="text-base font-semibold text-gray-900 mb-2 md:mb-0">Recent Searches</h3>
      <div class="flex flex-wrap gap-2">
        {#each searchHistory.slice(0, 8) as query}
          <button 
            onclick={() => handleHistoryClick(query)}
            class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
          >
            {query}
          </button>
        {/each}
      </div>
    </div>
    <button
      onclick={clearAllHistory}
      class="text-green-700 text-sm font-medium hover:underline mt-2 md:mt-0 md:ml-4"
      style="align-self:flex-start"
    >clear</button>
  </div>
{/if}

<!-- Main Content -->
<div class="max-w-7xl mx-auto md:pt-10  px-4 lg:pt-12 pb-16">
  {#if searchQuery && !isSearching}
    <!-- Results Summary -->
    <div class="mb-6" in:fade={{ duration: 200 }}>
      <h1 class="text-xl font-bold text-gray-900 mb-2">
        Search results for "{searchQuery}"
      </h1>
      <p class="text-gray-600">
        Found {totalResults()} results
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
    {#if totalResults() === 0 && !isSearching}
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
    <div class="text-center py-12 pt-24 pb-40">
      <Icon icon="mdi:magnify" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 class="text-xl font-medium text-gray-900 mb-2">Start your search</h2>
      <p class="text-gray-600 mb-6">
        Search for products, services, or categories to get started
      </p>
    </div>
  {/if}
</div>

<CartSidebar bind:isOpen={isCartOpen} />

<style>
  .sticky {
    position: sticky;
    top: 0;
    z-index: 20;
  }
</style> 