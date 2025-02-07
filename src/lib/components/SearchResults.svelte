<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from '$env/static/public';
    import { productApi } from '$lib/services/productApi';
    import Product from './product/Product.svelte';
    import Categories from './Categories.svelte';
    
    export let currentCategory;
    export let searchQuery;
  
    // State
    let products = [];
    let next;
    let categories = [];
    let filters = {};
    let loading = true;
    let loadingMore = false;
    let error = null;
    let currentPage = 1;
    
    // Filter states
    let selectedPriceRange = [0, 100000];
    let selectedBrands = [];
    let sortOption = 'default';
  
    let totalProducts = 0;
    let params = {
      search: searchQuery,
      "category_id": currentCategory?.id
    }
  
    async function loadSideFilters() {
      try {
        const filtersData = await productApi.getFilters({ search: searchQuery });
        filters = filtersData;
        selectedPriceRange = [
          parseFloat(filters.price_range?.min_price || 0),
          parseFloat(filters.price_range?.max_price || 100000)
        ];
      } catch (err) {
        console.error(err);
      }
    }
  
    onMount(() => {
      loadProducts();
      loadSideFilters();
      fetchAllCategories();
    });
  

    $: if(currentCategory){
      params['category_id'] = currentCategory.id;
      // console.log(currentCategory);
      loadProducts(params);
      fetchAllCategories();
      loadSideFilters(params);
    } 
    $: if(searchQuery){
      params['search'] = searchQuery;
      // console.log(currentCategory);
      loadProducts(params);
      fetchAllCategories();
      loadSideFilters(params);
    }
    async function loadMore() {
      loadingMore = true;
      try {
        const response = await fetch(next);
        const dataNew = await response.json();
        products = [...products, ...dataNew.results];
        next = dataNew.next;
      } finally {
        loadingMore = false;
      }
    }

    async function fetchAllCategories() {
      try {
      let data = await myFetch(`${PUBLIC_API_URL}/product/categories/?page=1&page_size=20&level=1&estore_id=${PUBLIC_ESTORE_ID}`);
      console.log(data);
      categories = data.results;
      } catch (err){
        console.log(err);
      }
    }
  
    async function loadProducts() {
      loading = true;
      products = [];
      try {
        const productsData = await productApi.getProducts({
          ...params,
          search: searchQuery,
          min_price: selectedPriceRange[0],
          max_price: selectedPriceRange[1],
          brand_ids: selectedBrands.join(','),
          ordering: getSortOrder(sortOption)
        });
  
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
  
    function getSortOrder(option) {
      switch(option) {
        case 'price_asc': return 'price';
        case 'price_desc': return '-price';
        case 'popularity': return '-popularity';
        case 'rating': return '-rating';
        default: return '';
      }
    }
  </script>
  
  <div class="">
    {#if error}
      <div class="alert alert-error">
        <span>{error}</span>
      </div>
    {:else}
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar Filters -->
        <div class="w-full lg:w-1/4" in:fly="{{ x: -50, duration: 500 }}">
            <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
              
                <Categories currentCategory={currentCategory} />
                
                
              </div>
          
            <!-- Price Range -->
          <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h3 class="text-sm font-medium mb-2">Price Range</h3>
            <div class="flex flex-col gap-4">
              <input
                type="range"
                min={filters.price_range?.min_price || 0}
                max={filters.price_range?.max_price || 100000}
                bind:value={selectedPriceRange[1]}
                on:change={loadProducts}
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
            {#each filters.brands || [] as brand}
              <label class="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox" 
                  checked={selectedBrands.includes(brand.brand__id)}
                  on:change={() => {
                    selectedBrands = selectedBrands.includes(brand.brand__id)
                      ? selectedBrands.filter(id => id !== brand.brand__id)
                      : [...selectedBrands, brand.brand__id];
                    loadProducts();
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
              Showing {products.length} of {totalProducts} results for "{searchQuery}"
            </div>
            
            <div class="flex items-center gap-4 bg-white">
              <select 
                class="select select-bordered select-sm bg-white text-gray-600"
                bind:value={sortOption}
                on:change={loadProducts}
              >
                <option value="default">Default Sorting</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popularity">Sort by Popularity</option>
                <option value="rating">Sort by Rating</option>
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
              <div class="loading loading-spinner loading-lg"></div>
            {/if}
  
            {#if loadingMore}
              <div class="loading loading-spinner loading-sm"></div>
            {/if}
  
            {#if (next && !loadingMore && !loading)}
              <button class="btn btn-sm my-4" on:click={loadMore}>Load More</button>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>