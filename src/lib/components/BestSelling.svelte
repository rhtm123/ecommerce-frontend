<script>
    // Product data
    const products = [
      {
        id: 1,
        name: "BUZZ LIGHTYEAR TALKING FIGURE",
        price: 25.20,
        rating: 4,
        image: "src/assets/Toy-Names-For-Kids.webp",
        hasQuickButtons: true
      },
      {
        id: 2,
        name: "SPIDEY WEB TRANSPORTER VEHICLE",
        price: 23.40,
        rating: 0,
        image: "src/assets/Toy-Names-For-Kids.webp",
        hasQuickButtons: true
      },
      {
        id: 3,
        name: "WHALE MUSICAL FOUNTAIN",
        price: 45.60,
        rating: 0,
        image: "src/assets/Toy-Names-For-Kids.webp"
      },
      {
        id: 4,
        name: "PLUSH PIG 30 CM",
        price: 14.70,
        rating: 0,
        image: "src/assets/Toy-Names-For-Kids.webp"
      }
    ];
  
    // Handle add to cart
    function addToCart(productId) {
      console.log(`Added product ${productId} to cart`);
    }
  </script>
  
  <section class="bg-yellow-50 mx-auto px-4 py-12">
    <div class="text-center mb-10">
      <h3 class="text-red-500 font-medium mb-2">Our Products</h3>
      <h2 class="text-4xl font-bold text-navy-900">BEST SELLING</h2>
    </div>
  
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each products as product (product.id)}
        <div 
          class="bg-white rounded-lg p-4 transition-transform duration-300 hover:scale-105 relative"
          animate:flip
        >
          <!-- Product Image -->
          <div class="relative mb-4 group">
            <img 
              src={product.image} 
              alt={product.name}
              class="w-full h-64 object-contain"
            />
            
            {#if product.hasQuickButtons}
              <div class="absolute right-2 top-2 flex flex-col gap-2">
                <button class="btn btn-circle btn-sm bg-white hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button class="btn btn-circle btn-sm bg-white hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>
                <button class="btn btn-circle btn-sm bg-white hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>
            {/if}
          </div>
  
          <!-- Product Details -->
          <div class="text-center">
            <h3 class="font-medium text-sm mb-2">{product.name}</h3>
            
            <!-- Rating Stars -->
            <div class="rating rating-sm mb-2 flex justify-center">
              {#each Array(5) as _, i}
                <input 
                  type="radio" 
                  name={`rating-${product.id}`} 
                  class="mask mask-star-2 bg-orange-400" 
                  checked={i < product.rating}
                  disabled
                />
              {/each}
            </div>
  
            <!-- Price -->
            <p class="text-red-500 font-bold text-lg mb-4">${product.price.toFixed(2)}</p>
  
            <!-- Add to Cart Button -->
            <button 
              on:click={() => addToCart(product.id)}
              class="btn btn-sm btn-primary rounded-full min-w-[120px] transition-all duration-300 hover:scale-105"
            >
              ADD TO CART
            </button>
          </div>
        </div>
      {/each}
    </div>
  </section>
  
  <style>
    /* Optional: Add custom animations */
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
  
    .btn:hover {
      animation: float 2s ease-in-out infinite;
    }
  </style>