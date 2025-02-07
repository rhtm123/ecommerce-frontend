<script>
  import { onMount } from 'svelte';
  import { addToCart } from '../../stores/cart';
  import { myFetch } from '$lib/utils/myFetch';
  import { PUBLIC_API_URL } from '$env/static/public';

  let slides = [];
  let currentSlide = 0;
  let interval;

  async function fetchProductListings() {
    let url = PUBLIC_API_URL + "/product/product_listings/?page=1&page_size=5&featured=true&ordering=-popularity";
    try {
      let data = await myFetch(url);
      slides = data.results;
    } catch (e) {
      console.log(e, "Error fetching data");
    }
  }

  onMount(() => {
    fetchProductListings();
    interval = setInterval(() => nextSlide(), 5000);
    return () => clearInterval(interval);
  });

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  }

  function calculateDiscount(mrp, price) {
    if (!mrp || !price || mrp <= price) return null;
    return Math.round(((mrp - price) / mrp) * 100);
  }
</script>

<div class="relative min-h-[600px] flex items-center justify-center bg-base-100 overflow-hidden">
  <div class="container mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row items-center">
    
    {#if slides.length > 0}
    <div class="text-center md:text-left space-y-4 md:w-1/2">
      <!-- Product Title with Assured Badge -->
      <h2 class="text-primary text-2xl md:text-4xl font-bold flex items-center">
        {slides[currentSlide].name} 
        <span class="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
          Assured by NM
        </span>
      </h2>

      <!-- Product Description -->
      <p class="text-gray-600 text-lg md:text-xl">{slides[currentSlide].description}</p>

      <!-- Price & Discount -->
      <div class="flex items-center space-x-2">
        {#if calculateDiscount(slides[currentSlide].mrp, slides[currentSlide].price)}
          <span class="text-green-600 font-semibold">
            Save {calculateDiscount(slides[currentSlide].mrp, slides[currentSlide].price)}%!
          </span>
        {/if}
        <span class="text-gray-500 line-through">{formatPrice(slides[currentSlide].mrp)}</span>
        <span class="text-primary font-bold text-lg">{formatPrice(slides[currentSlide].price)}</span>

        <span class="bg-green-600 text-white px-2 py-1 text-sm font-semibold rounded">
          {slides[currentSlide].rating} ★
        </span>
        <span class="text-gray-500 text-sm">{slides[currentSlide].review_count} Reviews</span>
        
      </div>

      <!-- Rating & Reviews -->
      <div class="flex items-center space-x-2">

        <a href={"/product/"+slides[currentSlide].slug}>
          <button class="btn btn-primary rounded-full px-6 py-3 text-lg">Get This Deal</button>
        </a>

        
      </div>

      <!-- Call to Action -->
      
    </div>
    {/if}

    <!-- Product Image -->
    <div class="relative md:w-1/2 flex items-center justify-center">
      {#each slides as slide, i}
        <img 
          src={slide?.main_image} 
          alt={slide?.name} 
          class="absolute w-full h-auto max-w-sm md:max-w-md object-cover rounded-lg shadow-lg transition-opacity duration-700" 
          style="opacity: {currentSlide === i ? '1' : '0'};"
        />
      {/each}
    </div>
  </div>

  <!-- Navigation Arrows -->
  <div class="absolute inset-x-0 bottom-4 flex justify-center space-x-4">
    <button class="btn btn-circle btn-sm btn-outline" on:click={prevSlide}>❮</button>
    <button class="btn btn-circle btn-sm btn-outline" on:click={nextSlide}>❯</button>
  </div>
</div>

<style>
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  :global(img) {
    animation: fadeIn 1s ease-in-out;
  }
</style>
