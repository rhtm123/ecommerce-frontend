<script>
    import { goto } from '$app/navigation';
  
    import { PUBLIC_API_URL } from '$env/static/public';
    import { onMount } from 'svelte';
  
    import { categoryApi } from '$lib/services/categoryApi';

  
    let brands;
  
    // console.log("HELLO FROM PRODUCT")
  
    let loading = true;
  
    import { myFetch } from '$lib/utils/myFetch';
  
  
    onMount(async ()=>{
        
    try {
      let data = await myFetch(`${PUBLIC_API_URL}/user/entities/?entity_type=brand`);
      brands = data.results;
    } catch (e) {

    } finally {
        loading = false;
    }
    })
    
  
    function handleCategoryClick(id) {
      goto(`/shop/?brand_ids=`+id);
    }
  </script>
  
  <section class="py-12 bg-base-200">
    <div class="text-center mb-8">
      <p class="text-primary text-sm mb-2">Shop By Brand</p>
      <h2 class="text-2xl font-bold">Your Favorite Brands</h2>
    </div>
  
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 px-4 md:px-8">
      {#each brands as brand}
        <button
          on:click={() => handleCategoryClick(brand.id)}
          class="flex flex-col items-center bg-base-300 py-8 px-4 rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
        >
          <div class="w-16 h-16 flex items-center justify-center mb-4 text-gray-600">
            {@html brand?.icon}
          </div>
          <h3 class="text-sm font-medium text-center">{brand.name}</h3>
        </button>
      {/each}

      {#if loading}
        <div class="p-4">
        <div class="loading loading-spinner loading-sm"></div>
        </div>
        {/if}
    </div>
  </section>
  
  
    
    <style>
      :global(.btn) {
        text-transform: uppercase;
        font-size: 0.875rem;
      }
    </style>