<script>
  import Product from "../product/Product.svelte";
  import Slider from "../Slider.svelte";
  import SkeltonSliderProducts from "../skeltons/SkeltonSliderProducts.svelte";
  
  export let products;
  export let loading;

</script>

<section class="bg-base-100 mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-12">
  <div class="relative mb-8">
    <div class="flex items-center justify-between">
      <div class="relative">
      <h2 class="text-md md:text-lg text-gray-700 font-medium mb-2">
        Grab the
        <span class="text-primary relative">
          Best Deals
        </span>
        <span class="absolute bottom-px rounded-full left-0 w-full h-0.5 bg-primary"></span>
      </h2>
      </div>
      <a href="/shop" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow border border-secondary/30 text-primary font-medium hover:bg-base-100">
      <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z"/></svg>
      View All
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
    </a>
    </div>
  </div>
  
  {#if loading}
    <SkeltonSliderProducts />
  {:else}

  <div class="relative">
    <Slider items={products} let:items>
      {#each products as product (product.id)}
        <div class="item w-3/4 sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 flex-shrink-0 px-2">
          <Product product={product} />
        </div>
      {/each}
    </Slider>
  </div>
  {/if}

</section>

