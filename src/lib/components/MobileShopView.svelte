<script>
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { productApi } from '$lib/services/productApi';
  import Product from '$lib/components/product/Product.svelte';

  export let currentCategory;
  export let products = [];
  export let filters = {};
  export let params = {};
  export let loadProducts;
  export let loading = false;

  let showSortModal = false;
  let showFilterModal = false;
  let selectedSort = 'popularity';
  let selectedPriceRange = null;
  let selectedBrands = [];
  let productsCount = 0;
  let appliedFilters = { ...params }; // Initialize with existing params

  $: if (products) {
    productsCount = products.length;
  }

  const sortOptions = [
    { id: 'popularity', label: 'Popularity' },
    { id: 'price_asc', label: 'Price – Low to High' },
    { id: 'price_desc', label: 'Price – High to Low' },
    { id: 'newest', label: 'Newest First' }
  ];

  // Initialize price ranges based on the API data
  // $: priceRanges = filters.price_range ? [
  //   { id: `${filters.price_range.min_price}-10000`, label: 'Under ₹10,000' },
  //   { id: '10000-20000', label: '₹10,000 - ₹20,000' },
  //   { id: '20000-30000', label: '₹20,000 - ₹30,000' },
  //   { id: `30000-${filters.price_range.max_price}`, label: 'Above ₹30,000' }
  // ] : [];

  // Dynamic Price Range 

  let priceRanges;

  function getPriceRanges(){

    if (!filters.price_range) {
      return [];
    }

    const minPrice = Number(filters.price_range?.min_price)
    const maxPrice = Number(filters.price_range?.max_price);

    // Validate numbers
    if (isNaN(minPrice) || isNaN(maxPrice) || minPrice >= maxPrice) {
      return [];
    }

    // Calculate appropriate range step
    const rangeDiff = maxPrice - minPrice;
    const step = Math.ceil(rangeDiff / 4); // Creates approximately 4-5 ranges
    const ranges = [];

    // Generate ranges
    for (let i = minPrice; i < maxPrice; i += step) {
      console.log("i", i, i + step);
      const rangeEnd = Math.min(i + step, maxPrice);
      const label = i === minPrice 
        ? `Under ₹${rangeEnd.toLocaleString('en-IN')}`
        : i + step >= maxPrice
          ? `Above ₹${i.toLocaleString('en-IN')}`
          : `₹${i.toLocaleString('en-IN')} - ₹${rangeEnd.toLocaleString('en-IN')}`;

      ranges.push({
        id: `${i}-${rangeEnd}`,
        label
      });
    }



    return ranges;
  }


  $: if (filters.price_range) { 
    priceRanges = getPriceRanges();

  }
  

  // Initialize filters from URL params on mount
  onMount(() => {
    if (params.brand_ids) {
      selectedBrands = params.brand_ids.split(',');
    }
    if (params.ordering) {
      selectedSort = Object.entries(getSortOrder).find(([_, value]) => 
        value === params.ordering
      )?.[0] || 'popularity';
    }
  });

  function toggleSortModal() {
    showSortModal = !showSortModal;
    if (showSortModal) showFilterModal = false;
  }

  function toggleFilterModal() {
    showFilterModal = !showFilterModal;
    if (showFilterModal) showSortModal = false;
  }

  function handleSortChange(sortId) {
    selectedSort = sortId;
    const ordering = getSortOrder(sortId);
    appliedFilters = {
      ...appliedFilters,
      ordering
    };
    updateAndLoadProducts();
    showSortModal = false;
  }

  function getSortOrder(option) {
    switch(option) {
      case 'price_asc': return 'price';
      case 'price_desc': return '-price';
      case 'popularity': return '-popularity';
      case 'newest': return '-created';
      default: return '';
    }
  }

  function handlePriceRangeChange(range) {
    if (selectedPriceRange === range) {
      selectedPriceRange = null;
      delete appliedFilters.min_price;
      delete appliedFilters.max_price;
    } else {
      selectedPriceRange = range;
      const [min, max] = range.split('-').map(Number);
      appliedFilters = {
        ...appliedFilters,
        min_price: min,
        max_price: max
      };
    }
  }

  function handleBrandChange(brandId) {
    const brandIdStr = brandId.toString();
    if (selectedBrands.includes(brandIdStr)) {
      selectedBrands = selectedBrands.filter(id => id !== brandIdStr);
    } else {
      selectedBrands = [...selectedBrands, brandIdStr];
    }
    
    if (selectedBrands.length > 0) {
      appliedFilters = {
        ...appliedFilters,
        brand_ids: selectedBrands.join(',')
      };
    } else {
      delete appliedFilters.brand_ids;
    }
  }

  function updateAndLoadProducts() {
    // Combine base params with applied filters
    const updatedParams = {
      ...params,
      ...appliedFilters,
      category_id: currentCategory?.id
    };

    // Remove any undefined or null values
    Object.keys(updatedParams).forEach(key => {
      if (updatedParams[key] === undefined || updatedParams[key] === null) {
        delete updatedParams[key];
      }
    });

    // Call parent component's loadProducts with updated params
    loadProducts(updatedParams);
  }

  function applyFilters() {
    updateAndLoadProducts();
    showFilterModal = false;
  }

  function clearFilters() {
    selectedPriceRange = null;
    selectedBrands = [];
    appliedFilters = {
      category_id: currentCategory?.id
    };
    
    loadProducts(appliedFilters);
    showFilterModal = false;
  }
