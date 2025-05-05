<script>
  import { addToCart } from '../../stores/cart';
  import { toggleWishlistItem, wishlistIds } from '../../stores/wishlist';
  import { addAlert } from '$lib/stores/alert';
  
  export let product;
  $: isWishlisted = $wishlistIds.has(product.id);

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
  </div>
</div>

<style>
  /* Optimize image loading */
  img {
    backface-visibility: hidden;
    transform: translateZ(0);
  }
</style>