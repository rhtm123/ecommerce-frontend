<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { productApi } from '$lib/services/productApi';
  import Product from '$lib/components/product/Product.svelte';
  import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from '$env/static/public';
  import { myFetch } from '$lib/utils/myFetch';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { writable } from 'svelte/store';

  export let currentCategory = null;

  let products = [];
  let next = null;
  let categories = [];
  let allCategories = [];
  let allBrands = [];
  let filters = {};
  let loading = true;
  let loadingMore = false;
  let error = null;
  let currentPage = 1;
  let showFilters = false;
  let parentCategory = null;
  let childCategories = [];
  let displayCategories = [];
  let selectedPriceRange = [0, 100];
  let sortOption = 'default';
  let viewMode = 'grid';
  let totalProducts = 0;

  const brand_ids = $page.url.searchParams.get('brand_ids');
  const search = $page.url.searchParams.get('q');
  let selectedBrands = writable(brand_ids ? brand_ids.split(',') : []);

  async function loadInitialFilters(params) {
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


  function updateCategoryContext(categoryId) {
    const category = findCategoryById(categoryId);
    if (!category) {
      displayCategories = categories;
      parentCategory = null;
      childCategories = [];
      return;
    }
    parentCategory = null;
    if (category.level > 1) {
      for (const cat of allCategories) {
        if (cat.level === category.level - 1 && cat.children.some(child => child.id === categoryId)) {
          parentCategory = cat;
          break;
        }
      }
    }
    childCategories = category.children || [];
    if (childCategories.length > 0) {
      displayCategories = childCategories;
    } else if (parentCategory && parentCategory.children) {
      displayCategories = parentCategory.children;
    } else {
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
      allCategories = flatCategories.map(cat => ({
        ...cat,
        children: []
      }));
      categories = buildCategoryHierarchy(flatCategories);
      if (currentCategory) {
        updateCategoryContext(currentCategory.id);
      } else {
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

    // Initialize root categories and current parents
    const rootCategories = [];
    let currentRoot = null;
    let currentLevel2 = null;

    // Iterate through categories in order
    flatCategories.forEach(cat => {
      const node = categoryMap.get(cat.id);
      if (cat.level === 1) {
        // New root category
        rootCategories.push(node);
        currentRoot = node;
        currentLevel2 = null; // Reset level 2 parent
      } else if (cat.level === 2 && currentRoot) {
        // Level 2 is a child of the current root
        currentRoot.children.push(node);
        currentLevel2 = node; // Set as current level 2 parent
      } else if (cat.level === 3 && currentLevel2) {
        // Level 3 is a child of the current level 2
        currentLevel2.children.push(node);
      }
    });

    // Update allCategories with the hierarchy
    rootCategories.forEach(root => {
      const index = allCategories.findIndex(c => c.id === root.id);
      if (index !== -1) {
        allCategories[index].children = root.children;
      }
      root.children.forEach(child => {
        const childIndex = allCategories.findIndex(c => c.id === child.id);
        if (childIndex !== -1) {
          allCategories[childIndex].children = child.children;
        }
      });
    });

    return rootCategories;
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
    goto('/shop');
  }

  function goToParentCategory() {
    if (parentCategory) {
      goto(`/shop/${parentCategory.slug}`);
    } else {
      clearCategory();
    }
  }

  $: params = {
    category_id: currentCategory?.id,
    brand_ids: $selectedBrands.join(','),
  };

  $: {
    if (currentCategory) {
      applyFilters();
      fetchAllCategories();

    }
  }

 

  let isMobile = false;
  
  onMount(async () => {
    // Detect mobile on mount
    isMobile = window.innerWidth < 768;
    window.addEventListener('resize', () => {
      isMobile = window.innerWidth < 768;
    });
    
    fetchAllCategories();
    await loadInitialFilters(params);
    await applyFilters();
  });

  let showSortModal = false;

  


</script>




<!-- Main container -->
<div class="mt-4">
  <div class="min-h-screen bg-white">
    <!-- {/*-- Mobile Header --*/} -->
    <div class="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 p-3 flex items-center justify-between">
      <h2 class="text-sm font-medium truncate max-w-[50vw]">
        {#if currentCategory}
          {currentCategory.name}
        {:else}
          All Products
        {/if}
      </h2>
      <div class="flex gap-2">
        <button 
          class="btn btn-sm btn-outline gap-1"
          on:click={() => showFilters = true}
          aria-label="Open filters"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
          </svg>
          Filter
        </button>
      </div>
    </div>

    <!-- {/*-- Mobile Categories Bar (Visible on mobile) --*/} -->
    <div class="md:hidden sticky top-12 z-20 bg-white border-b border-gray-200 overflow-x-auto">
      <div class="flex space-x-2 p-2 min-w-max">
        {#each displayCategories as category (category.id)}
          <a 
            href="/shop/{category.slug}"
            class="px-3 py-1.5 text-sm whitespace-nowrap rounded-full border border-gray-300 transition-colors
                  {currentCategory?.id === category.id 
                    ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'}"
          >
            {category.name}
          </a>
        {/each}
      </div>
    </div>

    <!-- {/*-- Desktop Title --*/} -->
    

    <div class="flex flex-col md:flex-row h-full">
      <!-- {/*-- Desktop Category Sidebar --*/} -->
      <div class="hidden md:block w-64 bg-white border-r border-gray-200 flex flex-col">
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
                  <span class="text-sm flex-1">{category.name}</span>
                  {#if category.children && category.children.length > 0}
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  {/if}
                </a>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- {/*-- Main Content Area --*/} -->
      <div class="flex-1 flex flex-col">
        <!-- {/*-- Desktop Top Bar --*/} -->
        <div class="hidden md:flex px-4 py-3 border-b border-gray-200 bg-white justify-between items-center">


          <h1 class="font-medium opacity-80 hidden md:block ">
            {currentCategory?.name} {totalProducts} Products
          </h1>


          <div class="flex items-center gap-3">
            <select 
              class="select select-sm select-bordered bg-white text-sm min-w-0 w-auto"
              bind:value={sortOption}
              on:change={applyFilters}
            >
              <option value="default">Default </option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popularity">Sort by Popularity</option>
              <option value="rating">Sort by Rating</option>
              <option value="newest">Sort by Newest</option>
            </select>
            <button 
              class="btn btn-sm btn-outline gap-1"
              on:click={() => showFilters = !showFilters}
              aria-label="Toggle filters"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
              Filter
            </button>
          </div>
        </div>

        <!-- {/*-- Product Grid --*/} -->
        <div class="flex-1 overflow-hidden bg-gray-50 relative">
          <div class="flex h-full">
            <div class="flex-1 overflow-y-auto p-0 md:p-4">
              <!-- {/*-- Mobile product count --*/} -->
              <div class="md:hidden px-3 py-2 text-sm text-gray-500">
                {totalProducts} products
              </div>
              
              {#if loading}
                <div class="flex justify-center py-10">
                  <div class="loading loading-spinner loading-md text-blue-500"></div>
                </div>
              {:else if error}
                <div class="text-center py-10 text-sm text-red-600">{error}</div>
              {:else if products.length === 0}
                <div class="text-center py-10 text-gray-600">
                  <p class="text-lg font-medium mb-1">No products found</p>
                  <p class="text-sm">Try adjusting your filters or search query</p>
                </div>
              {:else}
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 px-2 md:px-0">
                  {#each products as product (product.id)}
                    <Product {product} />
                  {/each}
                </div>
                <div class="flex justify-center items-center py-4">
                  {#if loadingMore}
                    <div class="loading loading-spinner loading-sm"></div>
                  {/if}
                  {#if next && !loadingMore && !loading}
                    <button class="btn btn-outline btn-sm" on:click={loadMore}>Load More</button>
                  {/if}
                </div>
              {/if}
            </div>
            
            <!-- {/*-- Filter Drawer (Mobile & Desktop) --*/} -->
            {#if showFilters}
              <div class="fixed inset-0 z-40 bg-white md:relative md:w-72 md:border-l md:shadow-lg" 
                   transition:fly={{ x: isMobile ? 300 : 0, duration: 300 }}>
                <div class="p-4 divide-y divide-gray-200 space-y-4 h-full overflow-y-auto">
                  <div class="flex justify-between items-center">
                    <h3 class="font-semibold text-gray-800 text-base">Filters</h3>
                    <button on:click={() => showFilters = false} class="text-gray-500 hover:text-gray-700">
                      ✕
                    </button>
                  </div>
              
                  <div class="pt-4">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
                    <div class="px-2">
                      <input
                        type="range"
                        min={filters.price_range?.min_price || 0}
                        max={filters.price_range?.max_price || 100}
                        bind:value={selectedPriceRange[1]}
                        class="range range-primary w-full"
                      />
                    </div>
                    <div class="flex justify-between text-sm text-gray-600 px-1">
                      <span>₹{filters.price_range?.min_price || 0}</span>
                      <span>₹{filters.price_range?.max_price || 100}</span>
                    </div>
                  </div>
              
                  <div class="pt-4">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Brands</h4>
                    <div class="space-y-2 max-h-60 overflow-y-auto">
                      {#each allBrands as brand}
                        <label class="flex items-center gap-2 text-sm text-gray-700 p-1">
                          <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" 
                            checked={$selectedBrands.includes(brand.brand__id?.toString())}
                            on:change={() => {
                              selectedBrands.update(sb =>
                                sb.includes(brand.brand__id.toString())
                                  ? sb.filter(id => id !== brand.brand__id.toString())
                                  : [...sb, brand.brand__id.toString()]
                              );
                            }}
                          />
                          <span class="truncate flex-1">{brand.brand__name}</span> 
                          <span class="text-gray-400 text-xs">({brand.count})</span>
                        </label>
                      {/each}
                    </div>
                  </div>
              
                  <div class="flex gap-2 pt-4">
                    <button class="btn btn-outline btn-sm flex-1" on:click={() => {
                      $selectedBrands = [];
                      selectedPriceRange = [
                        parseFloat(filters?.price_range?.min_price ?? 0),
                        parseFloat(filters?.price_range?.max_price ?? 100)
                      ];
                    }}>
                      Reset
                    </button>
                    <button class="btn btn-primary btn-sm flex-1" on:click={() => {
                      applyFilters();
                      if (isMobile) showFilters = false;
                    }}>
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- {/*-- Mobile Sort Button (Fixed at bottom) --*/} -->
   

    <!-- Mobile Sort Button with Action -->
<div class="md:hidden fixed bottom-4 right-4 z-30">
  <button 
    class="btn btn-primary btn-circle shadow-lg"
    on:click={() => showSortModal = true}
    aria-label="Sort options"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"/>
    </svg>
  </button>
</div>

<!-- Mobile Sort Modal -->
{#if showSortModal}
  <div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end md:hidden" 
       on:click={() => showSortModal = false}>
    <div class="bg-white w-full rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto"
         on:click|stopPropagation>
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg">Sort By</h3>
        <button on:click={() => showSortModal = false} class="text-gray-500">
          ✕
        </button>
      </div>
      
      <div class="space-y-2">
        {#each [
          { value: 'default', label: 'Default' },
          { value: 'price_asc', label: 'Price: Low to High' },
          { value: 'price_desc', label: 'Price: High to Low' },
          { value: 'popularity', label: 'Popularity' },
          { value: 'rating', label: 'Rating' },
          { value: 'newest', label: 'Newest' }
        ] as option}
          <button
            class="w-full text-left p-3 rounded-lg text-sm
                   {sortOption === option.value 
                     ? 'bg-blue-50 text-blue-600 font-medium' 
                     : 'text-gray-700 hover:bg-gray-50'}"
            on:click={() => {
              sortOption = option.value;
              applyFilters();
              showSortModal = false;
            }}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}


  </div>
</div>
