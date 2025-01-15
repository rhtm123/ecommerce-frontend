<script>
  import { page } from '$app/stores';
  import { fade, fly } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { productApi } from '$lib/services/api';
  import { addToCart } from '$lib/stores/cart';

  export let data;

  let products = [];
  const {  category, categoryId } = data;
  console.log(category);
  console.log(categoryId);
  let categories = [];
  let filters = {};
  let totalProducts = 0;
  let currentCategoryId = parseInt($page.params.category);
  
  // State management
  let loading = false;
  let error = null;
  let currentPage = 1;
  let sortOption = 'default';
  
  // Filter states
  let selectedPriceRange = [
    filters.price_range?.min_price || 0,
    filters.price_range?.max_price || 100
  ];
  let selectedBrands = [];

  // Get current category and its hierarchy
  $: currentCategory = categories.find(c => c.id === currentCategoryId);
  $: parentCategory = currentCategory?.level > 1 ? 
    categories.find(c => c.level === currentCategory.level - 1 && 
      c.id === findParentCategoryId(currentCategory)) : null;

  // Function to find parent category ID
  function findParentCategoryId(category) {
    if (!category || category.level <= 1) return null;
    const parentLevel = category.level - 1;
    return categories.find(c => 
      c.level === parentLevel && category.name.startsWith(c.name)
    )?.id;
  }

  // Load initial data
  async function loadInitialData() {
    try {
      loading = true;
      const [categoriesData, filtersData] = await Promise.all([
        productApi.getCategories(),
        productApi.getFilters({ category_id: currentCategoryId })
      ]);

      categories = categoriesData.results || [];
      filters = filtersData;

      // Set initial price range
      selectedPriceRange = [
        filters.price_range?.min_price || 0,
        filters.price_range?.max_price || 100
      ];

      await applyFilters();
    } catch (err) {
      console.error('Failed to load initial data:', err);
      error = 'Failed to load data';
    } finally {
      loading = false;
    }
  }

  // Apply filters with category ID
  async function applyFilters() {
    try {
      loading = true;
      error = null;

      const params = {
        category_id: currentCategoryId,
        page: currentPage,
        min_price: selectedPriceRange[0],
        max_price: selectedPriceRange[1],
        brand_ids: selectedBrands.join(','),
        ordering: getSortOrder(sortOption)
      };

      const response = await productApi.getProducts(params);
      products = response.results;
      totalProducts = response.count;
    } catch (err) {
      error = 'Failed to apply filters';
      console.error(err);
    } finally {
      loading = false;
    }
  }

  // Watch for category ID changes
  $: if (currentCategoryId) {
    loadInitialData();
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

  // Watch for changes in filters or sorting
  // $: {
  //   if (!loading) {
  //     applyFilters();
  //   }
  // }

  function handleProductClick(productId) {
    goto(`/product/${productId}`);
  }

  // Handle category navigation
  function handleCategoryClick(categoryId) {
    if (categoryId !== currentCategoryId) {
      goto(`/shop/${categoryId}`);
    }
  }

  // onMount(() => {
  //   loadInitialData();
  // });
</script>

<!-- Template -->
<div class="min-h-screen bg-gray-50">
  <!-- Header Section -->
  <section class="bg-gradient-to-r from-amber-50 to-amber-100 py-6 border-b" in:fade>
    <div class="container mx-auto px-4">
      <div class="flex flex-col items-center space-y-2">
        <h1 class="text-2xl font-bold text-gray-800">
          {currentCategory?.name || 'Shop'}
        </h1>
        <div class="text-sm breadcrumbs text-gray-600">
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/shop">Shop</a></li>
            <li>{category}</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Sidebar Filters -->
      <div class="w-full lg:w-1/4" in:fly="{{ x: -50, duration: 500 }}">
        <!-- Categories -->
        <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 class="font-bold text-lg mb-4">Categories</h3>
          <div class="space-y-2">
            {#if currentCategory}
              <!-- Show sibling categories (same level) -->
              {#each categories.filter(c => c.level === currentCategory.level) as category}
                <button 
                  class="w-full text-left px-4 py-2 rounded hover:bg-amber-50 transition-colors"
                  class:bg-amber-100={category.id === currentCategoryId}
                  on:click={() => handleCategoryClick(category.id)}
                >
                  {category.name}
                  {#if category.productCount !== undefined}
                    <span class="text-sm text-gray-500">({category.productCount})</span>
                  {/if}
                </button>
              {/each}

              <!-- Show child categories if any -->
              {#if currentCategory.level < 3}
                <div class="mt-4 ml-4">
                  {#each categories.filter(c => 
                    c.level === currentCategory.level + 1 && 
                    c.name.startsWith(currentCategory.name)
                  ) as childCategory}
                    <button 
                      class="w-full text-left px-4 py-2 rounded hover:bg-amber-50 transition-colors"
                      on:click={() => handleCategoryClick(childCategory.id)}
                    >
                      {childCategory.name}
                      {#if childCategory.productCount !== undefined}
                        <span class="text-sm text-gray-500">({childCategory.productCount})</span>
                      {/if}
                    </button>
                  {/each}
                </div>
              {/if}
            {/if}
          </div>
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
              <span>${selectedPriceRange[0]}</span>
              <span>${selectedPriceRange[1]}</span>
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
                bind:group={selectedBrands} 
                value={brand.brand__id}
                class="checkbox checkbox-primary"
                on:change={applyFilters}
              />
              {brand.brand__name} ({brand.count})
            </label>
          {/each}
        </div>
      </div>

      <!-- Products Grid -->
      <div class="w-full lg:w-3/4">
        <!-- Sort Bar -->
        <div class="bg-white p-4 rounded-lg shadow-sm mb-6 flex justify-between items-center">
          <span class="text-sm text-gray-600">
            Showing {products.length} of {totalProducts} products
          </span>
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

        <!-- Products Grid -->
        {#if loading}
          <div class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
        {:else if error}
          <div class="alert alert-error">
            {error}
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each products as product (product.id)}
              <div 
                class="card bg-white shadow-sm hover:shadow-lg transition-shadow "
                on:click={() => handleProductClick(product.id)}
                role="button"
                in:fade
              >
                <figure class="px-4 pt-4">
                  <img 
                    src={product.main_image} 
                    alt={product.name}
                    class="rounded-xl h-48 w-full object-contain"
                  />
                </figure>
                <div class="card-body">
                  <h2 class="card-title text-sm">{product.name}</h2>
                  <div class="rating rating-sm">
                    {#each Array(5) as _, i}
                      <input 
                        type="radio" 
                        class="mask mask-star-2 bg-orange-400" 
                        checked={i < product.rating} 
                        disabled
                      />
                    {/each}
                  </div>
                  <p class="text-primary font-bold">${product.price}</p>
                  <div class="card-actions justify-end">
                    <button 
                      class="btn btn-primary btn-sm"
                      on:click|stopPropagation={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Pagination -->
        {#if totalProducts > products.length}
          <div class="flex justify-center mt-8">
            <div class="join">
              {#each Array(Math.ceil(totalProducts / 10)) as _, i}
                <button 
                  class="join-item btn"
                  class:btn-active={currentPage === i + 1}
                  on:click={() => {
                    currentPage = i + 1;
                    applyFilters();
                  }}
                >
                  {i + 1}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  /* Add any additional custom styles here */
  /* Optional: Add smooth transitions */
  .select, button {
    transition: all 0.2s ease-in-out;
  }
</style>

