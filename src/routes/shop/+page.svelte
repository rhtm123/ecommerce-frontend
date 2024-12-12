<script>
    import { fade, fly } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { getAllProducts, getAllCategories } from '$lib/utils/product';
  
    // Get all products and categories
    const products = getAllProducts();
    const categories = getAllCategories();
    
    // Filter states
    let selectedPriceRange = [0, 100];
    let selectedColors = [];
    let selectedAgeRanges = [];
    let sortOption = 'default';
    let viewMode = 'grid';
  
    // Available colors and age ranges
    const colors = [...new Set(products.map(p => p.color))];
    const ageRanges = [...new Set(products.map(p => p.ageRange))];
  
    // Handle category click
    function handleCategoryClick(categorySlug) {
      goto(`/shop/${categorySlug}`);
    }
  
    // Filter products
    $: filteredProducts = products.filter(product => {
    const priceInRange = product.price >= selectedPriceRange[0] && product.price <= selectedPriceRange[1];
    const colorMatch = selectedColors.length === 0 || selectedColors.includes(product.color);
    const ageRangeMatch = selectedAgeRanges.length === 0 || selectedAgeRanges.includes(product.ageRange);
    return priceInRange && colorMatch && ageRangeMatch;
  });

  
    // Sort products
    $: sortedProducts = [...filteredProducts].sort((a, b) => {
      switch(sortOption) {
        case 'popularity':
        case 'rating':
          return b.rating - a.rating;
        case 'latest':
          return b.id - a.id;
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });

    function formatPrice(price) {
    return `$${price.toFixed(2)}`;
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
            <li><a href="/home"><i class="fas fa-home"></i></a></li>
            <li>Shop</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
  
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Sidebar Filters -->
      <div class="w-full lg:w-1/4" in:fly="{{ x: -50, duration: 500 }}">
        <!-- Categories Filter -->
        <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 class="font-bold text-lg mb-4">Categories</h3>
          <div class="space-y-2">
            {#each categories as category}
              <button 
                class="w-full text-left px-4 py-2 rounded hover:bg-amber-50 transition-colors"
                on:click={() => handleCategoryClick(category.slug)}
              >
                <span class="flex items-center gap-2">
                  {@html category.icon}
                  {category.name}
                  <span class="ml-auto text-sm text-gray-500">
                    ({category.products})
                  </span>
                </span>
              </button>
            {/each}
          </div>
        </div>
  
        <!-- Price Range Filter -->
        <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h3 class="text-sm font-medium mb-2">Price Range</h3>
            <input
              type="range"
              min="0"
              max="100"
              bind:value={selectedPriceRange[1]}
              class="range range-primary"
            />
            <div class="text-sm text-gray-600">
              {formatPrice(selectedPriceRange[0])} - {formatPrice(selectedPriceRange[1])}
            </div>
          </div>
  
        <!-- Color Filter -->
        <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 class="font-bold text-lg mb-4">Colors</h3>
          {#each colors as color}
            <label class="flex items-center gap-2 mb-2">
              <input 
                type="checkbox" 
                bind:group={selectedColors} 
                value={color}
                class="checkbox checkbox-primary"
              />
              {color}
            </label>
          {/each}
        </div>
  
        <!-- Age Range Filter -->
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="font-bold text-lg mb-4">Age Range</h3>
          {#each ageRanges as age}
            <label class="flex items-center gap-2 mb-2">
              <input 
                type="checkbox" 
                bind:group={selectedAgeRanges} 
                value={age}
                class="checkbox checkbox-primary"
              />
              {age}
            </label>
          {/each}
        </div>
      </div>
  
      <!-- Products Section -->
      <div class="w-full lg:w-3/4">
        <!-- Results and Sorting Bar -->
        <div class="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6">
          <div class="text-sm text-gray-600 mb-2 sm:mb-0">
            Showing {sortedProducts.length} products
          </div>
          
          <div class="flex items-center gap-4">
            <!-- View Toggle -->
            <div class="flex gap-2">
              <button 
                class="p-2 {viewMode === 'grid' ? 'text-primary' : 'text-gray-400'} hover:text-primary"
                on:click={() => viewMode = 'grid'}
                title="Grid View"
              >
                <i class="fas fa-th-large text-lg"></i>
              </button>
              <button 
                class="p-2 {viewMode === 'list' ? 'text-primary' : 'text-gray-400'} hover:text-primary"
                on:click={() => viewMode = 'list'}
                title="List View"
              >
                <i class="fas fa-list text-lg"></i>
              </button>
            </div>
  
            <!-- Sort Dropdown -->
            <select 
              class="select select-bordered bg-inherit text-base-300 select-sm w-full max-w-[200px]"
              bind:value={sortOption}
            >
              <option value="default">Default Sorting</option>
              <option value="popularity">Sort by Popularity</option>
              <option value="rating">Sort by Average Rating</option>
              <option value="latest">Sort by Latest</option>
              <option value="price_asc">Sort by Price: Low to High</option>
              <option value="price_desc">Sort by Price: High to Low</option>
            </select>
          </div>
        </div>
        <!-- Products Grid/List -->
        <div class={viewMode === 'grid' ? 
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 
          'space-y-6'
        }>
          {#each sortedProducts as product (product.id)}
          <a href="/product/{product.id}">
            <div class={viewMode === 'grid' ? 
              'bg-white rounded-lg p-4 hover:shadow-xl transition-shadow' :
              'bg-white rounded-lg p-4 hover:shadow-xl transition-shadow flex gap-6'
            }>
              <div class={viewMode === 'grid' ? 'relative mb-4' : 'relative w-1/3'}>
                <img 
                  src={product.image} 
                  alt={product.name}
                  class="w-full h-48 object-contain"
                />
                <div class="absolute top-2 right-2 flex flex-col gap-2">
                  <button class="btn btn-circle btn-sm bg-white hover:bg-gray-100">
                    <i class="fas fa-heart"></i>
                  </button>
                </div>
              </div>
              
              <div class={viewMode === 'grid' ? 'text-center' : 'flex-1'}>
                <h3 class="font-medium text-sm mb-2">{product.name}</h3>
                <div class="rating rating-sm mb-2">
                  {#each Array(5) as _, i}
                    <input 
                      type="radio" 
                      class="mask mask-star-2 bg-orange-400" 
                      checked={i < product.rating} 
                      disabled
                    />
                  {/each}
                </div>
                <p class="text-red-500 font-bold mb-4">${product.price.toFixed(2)}</p>
                <button class="btn btn-sm btn-primary rounded-full w-full">
                  ADD TO CART
                </button>
              </div>
            </div>
          </a>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>