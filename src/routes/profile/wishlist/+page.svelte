<script>
  import { addToCart } from '../../../lib/stores/cart';

  let wishlistItems = [
    // {
    //   id: 1,
    //   name: "Baby's First Blocks Set",
    //   price: 29.99,
    //   image: '/img/Toy-Names-For-Kids.webp',
    //   inStock: true,
    //   rating: 4.5,
    //   reviews: 128
    // }
    // Add more items as needed
  ];

  function removeFromWishlist(id) {
    wishlistItems = wishlistItems.filter(item => item.id !== id);
  }

  function moveToCart(item) {
    addToCart(item);
    removeFromWishlist(item.id);
  }
</script>

<div class="space-y-6">
  <h2 class="text-2xl font-bold">My Wishlist ({wishlistItems.length} items)</h2>

  {#if wishlistItems.length > 0}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each wishlistItems as item (item.id)}
        <div class="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <div class="relative">
            <img src={item.image} alt={item.name} class="w-full h-48 object-cover"/>
            <button 
              on:click={() => removeFromWishlist(item.id)}
              class="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <div class="p-4">
            <h3 class="font-medium mb-2">{item.name}</h3>
            
            <div class="flex items-center mb-2">
              <div class="flex items-center">
                {#each Array(5) as _, i}
                  <svg 
                    class="w-4 h-4 {i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'}" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                {/each}
                <span class="ml-1 text-sm text-gray-600">({item.reviews})</span>
              </div>
            </div>

            <p class="text-lg font-bold text-red-500 mb-4">${item.price.toFixed(2)}</p>

            <div class="space-y-2">
              {#if item.inStock}
                <button 
                  on:click={() => moveToCart(item)}
                  class="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  MOVE TO CART
                </button>
              {:else}
                <button 
                  class="w-full bg-gray-300 text-gray-600 py-2 rounded-lg cursor-not-allowed"
                  disabled
                >
                  OUT OF STOCK
                </button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="text-center py-12">
      <div class="mb-4">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900">Your wishlist is empty</h3>
      <p class="mt-1 text-gray-500">Save items you love to your wishlist</p>
      <div class="mt-6">
        <a href="/shop" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600">
          Continue Shopping
        </a>
      </div>
    </div>
  {/if}
</div> 