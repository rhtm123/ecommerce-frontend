<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { fade, slide } from 'svelte/transition';
  import { addToCart } from '../../../lib/stores/cart.js';
  import Reviews from '$lib/components/product/Reviews.svelte';
  import  Icon  from '@iconify/svelte';
  import { myFetch } from '$lib/utils/myFetch.js';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { addAlert } from '$lib/stores/alert.js';
  import Slider from '$lib/components/Slider.svelte';


  export let data;
  const { product_listing, category } = data;
  
  let relatedProducts = [];
  let activeTab = 'DETAIL';
  let quantity = 1;
  
  console.log("product_listing",product_listing);
  // console.log(product_listing.return_exchange_policy.conditions);
  
  // Selected image state (default to main image)
  let selectedImage = product_listing.main_image;


  
  let placeholderImages = [];
  
  // Use provided images if available, otherwise use placeholders
  let images = placeholderImages;
  
  function updateQuantity(change) {
    if (change===1 && quantity >= product_listing.buy_limit) {
      addAlert("Can't add more than 10", "error");
      return;
    }
    quantity = Math.max(1, quantity + change);
  }
  
  function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  }

  function calculateDiscount(mrp, price) {
    if (!mrp || !price || mrp <= price) return null;
    return Math.round(((mrp - price) / mrp) * 100);
  }
  
  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      addToCart(product_listing);
    }
  }

  async function getProductListingImages(){
    let url = `${PUBLIC_API_URL}/product/product-listing-images/?product_listing_id=${product_listing.id}`
    let data = await myFetch(url);
    // console.log(data);

    placeholderImages = data.results.map(i => i.image); // Assign new array
    images = placeholderImages; // Trigger reactivity
  }
  
  let mainImage;
  let currentImageIndex = 0;

  // Add main image to gallery if not already included
  $: allImages = [
    product_listing.main_image,
    ...placeholderImages
  ];

  // console.log(allImages);
  $: {
    if (selectedImage) {
      currentImageIndex = allImages.indexOf(selectedImage);
    }
  }

  

  function handleImageHover(image) {
    selectedImage = image;
  }


  function nextImage() {
    if (currentImageIndex < allImages.length - 1) {
      selectedImage = allImages[currentImageIndex + 1];
    }
  }

  function prevImage() {
    if (currentImageIndex > 0) {
      selectedImage = allImages[currentImageIndex - 1];
    }
  }

  onMount(()=>{
    getProductListingImages();
    // console.log(allImages);
  })

  let pincode = '';
  let pincodeResult = '';

  async function checkPincodeAvailability() {
    if (pincode.length === 6) {
      const response = await fetch(`${PUBLIC_API_URL}/estore/delivery-pins/?page=1&page_size=10`);
      const data = await response.json();
      const pinData = data.results.find(pin => pin.pin_code === pincode);
      
      if (pinData) {
        pincodeResult = `Delivery is available in ${pinData.city}, ${pinData.state}. COD is ${pinData.cod_available ? 'available' : 'not available'}.`;
      } else {
        pincodeResult = 'Delivery is not available for this pincode.';
      }
    } else {
      pincodeResult = 'Please enter a valid 6-digit pincode.';
    }
  }

  let showModal = false;
  let returnExchangeConditions = '';

  function openModal(conditions) {
    returnExchangeConditions = conditions;
    showModal = true; // Open the modal
    console.log("Modal opened with conditions:", conditions); // Debugging line
  }

  function closeModal() {
    showModal = false; // Close the modal
    console.log("Modal closed"); // Debugging line
  }

  let reviews = [];
  let reviewsLoading = false;
  let reviewsNext = null;
  let reviewsLoaded = false;

  async function fetchReviews() {
    if (reviewsLoaded) return;
    reviewsLoading = true;
    try {
      let url = `${PUBLIC_API_URL}/review/reviews/?product_listing_id=${product_listing.id}&ordering=-id`;
      let data = await myFetch(url);
      reviews = data.results;
      reviewsNext = data.next;
      reviewsLoaded = true;
    } catch (e) {
      console.error("Error fetching reviews:", e);
    } finally {
      reviewsLoading = false;
    }
  }

  // Watch activeTab changes
  $: if (activeTab === 'REVIEWS' && !reviewsLoaded) {
    fetchReviews();
  }
</script>

