<script>
  import { getAllCategories } from '$lib/utils/product';
  import { goto } from '$app/navigation';
  
  const categories = getAllCategories();

  function handleCategoryClick(slug) {
    goto(`/shop/${slug}`);
  }
</script>

<section class="py-12 bg-yellow-50">
  <div class="text-center mb-8">
    <p class="text-red-500 text-sm mb-2">Our Category</p>
    <h2 class="text-2xl font-bold text-[#2D2D2D]">CATEGORIES YOU'LL LOVE</h2>
  </div>

  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 px-4">
    {#each categories as category}
      <button
        on:click={() => handleCategoryClick(category.slug)}
        class="flex flex-col items-center bg-amber-100 p-4 rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
      >
        <div class="w-16 h-16 flex items-center justify-center mb-4 text-gray-600">
          {@html category.icon}
        </div>
        <h3 class="text-sm font-medium text-center">{category.name}</h3>
        <p class="text-xs text-gray-500">{category.products} Products</p>
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