<script>
  import { onMount } from 'svelte';
  import { addToCart } from '../../stores/cart';
  import { fade, fly } from 'svelte/transition';

  export let slides;
  let currentSlide = 0;
  let interval;
  let isHovering = false;

  onMount(() => {
    startAutoplay();
    return () => clearInterval(interval);
  });

  function startAutoplay() {
    if (!isHovering) {
      interval = setInterval(() => nextSlide(), 5000);
    }
  }

  function stopAutoplay() {
    clearInterval(interval);
  }

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

  function goToSlide(index) {
    currentSlide = index;
  }
</script>
<div 
  class="relative min-h-[350px] bg-gradient-to-br md:py-8 py-4 from-blue-50 via-white to-purple-50 overflow-hidden"
  on:mouseenter={() => {isHovering = true; stopAutoplay();}}
  on:mouseleave={() => {isHovering = false; startAutoplay();}}
>
  <!-- Animated Background Elements -->
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
    <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h4v4H0V0zm8 0h4v4H8V0zm8 0h4v4h-4V0zM0 8h4v4H0V8zm8 0h4v4H8V8zm8 0h4v4h-4V8zM0 16h4v4H0v-4zm8 0h4v4H8v-4zm8 0h4v4h-4v-4z\' fill=\'%23000000\' fill-opacity=\'0.03\'%3E%3C/path%3E%3C/svg%3E')] opacity-30"></div>
  </div>

  <!-- Arrow Buttons: Extreme left/right, vertically centered -->
  <button 
    class="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 hover:bg-gray-100 shadow transition-all "
    on:click={prevSlide}
    aria-label="Previous Slide"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
  <button 
    class="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 hover:bg-gray-100 shadow transition-all"
    on:click={nextSlide}
    aria-label="Next Slide"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </button>

  <div class="mx-auto px-4 md:px-8 lg:px-16 py-4 md:py-6 relative z-10 mb-2">
    {#if slides.length > 0}
      <div class="flex flex-col py-4 md:py-0 md:flex-row items-center justify-between gap-4 md:gap-8">
        <!-- Product Details -->
        <div class="w-full md:w-3/5 space-y-2 md:space-y-3 text-center md:text-left px-4 md:px-0" 
          in:fly={{ y: 20, duration: 800, delay: 200 }}
          out:fade={{ duration: 200 }}
        >
          <!-- Tags with enhanced mobile styling -->
          <div class="flex flex-wrap gap-2 justify-center md:justify-start">
            {#if calculateDiscount(slides[currentSlide].mrp, slides[currentSlide].price)}
              <span class="relative inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">
                <span class="absolute -left-1 -top-1 h-2 w-2 md:h-3 md:w-3 bg-white rounded-full animate-ping"></span>
                Save {calculateDiscount(slides[currentSlide].mrp, slides[currentSlide].price)}%
              </span>
            {/if}
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
              <svg class="w-3 h-3 md:w-4 md:h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
              Assured by NM
            </span>
          </div>

          <!-- Title with responsive typography -->
          <h1 class="text-xl md:text-3xl lg:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            {slides[currentSlide].name}
          </h1>

          <!-- Description with adjusted font size -->
          <p class="text-sm md:text-base lg:text-lg leading-relaxed text-gray-600 max-w-xl mx-auto md:mx-0 line-clamp-2">
            {slides[currentSlide].description}
          </p>

          <!-- Price & Rating with mobile optimization -->
          <div class="space-y-3 md:space-y-4">
            <div class="flex items-center gap-2 md:gap-3 justify-center md:justify-start">
              <span class="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary">
                {formatPrice(slides[currentSlide].price)}
              </span>
              {#if slides[currentSlide].mrp > slides[currentSlide].price}
                <span class="text-lg md:text-2xl text-gray-400 line-through">
                  {formatPrice(slides[currentSlide].mrp)}
                </span>
              {/if}
            </div>

            <div class="flex flex-wrap items-center gap-3 justify-center md:justify-start">
              <div class="flex items-center bg-white/80 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1 md:py-2 shadow-sm">
                <span class="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-0.5 rounded text-xs md:text-sm font-semibold mr-2">
                  {slides[currentSlide].rating} ★
                </span>
                <span class="text-gray-700 text-xs md:text-sm">
                  {slides[currentSlide].review_count} Reviews
                </span>
              </div>
              <div class="hidden md:block h-8 w-px bg-gray-200"></div>
              <span class="inline-flex items-center text-green-600 text-xs md:text-sm font-medium bg-green-50 px-2 md:px-3 py-1 rounded-full">
                <svg class="w-3 h-3 md:w-4 md:h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                In Stock
              </span>
            </div>
          </div>

          <!-- Enhanced CTA with mobile optimization -->
          <div class="flex items-center gap-4 justify-center md:justify-start mt-4 md:mt-6">
            <a href={"/product/"+slides[currentSlide].slug}
              class="group relative inline-flex items-center px-6 md:px-8 py-2 md:py-3 rounded-full overflow-hidden"
            >
              <span class="absolute inset-0 bg-gradient-to-r from-primary via-primary-focus to-primary transform transition-transform group-hover:scale-105"></span>
              <span class="relative flex items-center text-white font-semibold text-base md:text-lg">
                Get This Deal
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5 ml-2 transform transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </span>
            </a>
          </div>
        </div>

        <!-- Enhanced Product Image Display -->
        <div class="w-full md:w-2/5 relative h-[300px] md:h-[400px] flex items-center justify-center">
          {#each slides as slide, i}
            <div 
              class="absolute inset-0 transition-all duration-700 flex items-center justify-center"
              style="opacity: {currentSlide === i ? '1' : '0'};"
            >
              <img 
                src={slide?.main_image || "/placeholder.svg"} 
                alt={slide?.name}
                loading="lazy"
                class="max-w-full max-h-full object-contain rounded-lg transition-transform hover:scale-105 bg-transparent shadow-none"
                style="background: none; box-shadow: none;"
              />
            </div>
          {/each}
        </div>
      </div>

      <!-- Enhanced Navigation -->
      <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20">
        <div class="flex items-center gap-4 bg-white/80 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
          <div class="flex gap-2 ">
            {#each slides as _, i}
              <button
                class="relative w-2 h-2 rounded-full transition-all duration-300 {currentSlide === i ? 'w-8 bg-primary' : 'bg-gray-300 hover:bg-gray-400'}"
                on:click={() => goToSlide(i)}
              >
                {#if currentSlide === i}
                  <span class="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></span>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95) rotate(-5deg); }
    to { opacity: 1; transform: scale(1) rotate(0deg); }
  }

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }

  /* Enhanced transitions */
  button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Improved glass effect */
  .backdrop-blur-md {
    backdrop-filter: blur(12px);
  }

  /* Gradient text support for Safari */
  @supports (-webkit-background-clip: text) {
    .bg-clip-text {
      -webkit-background-clip: text;
      background-clip: text;
    }
  }
  /* Enhance transitions */
  .transition-all {
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>