</script>

<!-- Mobile Shop Header -->
<div class="md:hidden">
  <!-- Category Title -->
  <!-- <div class="flex items-center p-4 border-b">
    <button class="mr-4" on:click={() => history.back()}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <h1 class="text-lg font-medium">{currentCategory?.name || 'All Products'}</h1>
  </div> -->

  <!-- Sort & Filter Buttons -->
  <div class="grid grid-cols-2 border-b">
    <button 
      class="p-3 flex items-center justify-center gap-2 {showSortModal ? 'text-blue-600' : ''}"
      on:click={toggleSortModal}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
      Sort
    </button>
    <button 
      class="p-3 flex items-center justify-center gap-2 border-l {showFilterModal ? 'text-blue-600' : ''}"
      on:click={toggleFilterModal}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
      Filter {Object.keys(appliedFilters).length > 0 ? `(${Object.keys(appliedFilters).length})` : ''}
    </button>
  </div>

  <!-- Sort Modal -->
  {#if showSortModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50" transition:fade>
      <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl" transition:slide={{ duration: 300 }}>
        <div class="p-4 border-b">
          <h2 class="text-lg font-medium">Sort By</h2>
        </div>
        <div class="p-4">
          {#each sortOptions as option}
            <button
              class="w-full py-3 px-4 text-left flex items-center gap-3 {selectedSort === option.id ? 'text-blue-600' : ''}"
              on:click={() => handleSortChange(option.id)}
            >
              <input
                type="radio"
                name="sort"
                checked={selectedSort === option.id}
                class="radio radio-primary"
              />
              {option.label}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Filter Modal -->
  {#if showFilterModal}
    <div class="fixed inset-0 bg-white z-50" transition:fade>
      <div class="flex flex-col h-full">
        <!-- Filter Header -->
        <div class="flex items-center justify-between p-4 border-b">
          <button on:click={() => showFilterModal = false}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 class="text-lg font-medium">Filters</h2>
          <button 
            class="text-blue-600"
            on:click={clearFilters}
          >
            Clear All
          </button>
        </div>

        <!-- Filter Content -->
        <div class="flex-1 overflow-y-auto">

          <!-- Price Ranges -->
          {#if priceRanges.length > 0}
            <div class="border-b">
              <div class="p-4">
                <h3 class="font-medium mb-4">Price</h3>
                {#each priceRanges as range}
                  <label class="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedPriceRange === range.id}
                      on:change={() => handlePriceRangeChange(range.id)}
                      class="checkbox checkbox-primary"
                    />
                    {range.label}
                  </label>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Brands -->
          {#if filters.brands}
            <div class="border-b">
              <div class="p-4">
                <h3 class="font-medium mb-4">Brand</h3>
                {#each filters.brands as brand}
                  <label class="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.brand__id.toString())}
                      on:change={() => handleBrandChange(brand.brand__id)}
                      class="checkbox checkbox-primary"
                    />
                    {brand.brand__name} ({brand.count})
                  </label>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- Apply Button -->
        <div class="p-4 border-t">
          <button
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
            on:click={applyFilters}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- After your hero/info section -->
{#if loading}
  <div class="flex justify-center items-center py-12">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>
{:else}
  {#if products && products.length > 0}
    <div class="grid grid-cols-1 gap-4 mt-4">
      {#each products as product (product.id)}
        <Product {product} />
      {/each}
    </div>
  {:else}
    <div class="text-center text-gray-500 mt-8">No products found.</div>
  {/if}
{/if}

<style>
  /* Prevent body scroll when modals are open */
  /* :global(body) {
    overflow: hidden;
  } */

  /* Smooth transitions */
  .fixed {
    transition: all 0.3s ease-in-out;
  }

  /* Custom scrollbar for filter content */
  /* .overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: #CBD5E0 #F7FAFC;
  }

  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #F7FAFC;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: #CBD5E0;
    border-radius: 3px;
  } */
</style> 