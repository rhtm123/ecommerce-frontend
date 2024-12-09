<script>
    // Product data
    const products = [
      {
        id: 1,
        name: "BUZZ LIGHTYEAR TALKING FIGURE",
        price: 25.20,
        rating: 4,
        image: "/img/Toy-Names-For-Kids.webp",
        hasQuickButtons: true
      },
      {
        id: 2,
        name: "SPIDEY WEB TRANSPORTER VEHICLE",
        price: 23.40,
        rating: 0,
        image: "/img/Toy-Names-For-Kids.webp",
        hasQuickButtons: true
      },
      {
        id: 3,
        name: "WHALE MUSICAL FOUNTAIN",
        price: 45.60,
        rating: 0,
        image: "/img/Toy-Names-For-Kids.webp"
      },
      {
        id: 4,
        name: "PLUSH PIG 30 CM",
        price: 14.70,
        rating: 0,
        image: "/img/Toy-Names-For-Kids.webp"
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
        <div class="bg-white rounded-lg p-4 hover:shadow-xl transition-shadow">
          <div class="relative mb-4">
            <img 
              src={product.image} 
              alt={product.name}
              class="w-full h-48 object-contain"
            />
            <div class="absolute top-2 right-2 flex flex-col gap-2">
              <button class="btn btn-circle btn-sm bg-white hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
    
          <div class="text-center">
            <h3 class="font-medium text-sm mb-2">{product.name}</h3>
            <div class="rating rating-sm mb-2">
              {#each Array(5) as _, i}
                <input type="radio" class="mask mask-star-2 bg-orange-400" checked={i < product.rating} />
              {/each}
            </div>
            <p class="text-red-500 font-bold mb-4">${product.price.toFixed(2)}</p>
            <button class="btn btn-sm btn-primary rounded-full w-full">ADD TO CART</button>
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