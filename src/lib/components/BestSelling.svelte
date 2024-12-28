<script>
  import { onMount, onDestroy } from 'svelte';
  import { getBestSellingProducts } from '$lib/utils/product';
  import { addToCart } from '$lib/stores/cart';
  import { myFetch } from '$lib/utils/myFetch';


  import { PUBLIC_API_URL } from '$env/static/public';



  

  const products = getBestSellingProducts();
  let currentIndex = 0;
  let interval;
  
  // Show 5 products at a time
  const productsPerView = 5;
  
  // Calculate total number of possible slides
  $: maxIndex = Math.max(0, products.length - productsPerView);
  
  // Get current products to display
  $: visibleProducts = products.slice(currentIndex, currentIndex + productsPerView);
  
  // Auto scroll function
  function autoScroll() {
    currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
  }
  
  // Pause on hover
  function pauseScroll() {
    clearInterval(interval);
  }
  
  // Resume on mouse leave
  function resumeScroll() {
    interval = setInterval(autoScroll, 3000); // Scroll every 3 seconds
  }
  
  // Manual navigation
  function navigate(direction) {
    if (direction === 'prev') {
      currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
    } else {
      currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    }
  }

  async function fetchProductListings() {
    console.log(PUBLIC_API_URL);
    let url = PUBLIC_API_URL + "product/product_listings/"
    try {
        let data = await myFetch(url);
        console.log(data);
        } catch (e) { 
            console.log(e, "Error fetching data")
        } finally{
        }
  }
  
  onMount(() => {
    resumeScroll();
    fetchProductListings();
  });
  
  onDestroy(() => {
    clearInterval(interval);
  });


  function handleAddToCart(product) {
  addToCart(product);
}
</script>

<section class="bg-yellow-50 mx-auto px-4 py-12">
  <div class="text-center mb-10">
    <h3 class="text-red-500 font-medium mb-2">Our Products</h3>
    <h2 class="text-4xl font-bold text-navy-900">BEST SELLING</h2>
  </div>
  
  <div class="relative max-w-7xl mx-auto"
    on:mouseenter={pauseScroll}
    on:mouseleave={resumeScroll}
  >
    <!-- Navigation Buttons -->
    <button 
      class="absolute left-0 top-1/2  z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
      on:click={() => navigate('prev')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    
    <button 
      class="absolute right-0 top-1/2  z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
      on:click={() => navigate('next')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Products Slider -->
    <div class="overflow-hidden">
      <div 
        class="flex transition-transform duration-500 ease-in-out"
        style="transform: translateX(-{currentIndex * (100/productsPerView)}%)"
      >
        {#each products as product (product.id)}
          <div class="w-1/5 flex-shrink-0 px-3">
            <div class="bg-white rounded-lg p-4 hover:shadow-xl transition-shadow">
              <div class="relative mb-4">
                <img 
                  src={product.image} 
                  alt={product.name}
                  class="w-full h-48 object-contain"
                />
                <div class="absolute top-2 right-2 flex flex-col gap-2">
                  <button class="btn btn-circle btn-sm bg-white hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="text-center">
                <h3 class="font-medium text-sm mb-2">{product.name}</h3>
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
                <button class="btn btn-primary" on:click={() =>  handleAddToCart(product)}>ADD TO CART</button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Dots Navigation -->
    <div class="flex justify-center mt-6 gap-2">
      {#each Array(maxIndex + 1) as _, i}
        <button 
          class="w-2 h-2 rounded-full transition-colors duration-200 {currentIndex === i ? 'bg-primary' : 'bg-gray-300'}"
          on:click={() => currentIndex = i}
        />
      {/each}
    </div>
  </div>
</section>

<style>
  /* Optional: Add smooth transitions */
  .btn:hover {
    animation: float 2s ease-in-out infinite;
  }

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
</style>