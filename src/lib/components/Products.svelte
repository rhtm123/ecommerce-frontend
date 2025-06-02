<script lang="ts">
  import { run } from 'svelte/legacy';

  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { productApi } from '$lib/services/productApi';
  import Product from '$lib/components/product/Product.svelte';
  import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from '$env/static/public';
  import { myFetch } from '$lib/utils/myFetch';
  import { goto } from '$app/navigation';
  import { nonpassive } from 'svelte/legacy';
  import { page } from '$app/stores';
  import Categories from './Categories.svelte';
  import MobileShopView from './MobileShopView.svelte';
  import { writable } from 'svelte/store';

  interface Props {
    currentCategory: any;
    searchQuery?: string;
  }

  let { currentCategory = $bindable(), searchQuery = '' }: Props = $props();

  // State
  let products = $state([]);
  let next = $state();
  let categories = [];
  let allCategories = $state([]); // Store all categories flat for easy lookup
  let allBrands = $state([]);
  let filters = $state({});
  let loading = $state(true);
  let loadingMore = $state(false);
  let error = $state(null);
  let currentPage = 1;
  let showFilters = $state(false);
  let parentCategory = $state(null);
  let childCategories = []; // Child categories of current category
  let displayCategories = $state([]); // Categories to display in sidebar

  // Filter states
  let selectedPriceRange = $state([0, 100]);
  const brand_ids = $page.url.searchParams.get('brand_ids');
  const search = $page.url.searchParams.get('q');

  let sortOption = $state('default');
  let viewMode = 'grid';
  let totalProducts = $state(0);

  let selectedBrands = writable<string[]>(brand_ids ? brand_ids.split(',') : []);

  // Fetch initial sidebar filters
  async function loadInitialSideFilters(params) {
    try {
      const filtersData = await productApi.getFilters({ ...params, brand_ids: '' });
      filters = filtersData;
      allBrands = filtersData.brands.map(brand => ({
        brand__id: brand.brand__id,
        brand__name: brand.brand__name,
        count: brand.count
      }));
      selectedPriceRange = [
        parseFloat(filters?.price_range?.min_price ?? 0),
        parseFloat(filters?.price_range?.max_price ?? 100)
      ];
    } catch (err) {
      error = 'Failed to load filters';
      console.error(err);
    }
  }

  // Update brand counts based on current filters
  async function updateBrandCounts(params) {
    try {
      const filtersData = await productApi.getFilters({ ...params, brand_ids: '' });
      const brandCounts = filtersData.brands.reduce((acc, brand) => {
        acc[brand.brand__id] = brand.count;
        return acc;
      }, {});
      allBrands = allBrands.map(brand => ({
        ...brand,
        count: brandCounts[brand.brand__id] || 0
      }));
    } catch (err) {
      console.error('Error updating brand counts:', err);
    }
  }

  onMount(() => {
    loadProducts(params);
    fetchAllCategories();
    loadInitialSideFilters(params);
  });


  function updateCategoryContext(categoryId) {
    // Find the current category
    const category = findCategoryById(categoryId);
    
    if (!category) {
      // If no current category, show root categories
      displayCategories = categories;
      parentCategory = null;
      childCategories = [];
      return;
    }
    
    // Find parent category
    parentCategory = null;
    if (category.level > 1) {
      // This is a child category, find its parent
      for (const cat of allCategories) {
        if (cat.level === category.level - 1 && cat.children && cat.children.some(child => child.id === categoryId)) {
          parentCategory = cat;
          break;
        }
      }
    }
    
    // Get child categories of current category
    childCategories = category.children || [];
    
    // Determine what to display in sidebar
    if (childCategories.length > 0) {
      // If current category has children, show them
      displayCategories = childCategories;
    } else if (parentCategory && parentCategory.children) {
      // If no children but has parent, show siblings
      displayCategories = parentCategory.children;
    } else {
      // Show root categories
      displayCategories = categories;
    }
  }
  
  function findCategoryById(id) {
    return allCategories.find(cat => cat.id === id);
  }

  async function loadMore() {
    loadingMore = true;
    if (typeof next === 'string') {
      const response = await fetch(next);
      let dataNew = await response.json();
      products = [...products, ...dataNew.results];
      next = dataNew.next;
    }
    loadingMore = false;
  }

  async function fetchAllCategories() {
    try {
      let data = await myFetch(`${PUBLIC_API_URL}/product/categories/?page=1&page_size=50&estore_id=${PUBLIC_ESTORE_ID}`);
      const flatCategories = data.results;
      
      // Store all categories flat for easy lookup
      allCategories = flatCategories.map(cat => ({
        ...cat,
        children: []
      }));
      
      // Build the hierarchy
      categories = buildCategoryHierarchy(flatCategories);
      
      // If we have a current category, update context
      if (currentCategory) {
        updateCategoryContext(currentCategory.id);
      } else {
        // No current category, show root categories
        displayCategories = categories;
      }
    } catch (err) {
      console.log(err);
    }
  }

  function buildCategoryHierarchy(flatCategories) {
    // Create a map for easy lookup
    const categoryMap = new Map();
    flatCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Filter to get only root categories (level 1)
    const rootCategories = flatCategories.filter(cat => cat.level === 1);
    
    // Build the hierarchy based on the relationships
    rootCategories.forEach(rootCat => {
      const rootCategory = categoryMap.get(rootCat.id);
      
      if (rootCat.name === 'Toys') {
        // Toys -> Educational Toys
        const educationalToys = flatCategories.find(cat => cat.name === 'Educational Toys');
        if (educationalToys) {
          rootCategory.children.push(categoryMap.get(educationalToys.id));
        }
      } else if (rootCat.name === 'Traditional Toys Kb') {
        // Traditional Toys Kb -> Traditional Toys -> (Maths Learning, Science Learning)
        const traditionalToys = flatCategories.find(cat => cat.name === 'Traditional Toys');
        if (traditionalToys) {
          const traditionalToysCategory = categoryMap.get(traditionalToys.id);
          
          // Add Maths Learning and Science Learning as children of Traditional Toys
          const mathsLearning = flatCategories.find(cat => cat.name === 'Maths Learning');
          const scienceLearning = flatCategories.find(cat => cat.name === 'Science Learning');
          
          if (mathsLearning) traditionalToysCategory.children.push(categoryMap.get(mathsLearning.id));
          if (scienceLearning) traditionalToysCategory.children.push(categoryMap.get(scienceLearning.id));
          
          rootCategory.children.push(traditionalToysCategory);
        }
      }
    });
    
    // Update the children in allCategories for reference
    rootCategories.forEach(root => {
      const rootWithChildren = categoryMap.get(root.id);
      const index = allCategories.findIndex(c => c.id === root.id);
      if (index !== -1) {
        allCategories[index].children = rootWithChildren.children;
      }
      
      // Also update children of children
      rootWithChildren.children.forEach(child => {
        const childIndex = allCategories.findIndex(c => c.id === child.id);
        if (childIndex !== -1) {
          allCategories[childIndex].children = child.children;
        }
      });
    });
    
    return rootCategories.map(cat => categoryMap.get(cat.id));
  }

  async function loadProducts(newParams = {}) {
    loading = true;
    products = [];
    try {
      const productsData = await productApi.getProducts({...params, ...newParams});
      products = productsData.results;
      totalProducts = productsData.count;
      next = productsData.next;
    } catch (err) {
      error = 'Failed to load products';
      console.error(err);
    } finally {
      loading = false;
    }
  }

  async function applyFilters() {
    const newParams = {
      page: currentPage,
      category_id: currentCategory?.id,
      min_price: selectedPriceRange[0],
      max_price: selectedPriceRange[1],
      brand_ids: $selectedBrands.join(','),
      ordering: getSortOrder(sortOption)
    };
    await loadProducts(newParams);
    await updateBrandCounts(newParams);
  }

  function getSortOrder(option) {
    switch (option) {
      case 'price_asc': return 'price';
      case 'price_desc': return '-price';
      case 'popularity': return '-popularity';
      case 'rating': return '-rating';
      case 'newest': return '-created';
      default: return '';
    }
  }

  function clearCategory() {
    currentCategory = null;
    parentCategory = null;
    childCategories = [];
    displayCategories = categories;
    loadProducts({ category_id: null });
    
    // Update URL to base shop
    goto('/shop');
  }

  function goToParentCategory() {
    if (parentCategory) {
      goto(`/shop/${parentCategory.slug}`);
    } else {
      clearCategory();
    }
  }

  let params = $derived({
    "category_id": currentCategory?.id,
    "brand_ids": $selectedBrands.join(','),
    "search": search ? search : ""
  });
  run(() => {
    if (currentCategory) {
      loadProducts(params);
      updateBrandCounts(params);
      
      // Update category context when current category changes
      if (allCategories.length > 0) {
        updateCategoryContext(currentCategory.id);
      }
    }
  });
  run(() => {
    if (search !== undefined) {
      loadProducts(params);
      updateBrandCounts(params);
    }
  });
