<script>
  export let product;

  import { goto } from '$app/navigation';
  import { addToCart } from '../../stores/cart';
  import { toggleWishlistItem, wishlistIds } from '../../stores/wishlist';
  import { addAlert } from '$lib/stores/alert';
  import Slider from '../Slider.svelte';

  $: isWishlisted = $wishlistIds.has(product.id);

  function handleProductClick() {
    goto(`/product/${product.slug}`);
  }

  function AddToCardAlert(product) {
    addToCart(product);
  }

  function handleWishlistClick(event) {
    event.stopPropagation();
    toggleWishlistItem(product);
    const message = !isWishlisted 
      ? 'Added to wishlist' 
      : 'Removed from wishlist';
    addAlert(message, 'success');
  }


  function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 0 
  }).format(price);
}


  function calculateDiscount(mrp, price) {
    if (!mrp || !price || mrp <= price) return null;
    return Math.round(((mrp - price) / mrp) * 100);
  }
</script>

<div 
  class="bg-white p-4 hover:shadow-xl border rounded-lg relative flex flex-col h-full"
>
  <!-- Discount Badge -->
  <!-- {#if calculateDiscount(product.mrp, product.price)}
    <span class="absolute top-2 left-0 bg-green-600 text-white text-xs font-bold px-2 py-2 shadow-md z-10">
      {calculateDiscount(product.mrp, product.price)}% 
      OFF!
    </span>
  {/if} -->

  <!-- Wishlist button -->
  <button
    class="absolute top-2 right-2 z-10 p-1 rounded-full bg-base-200 hover:bg-white transition-colors"
    on:click={handleWishlistClick}
    aria-label="Toggle wishlist"
  >
    {#if isWishlisted}
      <svg class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    {:else}
      <svg class="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    {/if}
  </button>

  <!-- Status Labels -->
  <!-- {#if product.status}
    <span class="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
      {product.status}
    </span>
  {/if} -->

  <div class="relative mb-2">
    <a href={`/product/${product.slug}`}>
    <img 
      src={product.main_image || `https://placehold.co/400x400?text=${encodeURIComponent(product.name)}`} 
      alt={product.name}
      class="w-full rounded-lg transition-all duration-300 ease-in-out cursor-pointer transform hover:scale-105"
      loading="lazy"
      on:error={(e) => e.target.src = `https://placehold.co/400x400?text=${encodeURIComponent(product.name)}`}
    />

  </a>
  </div>

  <div class="flex flex-col flex-grow text-center">

    <a href={`/product/${product.slug}`}>

    <h3 class="font-bold text-md mb-2">{product.name}</h3>

    </a>

    <div class="flex items-center justify-center mb-0">
      <span class="bg-green-600 text-white px-2 py-0 text-sm font-semibold rounded">
        {product.rating} ★
      </span>
      <span class="text-gray-500 text-sm ml-2">[{product.review_count} Reviews]</span>
    </div>

    <p class="text-primary my-1">

      <span class="mr-1 font-bold ">
        {formatPrice(product.price)}
        </span>
      <span class="text-gray-500 line-through text-sm mr-1">{formatPrice(product.mrp)}</span>
      

      <span class="text-green-600 text-sm font-bold">
        {calculateDiscount(product.mrp, product.price)}% 
        OFF!
      </span>
    </p>


    <!-- Push button to bottom -->
    <button 
      class="btn btn-primary btn-sm w-full mt-auto"
      on:click|stopPropagation={() => AddToCardAlert(product)}
      disabled={!product.stock || product.stock <= 0}
      aria-label="Add to cart"
    >
      {!product.stock || product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
    </button>
  </div>
</div>