<svelte:head>
  <title>Buy {product_listing.name} Online in Naigaon | Best Price & Fast Delivery</title>
  <meta name="description" content="Shop {product_listing.name} at the best price in Naigaon, and more. Fast delivery, secure payments & top-quality products!">
  <meta name="keywords" content="{product_listing.name}, buy {product_listing.name} online, {category?.name} in Naigaon, {product_listing?.brand.name} {product_listing.name}, best {product_listing.name} price, fast delivery Naigaon">
  <meta property="og:title" content="Buy {product_listing.name} Online in Naigaon | Best Price & Fast Delivery">
  <meta property="og:description" content="Get {product_listing.name} at the best price in Naigaon and more. Order now for quick delivery!">
  <meta property="og:type" content="website" />
</svelte:head>

<div class="mx-4 md:mx-8 mt-2 lg:mx-16 md:pb-0">
  <!-- Breadcrumbs -->
  <div class="text-sm breadcrumbs text-gray-600 ">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/shop">Shop</a></li>
      <li><a href="/shop/{category?.slug}">{category?.name}</a></li>
      <li>{product_listing.name}</li>
    </ul>
  </div>

  

  <!-- Product Section -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
    <!-- Product Images -->
    <div class="flex flex-col md:flex-row gap-4">
      <!-- Thumbnail Gallery - Desktop -->
      <div class="hidden md:flex flex-col gap-2 w-20">
        {#each allImages as image, i}
          <div 
            class="relative w-20 h-20 border-2 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer"
            class:border-primary={selectedImage === image}
            class:border-gray-200={selectedImage !== image}
            on:mouseenter={() => handleImageHover(image)}
          >
            <img 
              src={image || "/placeholder.svg"} 
              alt="Product thumbnail"
              class="w-full h-full object-contain"
              loading={i > 2 ? 'lazy' : 'eager'}
            />
          </div>
        {/each}
      </div>

      <!-- Mobile Slider for Images -->
      <div class="md:hidden">
        <Slider items={allImages}>
          {#each allImages as image}
            <div class="item snap-start bg-white rounded-lg p-6  transform hover:-translate-y-2 transition-transform duration-300 w-[400px] flex-shrink-0">
              <img 
                src={image || "/placeholder.svg"} 
                alt={product_listing.name}
                class="w-full h-auto"
              />
            </div>
          {/each}
        </Slider>
      </div>

      <!-- Main Image Container (Desktop Only) -->
      <div class="flex-1 relative overflow-hidden hidden md:block">
        <img 
          src={selectedImage || "/placeholder.svg"} 
          alt={product_listing.name}
          class="w-full h-auto rounded-lg"
        />
      </div>

      <!-- Magnifier Lens -->
      <div 
        class="hidden md:block absolute w-[200px] h-[200px] border-2 border-gray-200 rounded-lg pointer-events-none bg-white opacity-0 transition-opacity duration-200 hover:opacity-100"
        style="display: none;"
      >
        <div class="w-full h-full overflow-hidden rounded-lg">
          <img 
            
            src={selectedImage || "/placeholder.svg"} 
            alt={product_listing.name}
            class="w-full h-full object-contain origin-top-left"
          />
        </div>
      </div>


      {#if product_listing?.isBestSeller}
        <span class="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 text-sm rounded">
          BEST SELLER
        </span>
      {/if}
    </div>

    <!-- Product Info -->
    <div class="space-y-4">
      <!-- Product Title and Assured Badge -->
      <h1 class="text-3xl font-bold flex items-center gap-2">
        {product_listing.name}
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
          <svg class="w-3 h-3 md:w-4 md:h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
          </svg>
          Assured by NM
        </span>
      </h1>

      <!-- Add mobile sticky header
  <div class="md:hidden ">
    <h1 class="text-xl font-semibold truncate">{product_listing.name}</h1>
    <div class="flex items-center gap-2 mt-2">
      <div class="flex items-center">
        {#each Array(5) as _, i}
          <Icon 
            icon={i < Math.floor(product_listing.rating) ? "ic:baseline-star" : 
                 (i < product_listing.rating ? "ic:baseline-star-half" : "ic:baseline-star-outline")}
            class="w-4 h-4 text-yellow-400"
          />
        {/each}
      </div>
    </div>
  </div> -->
      
      <!-- Price Section -->
      <div class="flex flex-col items-center md:items-start gap-2">
        <!-- Update Price section for mobile -->
  <div class="mobile-price-stack md:flex md:items-center gap-2">
    <p class="text-2xl md:text-3xl font-bold text-primary">
      {formatPrice(product_listing.price)}
    </p>
    <div class="flex items-center gap-2">
      <span class="text-gray-500 line-through text-lg md:text-xl">
        {formatPrice(product_listing.mrp)}
      </span>
      {#if calculateDiscount(product_listing.mrp, product_listing.price)}
        <span class="text-green-600 text-lg md:text-xl font-semibold">
          Save {calculateDiscount(product_listing.mrp, product_listing.price)}%!
        </span>
      {/if}
    </div>
  </div>
        
        <!-- Rating Section -->
        <div class="flex items-center gap-2">
          <div class="flex items-center">
            {#each Array(5) as _, i}
              <Icon 
                icon={i < Math.floor(product_listing.rating) ? "ic:baseline-star" : 
                     (i < product_listing.rating ? "ic:baseline-star-half" : "ic:baseline-star-outline")}
                class="w-5 h-5 text-yellow-400"
              />
            {/each}
            <span class="ml-2 text-sm text-gray-600">
              {product_listing.rating} ({product_listing.review_count} reviews)
            </span>
          </div>
        </div>
      </div>

      <!-- Product Guarantees -->
      <!-- <div class="flex items-center justify-between border-t border-b py-4 my-4">
        <div class="flex flex-col items-center gap-2">
          <Icon icon="mdi:refresh-circle" class="w-8 h-8 text-primary" />
          <span class="text-xs text-center">10 days Return<br/>& Exchange</span>
        </div>
        
        <div class="flex flex-col items-center gap-2">
          <Icon icon="mdi:cash-multiple" class="w-8 h-8 text-primary" />
          <span class="text-xs text-center">Pay on<br/>Delivery</span>
        </div>
        
        <div class="flex flex-col items-center gap-2">
          <Icon icon="mdi:truck-delivery" class="w-8 h-8 text-primary" />
          <span class="text-xs text-center">Free<br/>Delivery</span>
        </div>
        
        <div class="flex flex-col items-center gap-2">
          <Icon icon="mdi:shield-check" class="w-8 h-8 text-primary" />
          <span class="text-xs text-center">Top<br/>Brand</span>
        </div>
        
        <div class="flex flex-col items-center gap-2">
          <Icon icon="mdi:package-variant" class="w-8 h-8 text-primary" />
          <span class="text-xs text-center">Naigaon Market<br/>Delivered</span>
        </div>
      </div> -->


      <div class="flex md:items-center md:justify-between border-t border-b py-4 my-4">
        <div class="mobile-scroll-container flex gap-6 md:gap-4 w-full md:w-auto">
          <div class="flex flex-col items-center gap-2 flex-shrink-0">
            {#if product_listing.return_exchange_policy !=null && (product_listing.return_exchange_policy.return_available || product_listing.return_exchange_policy.exchange_available) }
            <button class="" on:click={() => openModal(product_listing.return_exchange_policy.conditions)}>
              <Icon 
                icon="mdi:refresh-circle" 
                class="w-6 h-6 md:w-8 md:h-8 text-secondary cursor-pointer" 
              />
            </button>
            <span class="text-[10px] md:text-xs text-center whitespace-nowrap">
              {#if product_listing.return_exchange_policy.return_available && product_listing.return_exchange_policy.exchange_available}
              {product_listing.return_exchange_policy.exchange_days} days Return<br/> & Exchange
              {:else if product_listing.return_exchange_policy.return_available}
              {product_listing.return_exchange_policy.return_days} days Return
              {:else if product_listing.return_exchange_policy.exchange_available}
              {product_listing.return_exchange_policy.exchange_days} days Exchange
              {/if}
            </span>
            {/if}
          </div>
          
          <div class="flex flex-col items-center gap-2 flex-shrink-0">
            <Icon icon="mdi:cash-multiple" class="w-6 h-6 md:w-8 md:h-8 text-secondary" />
            <span class="text-[10px] md:text-xs text-center whitespace-nowrap">Pay on<br/>Delivery</span>
          </div>
          
          <div class="flex flex-col items-center gap-2 flex-shrink-0">
            <Icon icon="mdi:truck-delivery" class="w-6 h-6 md:w-8 md:h-8 text-secondary" />
            <span class="text-[10px] md:text-xs text-center whitespace-nowrap">Free<br/>Delivery</span>
          </div>
          
          <div class="flex flex-col items-center gap-2 flex-shrink-0">
            <Icon icon="mdi:shield-check" class="w-6 h-6 md:w-8 md:h-8 text-secondary" />
            <span class="text-[10px] md:text-xs text-center whitespace-nowrap">Top<br/>Brand</span>
          </div>
          
          <div class="flex flex-col items-center gap-2 flex-shrink-0">
            <Icon icon="mdi:package-variant" class="w-6 h-6 md:w-8 md:h-8 text-secondary" />
            <span class="text-[10px] md:text-xs text-center whitespace-nowrap">Naigaon Market<br/>Delivered</span>
          </div>
        </div>
      </div>
      <!-- Product Description -->
      <!-- <p class="text-gray-600">{product_listing.description}</p> -->

      <!-- Color Selection (if applicable) -->
      {#if product_listing.color}
        <div class="space-y-2">
          <h3 class="font-medium">COLOR</h3>
          <div class="flex gap-2">
            <button 
              class="w-8 h-8 rounded-full border-2 transition-all duration-200"
              style="background-color: {product_listing.color}"
            ></button>
          </div>
        </div>
      {/if}

      <!-- Quantity and Add to Cart -->
      <div class="flex items-center gap-4">
        <div class="flex items-center border rounded-lg">
          <button 
            class="px-4 py-2 hover:bg-base-50"
            on:click={() => updateQuantity(-1)}
          >-</button>
          <input 
            type="number" 
            bind:value={quantity}
            disabled
            class="w-16 text-center bg-inherit border-x"
            min="1"
            max="10"
          />
          <button 
            class="px-4 py-2 hover:bg-base-50"
            on:click={() => updateQuantity(1)}
          >+</button>
        </div>
        <button class="border bg-primary text-white rounded-lg px-4 py-2" on:click={handleAddToCart}>ADD TO CART</button>
      </div>

      <!-- Additional Product Info -->
      <div class="space-y-1 pt-4 border-t">
        <div class="flex gap-2">
          <span class="font-medium">SKU:</span>
          <span class="text-gray-600">NM_{product_listing.id}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium">CATEGORY:</span>
          <span class="text-gray-600">{category?.name}</span>
        </div>
        

        
        <div class="flex gap-4">
          <span class="font-medium">SHARE LINK:</span>
          <div class="flex gap-2">
            <!-- Facebook Share -->
            <a 
              href={"https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent($page.url.href)}
              target="_blank" rel="noopener noreferrer"
              class="hover:text-primary"
            >
              <Icon icon="ic:outline-facebook" class="w-5 h-5" />
            </a>
            <!-- Twitter Share -->
            <a 
              href={"https://x.com/intent/tweet?url=" + encodeURIComponent($page.url.href) + "&text=" + encodeURIComponent(product_listing.name)}
              target="_blank" rel="noopener noreferrer"
              class="hover:text-primary"
            >
              <Icon icon="pajamas:twitter" class="w-5 h-5" />
            </a>
            <!-- WhatsApp Share -->
            <a 
              href={"https://wa.me/?text=" + encodeURIComponent(product_listing.name + " " + $page.url.href)}
              target="_blank" rel="noopener noreferrer"
              class="hover:text-primary"
            >
              <Icon icon="ic:outline-whatsapp" class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- New Pin Code Check Section -->
        <div class="bg-blue-50 border px-4 py-2 rounded-lg mt-4">
          <h3 class="font-medium">Check Delivery Availability</h3>
          <div class="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Enter Pincode" 
              bind:value={pincode} 
              class="border rounded-lg p-2 w-full md:w-1/3"
              maxlength="6"
              on:input={checkPincodeAvailability}
            />
            <button 
              class="bg-primary text-white rounded-lg px-4 py-2"
              on:click={checkPincodeAvailability}
            >
              Check
            </button>
          </div>
          {#if pincodeResult}
            <p class="mt-2 text-gray-600">{pincodeResult}</p>
          {/if}
        </div>

      </div>
    </div>
  </div>

  <!-- Product Tabs Section -->
  <div class="md:my-8 my-4">
    <!-- Tab Headers -->
    <div class="flex justify-center mb-8">
      <div class="tabs tabs-boxed bg-inherit gap-2">
        <button 
          class="tab tab-lg transition-all duration-200 hover:bg-primary/10 {activeTab === 'DETAIL' ? 'tab-active bg-primary text-white' : ''}"
          on:click={() => activeTab = 'DETAIL'}
        >
          DETAIL
        </button>
        <button 
          class="tab tab-lg transition-all duration-200 hover:bg-primary/10 {activeTab === 'INFO' ? 'tab-active bg-primary text-white' : ''}"
          on:click={() => activeTab = 'INFO'}
        >
          INFO
        </button>
        <button 
          class="tab tab-lg transition-all duration-200 hover:bg-primary/10 {activeTab === 'REVIEWS' ? 'tab-active bg-primary text-white' : ''}"
          on:click={() => activeTab = 'REVIEWS'}
        >
          REVIEWS ({product_listing.review_count})
        </button>
      </div>
    </div>
  
    <!-- Tab Content -->
    <div class="" in:fade={{ duration: 300 }}>
      {#if activeTab === 'DETAIL'}
        <div class="max-w-3xl mx-auto" in:fade={{ duration: 300 }}>
          <div class="text-gray-600 prose-sm">{@html product_listing.product.description}</div>
        </div>
      {:else if activeTab === 'INFO'}
        <div class="max-w-3xl mx-auto" in:fade={{ duration: 300 }}>
          <div class="overflow-x-auto">
            <table class="table border-4 w-full">
              <tbody>
                {#if product_listing.weight}
                  <tr class="border-t">
                    <td class="font-medium text-gray-600 w-1/3 border-l">WEIGHT</td>
                    <td class=" italic text-gray-500 border-l border-r">{product_listing.weight}</td>
                  </tr>
                {/if}
                
                {#if product_listing.dimensions}
                  <tr>
                    <td class="font-medium text-gray-600 w-1/3 border-l">DIMENSIONS</td>
                    <td class="italic text-gray-500 border-l border-r">{product_listing.dimensions}</td>
                  </tr>
                {/if}
                
                {#if product_listing.color}
                  <tr>
                    <td class="font-medium text-gray-600 w-1/3 border-l">COLOR</td>
                    <td class="italic text-gray-500 border-l border-r">{product_listing.color}</td>
                  </tr>
                {/if}
                
                {#if product_listing.ageRange}
                  <tr>
                    <td class="font-medium text-gray-600 w-1/3 border-l">AGE</td>
                    <td class="italic text-gray-500 border-l border-r">{product_listing.ageRange}</td>
                  </tr>
                {/if}
                
                {#if product_listing.brand}
                  <tr>
                    <td class="font-medium text-gray-600 w-1/3 border-l">BRAND</td>
                    <td class="italic text-gray-500 border-l border-r">{product_listing.brand.name}</td>
                  </tr>
                {/if}
    
                <!-- Dynamically render any additional properties -->
                {#each Object.entries(product_listing.additionalInfo || {}) as [key, value]}
                  <tr class="border-b">
                    <td class="font-medium text-gray-600 w-1/3 border-l">{key}</td>
                    <td class="italic text-gray-500 border-l border-r">{value}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {:else}
        <div in:fade>
          <div class="overflow-x-auto max-w-3xl mx-auto">
            <Reviews 
              {product_listing}
              {reviews}
              loading={reviewsLoading}
              next={reviewsNext}
              on:loadMore={async () => {
                reviewsLoading = true;
                const dataNew = await myFetch(reviewsNext);
                reviews = [...reviews, ...dataNew.results];
                reviewsNext = dataNew.next;
                reviewsLoading = false;
              }}
            />
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Modal for Return and Exchange Conditions -->
{#if showModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h2 class="font-bold text-lg">Return & Exchange Conditions</h2>
      <div class="py-4">{@html returnExchangeConditions}</div>
      <div class="modal-action">
        <button class="btn" on:click={closeModal}>Close</button>
      </div>
    </div>
  </div>
{/if}

<style>
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  img {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
  }

  /* Smooth transitions */
  .transition-transform {
    transition: transform 0.1s ease-out;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .cursor-zoom-in {
      cursor: default;
    }
  }

  /* Prevent text selection during zoom */
  .overflow-hidden {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* Enhanced zoom functionality */
  .magnifier {
    pointer-events: none;
    z-index: 10;
  }

  /* Prevent image dragging */
  img {
    -webkit-user-drag: none;
    user-select: none;
  }

  /* Mobile touch slider */
  @media (max-width: 768px) {
    .image-slider {
      touch-action: pan-y pinch-zoom;
    }
  }

  /* Smooth transitions */
  .transition-all {
    transition: all 0.3s ease;
  }

  /* Better focus states */
  button:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  /* Mobile Specific Styles */
  @media (max-width: 768px) {
    /* Sticky header for mobile */
    .mobile-sticky-header {
      position: sticky;
      top: 0;
      background: white;
      z-index: 20;
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }

    /* Scrollable guarantee icons */
    .mobile-scroll-container {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding: 1rem 0;
    }

    .mobile-scroll-container::-webkit-scrollbar {
      display: none;
    }

    /* Sticky add to cart bar */
    .mobile-sticky-cart {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 1rem;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      z-index: 30;
    }

    /* Full width tabs */
    .mobile-tabs {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    /* Compact price display */
    .mobile-price-stack {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    /* Better touch targets */
    .mobile-touch-target {
      min-height: 44px;
      min-width: 44px;
    }
  }

  /* Add styles for the pincode check section */


  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal-content {
    background-color: white;
    z-index: 1001; /* Add this */
    position: relative; /* Add this */
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
  }
  .close {
    cursor: pointer;
    float: right;
    font-size: 20px;
  }
</style>
