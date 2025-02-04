<script>
    import { page } from '$app/stores';
    import { fade, slide } from 'svelte/transition';
    import { addToCart } from '../../../lib/stores/cart.js';
    // export let data;
    //  const { product, relatedProducts } = data;
     
    
    // Get product data from page data
    export let data;
    const { product, category } = data;

    let relatedProducts = [];
    
    // Tabs state
    let activeTab = 'DESCRIPTION';
    
    // Quantity state
    let quantity = 1;

    console.log(product);
    
    // Selected image state (using the first image as default)
    let selectedImage = product.image;
    
    // Handle quantity changes
    function updateQuantity(change) {
      quantity = Math.max(1, quantity + change);
    }
  
    function formatPrice(price) {
      return `₹ ${price.toFixed(2)}`;
    }


    function handleAddToCart() {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    }

    async function fetchProductImages(){

    }


  


  </script>

<svelte:head>
  <title>Buy {product.name} Online in Naigaon | Best Price & Fast Delivery</title>
  <meta name="description" content="Shop {product.name} at the best price in Naigaon, and more. Fast delivery, secure payments & top-quality products!">

  <meta name="keywords" content="{product.name}, buy {product.name} online, {category?.name} in Naigaon, {product?.brand.name} {product.name}, best {product.name} price, fast delivery Naigaon">

  <meta property="og:title" content="Buy {product.name} Online in Naigaon | Best Price & Fast Delivery">
  <meta property="og:description" content="Get {product.name} at the best price in Naigaon and more. Order now for quick delivery!">

  <!-- {Short Feature 1}, {Short Feature 2}, -->
  <!-- <meta property="og:image" content="/path/to/your/image.jpg" /> -->
  <!-- <meta property="og:url" content="https://www.codingchaskalab.com" /> -->
  <meta property="og:type" content="website" />
