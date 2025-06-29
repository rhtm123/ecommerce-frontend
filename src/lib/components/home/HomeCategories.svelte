<script>
  import { goto } from '$app/navigation';
  export let categories;

  function handleCategoryClick(slug) {
    goto(`/shop/${slug}`);
  }
</script>

<section class="py-6 md:py-12 mx-auto px-4 md:px-8 lg:px-16 bg-gradient-to-b from-base-100 to-base-200">
  <div class="relative mb-8">
    <div class="flex items-center justify-between">
      <div class="relative">
      <h2 class="text-lg md:text-xl text-gray-700 font-medium mb-2">
        Shop From 
        <span class="relative inline-block align-middle">
          <span class="text-primary z-10 relative">Top Categories</span>
        </span>
        <span class="absolute left-0 right-0 bottom-px h-0.5 bg-primary rounded-full "></span>
      </h2>
      </div>
      <a href="/shop" class="text-primary text-sm hover:underline flex items-center gap-1">
        View All
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </a>
    </div>
    <div class="absolute bottom-0 left-0 w-full h-px bg-gray-200 z-0"></div>
  </div>
  

    <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-4 md:gap-4">
      {#each categories as category}
        <button
          on:click={() => handleCategoryClick(category.slug)}
          class="group flex flex-col items-center space-y-3"
        >
          <div class="w-full aspect-square relative">
            <div class="absolute inset-0 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors duration-300"></div>
            <div class="relative w-full h-full p-4 flex items-center justify-center">
              <img 
                src={category.image || "/placeholder.svg"} 
                alt={category.name}
                class="w-[85%] h-[85%] object-contain"
                loading="lazy"
              />
            </div>
          </div>
          
          <span class="text-sm md:text-base text-center text-gray-700 group-hover:text-primary transition-colors duration-300 font-medium">
            {category.name}
          </span>
        </button>
      {/each}
    </div>
</section>

<style>
  /* Keep only necessary styles */
  /* Ensure slider navigation is visible */
  :global(.slider-nav) {
    @apply absolute top-1/2 -translate-y-1/2;
  }
  
  :global(.slider-nav.prev) {
    @apply -left-4;
  }
  
  :global(.slider-nav.next) {
    @apply -right-4;
  }
  button {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  img {
    backface-visibility: hidden;
    transform: translateZ(0);
    -webkit-font-smoothing: subpixel-antialiased;
  }

  
</style>