<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { productApi } from '$lib/services/api';
  import { addToCart } from '$lib/stores/cart';

  // State
  let products = [];
  let categories = [];
  let filters = {};
  let loading = true;
  let error = null;

  // Filter states
  let selectedPriceRange = [0, 100];
  let selectedBrands = [];
  let sortOption = 'default';
  let viewMode = 'grid';
  let currentPage = 1;
  let totalProducts = 0;

  // Process categories to create a hierarchical structure
  function processCategories(categoriesData) {
    if (!Array.isArray(categoriesData)) {
      console.error('Invalid categories data:', categoriesData);
      return [];
    }

    // Filter root categories (level 1)
    const rootCategories = categoriesData.filter(cat => cat.level === 1);
    
    // Get subcategories for each root category
    return rootCategories.map(root => {
      const children = categoriesData.filter(cat => 
        cat.level === 2 && cat.name.startsWith(root.name)
      );
      
      return {
        ...root,
        children: children.map(child => ({
          ...child,
          children: categoriesData.filter(cat => 
            cat.level === 3 && cat.name.startsWith(child.name)
          )
        }))
      };
    });
  }

  // Load categories with counts
  async function loadCategoriesWithCounts() {
    try {
      const [categoriesResponse, productsResponse] = await Promise.all([
        productApi.getCategories(),
        productApi.getProducts({ page_size: 1000 }) // Get all products to count
      ]);

      const categoriesData = categoriesResponse.results || [];
      const productsData = productsResponse.results || [];

      // Create a map to count products per category
      const categoryCountMap = {};
      productsData.forEach(product => {
        if (product.category) {
          categoryCountMap[product.category.id] = (categoryCountMap[product.category.id] || 0) + 1;
          
          // Find parent categories by level and name prefix
          let currentCategory = product.category;
          let parentCategory = categoriesData.find(
            cat => cat.level === currentCategory.level - 1 && 
                   currentCategory.name.startsWith(cat.name)
          );

          while (parentCategory) {
            categoryCountMap[parentCategory.id] = (categoryCountMap[parentCategory.id] || 0) + 1;
            currentCategory = parentCategory;
            parentCategory = categoriesData.find(
              cat => cat.level === currentCategory.level - 1 && 
                     currentCategory.name.startsWith(cat.name)
            );
          }
        }
      });

      // Add counts to categories
      const categoriesWithCounts = categoriesData.map(cat => ({
        ...cat,
        productCount: categoryCountMap[cat.id] || 0
      }));

      // Process categories into hierarchy
      categories = processCategories(categoriesWithCounts);
    } catch (err) {
      console.error('Failed to load categories with counts:', err);
      error = 'Failed to load categories';
    }
  }

  // Handle category click
  function handleCategoryClick(categoryId) {
    goto(`/shop/${categoryId}`);
  }

  onMount(async () => {
    await loadCategoriesWithCounts();
    try {
      loading = true;
      const [productsData, filtersData] = await Promise.all([
        productApi.getProducts(),
        productApi.getFilters()
      ]);

      products = productsData.results;
      totalProducts = productsData.count;
      filters = filtersData;
      
      // Set initial price range from API
      selectedPriceRange = [
        parseFloat(filters.price_range?.min_price || 0),
        parseFloat(filters.price_range?.max_price || 100)
      ];
    } catch (err) {
      error = 'Failed to load products';
      console.error(err);
    } finally {
      loading = false;
    }
  });

  // Handle filters change
  async function applyFilters() {
    try {
      loading = true;
      const params = {
        page: currentPage,
        min_price: selectedPriceRange[0],
        max_price: selectedPriceRange[1],
        brand_ids: selectedBrands.join(','),
        ordering: getSortOrder(sortOption)
      };

      const data = await productApi.getProducts(params);
      products = data.results;
      totalProducts = data.count;
    } catch (err) {
      error = 'Failed to apply filters';
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


  // Handle product click
  function handleProductClick(productId) {
    goto(`/product/${productId}`);
  }

  // Safe rating display function
  function renderRatingStars(rating) {
    try {
      const stars = [];
      const numStars = 5;
      const safeRating = Math.min(Math.max(0, Number(rating) || 0), numStars);
      
      for (let i = 0; i < numStars; i++) {
        stars.push(i < safeRating);
      }
      return stars;
    } catch (error) {
      console.error('Error rendering stars:', error);
      return [false, false, false, false, false];
    }
  }

  // Safe star rendering function
  function getStars(rating = 0) {
    return new Array(5).fill(false).map((_, i) => i < rating);
  }
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Header Section -->
  <section class="bg-gradient-to-r from-amber-50 to-amber-100 py-6 border-b" in:fade>
    <div class="container mx-auto px-4">
      <div class="flex flex-col items-center space-y-2">
        <h1 class="text-2xl font-bold text-gray-800">Shop</h1>
        <div class="text-sm breadcrumbs text-gray-600">
          <ul>
            <li><a href="/home">Home</a></li>
            <li>Shop</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <div class="container mx-auto px-4 py-8">
    {#if loading}
      <div class="flex justify-center items-center h-64">
        <div class="loading loading-spinner loading-lg"></div>
      </div>
    {:else if error}
      <div class="alert alert-error">
        <span>{error}</span>
      </div>
    {:else}
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar Filters -->
        <div class="w-full lg:w-1/4" in:fly="{{ x: -50, duration: 500 }}">
          <!-- Categories -->
          <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h3 class="font-bold text-lg mb-4">Categories</h3>
            <div class="space-y-2">
              {#each categories as rootCategory}
                <div class="mb-4">
                  <button 
                    class="w-full text-left font-semibold px-2 py-1 rounded hover:bg-amber-50 transition-colors flex justify-between items-center"
                    on:click={() => handleCategoryClick(rootCategory.id)}
                  >
                    <span>{rootCategory.name}</span>
                    <span class="text-sm text-gray-500">{rootCategory.productCount}</span>
                  </button>
                  
                  {#if rootCategory.children.length > 0}
                    <div class="ml-4 space-y-1 mt-2">
                      {#each rootCategory.children as subCategory}
                        <div>
                          <button 
                            class="w-full text-left px-2 py-1 rounded hover:bg-amber-50 transition-colors flex justify-between items-center"
                            on:click={() => handleCategoryClick(subCategory.id)}
                          >
                            <span>{subCategory.name}</span>
                            <span class="text-sm text-gray-500">{subCategory.productCount}</span>
                          </button>
                          
                          {#if subCategory.children.length > 0}
                            <div class="ml-4 space-y-1 mt-1">
                              {#each subCategory.children as leafCategory}
                                <button 
                                  class="w-full text-left px-2 py-1 rounded hover:bg-amber-50 transition-colors flex justify-between items-center text-sm"
                                  on:click={() => handleCategoryClick(leafCategory.id)}
                                >
                                  <span>{leafCategory.name}</span>
                                  <span class="text-gray-500">{leafCategory.productCount}</span>
                                </button>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/each}
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
        <div class="w-full lg:w-3/4">
          <!-- Results and Sorting Bar -->
          <div class="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6">
            <div class="text-sm text-gray-600 mb-2 sm:mb-0">
              Showing {products.length} of {totalProducts} products
            </div>
            
            <div class="flex items-center gap-4 bg-white">
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
              <div 
                class="bg-white rounded-lg p-4 hover:shadow-xl transition-shadow cursor-pointer"
                on:click={() => handleProductClick(product.id)}
              >
                <div class="relative mb-4">
                  <img 
                    src={product.main_image || '/placeholder-image.jpg'} 
                    alt={product.name}
                    class="w-full h-48 object-contain"
                  />
                </div>
                <div class="text-center">
                  <h3 class="font-medium text-sm mb-2">{product.name}</h3>
                  <!-- Rating Stars -->
                  <div class="rating rating-sm mb-2">
                    {#each getStars(product.rating) as isActive}
                      <input 
                        type="radio" 
                        class="mask mask-star-2 bg-orange-400" 
                        {isActive}
                        disabled
                      />
                    {/each}
                  </div>
                  <p class="text-primary font-bold mb-4">
                    ${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                  </p>
                  <button 
                    class="btn btn-primary btn-sm w-full"
                    on:click|stopPropagation={() => addToCart(product)}
                    disabled={!product.stock || product.stock <= 0}
                  >
                    {!product.stock || product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            {/each}
          </div>

          <!-- Pagination -->
          {#if totalProducts > 0}
            <div class="flex justify-center mt-8">
              <div class="join">
                {#if totalProducts && products.length}
                  {@const pageCount = Math.max(1, Math.ceil(totalProducts / 10))}
                  {#each Array.from({ length: pageCount }) as _, i}
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
                {/if}
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Add this to ensure star containers are stable */
  .star {
    display: inline-block;
    width: 1rem;
    height: 1rem;
  }
</style>