</svelte:head>

  <div class="mx-4 md:mx-8">

    <div class="text-sm breadcrumbs text-gray-600">
      <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/shop">Shop</a></li>
          <li><a href="/shop/{category?.slug}">{category?.name}</a></li>
          <li>{product.name}</li>
        </ul>
  </div>

  
    <!-- Product Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
      <!-- Product Images -->
      <div class="space-y-4">
        <!-- Main Image -->
        <div class="relative rounded-lg" in:fade>
          <img 
            src={product?.main_image} 
            alt={product.name}
            class="w-full h-auto object-contain rounded-lg"
          />
          {#if product?.isBestSeller}
            <span class="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 text-sm rounded">
              BEST SELLER
            </span>
          {/if}
        </div>
        
        <!-- Thumbnail Images (if multiple images available) -->
        {#if product.images && product.images.length > 0}
          <div class="flex gap-4">
            {#each product.images as image}
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
        {/if}
      </div>
  
      <!-- Product Info -->
      <div class="space-y-6">
        <h1 class="text-3xl font-bold">{product.name}</h1>
        
        <!-- Price -->
        <div class="flex items-center gap-2">
          <span class="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
        </div>
  
        <!-- Description -->
        <p class="text-gray-600">{product.description}</p>
  
        <!-- Color Selection -->
        {#if product.color}
          <div class="space-y-2">
            <h3 class="font-medium">COLOR</h3>
            <div class="flex gap-2">
              <button 
                class="w-8 h-8 rounded-full border-2 transition-all duration-200"
                style="background-color: {product.color}"
              ></button>
            </div>
          </div>
        {/if}
  
        <!-- Age Selection -->
        <!-- <div class="space-y-2 bg-inherit">
          <h3 class="font-medium">AGE</h3>
          <select class="select select-bordered text-base-200 bg-inherit w-full max-w-xs">
            <option>{product.ageRange}</option>
          </select>
        </div> -->
  
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
  
        <!-- Additional Info -->
        <div class="space-y-4 pt-4 border-t">
          <div class="flex gap-2">
            <span class="font-medium">SKU:</span>
            <span class="text-gray-600">{product.id}</span>
          </div>
          <div class="flex gap-2">
            <span class="font-medium">CATEGORY:</span>
            <span class="text-gray-600">{category?.name}</span>
          </div>
          <div class="flex gap-4">
            <span class="font-medium">SHARE LINK:</span>
            <div class="flex gap-2">
              <a href="#" class="hover:text-primary"><i class="fab fa-facebook"></i></a>
              <a href="#" class="hover:text-primary"><i class="fab fa-twitter"></i></a>
              <a href="#" class="hover:text-primary"><i class="fab fa-instagram"></i></a>
              <a href="#" class="hover:text-primary"><i class="fab fa-pinterest"></i></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Product Tabs -->
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
            REVIEWS (0)
          </button>
        </div>
      </div>
  
      <!-- Tab Content -->
      <div class="py-8" in:fade={{ duration: 300 }}>
        {#if activeTab === 'DESCRIPTION'}
          <div class="max-w-3xl mx-auto" in:fade={{ duration: 300 }}>
            <p class="text-gray-600">{product.product.description}</p>
          </div>
        {:else if activeTab === 'ADDITIONAL INFORMATION'}
          <div class="max-w-3xl mx-auto" in:fade={{ duration: 300 }}>
            <div class="overflow-x-auto">
              <table class="table border-4 w-full">
                <tbody>
                  {#if product.weight}
                    <tr class="border-t">
                        <td class="font-medium text-gray-600 w-1/3 border-l">WEIGHT</td>
                        <td class=" italic text-gray-500 border-l border-r">{product.weight}</td>
                      </tr>
                  {/if}
                  
                  {#if product.dimensions}
                    <tr>
                      <td class="font-medium text-gray-600 w-1/3 border-l">DIMENSIONS</td>
                      <td class="italic text-gray-500 border-l border-r">{product.dimensions}</td>
                    </tr>
                  {/if}
                  
                  {#if product.color}
                    <tr>
                      <td class="font-medium text-gray-600 w-1/3 border-l">COLOR</td>
                    <td class="italic text-gray-500 border-l border-r">{product.color}</td>
                    </tr>
                  {/if}
                  
                  {#if product.ageRange}
                    <tr>
                      <td class="font-medium text-gray-600 w-1/3 border-l">AGE</td>
                      <td class="italic text-gray-500 border-l border-r">{product.ageRange}</td>
                    </tr>
                  {/if}
                  
                  {#if product.brand}
                    <tr>
                      <td class="font-medium text-gray-600 w-1/3 border-l">BRAND</td>
                      <td class="italic text-gray-500 border-l border-r">{product.brand.name}</td>
                    </tr>
                  {/if}
      
                  <!-- Dynamically render any additional properties -->
                  {#each Object.entries(product.additionalInfo || {}) as [key, value]}
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
            <div class="overflow-x-auto">
              <table class="w-full">
                <tbody>
                  <tr>
                    <td class="bg-gray-50 py-3 px-4 font-medium text-gray-600 w-1/4">REVIEWS</td>
                    <td class="py-3 px-4 text-gray-600">
                      <p class="italic">There are no reviews yet.</p>
                      <div class="mt-4">
                        <p class="font-medium mb-2">BE THE FIRST TO REVIEW "{product.name}"</p>
                        <p class="text-sm text-gray-500 mb-4">
                          Your email address will not be published. Required fields are marked *
                        </p>
                        
                        <!-- Rating Input -->
                        <div class="mb-4">
                          <p class="font-medium mb-2">Your Rating *</p>
                          <div class="rating rating-lg">
                            {#each Array(5) as _, i}
                              <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" value={i + 1}/>
                            {/each}
                          </div>
                        </div>
      
                        <!-- Review Form -->
                        <form class="space-y-4">
                          <div>
                            <label class="font-medium block mb-1">Your Review *</label>
                            <textarea 
                              class="textarea bg-inherit textarea-bordered w-full h-32" 
                              required
                            ></textarea>
                          </div>
                          
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label class="font-medium bg-inherit block mb-1">Name *</label>
                              <input 
                                type="text" 
                                class="input bg-inherit input-bordered w-full" 
                                required
                              />
                            </div>
                            
                            <div>
                              <label class="font-medium block mb-1">Email *</label>
                              <input 
                                type="email" 
                                class="input input-bordered bg-inherit w-full" 
                                required
                              />
                            </div>
                          </div>
      
                          <div>
                            <label class="inline-flex items-center">
                              <input type="checkbox" class="checkbox checkbox-primary mr-2"/>
                              <span class="text-sm">
                                Save my name, email, and website in this browser for the next time I comment.
                              </span>
                            </label>
                          </div>
      
                          <button type="submit" class="btn btn-primary">
                            SUBMIT
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        {/if}
      </div>
    </div>
  
    <!-- Related Products -->
    <div class="mt-16 p-8">
      <h2 class="text-2xl font-bold mb-8">RELATED PRODUCTS</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {#each relatedProducts as product}
          <div class="bg-white rounded-lg shadow-sm overflow-hidden group">
            <div class="relative">
              <a href="/product/{product.id}">
                <img 
                  src={product.image}
                  alt={product.name}
                  class="w-full h-48 object-cover"
                />
                {#if product.isBestSeller}
                  <div class="absolute top-2 left-2">
                    <span class="bg-red-500 text-white px-2 py-1 text-sm rounded">
                      BEST SELLER
                    </span>
                  </div>
                {/if}
              </a>
            </div>
            <div class="p-4 text-center">
              <h3 class="font-medium mb-2">{product.name}</h3>
              <div class="flex justify-center gap-1 mb-2">
                {#each Array(product.rating) as _}
                  <i class="fas fa-star text-yellow-400"></i>
                {/each}
              </div>
              <p class="text-primary font-bold">{formatPrice(product.price)}</p>
              <button class="btn btn-primary btn-sm mt-4 w-full">
                ADD TO CART
              </button>
            </div>
          </div>
        {/each}
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