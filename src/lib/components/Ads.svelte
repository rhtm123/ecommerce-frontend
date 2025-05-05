<!-- Add this component after Hero and before HomeCategories -->
<script>
    import { onMount } from 'svelte';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { myFetch } from '$lib/utils/myFetch';
    import { fade } from 'svelte/transition';
    
    let ads = [];
    let currentPage = 0;
    let interval;
    let isHovering = false;
    const adsPerPage = 2;
    
    onMount(async () => {
      try {
        const response = await myFetch(`${PUBLIC_API_URL}/ads/advertisements?page=1&page_size=5`);
        console.log(response)
        const today = new Date();
        ads = response.results.filter(ad => {
          const startDate = new Date(ad.start_date);
          const endDate = new Date(ad.end_date);
          return startDate <= today && today <= endDate;
        });
        
        startAutoplay();
      } catch (error) {
        console.error("Error fetching ads:", error);
      }

      return () => {
        if (interval) clearInterval(interval);
      };
    });
    
    $: totalPages = Math.ceil(ads.length / adsPerPage);
    $: visibleAds = ads.slice(currentPage * adsPerPage, (currentPage + 1) * adsPerPage);
    
    function startAutoplay() {
      if (!isHovering && ads.length > adsPerPage) {
        interval = setInterval(() => {
          nextPage();
        }, 5000);
      }
    }
    
    function stopAutoplay() {
      if (interval) {
        clearInterval(interval);
      }
    }
    
    function nextPage() {
      currentPage = (currentPage + 1) % totalPages;
    }
    
    function prevPage() {
      currentPage = (currentPage - 1 + totalPages) % totalPages;
    }

    function goToPage(index) {
      currentPage = index;
    }
</script>

{#if ads.length > 0}
  <div 
    class="py-4  px-4 md:px-8 lg:px-16 bg-gradient-to-br from-base-200 via-base-100 to-base-200"
    on:mouseenter={() => {isHovering = true; stopAutoplay();}}
    on:mouseleave={() => {isHovering = false; startAutoplay();}}
  >
    <div class="max-w-6xl mx-auto mt-4">
      <div class="overflow-hidden">
        <div class="slider-container">
          <div 
            class="slider-track"
            style="transform: translateX(-{currentPage * 100}%)"
          >
            {#each Array(totalPages) as _, pageIndex}
              <div class="slider-page">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {#each ads.slice(pageIndex * adsPerPage, (pageIndex + 1) * adsPerPage) as ad}
                    <div 
                      class="ad-card"
                      in:fade={{ duration: 300 }}
                    >
                      <a href={ad.link} class="group block">
                        <div class="relative h-32 md:h-40 overflow-hidden rounded-lg">
                          <img 
                            src={ad.image} 
                            alt={ad.title} 
                            class="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105" 
                          />
                          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div class="absolute bottom-0 left-0 right-0 p-3">
                            <div class="flex items-center gap-2 mb-1">
                              <span class="badge badge-sm badge-primary">Ad</span>
                            </div>
                            <h3 class="text-sm md:text-base font-semibold text-white line-clamp-2 group-hover:text-primary-100 transition-colors duration-300">
                              {ad.title}
                            </h3>
                          </div>
                        </div>
                      </a>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      {#if totalPages > 1}
        <div class="flex justify-center items-center mt-4 gap-4">
          <button 
            class="btn btn-circle btn-sm btn-ghost"
            on:click={prevPage}
          >
            ❮
          </button>
          
          <div class="flex items-center gap-2">
            {#each Array(totalPages) as _, i}
              <button 
                class="w-2 h-2 rounded-full transition-all duration-300 {i === currentPage ? 'w-6 bg-primary' : 'bg-gray-300 hover:bg-gray-400'}"
                on:click={() => goToPage(i)}
              />
            {/each}
          </div>

          <button 
            class="btn btn-circle btn-sm btn-ghost"
            on:click={nextPage}
          >
            ❯
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .slider-container {
    width: 100%;
    overflow: hidden;
    position: relative;
  }

  .slider-track {
    display: flex;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
  }

  .slider-page {
    flex: 0 0 100%;
    width: 100%;
  }

  .ad-card {
    height: 100%;
    transition: all 0.3s ease;
  }

  .ad-card:hover {
    transform: translateY(-2px);
  }

  /* Improve button interactions */
  button {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  /* Optimize images */
  img {
    backface-visibility: hidden;
    transform: translateZ(0);
    -webkit-font-smoothing: subpixel-antialiased;
  }

  /* Reduce motion if user prefers */
  @media (prefers-reduced-motion: reduce) {
    .slider-track {
      transition: none;
    }
  }
</style>