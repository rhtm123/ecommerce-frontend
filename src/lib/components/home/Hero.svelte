<script>
  
  import { onMount } from 'svelte';
  import { addToCart } from '../../stores/cart';
  import { myFetch } from '$lib/utils/myFetch';
  import { PUBLIC_API_URL } from '$env/static/public';

  import Product from '../Product.svelte';
  import { slide } from 'svelte/transition';

  let slides = [];

  async function fetchProductListings() {
    let url = PUBLIC_API_URL + "/product/product_listings/?page=1&page_size=5&featured=true&ordering=-popularity";
    // console.log(url);
    try {
      let data = await myFetch(url);
      // console.log(data);
      slides = data.results;
      console.log(slides);

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


  
  let currentSlide = 0;
  // slides = [
  //   {
  //     image: 'https://prod-cdn-thekrazycouponlady.imgix.net/wp-content/uploads/2022/05/bluey-toys-target-2022-10-1653246893-1653246893.jpg?auto=compress',
  //     name: 'Creative Toys',
  //     description: 'Unleash creativity with toys that make learning fun!'
  //   },
  //   {
  //     image: 'https://s.hdnux.com/photos/01/26/51/40/22714424/4/1200x0.jpg',
  //     name: 'Interactive Learning',
  //     description: 'Engage young minds with interactive and educational toys.'
  //   },
  //   {
  //     image: 'https://th.bing.com/th/id/R.a8f6a604a36d1c2d2d0a0f5b6e47453f?rik=6syH0qNgEawdyw&riu=http%3a%2f%2fretrododo.com%2fwp-content%2fuploads%2f2022%2f08%2fbest-70s-toys-of-all-time.jpg&ehk=uYKedTboNLjOpnev3rpsMyoER61LVCqlA5%2fPgAY%2bk94%3d&risl=&pid=ImgRaw&r=0',
  //     name: 'Classic Toys',
  //     description: 'Revisit timeless classics that spark joy and imagination.'
  //   }
  // ];

  let interval;

  onMount(() => {
    interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  });

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  }
</script>

<div class="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center bg-base-100 overflow-hidden">
  <div class="container mx-auto px-4 md:px-8 flex flex-col-reverse md:flex-row items-center">
    
    {#if slides.length > 0}
    <div class="text-center md:text-left space-y-4 md:w-1/2">

      <h2 class="text-primary text-2xl md:text-4xl font-bold">{slides[currentSlide].name}</h2>
      <p class="text-gray-600 text-lg md:text-xl">{slides[currentSlide].description}</p>
      <a href={"/shop/"+slides[currentSlide].slug}>
      <button class="btn btn-primary rounded-full px-6 py-3 text-lg">SHOP NOW</button>
    </a>
    </div>
    {/if}

    <div class="relative md:w-1/2 flex items-center justify-center">
      {#each slides as slide, i}
        <!-- <p>{JSON.stringify(slide)}</p> -->
        <img 
          src={slide?.main_image} 
          alt={slide?.name} 
          class="absolute w-full h-auto max-w-sm md:max-w-md object-cover rounded-lg shadow-lg transition-opacity duration-700" 
          style="opacity: {currentSlide === i ? '1' : '0'};"
        />
      {/each}
    </div>
  </div>

  <!-- Navigation Arrows -->
  <div class="absolute inset-x-0 bottom-4 flex justify-center space-x-4">
    <button class="btn btn-circle btn-sm btn-outline" on:click={prevSlide}>❮</button>
    <button class="btn btn-circle btn-sm btn-outline" on:click={nextSlide}>❯</button>
  </div>
</div>

<style>
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  :global(img) {
    animation: fadeIn 1s ease-in-out;
  }
</style>
