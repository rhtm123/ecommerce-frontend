<script>
  import { goto } from '$app/navigation';
  export let categories;

  function handleCategoryClick(slug) {
    goto(`/shop/${slug}`);
  }
</script>

<section class="py-6 md:py-16 bg-gradient-to-b from-base-100 to-base-200">
  <div class="mx-auto px-4 md:px-8 lg:px-16">
    <div class="text-center mb-6 md:mb-12">
      <span class="inline-block text-primary font-medium text-xs md:text-sm tracking-wider mb-2 md:mb-3 bg-primary/10 px-3 py-1 rounded-full">
        OUR CATEGORIES
      </span>
      <h2 class="text-xl md:text-4xl font-bold text-gray-900">Categories You'll Love</h2>
      <div class="w-12 md:w-24 h-1 bg-primary mx-auto mt-2 md:mt-4 rounded-full"></div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-6">
      {#each categories as category}
        <button
          on:click={() => handleCategoryClick(category.slug)}
          class="group relative bg-white rounded-lg md:rounded-xl p-2 md:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary/50 flex flex-col h-[120px] md:h-auto"
        >
          <div class="relative flex flex-col h-full">
            <div class="w-full h-[80px] md:h-auto md:aspect-square mb-1 md:mb-4 rounded-lg bg-base-100/50 p-1 md:p-4 flex items-center justify-center">
              <img 
                src={category.image || "/placeholder.svg"} 
                alt={category.name}
                class="w-[100%] h-[100%] md:w-[100%] md:h-[100%] object-contain filter drop-shadow-md"
                loading="lazy"
              />
            </div>
            
            <div class="text-center mt-auto">
              <h3 class="font-medium text-[11px] md:text-base text-gray-900 group-hover:text-primary transition-colors duration-300 line-clamp-1 md:line-clamp-2">
                {category.name}
              </h3>
              <span class="hidden md:inline-block mt-1 md:mt-2 text-[10px] md:text-xs text-gray-500">
                Explore Now →
              </span>
            </div>
          </div>

          {#if category.featured}
            <span class="absolute top-1 right-1 md:top-3 md:right-3 bg-primary text-white text-[8px] md:text-xs px-1.5 py-0.5 rounded-full">
              Featured
            </span>
          {/if}
        </button>
      {/each}
    </div>
  </div>
</section>

<style>
  /* Base styles */
  :global(html) {
    scroll-behavior: smooth;
  }

  /* Mobile-first responsive styles */
  button {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .hover\:shadow-xl:hover {
      box-shadow: none;
    }
    
    .hover\:-translate-y-1:hover {
      transform: none;
    }
    
    button:active {
      transform: scale(0.98);
      background-color: rgba(0, 0, 0, 0.02);
    }

    /* Prevent text overflow */
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  /* Reduce motion if user prefers */
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Performance optimizations */
  button {
    will-change: transform;
  }
</style>