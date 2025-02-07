<script>
  export let product;

  import { goto } from '$app/navigation';
  import { addToCart } from '../../stores/cart';
  import { addAlert } from '$lib/stores/alert';

  function handleProductClick() {
    goto(`/product/${product.slug}`);
  }

  function AddToCardAlert(product) {
    addToCart(product);
    addAlert('Product added to cart', 'success');
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  }

  function calculateDiscount(mrp, price) {
    if (!mrp || !price || mrp <= price) return null;
    return Math.round(((mrp - price) / mrp) * 100);
  }
</script>

<div 
  class="bg-white rounded-lg p-4 hover:shadow-xl border rounded-lg relative"
  on:click={() => handleProductClick()}
>
  <!-- Status Labels -->
  {#if product.status}
    <span class="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
      {product.status}
    </span>
  {/if}

  <div class="relative mb-4">
    {#if !product.stock || product.stock <= 0}
      <span class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
        Out of Stock
      </span>
    {/if}
    <img 
      src={product.main_image || `https://placehold.co/400x400?text=${encodeURIComponent(product.name)}`} 
      alt={product.name}
      class="w-full rounded transition-all duration-300 ease-in-out cursor-pointer transform hover:scale-105"
      loading="lazy"
      on:error={(e) => e.target.src = `https://placehold.co/400x400?text=${encodeURIComponent(product.name)}`}
    />
  </div>

  <div class="">
    <div class="text-center">
      <h3 class="font-bold text-md mb-2">{product.name}</h3>
      <div class="flex items-center justify-center mb-1">
        <span class="bg-green-600 text-white px-2 py-0 text-sm font-semibold rounded">
          {product.rating} ★
        </span>
        <span class="text-gray-500 text-sm ml-2">[{product.review_count} Reviews]</span>

      </div>

     
      <p class="text-primary font-bold mt-2">
        <span class="text-gray-500 line-through text-sm mr-2">{formatPrice(product.mrp)}</span>
        {formatPrice(product.price)}
      </p>
      {#if calculateDiscount(product.mrp, product.price)}
        <p class="text-green-600 text-sm font-semibold">Save {calculateDiscount(product.mrp, product.price)}%!</p>
      {/if}
      
      <button 
        class="btn btn-primary btn-sm w-full mt-2"
        on:click|stopPropagation={() => AddToCardAlert(product)}
        disabled={!product.stock || product.stock <= 0}
        aria-label="Add to cart"
      >
        {!product.stock || product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  </div>
</div>
