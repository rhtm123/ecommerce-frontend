<script>
  import { onMount } from 'svelte';
  import { getBestSellingProducts } from '$lib/utils/product';
  import { addToCart } from '../stores/cart';
  import { myFetch } from '$lib/utils/myFetch';
  import { PUBLIC_API_URL } from '$env/static/public';

  import Product from './Product.svelte';

  let products = [];

  async function fetchProductListings() {
    let url = PUBLIC_API_URL + "/product/product_listings/?page=1&page_size=24&ordering=-popularity";
    console.log(url);
    try {
      let data = await myFetch(url);
      // console.log(data);
      products = data.results;

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
    <Product product={product} />
    {/each}
  </div>
</section>

<style>
  .card:hover {
    transform: translateY(-5px);
    transition: transform 0.3s ease-in-out;
  }
</style>
