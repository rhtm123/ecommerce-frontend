<script>
  import { addToCart, cart } from '../../stores/cart';
  import { toggleWishlistItem, wishlistIds } from '../../stores/wishlist';
  import { addAlert } from '$lib/stores/alert';
  import Icon from '@iconify/svelte';
  
  export let product;
  $: isWishlisted = $wishlistIds.has(product.id);

  // Cart quantity logic
  let quantity = 1;
  let showQtyControls = false;

  // Use $cart for reactivity
  $: cartItem = $cart.find(item => item.id === product.id);
  $: inCart = !!cartItem;
  $: cartQuantity = cartItem ? cartItem.quantity : 0;
  $: showQtyControls = inCart;
  $: if (inCart && cartQuantity !== quantity) quantity = cartQuantity;

  function handleWishlistClick(event) {
    event.stopPropagation(); 
    event.preventDefault();
    toggleWishlistItem(product);
  }

  function calculateDiscount(mrp, price) {
    if (!mrp || !price || mrp <= price) return null;
    return Math.round(((mrp - price) / mrp) * 100);
  }

  $: discount = calculateDiscount(product.mrp, product.price);
  $: savingsAmount = product.mrp - product.price;

  function handleAddToCart() {
    addToCart(product);
    quantity = 1;
    showQtyControls = true;
  }

  function handleIncrement() {
    if (cartQuantity < 10) {
      cart.update(items => items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    }
  }
  
  function handleDecrement() {
    if (cartQuantity > 1) {
      cart.update(items => items.map(item => item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item));
    }
  }
  
  function handleRemove() {
    cart.update(items => items.filter(item => item.id !== product.id));
  }
</script>

<div class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col relative">
  <!-- Gradient overlay for visual appeal -->
  <div class="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 pointer-events-none"></div>
  
  <!-- Product Image with Badges -->
  <a href="/product/{product.slug}" class="block w-full h-full">
  <div class="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
    <!-- Discount Badge -->
    {#if discount}
      <div class="absolute top-2 left-2 z-10">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md text-[10px]">
          {discount}% OFF
        </div>
      </div>
    {/if}

    <!-- Wishlist Button -->
    <button
      class="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 {isWishlisted ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600'}"
      on:click={handleWishlistClick}
      aria-label="Toggle wishlist"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>

  

    <!-- Product Image -->
      <img 
        src={product.main_image || product.category?.image || "/placeholder.svg?height=150&width=150"} 
        alt={product.name}
        class="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
    

    <!-- Hover overlay -->
    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300"></div>
  </div>
  </a>

  <!-- Product Info - Flex column to push content to bottom -->
  <div class="p-3 flex flex-col flex-1 relative z-10">
    <a href="/product/{product.slug}" class="block flex-1">
      <!-- Product Name - Fixed height for 2 lines -->
      <h3 class="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
        {product.name}
      </h3>
    </a>

    <!-- Bottom section - Brand, Rating, Price, and Add Button -->
    <div class="mt-auto space-y-2">
      <!-- Brand and Rating on same line -->
      <div class="flex items-center justify-between">
        <!-- Brand -->
        <div class="flex-1 min-w-0">
          {#if product.brand?.name}
            <p class="text-xs text-gray-500 truncate">{product.brand.name}</p>
          {:else}
            <div class="h-4"></div>
          {/if}
        </div>
        
        <!-- Rating -->
        {#if product.rating}
          <div class="flex items-center gap-1 ml-2">
            <div class="flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-md shadow-sm">
              <span class="font-medium">{product.rating}</span>
              <span class="ml-0.5">★</span>
            </div>
            {#if product.review_count}
              <span class="text-[10px] text-gray-500">
                [{product.review_count}]
              </span>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Price and Add Button Row -->
      <div class="flex items-end justify-between">
        <!-- Price Section -->
        <div class="flex flex-col">
          <span class="text-sm font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
          {#if product.mrp && product.mrp > product.price}
            <span class="text-gray-500 text-xs line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
          {/if}
        </div>

        <!-- Add to Cart Controls -->
        <div class="ml-2">

          {#if product.stock ==0}
            <span class="text-red-500 text-xs font-semibold border border-red-200 bg-red-50 px-2 py-1 rounded">Out of Stock</span>
          {:else if showQtyControls}

            <div class="flex items-center border-2 border-green-500 rounded-lg px-2 py-1 gap-2 bg-green-50/50">
              <button 
                class="w-5 h-5 flex items-center justify-center text-green-600 hover:bg-green-100 rounded transition-colors"
                on:click={cartQuantity > 1 ? handleDecrement : handleRemove}
                aria-label={cartQuantity === 1 ? 'Remove item from cart' : 'Decrease quantity'}
              >
                {#if cartQuantity === 1}
                  <Icon icon="mdi:delete-outline" class="text-red-600" width="12" height="12" />
                {:else}
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                  </svg>
                {/if}
              </button>
              <span class="font-semibold text-green-600 text-xs min-w-[1rem] text-center">{cartQuantity}</span>
              <button 
                class="w-5 h-5 flex items-center justify-center text-green-600 hover:bg-green-100 rounded transition-colors"
                on:click={handleIncrement}
                disabled={cartQuantity >= 10}
                aria-label="Increase quantity"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </button>
            </div>
          {:else}
            <button 
              class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-1.5 px-3 rounded-lg transition-all duration-200 text-xs shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              on:click={handleAddToCart}
            >
              ADD
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>