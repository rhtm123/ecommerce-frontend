<script>
  import Product from "../product/Product.svelte";
  import Slider from "../Slider.svelte";
  export let products;

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
      <a href="/shop" class="text-primary text-md  md:text-lg font-medium hover:underline flex items-center gap-1">
        View All
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </a>
    </div>
    <div class="absolute bottom-0 left-0 w-full h-px bg-gray-200"></div>
  </div>

  <div class="relative">
    <Slider items={products} let:items>
      {#each products as product (product.id)}
        <div class="item w-3/4 sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 flex-shrink-0 px-2">
          <Product product={product} />
        </div>
      {/each}
    </Slider>
  </div>

</section>

