<script>
    import { goto } from '$app/navigation';
  
    // import { PUBLIC_API_URL } from '$env/static/public';
    // import { onMount } from 'svelte';
  

  
    export let brands;
  
    // console.log("HELLO FROM PRODUCT")
  
    // let loading = true;
  
    // import { myFetch } from '$lib/utils/myFetch';
  
  
    // onMount(async ()=>{
        
    // try {
    //   let data = await myFetch(`${PUBLIC_API_URL}/user/entities/?entity_type=brand`);
    //   brands = data.results;
    // } catch (e) {

    // } finally {
    //     loading = false;
    // }
    // })
    
  
    function handleBrandClick(id) {
      goto(`/shop/?brand_ids=`+id);
    }
  </script>
  
  <section class="py-8 md:py-12 bg-base-200">
    <div class="mx-auto px-4 md:px-8 lg:px-16">
      <div class="text-center mb-6 md:mb-8">
        <p class="inline-block text-primary font-medium text-xs md:text-sm tracking-wider mb-2 bg-primary/10 px-3 py-1 rounded-full">
          Shop By Brand
        </p>
        <h2 class="text-xl md:text-3xl font-bold">Your Favorite Brands</h2>
      </div>
  
      <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {#each brands as brand}
          <button
            on:click={() => handleBrandClick(brand.id)}
            class="group relative bg-white rounded-lg p-2 md:p-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <div class="flex flex-col items-center">
              <div class="w-full aspect-square mb-2 rounded-lg bg-base-100/50 p-2 flex items-center justify-center overflow-hidden">
                <img 
                  src={brand?.logo || `https://placehold.co/400x400?text=${encodeURIComponent(brand.name)}`} 
                  alt={brand.name}
                  class="w-full h-full object-contain rounded-lg"
                  loading="lazy"
                />
              </div>
              
              <div class="text-center w-full">
                <h3 class="font-medium text-[11px] md:text-sm text-gray-900 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                  {brand.name}
                </h3>
                <span class="hidden md:inline-block mt-1 text-[10px] text-gray-500">
                  View Products →
                </span>
              </div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </section>
  
  
    
    <style>
      :global(.btn) {
        text-transform: uppercase;
        font-size: 0.875rem;
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