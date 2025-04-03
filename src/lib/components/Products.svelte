<script>
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

  export let currentCategory;
  export let searchQuery = '';

  // State
  let products = [];
  let next;
  let categories = [];
  let allBrands = []; // Store the full list of brands
  let filters = {};
  let loading = true;
  let loadingMore = false;
  let error = null;
  let currentPage = 1;

  // Filter states
  let selectedPriceRange = [0, 100];
  const brand_ids = $page.url.searchParams.get('brand_ids');
  const search = $page.url.searchParams.get('q');

  $: selectedBrands = brand_ids ? brand_ids.split(',') : [];
  let sortOption = 'default';
  let viewMode = 'grid';
  let totalProducts = 0;

  $: params = {
    "category_id": currentCategory?.id,
    "brand_ids": selectedBrands.join(','),
    "search": search ? search : ""
  };

  // Fetch initial sidebar filters (including the full list of brands)
  async function loadInitialSideFilters(params) {
    try {
      // Fetch filters without brand_ids to get the full list of brands
      const filtersData = await productApi.getFilters({ ...params, brand_ids: '' });
      filters = filtersData;
      // Store the full list of brands in allBrands
      allBrands = filtersData.brands.map(brand => ({
        brand__id: brand.brand__id,
        brand__name: brand.brand__name,
        count: brand.count
      }));
      selectedPriceRange = [
        parseFloat(filters.price_range?.min_price || 0),
        parseFloat(filters.price_range?.max_price || 100)
      ];
    } catch (err) {
      error = 'Failed to load filters';
      console.error(err);
    }
  }

  // Update brand counts based on current filters
  async function updateBrandCounts(params) {
    try {
      // Fetch filters without brand_ids to get counts for all brands
      const filtersData = await productApi.getFilters({ ...params, brand_ids: '' });
      const brandCounts = filtersData.brands.reduce((acc, brand) => {
        acc[brand.brand__id] = brand.count;
        return acc;
      }, {});
      // Update counts in allBrands without overwriting the list
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

  $: if (currentCategory) {
    params['category_id'] = currentCategory.id;
    loadProducts(params);
    fetchAllCategories();
    updateBrandCounts(params);
  }

  async function loadMore() {
    loadingMore = true;
    const response = await fetch(next);
    let dataNew = await response.json();
    products = [...products, ...dataNew.results];
    next = dataNew.next;
    loadingMore = false;
  }

  async function fetchAllCategories() {
    try {
      let data = await myFetch(`${PUBLIC_API_URL}/product/categories/?page=1&page_size=20&level=1&estore_id=${PUBLIC_ESTORE_ID}`);
      categories = data.results;
    } catch (err) {
      console.log(err);
    }
  }

  async function loadProducts(newParams = {}) {
    loading = true;
    products = [];
    try {
      params = { ...params, ...newParams };
      const productsData = await productApi.getProducts(params);
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
    params = {
      page: currentPage,
      category_id: currentCategory?.id,
      min_price: selectedPriceRange[0],
      max_price: selectedPriceRange[1],
      brand_ids: selectedBrands.join(','),
      ordering: getSortOrder(sortOption)
    };
    await loadProducts();
    await updateBrandCounts(params); // Update brand counts without affecting the brand list
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

  $: if (search !== undefined) {
    params['search'] = search;
    loadProducts(params);
    updateBrandCounts(params);
  }
</script>

<!-- Mobile Shop View -->
<MobileShopView 
{currentCategory}
{products}
{filters}
{params}
{loadProducts}
/>

<div class="py-2">
{#if error}
  <div class="alert alert-error">
    <span>{error}</span>
  </div>
{:else}
  {#if search}
    <div class="mb-4 text-sm text-gray-600">
      Showing {products.length} of {totalProducts} results for "{search}"
    </div>
  {/if}
  <div class="flex flex-col lg:flex-row gap-8">
    <!-- Sidebar Filters -->
    <div class="w-full lg:w-1/4 hidden md:block" in:fly="{{ x: -50, duration: 500 }}">
      <!-- Categories -->
      <div class="mb-6">
        <Categories currentCategory={currentCategory} />
      </div>

      <!-- Price Range -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 class="text-sm font-medium mb-2">Price Range</h3>
        <div class="flex flex-col gap-4">
          <input
            type="range"
            min={filters.price_range?.min_price || 0}
            max={filters.price_range?.max_price || 100}
            bind:value={selectedPriceRange[1]}
            on:change={applyFilters}
            class="range range-primary"
          />
          <div class="flex justify-between text-sm text-gray-600">
            <span>{selectedPriceRange[0]}</span>
            <span>{selectedPriceRange[1]}</span>
          </div>
        </div>
      </div>

      <!-- Brands -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 class="font-bold text-lg mb-4">Brands</h3>
        {#each allBrands as brand}
          <label class="flex items-center gap-2 mb-2">
            <input 
              type="checkbox" 
              checked={selectedBrands.includes(brand.brand__id.toString())}
              on:change={() => {
                if (selectedBrands.includes(brand.brand__id.toString())) {
                  selectedBrands = selectedBrands.filter(id => id !== brand.brand__id.toString());
                } else {
                  selectedBrands = [...selectedBrands, brand.brand__id.toString()];
                }
                applyFilters();
              }}
              class="checkbox checkbox-primary"
            />
            {brand.brand__name} ({brand.count})
          </label>
        {/each}
      </div>
    </div>

    <!-- Products Section -->
    <div class="w-full lg:w-3/4" in:fly="{{ x: -50, duration: 500 }}">
      <!-- Results and Sorting Bar -->
      <div class="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6">
        <div class="text-sm text-gray-600 mb-2 sm:mb-0">
          Showing {products.length} of {totalProducts} products
        </div>
        <div class="flex items-center gap-4 bg-white hidden md:block">
          <select 
            class="select select-bordered select-sm bg-white text-gray-600"
            bind:value={sortOption}
            on:change={applyFilters}
          >
            <option value="default">Default Sorting</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popularity">Sort by Popularity</option>
            <option value="rating">Sort by Rating</option>
            <option value="newest">Sort by Newest</option>
          </select>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each products as product (product.id)}
          <Product product={product} />
        {/each}
      </div>

      <div class="flex justify-center items-center py-4">
        {#if loading}
          <div class="loading loading-spinner loading-sm"></div>
        {/if}
        {#if loadingMore}
          <div class="loading loading-spinner loading-sm"></div>
        {/if}
        {#if next && !loadingMore && !loading}
          <button class="btn btn-sm my-4" on:click={loadMore}>Load More</button>
        {/if}
      </div>
      <br />
    </div>
  </div>
{/if}
</div>

<style>
.star {
  display: inline-block;
  width: 1rem;
  height: 1rem;
}
</style>