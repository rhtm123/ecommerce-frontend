<script>
  import { addToCart, cart } from '../../stores/cart';
  import { toggleWishlistItem, wishlistIds } from '../../stores/wishlist';
  import { addAlert } from '$lib/stores/alert';
  import { onMount } from 'svelte';
  
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
    // addAlert('Product added to cart!', 'success');
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
</script>

<div class="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
  <!-- Product Image Container with Overlay Elements -->
  <div class="relative aspect-square">
    <!-- Offer Badge - Top Right -->
    {#if discount}
      <div class="absolute top-3 right-3 z-20 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">
        {discount}% OFF
      </div>
    {/if}

    <!-- Wishlist Button - Top Left -->
    <button
      class="absolute top-3 left-3 z-20 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 {isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}"
      on:click={handleWishlistClick}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>

    <!-- Product Image -->
    <a href="/product/{product.slug}" class="block w-full h-full">
      <div class="w-full h-full bg-gray-50">
        <img 
          src={product.main_image || "/placeholder.svg"} 
          alt={product.name}
          class="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
    </a>
  </div>

  <!-- Product Info -->
  <div class="p-4">
    <a href="/product/{product.slug}" class="block space-y-2">
      <h3 class="font-medium text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {product.name}
      </h3>
      
      <!-- Reviews Section -->
      <div class="flex items-center gap-2">
        {#if product.rating}
          <div class="flex items-center bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
            <span class="font-medium">{product.rating}</span>
            <span class="ml-0.5">★</span>
          </div>
        {/if}
        {#if product.review_count}
          <span class="text-xs text-gray-500">
            [{product.review_count} {product.review_count === 1 ? 'Review' : 'Reviews'}]
          </span>
        {/if}
      </div>

      <!-- Price Section -->
      <div class="flex items-baseline gap-2">
        <span class="text-xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
        <span class="text-gray-500 text-sm line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
      </div>

      {#if savingsAmount > 0}
        <div class="inline-flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded">
          Save ₹{savingsAmount.toLocaleString('en-IN')}
        </div>
      {/if}
    </a>

    <!-- Add to Cart Controls -->
    <div class="mt-4 flex flex-col items-center">
      {#if showQtyControls}
        <div class="flex flex-col w-full items-center gap-1">
          <div class="flex items-center justify-center w-full gap-1">
            <button class="qty-btn-sm" on:click={handleDecrement} disabled={cartQuantity <= 1} aria-label="Decrease quantity">-</button>
            <span class="qty-value-sm">{cartQuantity > 0 ? cartQuantity : 1}</span>
            <button class="qty-btn-sm" on:click={handleIncrement} disabled={cartQuantity >= 10} aria-label="Increase quantity">+</button>
          </div>
          <button class="added-btn-sm" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            Added
          </button>
        </div>
      {:else}
        <button class="add-to-cart-btn-sm w-full" on:click={handleAddToCart}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.48 19h9.04a2 2 0 001.83-1.3L17 13M7 13V6h10v7" /></svg>
          Add to Cart
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  /* Optimize image loading */
  img {
    backface-visibility: hidden;
    transform: translateZ(0);
  }
  .add-to-cart-btn {
    background: linear-gradient(90deg, #6366f1 0%, #4338ca 100%);
    color: #fff;
    font-weight: 600;
    border-radius: 0.75rem;
    padding: 0.75rem 0;
    font-size: 1rem;
    transition: background 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px 0 rgba(99,102,241,0.08);
    margin-top: 0.5rem;
    margin-bottom: 0.25rem;
  }
  .add-to-cart-btn:hover {
    background: linear-gradient(90deg, #4338ca 0%, #6366f1 100%);
    box-shadow: 0 4px 16px 0 rgba(99,102,241,0.12);
  }
  .qty-btn {
    background: #f3f4f6;
    color: #374151;
    font-size: 1.25rem;
    font-weight: 700;
    border: none;
    border-radius: 0.5rem;
    width: 2.5rem;
    height: 2.5rem;
    transition: background 0.2s;
    cursor: pointer;
  }
  .qty-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .qty-value {
    min-width: 2.5rem;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 600;
    color: #4338ca;
    background: #f9fafb;
    border-radius: 0.5rem;
    padding: 0.5rem 0;
    border: 1px solid #e5e7eb;
  }
  .added-btn {
    background: #22c55e;
    color: #fff;
    font-weight: 600;
    border-radius: 0.75rem;
    padding: 0.5rem 0;
    font-size: 1rem;
    width: 100%;
    margin-top: 0.5rem;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  .added-btn:disabled {
    opacity: 0.85;
  }
  .add-to-cart-btn-sm {
    background: linear-gradient(90deg, #6366f1 0%, #4338ca 100%);
    color: #fff;
    font-weight: 600;
    border-radius: 0.5rem;
    padding: 0.4rem 0;
    font-size: 0.95rem;
    transition: background 0.2s, box-shadow 0.2s;
    box-shadow: 0 1px 4px 0 rgba(99,102,241,0.08);
    margin-top: 0.25rem;
    margin-bottom: 0.15rem;
  }
  .add-to-cart-btn-sm:hover {
    background: linear-gradient(90deg, #4338ca 0%, #6366f1 100%);
    box-shadow: 0 2px 8px 0 rgba(99,102,241,0.12);
  }
  .qty-btn-sm {
    background: #f3f4f6;
    color: #374151;
    font-size: 1rem;
    font-weight: 700;
    border: none;
    border-radius: 0.35rem;
    width: 1.9rem;
    height: 1.9rem;
    transition: background 0.2s;
    cursor: pointer;
    padding: 0;
  }
  .qty-btn-sm:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .qty-value-sm {
    min-width: 1.9rem;
    text-align: center;
    font-size: 1rem;
    font-weight: 600;
    color: #4338ca;
    background: #f9fafb;
    border-radius: 0.35rem;
    padding: 0.25rem 0;
    border: 1px solid #e5e7eb;
    margin: 0 0.1rem;
  }
  .added-btn-sm {
    background: #22c55e;
    color: #fff;
    font-weight: 600;
    border-radius: 0.5rem;
    padding: 0.35rem 0;
    font-size: 0.95rem;
    width: 100%;
    margin-top: 0.25rem;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  }
  .added-btn-sm:disabled {
    opacity: 0.85;
  }
</style>