<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { fade, slide } from 'svelte/transition';
  import { addToCart, cart } from '../../../lib/stores/cart.js';
  import  Icon  from '@iconify/svelte';
  import { myFetch } from '$lib/utils/myFetch.js';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { addAlert } from '$lib/stores/alert.js';
  import Slider from '$lib/components/Slider.svelte';
  import { user } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';


  export let data;

  let product_listing;
  let category;

  $: if (data) {
        ({ product_listing, category } = data);
  }
  
  
  let activeTab = 'DETAIL';
  
  // console.log(product_listing.return_exchange_policy.conditions);
  
  // Selected image state (default to main image)
  $: selectedImage = product_listing?.main_image;


  
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
  
  // function handleAddToCart() {
  //   for (let i = 0; i < quantity; i++) {
  //     addToCart(product_listing);
  //   }
  // }

  $: cartItem = $cart.find(item => item.id === product_listing.id);
  $: quantity = cartItem ? cartItem.quantity : 0;
  $: showQtyControls = quantity>0?true:false;



  function handleAddToCart() {
    addToCart(product_listing);
    quantity = 1;
  }

  function handleIncrement() {

    if (quantity < 10) {
      if (quantity >= product_listing.stock) {
        addAlert("No more stock available", "error");
        return;
      }
      cart.update(items => items.map(item => item.id === product_listing.id ? { ...item, quantity: item.quantity + 1 } : item));
    }

  }
  
  function handleDecrement() {

    if (quantity > 1) {
      cart.update(items => items.map(item => item.id === product_listing.id ? { ...item, quantity: item.quantity - 1 } : item));
    }

  }
  
  function handleRemove() {
    cart.update(items => items.filter(item => item.id !== product_listing.id));
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

  let RelatedProducts;
  let Reviews;
  let Variants;
  let AvailabilityCheck;
  let ProductOffers;
  // let Qna;


  onMount( () => {
    
    getProductListingImages();

    RelatedProducts = import('$lib/components/product/RelatedProducts.svelte');
    Reviews = import('$lib/components/product/Reviews.svelte');
    Variants = import('$lib/components/product/Variants.svelte');
    AvailabilityCheck = import('$lib/components/product/AvailabilityCheck.svelte');
    ProductOffers = import('$lib/components/product/ProductOffers.svelte');



    // Qna = import('$lib/components/product/Qna.svelte');


  });

 

  let showModal = false;
  let returnExchangeConditions = '';

  function openModal(conditions) {
    returnExchangeConditions = conditions;
    showModal = true; // Open the modal
    // console.log("Modal opened with conditions:", conditions); // Debugging line
  }

  function closeModal() {
    showModal = false; // Close the modal
    // console.log("Modal closed"); // Debugging line
  }



  let isExpanded = false;



  
</script>

<svelte:head>
  <title>Buy {product_listing.name} Online in Naigaon | Best Price & Fast Delivery</title>
  <meta name="description" content="Shop {product_listing.name} at the best price in Naigaon, and more. Fast delivery, secure payments & top-quality products!">
  <meta name="keywords" content="{product_listing.name}, buy {product_listing.name} online, {category?.name} in Naigaon, {product_listing?.brand?.name} {product_listing.name}, best {product_listing.name} price, fast delivery in Naigaon">
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
      <!-- <div 
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
      </div> -->


      <!-- {#if product_listing?.isBestSeller}
        <span class="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 text-sm rounded">
          BEST SELLER
        </span>
      {/if} -->
    </div>

    <!-- Product Info -->
    <div class="space-y-4">
      <!-- Product Title and Assured Badge -->
      <h1 class="text-4xl font-bold flex items-center gap-2">
        {product_listing.name}
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
          <svg class="w-3 h-3 md:w-4 md:h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
          </svg>
          Assured by NM
        </span>
      </h1>

    
      
      <!-- Price Section -->
      
      <div class="flex flex-col md:flex-row md:items-center md:gap-6">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <p class="text-2xl font-bold text-gray-900">
              {formatPrice(product_listing.price)}
            </p>

            <span class="text-gray-500 line-through text-lg">
              {formatPrice(product_listing.mrp)}
            </span>

            {#if calculateDiscount(product_listing.mrp, product_listing.price)}
              <span class="text-green-600 font-semibold text-lg">
                {calculateDiscount(product_listing.mrp, product_listing.price)}% OFF
              </span>
            {/if}
            
          </div>
          <div class="flex items-center gap-2">
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


      <!-- Variants and Offers -->
  <div class="space-y-4">
    {#if Variants}
      {#await Variants then { default: Variants }}
        <Variants product_listing={product_listing} />
      {/await}
    {/if}

    {#if ProductOffers}
      {#await ProductOffers then { default: ProductOffers }}
        <ProductOffers product_listing={product_listing} />
      {/await}
    {/if}
  </div>


  <!-- Product Guarantees -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-200">
    {#if product_listing.return_exchange_policy !=null && (product_listing.return_exchange_policy.return_available || product_listing.return_exchange_policy.exchange_available)}
      <div class="flex flex-col items-center gap-2">
        <button on:click={() => openModal(product_listing.return_exchange_policy.conditions)}>
          <Icon icon="mdi:refresh-circle" class="w-8 h-8 text-blue-600" />
        </button>
        <span class="text-xs text-gray-600 text-center">
          {#if product_listing.return_exchange_policy.return_available && product_listing.return_exchange_policyexchange_available}
            {product_listing.return_exchange_policy.exchange_days} days Return & Exchange
          {:else if product_listing.return_exchange_policy.return_available}
            {product_listing.return_exchange_policy.return_days} days Return
          {:else if product_listing.return_exchange_policy.exchange_available}
            {product_listing.return_exchange_policy.exchange_days} days Exchange
          {/if}
        </span>
      </div>
    {/if}
    <div class="flex flex-col items-center gap-2">
      <Icon icon="mdi:cash-multiple" class="w-8 h-8 text-blue-600" />
      <span class="text-xs text-gray-600 text-center">Pay on Delivery</span>
    </div>
    <div class="flex flex-col items-center gap-2">
      <Icon icon="mdi:truck-delivery" class="w-8 h-8 text-blue-600" />
      <span class="text-xs text-gray-600 text-center">Free Delivery</span>
    </div>
    <div class="flex flex-col items-center gap-2">
      <Icon icon="mdi:shield-check" class="w-8 h-8 text-blue-600" />
      <span class="text-xs text-gray-600 text-center">Top Brand</span>
    </div>

  </div>

      

  {#if product_listing.stock && product_listing.stock > 0}
  <div class="flex items-center gap-4">
    {#if showQtyControls}
      <div class="inline-flex items-center border border-gray-300 rounded-full p-1.5 bg-white shadow-sm">
        <button
          class="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
          on:click={quantity > 1 ? handleDecrement : handleRemove}
          aria-label={quantity === 1 ? 'Remove item from cart' : 'Decrease quantity'}
        >
          {#if quantity === 1}
            <Icon icon="mdi:delete-outline" class="text-red-500 h-6 w-6" />
          {:else}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
            </svg>
          {/if}
        </button>
        <span class="font-bold text-gray-900 min-w-[2.5rem] text-center text-lg">{quantity}</span>
        <button
          class="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
          on:click={handleIncrement}
          disabled={quantity >= 10}
          aria-label="Increase quantity"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </button>
      </div>
    {:else}
      <button
        class="relative w-full md:w-auto bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-500 hover:to-green-500 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 overflow-hidden"
        on:click={handleAddToCart}
      >
        <span class="relative z-10">Add to Cart</span>
        <span class="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></span>
        <span class="absolute inset-0 animate-pulse bg-white opacity-5 rounded-full"></span>
      </button>
    {/if}
  </div>

      {#if AvailabilityCheck}
          {#await AvailabilityCheck then { default: AvailabilityCheck }}
            <AvailabilityCheck product_listing={product_listing} />
          {/await}
      {/if}
        
{:else}
  <div class="text-red-600 font-semibold text-lg animate-pulse">Out of Stock</div>
{/if}




      <!-- Additional Product Info -->

      <div class="space-y-4 pt-4 border-t border-gray-200">
        <div class="flex items-center gap-4">
          <span class="font-medium text-gray-700">Share:</span>
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

        
      </div>
      
    </div>
  </div>

  <!-- Product Tabs Section -->
  <div class="md:my-8 my-4">
    <!-- Tab Headers -->
    <div class="flex justify-center mb-4">
      <div class="tabs tabs-boxed bg-inherit gap-2 flex-nowrap overflow-x-auto">
        <button 
          class="tab tab-lg inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 hover:bg-primary/10 {activeTab === 'DETAIL' ? 'tab-active bg-primary text-white' : ''}"
          on:click={() => activeTab = 'DETAIL'}
        >
          DETAIL
        </button>
        <button 
          class="tab tab-lg inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 hover:bg-primary/10 {activeTab === 'INFO' ? 'tab-active bg-primary text-white' : ''}"
          on:click={() => activeTab = 'INFO'}
        >
          INFO
        </button>
        <!-- <button 
          class="tab tab-lg inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 hover:bg-primary/10 {activeTab === 'QNA' ? 'tab-active bg-primary text-white' : ''}"
          on:click={() => activeTab = 'QNA'}
        >
          <span>Q&A</span>
          
        </button> -->
        <button 
          class="tab tab-lg inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 hover:bg-primary/10 {activeTab === 'REVIEWS' ? 'tab-active bg-primary text-white' : ''}"
          on:click={() => activeTab = 'REVIEWS'}
        >
          <span>REVIEWS</span>
          {#if product_listing.review_count > 0}
            <span class="ml-1">({product_listing.review_count})</span>
          {/if}
        </button>
      </div>
    </div>
  
    <!-- Tab Content -->
    <div class="" in:fade={{ duration: 300 }}>
      {#if activeTab === 'DETAIL'}
        <div class="max-w-3xl mx-auto" in:fade={{ duration: 300 }}>
          <div class="text-gray-600 prose-sm description-container">
            <div class="description-text" class:expanded={isExpanded}>
              {@html product_listing.product.description}
            </div>
            <!-- Show More button only on mobile when text is truncated -->
            <button 
              class="show-more-btn md:hidden"
              on:click={() => isExpanded = !isExpanded}
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          </div>
        </div>
      {:else if activeTab === 'INFO'}

      
        <div class="max-w-3xl mx-auto" in:fade={{ duration: 300 }}>
          <div class="overflow-x-auto">
            <table class="table border-4 w-full">
              <tbody>
                <!-- {#if product_listing.weight}
                  <tr class="border-t">
                    <td class="font-medium text-gray-600 w-1/3 border-l">WEIGHT</td>
                    <td class=" italic text-gray-500 border-l border-r">{product_listing.weight}</td>
                  </tr>
                {/if} -->
                
                <!-- {#if product_listing.dimensions}
                  <tr>
                    <td class="font-medium text-gray-600 w-1/3 border-l">DIMENSIONS</td>
                    <td class="italic text-gray-500 border-l border-r">{product_listing.dimensions}</td>
                  </tr>
                {/if} -->
                
                <!-- {#if product_listing.color}
                  <tr>
                    <td class="font-medium text-gray-600 w-1/3 border-l">COLOR</td>
                    <td class="italic text-gray-500 border-l border-r">{product_listing.color}</td>
                  </tr>
                {/if} -->
                
         
                
                {#if product_listing.brand}
                  <tr>
                    <td class="font-medium text-gray-600 w-1/3 border-l">BRAND</td>
                    <td class="italic text-gray-500 border-l border-r">{product_listing.brand.name}</td>
                  </tr>
                {/if}

                <tr>

                  <td class="font-medium text-gray-600 w-1/3 border-l">SKU</td>
                  <td class="italic text-gray-500 border-l border-r">KB_{product_listing.id}</td>

                </tr>

                <tr>

                  <td class="font-medium text-gray-600 w-1/3 border-l">CATEGORY</td>
                  <td class="italic text-gray-500 border-l border-r">{category?.name}</td>
                  
                </tr>

    
                <!-- Dynamically render any additional properties -->
                <!-- {#each Object.entries(product_listing.additionalInfo || {}) as [key, value]}
                  <tr class="border-b">
                    <td class="font-medium text-gray-600 w-1/3 border-l">{key}</td>
                    <td class="italic text-gray-500 border-l border-r">{value}</td>
                  </tr>
                {/each} -->
              </tbody>
            </table>
          </div>
        </div>

      <!-- {:else if activeTab === 'QNA'}
        
        {#if Qna}
              {#await Qna then { default: Qna }}
                <Qna product_listing={product_listing} />
              {/await}
            {/if} -->
      {:else}
        <div in:fade>
          <div class="overflow-x-auto max-w-3xl mx-auto">
            

            {#if Reviews}
              {#await Reviews then { default: Reviews }}
                <Reviews product_listing={product_listing} />
              {/await}
            {/if}


          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Related Products Section -->

  {#if RelatedProducts}
    {#await RelatedProducts then { default: RelatedProducts }}
      <RelatedProducts product_listing={product_listing} />
    {/await}
  {/if}

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
  }

  /* Smooth transitions */
  .transition-transform {
    transition: transform 0.1s ease-out;
  }

  /* Prevent text selection during zoom */
  .overflow-hidden {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }


  /* Prevent image dragging */
  img {
    -webkit-user-drag: none;
    user-select: none;
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


    /* Compact price display */
    .mobile-price-stack {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
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

  /* Custom styles for Q&A section */
  .qna-container {
    max-width: 800px;
    margin: 0 auto;
  }

  .question-card {
    transition: all 0.3s ease;
  }

  .question-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .qna-container {
      padding: 0 1rem;
    }

    .textarea {
      font-size: 0.9rem;
    }

    .btn {
      padding: 0.5rem 1rem;
    }

    .avatar {
      width: 2rem;
      height: 2rem;
    }
  }

  /* Mobile tab improvements */
  @media (max-width: 768px) {
    .tabs {
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding: 0.5rem;
      display: flex;
      align-items: center;
    }
    
    .tabs::-webkit-scrollbar {
      display: none;
    }
    
    .tab {
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
      height: auto;
      min-height: 2.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  }

  /* Description text container styles */
  @media (max-width: 768px) {
    .description-container {
      position: relative;
    }

    .description-text {
      max-height: 300px; /* Adjust this value as needed */
      overflow: hidden;
      position: relative;
      transition: max-height 0.3s ease-out;
    }

    .description-text::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100px;
      background: linear-gradient(to bottom, transparent, white);
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .description-text.expanded {
      max-height: none;
    }

    .description-text.expanded::after {
      opacity: 0;
    }

    .show-more-btn {
      width: 100%;
      padding: 0.5rem;
      text-align: center;
      color: var(--primary-color);
      font-weight: 500;
      background: white;
      border: none;
      cursor: pointer;
      transition: color 0.2s ease;
      margin-top: 0.5rem;
    }

    .show-more-btn:hover {
      color: var(--primary-color-dark);
    }
  }

  /* Add these styles for better mobile responsiveness */
  @media (max-width: 768px) {
    .input-sm {
      font-size: 0.875rem;
    }
    
    .btn-sm {
      font-size: 0.875rem;
    }
  }
</style>
