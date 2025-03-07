<script>
  import { goto } from '$app/navigation';
  export let categories;

  function handleCategoryClick(slug) {
    goto(`/shop/${slug}`);
  }
</script>

<section class="py-6 md:py-12 bg-gradient-to-b from-base-100 to-base-200">
  <div class="mx-auto px-4 md:px-8 lg:px-16">
    <div class="text-center mb-6 md:mb-8">
      <span class="inline-block text-primary font-medium text-xs md:text-sm tracking-wider mb-2 bg-primary/10 px-3 py-1 rounded-full">
        OUR CATEGORIES
      </span>
      <h2 class="text-xl md:text-3xl font-bold text-gray-900">Categories You'll Love</h2>
      <div class="w-12 h-1 bg-primary mx-auto mt-2 rounded-full"></div>
    </div>

    <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
      {#each categories as category}
        <button
          on:click={() => handleCategoryClick(category.slug)}
          class="group relative bg-white rounded-lg p-2 md:p-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <div class="flex flex-col items-center">
            <div class="w-full aspect-square mb-2 rounded-lg bg-base-100/50 p-2 flex items-center justify-center">
              <img 
                src={category.image || "/placeholder.svg"} 
                alt={category.name}
                class="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            
            <div class="text-center w-full">
              <h3 class="font-medium text-[11px] md:text-sm text-gray-900 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                {category.name}
              </h3>
              <span class="hidden md:inline-block mt-1 text-[10px] text-gray-500">
                Explore →
              </span>
            </div>
          </div>

          {#if category.featured}
            <span class="absolute top-1 right-1 bg-primary text-white text-[8px] px-1.5 py-0.5 rounded-full">
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

  /* Base styles */
  :global(html) {
    scroll-behavior: smooth;
  }

  /* Container max-width */
  .container {
    max-width: 1280px;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .hover\:shadow-lg:hover {
      box-shadow: none;
    }
    
    .hover\:-translate-y-0\.5:hover {
      transform: none;
    }
    
    button:active {
      transform: scale(0.98);
      background-color: rgba(0, 0, 0, 0.02);
    }
  }

  /* Reduce motion */
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
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  /* Image optimizations */
  img {
    backface-visibility: hidden;
    transform: translateZ(0);
    -webkit-font-smoothing: subpixel-antialiased;
  }
</style>