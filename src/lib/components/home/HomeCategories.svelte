<script>
  import { goto } from '$app/navigation';

  // import { PUBLIC_API_URL } from '$env/static/public';
  // import { onMount } from 'svelte';


  export let categories;

  // console.log("HELLO FROM PRODUCT")


  // import { myFetch } from '$lib/utils/myFetch';


  // onMount(async ()=>{
  //   let data = await categoryApi.getMainCategories();
  //   categories = data.results;
  // })
  

  function handleCategoryClick(slug) {
    goto(`/shop/${slug}`);
  }
</script>

<section class="py-12 bg-base-200">
  <div class="text-center mb-8">
    <p class="text-primary text-sm mb-2">Our Category</p>
    <h2 class="text-2xl font-bold">CATEGORIES YOU'LL LOVE</h2>
  </div>

  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 px-4 md:px-8">
    {#each categories as category}
      <button
        on:click={() => handleCategoryClick(category.slug)}
        class="flex flex-col items-center bg-base-300 py-8 px-4 rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
      >
        <div class="w-16 h-16 flex items-center justify-center mb-4 text-gray-600">
          {@html category.icon}
        </div>
        <h3 class="text-sm font-medium text-center">{category.name}</h3>
      </button>
    {/each}
  </div>
</section>


  
  <style>
    :global(.btn) {
      text-transform: uppercase;
      font-size: 0.875rem;
    }
  </style>