<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';

    import { productApi } from '$lib/services/productApi';
    import Product from '$lib/components/product/Product.svelte';

    import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from '$env/static/public';
  
    import { myFetch } from '$lib/utils/myFetch';
    import { goto } from '$app/navigation';
    import { nonpassive } from 'svelte/legacy';

    import { page } from '$app/stores'


    import Categories from './Categories.svelte';
    import MobileShopView from './MobileShopView.svelte';
    export let currentCategory;
  
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
    let selectedPriceRange = [0, 100];

    const brand_ids = $page.url.searchParams.get('brand_ids');
    console.log(brand_ids)


    $: selectedBrands = brand_ids ? brand_ids.split(',') : [];
    let sortOption = 'default';
    let viewMode = 'grid';
  
    let totalProducts = 0;
    $: params = {
      "category_id": currentCategory?.id,
      "brand_ids": brand_ids? brand_ids : ""
    }

    async function loadSideFilters(params) {
      try {
      const filtersData = await productApi.getFilters()
      filters = filtersData;
      console.log(filters);
      // Set initial price range from API
      selectedPriceRange = [
        parseFloat(filters.price_range?.min_price || 0),
        parseFloat(filters.price_range?.max_price || 100)
      ];
    } catch (err) {
      error = 'Failed to load products';
      console.error(err);
    } finally {
    }
    }

    onMount(()=>{
      loadProducts(params);
      fetchAllCategories();
      loadSideFilters(params);
    })
  

    $: if(currentCategory){
      params['category_id'] = currentCategory.id;
      // console.log(currentCategory);
      loadProducts(params);
      fetchAllCategories();
      loadSideFilters(params);
    }
  
    async function loadMore() {
        loadingMore = true;
          // console.log("Hello Bhai")
            const response = await fetch(next);
            let dataNew = await response.json();
          // console.log(dataNew);
          products = [...products,...dataNew.results];
          next = dataNew.next;
          loadingMore = false
      }
  
    // Process categories to create a hierarchical structure
  
    async function fetchAllCategories() {
      try {
      let data = await myFetch(`${PUBLIC_API_URL}/product/categories/?page=1&page_size=20&level=1&estore_id=${PUBLIC_ESTORE_ID}`);
      console.log(data);
      categories = data.results;
      } catch (err){
        console.log(err);
      }
    }
  
    // Handle category click

  
    async function loadProducts(newParams = {}) {
      loading = true;
      products = [];
      try {
        // Merge existing params with new params
        params = {
          ...params,
          ...newParams
        };
        
        const productsData = await productApi.getProducts(params);
        products = productsData.results;
        totalProducts = productsData.count;
        next = productsData.next;
        
        // Update filters after loading products
        // await loadSideFilters(params);
      } catch (err) { 
        error = 'Failed to load products';
        console.error(err);
      } finally {
        loading = false;
      }
    }
  
    // Handle filters change
    async function applyFilters() {
    
        params = {
          page: currentPage,
          category_id: currentCategory?.id,
          min_price: selectedPriceRange[0],
          max_price: selectedPriceRange[1],
          brand_ids: selectedBrands.join(','),
          ordering: getSortOrder(sortOption)
        };
        loadProducts();
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
        <div class="flex flex-col lg:flex-row gap-8 ">
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
              {#each filters.brands || [] as brand}
                <label class="flex items-center gap-2 mb-2">
                  <input 
                    type="checkbox" 
                    checked={selectedBrands.includes(brand.brand__id)}
                    on:change={() => {
                      if (selectedBrands.includes(brand.brand__id)) {
                        selectedBrands = selectedBrands.filter(id => id !== brand.brand__id);
                      } else {
                        selectedBrands = [...selectedBrands, brand.brand__id];
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
                <!-- Sort Dropdown -->
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
  
            {#if ( loadingMore )}
              <div class="loading loading-spinner loading-sm"></div>
  
            {/if}
  
  
            <!-- Pagination -->
            
            {#if (next && !loadingMore && !loading)}
                <button class="btn btn-sm my-4" on:click={loadMore}>Load More</button>
            {/if}
  
            </div>
            <br />
  
          </div>
        </div>
      {/if}
    </div>

  
  <style>
    /* Add this to ensure star containers are stable */
    .star {
      display: inline-block;
      width: 1rem;
      height: 1rem;
    }
  </style>