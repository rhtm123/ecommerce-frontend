<script>
    import { page } from '$app/stores';
  import { fade, fly } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { getProductsByCategory, getAllCategories } from '$lib/utils/product';

  
  // Get category from URL params
  $: category = $page.params.category;
  
  // View mode state
  let viewMode = 'grid'; // 'grid' or 'list'
  const categories = getAllCategories();
  // Sorting state
  let sortOption = 'default';
  $: products = getProductsByCategory(category);
  // let products = [
  //   // Action Toys
  //   { id: 1, name: "Superhero Action Figure", price: 15.99, rating: 4, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "action-toys", color: "red", ageRange: "3-5 Years" },
  //   { id: 2, name: "Ninja Warrior Set", price: 24.99, rating: 5, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "action-toys", color: "black", ageRange: "5-7 Years" },
  //   { id: 3, name: "Dinosaur Battle Pack", price: 19.99, rating: 4, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "action-toys", color: "green", ageRange: "3-5 Years" },
  //   { id: 4, name: "Space Explorer Kit", price: 29.99, rating: 5, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "action-toys", color: "white", ageRange: "5-7 Years" },
  //   { id: 5, name: "Pirate Adventure Set", price: 22.99, rating: 4, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "action-toys", color: "brown", ageRange: "3-5 Years" },
  //   { id: 6, name: "Robot Fighter Squad", price: 27.99, rating: 5, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "action-toys", color: "silver", ageRange: "5-7 Years" },

  //   // Pre-school Toys
  //   { id: 7, name: "Shape Sorter Cube", price: 12.99, rating: 5, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "pre-school-toys", color: "multicolor", ageRange: "1-2 Years" },
  //   { id: 8, name: "Stacking Rings", price: 9.99, rating: 4, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "pre-school-toys", color: "rainbow", ageRange: "0-12 Months" },
  //   { id: 9, name: "Musical Xylophone", price: 17.99, rating: 5, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "pre-school-toys", color: "yellow", ageRange: "2-3 Years" },
  //   { id: 10, name: "Soft Building Blocks", price: 14.99, rating: 4, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "pre-school-toys", color: "pastel", ageRange: "1-2 Years" },
  //   { id: 11, name: "Toddler Puzzle Set", price: 11.99, rating: 5, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "pre-school-toys", color: "blue", ageRange: "2-3 Years" },
  //   { id: 12, name: "Play-Doh Starter Pack", price: 8.99, rating: 4, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "pre-school-toys", color: "multicolor", ageRange: "3-5 Years" },

  //   // Electronic Toys
  //   { id: 13, name: "Remote Control Car", price: 39.99, rating: 5, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "electronic-toys", color: "red", ageRange: "5-7 Years" },
  //   { id: 14, name: "Interactive Pet Robot", price: 49.99, rating: 4, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "electronic-toys", color: "white", ageRange: "5-7 Years" },
  //   { id: 15, name: "Kids Digital Camera", price: 29.99, rating: 4, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "electronic-toys", color: "blue", ageRange: "3-5 Years" },
  //   { id: 16, name: "Electronic Drum Pad", price: 34.99, rating: 5, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "electronic-toys", color: "black", ageRange: "5-7 Years" },
  //   { id: 17, name: "Learning Tablet", price: 59.99, rating: 5, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "electronic-toys", color: "green", ageRange: "3-5 Years" },
  //   { id: 18, name: "Voice Changing Microphone", price: 19.99, rating: 4, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "electronic-toys", color: "purple", ageRange: "5-7 Years" },

  //   // Educational Toys
  //   { id: 19, name: "Magnetic Letters Set", price: 14.99, rating: 5, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "educational-toys", color: "multicolor", ageRange: "3-5 Years" },
  //   { id: 20, name: "Science Experiment Kit", price: 24.99, rating: 4, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "educational-toys", color: "green", ageRange: "5-7 Years" },
  //   { id: 21, name: "World Map Puzzle", price: 19.99, rating: 5, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "educational-toys", color: "blue", ageRange: "5-7 Years" },
  //   { id: 22, name: "Math Learning Cube", price: 16.99, rating: 4, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "educational-toys", color: "yellow", ageRange: "3-5 Years" },
  //   { id: 23, name: "Coding for Kids Set", price: 29.99, rating: 5, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "educational-toys", color: "orange", ageRange: "5-7 Years" },
  //   { id: 24, name: "Solar System Mobile", price: 22.99, rating: 4, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "educational-toys", color: "black", ageRange: "5-7 Years" },

  //   // Transport & Car Toys
  //   { id: 25, name: "Wooden Train Set", price: 34.99, rating: 5, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "transport-car-toys", color: "brown", ageRange: "3-5 Years" },
  //   { id: 26, name: "Die-Cast Car Collection", price: 19.99, rating: 4, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "transport-car-toys", color: "multicolor", ageRange: "3-5 Years" },
  //   { id: 27, name: "Police Car Playset", price: 24.99, rating: 5, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "transport-car-toys", color: "blue", ageRange: "3-5 Years" },
  //   { id: 28, name: "Fire Truck with Ladder", price: 29.99, rating: 4, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "transport-car-toys", color: "red", ageRange: "3-5 Years" },
  //   { id: 29, name: "Construction Vehicle Set", price: 27.99, rating: 5, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "transport-car-toys", color: "yellow", ageRange: "3-5 Years" },
  //   { id: 30, name: "Race Car Track", price: 39.99, rating: 5, image: "/img/Toy-Names-For-Kids.webp?height=300&width=300", category: "transport-car-toys", color: "orange", ageRange: "5-7 Years" },
  // ];

  let selectedPriceRange = [0, 100];
  let selectedColors = [];
  let selectedAgeRanges = [];

  $: colors = [...new Set(products.map(p => p.color))];
  $: ageRanges = [...new Set(products.map(p => p.ageRange))];

  // Handle category change
  function handleCategoryClick(categorySlug) {
    if (categorySlug !== category) {
      goto(`/shop/${categorySlug}`);
    }
  }

  
  $: filteredProducts = products.filter(product => {
    const priceInRange = product.price >= selectedPriceRange[0] && product.price <= selectedPriceRange[1];
    const categoryMatch = product.category === category;
    const colorMatch = selectedColors.length === 0 || selectedColors.includes(product.color);
    const ageRangeMatch = selectedAgeRanges.length === 0 || selectedAgeRanges.includes(product.ageRange);
    return priceInRange && categoryMatch && colorMatch && ageRangeMatch;
  });

   // Combine filtering and sorting
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

