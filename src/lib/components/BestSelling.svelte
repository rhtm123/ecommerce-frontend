<script>
  import { onMount } from 'svelte';
  import { getBestSellingProducts } from '$lib/utils/product';
  import { addToCart } from '$lib/stores/cart';
  import { myFetch } from '$lib/utils/myFetch';
  import { PUBLIC_API_URL } from '$env/static/public';

  const products = getBestSellingProducts();

  async function fetchProductListings() {
    let url = PUBLIC_API_URL + "/product/product_listings/";
    console.log(url);
    try {
      let data = await myFetch(url);
      console.log(data);
    } catch (e) {
      console.log(e, "Error fetching data");
    }
  }

  onMount(() => {
    fetchProductListings();
  });

  function handleAddToCart(product) {
    addToCart(product);
  }
</script>

<section class="bg-base-100 mx-auto px-4 md:px-8 py-12">
  <div class="text-center mb-10">
    <h3 class="text-secondary font-medium mb-2">Our Products</h3>
    <h2 class="text-4xl font-bold text-primary">BEST SELLING</h2>
  </div>

  <!-- Grid Layout -->
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {#each products as product (product.id)}
      <div class="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
        <figure class="">
          <img 
            src={product.image} 
            alt={product.name} 
            class="rounded-t-xl object-contain w-full" 
          />
        </figure>
        <div class="card-body items-center text-center">
          <h3 class="font-bold text-lg mb-2">{product.name}</h3>
          <div class="rating rating-sm mb-2">
            {#each Array(5) as _, i}
              <input 
                type="radio" 
                class="mask mask-star-2 bg-orange-400" 
                checked={i < product.rating} 
                disabled 
              />
            {/each}
          </div>
          <p class="text-red-500 font-bold mb-4">${product.price.toFixed(2)}</p>
          <button class="btn btn-primary" on:click={() => handleAddToCart(product)}>ADD TO CART</button>
        </div>
      </div>
    {/each}
  </div>
</section>

<style>
  .card:hover {
    transform: translateY(-5px);
    transition: transform 0.3s ease-in-out;
  }
</style>
