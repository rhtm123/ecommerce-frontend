<script>
    import { onMount } from "svelte";

   export let product_listing;
  let relatedProducts = [];
  let loadingRelatedProducts = true;
  
  async function getRelatedProducts() {
    try{
    let url = `${PUBLIC_API_URL}/product/product-listings/related/${product_listing.id}/`
    let data = await myFetch(url);
    relatedProducts = data.results;
    console.log(relatedProducts);
    } catch(e){

    }finally{
      loadingRelatedProducts = false
    }
  }

  onMount(()=>{
    getRelatedProducts();
  })

  
</script>

<div class="mx-4 md:mx-8 lg:mx-16 mt-12 mb-8">
    <h2 class="text-2xl font-bold text-primary mb-6">Related Products</h2>
    
    {#if loadingRelatedProducts}
      <div class="flex justify-center items-center py-8">
        <div class="loading loading-spinner loading-sm"></div>
      </div>
    {:else if relatedProducts.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {#each relatedProducts as product (product.id)}
          <Product product={product} />
        {/each}
      </div>
    {:else}
      <div class="text-center py-8 text-gray-500">
        No related products found
      </div>
    {/if}
  </div>