<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header Section -->
  <section class="bg-gradient-to-r from-amber-50 to-amber-100 py-6 border-b" in:fade>
    <div class="container mx-auto px-4">
      <div class="flex flex-col items-center space-y-2">
        <h1 class="text-2xl font-bold text-gray-800">
          {categories.find(c => c.slug === category)?.name || 'Shop'}
        </h1>
        <div class="text-sm breadcrumbs text-gray-600">
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/shop">Shop</a></li>
            <li>{categories.find(c => c.slug === category)?.name}</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Sidebar Filters -->
      <div class="w-full lg:w-1/4" in:fly="{{ x: -50, duration: 500 }}">
        <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 class="text-lg font-semibold mb-4">Filters</h2>
          
          <!-- Price Range Filter -->
          <div class="mb-6">
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
          <div class="mb-6">
            <h3 class="text-sm font-medium mb-2">Color</h3>
            <div class="flex flex-wrap gap-2">
              {#each ['red', 'blue', 'green', 'yellow', 'black', 'white', 'brown', 'orange', 'purple', 'multicolor'] as color}
                <button
                  class="w-6 h-6 rounded-full border-2"
                  style="background-color: {color}"
                  class:border-primary={selectedColors.includes(color)}
                  on:click={() => {
                    if (selectedColors.includes(color)) {
                      selectedColors = selectedColors.filter(c => c !== color);
                    } else {
                      selectedColors = [...selectedColors, color];
                    }
                  }}
                />
              {/each}
            </div>
          </div>

          <!-- Age Range Filter -->
          <div class="mb-6">
            <h3 class="text-sm font-medium mb-2">Age Range</h3>
            <div class="space-y-2">
              {#each ['0-12 Months', '1-2 Years', '2-3 Years', '3-5 Years', '5-7 Years'] as range}
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    class="checkbox checkbox-primary"
                    bind:group={selectedAgeRanges}
                    value={range}
                  />
                  <span class="ml-2 text-sm">{range}</span>
                </label>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Products Section -->
    <div class="w-full lg:w-3/4">
      <!-- Results and Sorting Bar -->
      <div class="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6">
        <div class="text-sm text-gray-600 mb-2 sm:mb-0">
          Showing {filteredProducts.length} products
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
            class="select select-bordered select-sm bg-inherit text-base-300 w-full max-w-[200px]"
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

      <!-- Product Grid/List View -->
      <div class={viewMode === 'grid' ? 
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
        "flex flex-col gap-4"}
      >
      {#each sortedProducts as product (product.id)}
      <a href="/product/{product.id}">
          <div
            class="bg-white rounded-lg shadow-sm overflow-hidden transform transition-transform hover:scale-105"
            class:flex={viewMode === 'list'}
            in:fade="{{ duration: 300 }}"
          >
            <img
              src={product.image}
              alt={product.name}
              class={viewMode === 'grid' ? 
                "w-full h-48 object-cover" : 
                "w-48 h-48 object-cover"}
            />
            <div class="p-4 flex-1">
              <h3 class="font-medium text-gray-800 mb-2">{product.name}</h3>
              <div class="flex items-center mb-2">
                {#each Array(5) as _, i}
                  <i class="fas fa-star {i < product.rating ? 'text-yellow-400' : 'text-gray-300'}"></i>
                {/each}
              </div>
              <div class="flex items-center justify-between">
                <span class="text-lg font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                <button class="btn btn-primary btn-sm">Add to Cart</button>
              </div>
            </div>
          </div>
        </a>
          {/each}
        </div>
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

