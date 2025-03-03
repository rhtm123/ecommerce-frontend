<script>
  // import { onMount } from 'svelte';
  import { addToCart } from '../stores/cart';
  // import { myFetch } from '$lib/utils/myFetch';
  // import { PUBLIC_API_URL } from '$env/static/public';

  import Product from './product/Product.svelte';  
  import Slider from './Slider.svelte';

  export let products;

  // let loading = true;

  // async function fetchProductListings() {
  //   let url = PUBLIC_API_URL + "/product/product-listings/?page=1&page_size=12&ordering=-id";
  //   console.log(url);
  //   try {
  //     let data = await myFetch(url);
  //     // console.log(data);
  //     products = data.results;
      

  //   } catch (e) {
  //     console.log(e, "Error fetching data");
  //   }
  //   finally {
  //     loading = false;
  //   }
  // }

  

  // onMount(() => {
  //   fetchProductListings();
  // });

  function handleAddToCart(product) {
    addToCart(product);
  }

</script>

<section class="bg-base-100 mx-auto px-4 md:px-8 lg:px-16 py-12">
  <div class="text-center mb-10">
    <h3 class="text-secondary font-medium mb-2">Our Products</h3>
    <h2 class="text-4xl font-bold text-primary">What's New?</h2>
  </div>

  <Slider items={products} let:items>
    {#each products as product (product.id)}
      <div class="item w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex-shrink-0">
        <Product product={product} />
      </div>
    {/each}
  </Slider>

  <!-- {#if loading}
    <div class="p-4">
    <div class="loading loading-spinner loading-sm"></div>
    </div>
  {/if} -->
</section>

<style>
  .card:hover {
    transform: translateY(-5px);
    transition: transform 0.3s ease-in-out;
  }
</style>
