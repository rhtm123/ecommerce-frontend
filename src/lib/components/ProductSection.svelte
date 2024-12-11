<script>
  import { getAgeCategories, getProductsByAge } from '$lib/utils/product';
  
  const ageCategories = getAgeCategories();
  let selectedAge = ageCategories[0];
  
  $: products = getProductsByAge(selectedAge);
</script>
  
  <section class="mx-auto bg-amber-50 px-4 py-16">
    <!-- Section Headers -->
    <div class="text-center mb-12">
      <h3 class="text-red-500 font-medium mb-2">Our Products</h3>
      <h2 class="text-3xl font-bold text-navy-900">PRODUCTS BY AGE</h2>
    </div>
  
    <!-- Age Categories -->
    <div class="flex flex-wrap justify-center gap-4 mb-12">
      {#each ageCategories as age}
        <button 
          class="px-6 py-2 rounded-full transition-all duration-300 hover:scale-105 {selectedAge === age ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          on:click={() => selectedAge = age}
        >
          {age}
        </button>
      {/each}
    </div>
  
    <!-- Product Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {#each products as product}
        <div class="bg-white rounded-lg p-6 shadow-lg transform transition-all duration-300 hover:-translate-y-2">
          <div class="relative aspect-square mb-4 overflow-hidden rounded-lg">
            <img 
              src="{product.image}"
              alt={product.name}
              class="w-full h-full object-cover transform transition-transform duration-300 hover:scale-110"
            />
          </div>
          
          <h3 class="text-lg font-semibold text-center mb-2">{product.name}</h3>
          
          <div class="flex justify-center mb-2">
            {#each Array(5) as _, i}
              <svg 
                class="w-5 h-5 {i < product.rating ? 'text-yellow-400' : 'text-gray-300'}" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            {/each}
          </div>
          
          <div class="text-center text-red-500 font-bold mb-4">
            ${product.price.toFixed(2)}
          </div>
          
          <button 
            on:click={() => addToCart(product)}
            class="w-full btn btn-primary text-white py-2 rounded-full transform transition-all duration-300 hover:bg-navy-800 hover:scale-105 active:scale-95"
          >
            ADD TO CART
          </button>
        </div>
      {/each}
    </div>
  
    <!-- Toast Notification
    {#if showToast}
      <div class="fixed bottom-4 left-4 bg-white shadow-lg rounded-lg p-4 flex items-center space-x-4 animate-slide-in-bottom">
        <img 
          src="https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=100&h=100&fit=crop" 
          alt="Product" 
          class="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p class="text-sm">Someone in London, UK purchased a</p>
          <p class="font-semibold">RADIO CONTROLLED RACING CAR</p>
          <p class="text-xs text-gray-500">About 7 days ago</p>
        </div>
        <button 
          on:click={() => showToast = false}
          class="text-gray-500 hover:text-gray-700"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    {/if} -->
  </section>
  
  <style>
    /* Custom animation for toast */
    @keyframes slide-in-bottom {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  
    .animate-slide-in-bottom {
      animation: slide-in-bottom 0.5s ease-out;
    }
  </style>