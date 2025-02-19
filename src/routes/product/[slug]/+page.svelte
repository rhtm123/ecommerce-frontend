<script>
  import { page } from '$app/stores';
  import { fade, slide } from 'svelte/transition';
  import { addToCart } from '../../../lib/stores/cart.js';
  import Reviews from '$lib/components/product/Reviews.svelte';
  
  import  Icon  from '@iconify/svelte';


  export let data;
  const { product_listing, category } = data;
  
  let relatedProducts = [];
  let activeTab = 'DESCRIPTION';
  let quantity = 1;
  
  console.log(product_listing);
  
  // Selected image state (default to main image)
  let selectedImage = product_listing.main_image;
  
  // Fallback placeholder images (if product_listing.images is empty)
  let placeholderImages = [
    "https://placehold.co/600x600?text=Image+1",
    "https://placehold.co/600x600?text=Image+2",
    "https://placehold.co/600x600?text=Image+3"
  ];
  
  // Use provided images if available, otherwise use placeholders
  let images =
    product_listing.images && product_listing.images.length > 0
      ? product_listing.images
      : placeholderImages;
  
  function updateQuantity(change) {
    quantity = Math.max(1, quantity + change);
  }
  
  function formatPrice(price) {
    return `₹ ${price.toFixed(2)}`;
  }
  
  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      addToCart(product_listing);
    }
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

<div class="mx-4 md:mx-8">
  <!-- Breadcrumbs -->
  <div class="text-sm breadcrumbs text-gray-600">
    <ul>
      <li><a href="/home">Home</a></li>
      <li><a href="/shop">Shop</a></li>
      <li><a href="/shop/{category?.slug}">{category?.name}</a></li>
      <li>{product_listing.name}</li>
    </ul>
  </div>

  <!-- Product Section -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
    <!-- Product Images -->
    <div class="space-y-4">
      <!-- Main Image -->
      <div class="relative rounded-lg" in:fade>
        <img 
          src={selectedImage} 
          alt={product_listing.name}
          class="w-full h-auto object-contain rounded-lg"
        />
        {#if product_listing?.isBestSeller}
          <span class="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 text-sm rounded">
            BEST SELLER
          </span>
        {/if}
      </div>
      
      <!-- Thumbnail Images -->
      <div class="flex gap-4">
        {#each images as image}
          <button 
            class="w-24 h-24 border-2 rounded-lg overflow-hidden transition-all duration-200"
            class:border-primary={selectedImage === image}
            class:border-gray-200={selectedImage !== image}
            on:click={() => selectedImage = image}
          >
            <img 
              src={image} 
              alt="Product thumbnail"
              class="w-full h-full object-cover"
            />
          </button>
        {/each}
      </div>
    </div>

    <!-- Product Info -->
    <div class="space-y-6">
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
      
      <!-- Price -->
      <div class="flex items-center gap-2">
        <span class="text-2xl font-bold text-primary">{formatPrice(product_listing.price)}</span>
      </div>

      <!-- Product Guarantees -->
      <div class="flex flex-wrap gap-4">
        <!-- Same Day Delivery Badge -->
        <div class="flex items-center badge">
          <!-- Replace with a proper truck icon if available -->
          <svg class="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 5h14v14H5z" />
          </svg>
          <span>Same Day Delivery</span>
        </div>
        <!-- Cash on Delivery Badge -->
        <div class="flex items-center badge ">
          <!-- Replace with a cash/money icon if available -->
          <svg class="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 5h14v14H5z" />
          </svg>
          <span>Cash on Delivery</span>
        </div>
      </div>

      <!-- Product Description -->
      <p class="text-gray-600">{product_listing.description}</p>

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
            class="w-16 text-center bg-inherit border-x"
            min="1"
          />
          <button 
            class="px-4 py-2 hover:bg-base-50"
            on:click={() => updateQuantity(1)}
          >+</button>
        </div>
        <button class="btn btn-primary" on:click={handleAddToCart}>ADD TO CART</button>
      </div>

      <!-- Additional Product Info -->
      <div class="space-y-4 pt-4 border-t">
        <div class="flex gap-2">
          <span class="font-medium">SKU:</span>
          <span class="text-gray-600">{product_listing.id}</span>
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
            <!-- Instagram (Link to your profile, as Instagram doesn't support direct sharing) -->
            

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
  <div class="mt-16">
    <!-- Tab Headers -->
    <div class="flex justify-center mb-8">
      <div class="tabs tabs-boxed bg-inherit gap-2">
        <button 
          class="tab tab-lg transition-all duration-200 hover:bg-primary/10 {activeTab === 'DESCRIPTION' ? 'tab-active bg-primary text-white' : ''}"
          on:click={() => activeTab = 'DESCRIPTION'}
        >
          DESCRIPTION
        </button>
        <button 
          class="tab tab-lg transition-all duration-200 hover:bg-primary/10 {activeTab === 'ADDITIONAL INFORMATION' ? 'tab-active bg-primary text-white' : ''}"
          on:click={() => activeTab = 'ADDITIONAL INFORMATION'}
        >
          ADDITIONAL INFORMATION
        </button>
        <button 
          class="tab tab-lg transition-all duration-200 hover:bg-primary/10 {activeTab === 'REVIEWS' ? 'tab-active bg-primary text-white' : ''}"
          on:click={() => activeTab = 'REVIEWS'}
        >
          REVIEWS
        </button>
      </div>
    </div>
  
    <!-- Tab Content -->
    <div class="py-8" in:fade={{ duration: 300 }}>
      {#if activeTab === 'DESCRIPTION'}
        <div class="max-w-3xl mx-auto" in:fade={{ duration: 300 }}>
          <p class="text-gray-600">{product_listing.product.description}</p>
        </div>
      {:else if activeTab === 'ADDITIONAL INFORMATION'}
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
            <Reviews product_listing={product_listing} />
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>