</script>

<!-- Mobile Shop View (only on mobile) -->
<div class="md:hidden">
  <MobileShopView 
    {currentCategory}
    {products}
    {filters}
    {params}
    {loadProducts}
  />
</div>

<!-- Desktop Product Grid (only on desktop) -->
<div class="hidden md:block">
  <!-- Desktop Blinkit-style Layout -->
  <div class="h-screen bg-white">
    <div class="flex h-full">
      <!-- Left Sidebar - Categories -->
      <div class="w-64 bg-white border-r border-gray-200 flex flex-col">
        <!-- Header - Shows current category or "All Categories" -->
        <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h2 class="font-bold text-gray-800 flex items-center gap-2">
            {#if currentCategory}
              <button 
                class="p-1 hover:bg-gray-100 rounded-full transition-colors"
                onclick={parentCategory ? goToParentCategory : clearCategory}
                aria-label="Back to parent category"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <span>{currentCategory.name}</span>
            {:else}
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              <span>All Categories</span>
            {/if}
          </h2>
        </div>

        <!-- Category List -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-2">
            {#each displayCategories as category (category.id)}
              <div class="relative">
                <a 
                  href="/shop/{category.slug}"
                  class="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors text-left {currentCategory?.id === category.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}"
                >
                  <div class="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                    <img 
                      src={category.image || "/placeholder.svg?height=32&width=32"} 
                      alt={category.name}
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <span class="text-sm truncate">{category.name}</span>
                  
                  {#if category.children && category.children.length > 0}
                    <svg class="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  {/if}
                </a>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col">
        <!-- Header Section -->
        <div class="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
          <div>
            <h1 class="text-lg font-semibold text-gray-900">
              {currentCategory ? currentCategory.name : 'All Products'}
            </h1>
            <p class="text-xs text-gray-500">
              {totalProducts} products
            </p>
          </div>
          
          <div class="flex items-center gap-3">
            <!-- Sort Dropdown -->
            <select 
              class="select select-sm select-bordered bg-white text-sm min-w-0 w-auto"
              bind:value={sortOption}
              onchange={applyFilters}
            >
              <option value="default">Default Sorting</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popularity">Sort by Popularity</option>
              <option value="rating">Sort by Rating</option>
              <option value="newest">Sort by Newest</option>
            </select>
            
            <!-- Filter Button -->
            <button 
              class="btn btn-sm btn-outline gap-1"
              onclick={() => showFilters = !showFilters}
              aria-label="Toggle filters"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
              Filter
            </button>
          </div>
        </div>

        <!-- Products Grid with Filter Sidebar -->
        <div class="flex-1 overflow-hidden bg-gray-50 relative">
          <div class="flex h-full">
            <!-- Main Products Area -->
            <div class="flex-1 overflow-y-auto p-4">
              {#if loading}
                <div class="flex justify-center items-center py-8">
                  <div class="loading loading-spinner loading-md text-blue-500"></div>
                </div>
              {:else if error}
                <div class="text-center py-8">
                  <p class="text-red-500 text-sm">{error}</p>
                </div>
              {:else if products.length === 0}
                <div class="text-center py-8">
                  <div class="text-gray-400 mb-2">
                    <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5"></path>
                    </svg>
                  </div>
                  <h3 class="text-base font-medium text-gray-900 mb-1">No products found</h3>
                  <p class="text-gray-500 text-sm">Try adjusting your search or filters</p>
                </div>
              {:else}
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {#each products as product (product.id)}
                    <Product {product} />
                  {/each}
                </div>

                <!-- Load More Button -->
                <div class="flex justify-center items-center py-4">
                  {#if loadingMore}
                    <div class="loading loading-spinner loading-sm"></div>
                  {/if}
                  {#if next && !loadingMore && !loading}
                    <button class="btn btn-outline btn-sm" onclick={loadMore}>Load More</button>
                  {/if}
                </div>
              {/if}
            </div>

            <!-- Filter Sidebar -->
            {#if showFilters}
              <div class="w-72 bg-white border-l border-gray-200 overflow-y-auto" transition:fly="{{ x: 300, duration: 300 }}">
                <div class="p-4">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-gray-900">Filters</h3>
                    <button 
                      class="btn btn-ghost btn-xs"
                      onclick={() => showFilters = false}
                      aria-label="Close filters"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  <!-- Price Range Filter -->
                  <div class=" mb-6">
                    <h3 class="text-sm font-medium mb-2">Price Range</h3>
                    <div class="flex flex-col gap-4">
                      <div class="relative group">
                        <div 
                          class="absolute -top-8 transform -translate-x-1/2 transition-all duration-200 pointer-events-none"
                          style="left: calc({((selectedPriceRange[1] - (filters.price_range?.min_price || 0)) / ((filters.price_range?.max_price || 100) - (filters.price_range?.min_price || 0)) * 100)}%)"
                        >
                          <div class="bg-primary text-white px-2 py-1 rounded text-xs shadow-md opacity-0 group-hover:opacity-100 whitespace-nowrap">
                             {selectedPriceRange[1]}
                          </div>
                          <div class="w-2 h-2 bg-primary rotate-45 transform -translate-x-1/2 left-1/2 absolute -bottom-1"></div>
                        </div>
                        <input
                          type="range"
                          min={filters.price_range?.min_price || 0}
                          max={filters.price_range?.max_price || 100}
                          bind:value={selectedPriceRange[1]}
                          onchange={applyFilters}
                          class="range range-primary w-full cursor-pointer"
                        />
                      </div>
                      <div class="flex justify-between text-sm text-gray-600">
                        <span>{filters.price_range?.min_price || 0}</span>
                        <span>{filters.price_range?.max_price || 100}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Brand Filter -->
                  <div class="mb-6">
                    <h4 class="font-medium text-gray-900 mb-3 text-sm">Brands</h4>
                    <div class="space-y-2">
                      {#each allBrands as brand}
                        <label class="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            class="checkbox checkbox-primary checkbox-sm"
                            checked={$selectedBrands.includes(brand.brand__id.toString())}
                            onchange={() => {
                              selectedBrands.update(sb => 
                                sb.includes(brand.brand__id.toString())
                                  ? sb.filter(id => id !== brand.brand__id.toString())
                                  : [...sb, brand.brand__id.toString()]
                              );
                              applyFilters();
                            }}
                          />
                          {brand.brand__name} ({brand.count})
                        </label>
                      {/each}
                    </div>
                  </div>

                  <!-- Apply Filters Button -->
                  <button class="btn btn-primary btn-sm w-full" onclick={applyFilters}>
                    Apply Filters
                  </button>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
