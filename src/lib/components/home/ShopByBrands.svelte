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
    
  
    function handleCategoryClick(id) {
      goto(`/shop/?brand_ids=`+id);
    }
  </script>
  
  <section class="py-12 mx-auto px-4 md:px-8 lg:px-16 bg-base-200">
    <div class="text-center mb-8">
      <p class="inline-block text-primary font-medium text-xs md:text-sm tracking-wider mb-2 md:mb-3 bg-primary/10 px-3 py-1 rounded-full">Shop By Brand</p>
      <h2 class="text-2xl font-bold">Your Favorite Brands</h2>
    </div>
  
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
      {#each brands as brand}
        
        <button
          on:click={() => handleCategoryClick(brand.id)}
          class="group relative bg-white rounded-lg md:rounded-xl p-2 md:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary/50 flex flex-col h-[120px] md:h-auto"
        >
          <div class="relative flex flex-col h-full">
            <div class="w-full h-[80px] md:h-auto md:aspect-square mb-1 md:mb-4 rounded-lg bg-base-100/50 p-1 md:p-4 flex items-center justify-center">
              <img 
                src={brand?.image || `https://placehold.co/400x400?text=${encodeURIComponent(brand.name)}`} 
                alt={brand.name}
                class="w-[100%] h-[100%] md:w-[100%] md:h-[100%] object-contain filter drop-shadow-md"
                loading="lazy"
              />
            </div>
            
            <div class="text-center mt-auto">
              <h3 class="font-medium text-[11px] md:text-base text-gray-900 group-hover:text-primary transition-colors duration-300 line-clamp-1 md:line-clamp-2">
                {brand.name}
              </h3>
              <span class="hidden md:inline-block mt-1 md:mt-2 text-[10px] md:text-xs text-gray-500">
                Explore Now →
              </span>
            </div>
          </div>
        </button>


      {/each}
<!-- 
      {#if loading}
        <div class="p-4">
        <div class="loading loading-spinner loading-sm"></div>
        </div>
        {/if} -->
    </div>
  </section>
  
  
    
    <style>
      :global(.btn) {
        text-transform: uppercase;
        font-size: 0.875rem;
      }
    </style>