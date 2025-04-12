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
  import { user } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';
  import Product from '$lib/components/product/Product.svelte';
  import ProductOffers from '$lib/components/product/ProductOffers.svelte';

  export let data;
  const { product_listing, category } = data;
  
  
  let activeTab = 'DETAIL';
  let quantity = 1;
  
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

  onMount(async () => {
    // Subscribe to user store
    const unsubscribe = user.subscribe(value => {
      if (value) {
        currentUser = value;
        userId = value.user_id;
        // Set role based on entity field
        userRole = value.entity ? 'seller' : 'buyer';
        console.log("User data:", { userId, userRole, entity: value.entity });
        checkPurchaseHistory();
      } else {
        currentUser = null;
        userId = null;
        userRole = null;
        hasPurchased = false;
      }
    });

    // Get product listing images
    await getProductListingImages();

    await getRelatedProducts();

    // Cleanup subscription on component destroy
    return () => {
      unsubscribe();
    };
  });

  let pincode = '';
  let pincodeResult = '';
  let pinData = null;

  async function checkPincodeAvailability() {
    if (!pincode) return; // Don't do anything if pincode is empty
    
    if (pincode.length === 6) {
      const response = await fetch(`${PUBLIC_API_URL}/estore/delivery-pins/?page=1&page_size=10`);
      const data = await response.json();
      const foundPinData = data.results.find(pin => pin.pin_code === pincode);
      
      pinData = foundPinData;
      
      if (foundPinData) {
        pincodeResult = `Delivery is available in ${foundPinData.city}, ${foundPinData.state}. COD is ${foundPinData.cod_available ? 'available' : 'not available'}.`;
      } else {
        pincodeResult = 'Delivery is not available for this pincode.';
      }
    } else if (pincode.length > 0) {
      pincodeResult = 'Please enter a valid 6-digit pincode.';
      pinData = null;
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
      let data = await myFetch(url, 'GET', {}, currentUser?.access_token);
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


  // Add these to your existing variables
  let questions = [];
  let questionsLoading = false;
  let questionsNext = null;
  let questionsLoaded = false;
  let newQuestion = '';
  let newAnswer = {};
  let userRole = null;
  let userId = null;
  let hasPurchased = false;
  let currentUser = null;

  // Fetch questions
  async function fetchQuestions() {
    if (questionsLoaded) return;
    questionsLoading = true;
    try {
      let url = `${PUBLIC_API_URL}/qna/questions/?product_listing_id=${product_listing.id}&ordering=-id&answers_required=true`;
      let data = await myFetch(url, 'GET', {}, currentUser?.access_token);
      questions = data.results;
      questionsNext = data.next;
      questionsLoaded = true;
      console.log("questions",questions);
    } catch (e) {
      console.error("Error fetching questions:", e);
    } finally {
      questionsLoading = false;
    }
  }

  // Check if user has purchased the product
  async function checkPurchaseHistory() {
    if (!userId) return;
    try {
      // First get user's orders
      const ordersResponse = await myFetch(
        `${PUBLIC_API_URL}/order/orders?user_id=${userId}`,
        'GET',
        {},
        currentUser?.access_token
      );
      
      // Get all order IDs
      const orderIds = ordersResponse.results.map(order => order.id);
      
      // If there are orders, check order items
      if (orderIds.length > 0) {
        const orderItemsResponse = await myFetch(
          `${PUBLIC_API_URL}/order/order-items/?page=1&page_size=100&need_reviews=true`,
          'GET',
          {},
          currentUser?.access_token
        );
        
        // Check if any order item matches the current product
        hasPurchased = orderItemsResponse.results.some(item => 
          orderIds.includes(item.order_id) && 
          item.product_listing.id === product_listing.id &&
          ['delivered', 'ready_for_delivery'].includes(item.status)
        );
      }
    } catch (e) {
      console.error("Error checking purchase history:", e);
    }
  }

  // Submit new question
  async function submitQuestion() {
    if (!userId) {
      goto('/login');
      return;
    }
    if (!newQuestion.trim()) return;

    try {
      const response = await myFetch(
        `${PUBLIC_API_URL}/qna/questions/`, 
        'POST',
        {
          question_text: newQuestion,
          user_id: userId,
          product_listing_id: product_listing.id
        },
        currentUser?.access_token
      );
      
      if (response) {
        newQuestion = '';
        questionsLoaded = false;
        fetchQuestions();
      }
    } catch (e) {
      console.error("Error submitting question:", e);
    }
  }

  // Submit new answer
  async function submitAnswer(questionId) {
    if (!userId) {
      goto('/login');
      return;
    }
    if (!newAnswer[questionId]?.trim()) return;

    try {
      const response = await myFetch(
        `${PUBLIC_API_URL}/qna/answers/`,
        'POST',
        {
          answer_text: newAnswer[questionId],
          user_id: userId,
          question_id: questionId
        },
        currentUser?.access_token
      );
      console.log("response",response);
      
      if (response) {
        newAnswer[questionId] = '';
        questionsLoaded = false;
        fetchQuestions();
      }
    } catch (e) {
      console.error("Error submitting answer:", e);
    }
  }

  // Watch activeTab changes
  $: if (activeTab === 'QNA' && !questionsLoaded) {
    fetchQuestions();
  }

  let isExpanded = false;
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
      {#if product_listing.stock && product_listing.stock > 0}
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
      {:else}
        <div class="text-red-500 font-medium text-lg">Out of Stock</div>
      {/if}


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
        <div class="flex flex-col gap-2">
          <div class=" font-medium">Check Delivery Availability</div>
          <div class="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Enter Pincode" 
              bind:value={pincode}
              class="input input-bordered input-sm h-9 w-32 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              maxlength="6"
            />
            <button 
              class="btn btn-primary btn-sm h-9 px-4"
              on:click={checkPincodeAvailability}
            >
              Check
            </button>
          </div>
          {#if pincode && pincodeResult}
            <div class="flex items-start gap-2">
              <Icon 
                icon={pinData ? "mdi:check-circle" : "mdi:alert-circle"} 
                class="w-4 h-4 mt-0.5 {pinData ? 'text-green-500' : 'text-red-500'}"
              />
              <div class="flex flex-col">
                {#if pinData}
                  <p class="text-xs text-green-700">
                    Delivery is available in <span class="font-medium">{pinData.city}, {pinData.state}</span>
                  </p>
                  <p class="text-xs {pinData.cod_available ? 'text-green-700' : 'text-red-600'}">
                    COD is <span class="font-medium">{pinData.cod_available ? 'available' : 'not available'}</span>
                  </p>
                {:else}
                  <p class="text-xs text-red-600">{pincodeResult}</p>
                {/if}
              </div>
            </div>
          {/if}
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
        <button 
          class="tab tab-lg inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 hover:bg-primary/10 {activeTab === 'QNA' ? 'tab-active bg-primary text-white' : ''}"
          on:click={() => activeTab = 'QNA'}
        >
          <span>Q&A</span>
          {#if questions.length > 0}
            <span class="ml-1">({questions.length})</span>
          {/if}
        </button>
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

        {:else if activeTab === 'QNA'}
        <div class="max-w-3xl mx-auto space-y-6">
          <!-- Question Input -->
          <div class="bg-white rounded-lg shadow-sm border p-4">
            <h3 class="text-lg font-medium mb-3">Ask a Question</h3>
            <div class="flex gap-3">
              <textarea
                bind:value={newQuestion}
                placeholder="Type your question here..."
                class="textarea textarea-bordered w-full  resize-none text-sm focus:ring-2 focus:ring-primary/20"
                disabled={questionsLoading}
              ></textarea>
              <button
                on:click={submitQuestion}
                class="btn btn-primary px-6 h-auto"
                disabled={questionsLoading || !newQuestion.trim()}
              >
                Submit
              </button>
            </div>
          </div>

          <!-- Questions List -->
          {#if questionsLoading}
            <div class="flex justify-center py-6">
              <span class="loading loading-spinner loading-md text-primary"></span>
            </div>
          {:else if questions.length === 0}
            <div class="text-center py-8 text-gray-500">
              No questions yet. Be the first to ask!
            </div>
          {:else}
            <div class="space-y-4">
              {#each questions as question}
                <div class="bg-white rounded-lg shadow-sm border p-4">
                  <!-- Question -->
                  <div class="flex gap-3">
                    <div class="avatar placeholder flex-shrink-0">
                      <div class="bg-neutral-focus text-neutral-content rounded-full w-8 h-8">
                        <span class="text-sm">{question.user?.first_name?.[0]?.toUpperCase() || 'U'}</span>
                      </div>
                    </div>
                    <div class="flex-1 space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-sm">
                          {question.user?.first_name} {question.user?.last_name}
                        </span>
                        {#if question.user?.role === 'entity'}
                          <span class="badge badge-warning badge-sm">Seller</span>
                        {:else if hasPurchased}
                          <span class="badge badge-success badge-sm">Verified Buyer</span>
                        {/if}
                      </div>
                      <p class="text-gray-700">{question.question_text}</p>
                      <p class="text-xs text-gray-500">
                        Asked on {new Date(question.created).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <!-- Answers -->
                  {#if question.answers?.length}
                    <div class="ml-11 mt-3 space-y-3">
                      <!-- Show first verified buyer answer or first answer -->
                      {#if question.answers.length > 0}
                        {@const verifiedBuyerAnswer = question.answers.find(a => a.user?.role !== 'entity')}
                        {@const firstAnswer = verifiedBuyerAnswer || question.answers[0]}
                        <div class="border-l-2 border-primary/20 pl-4 py-2">
                          <div class="flex items-start gap-2">
                            <div class="avatar placeholder flex-shrink-0">
                              <div class="bg-primary/10 text-primary rounded-full w-6 h-6">
                                <span class="text-xs">{firstAnswer.user?.first_name?.[0]?.toUpperCase() || 'U'}</span>
                              </div>
                            </div>
                            <div class="flex-1 space-y-1">
                              <div class="flex items-center gap-2">
                                <span class="font-medium text-sm">{firstAnswer.user?.first_name} {firstAnswer.user?.last_name}</span>
                                {#if firstAnswer.user?.role === 'entity'}
                                  <span class="badge badge-warning badge-sm">Seller</span>
                                {:else if hasPurchased}
                                  <span class="badge badge-success badge-sm">Verified Buyer</span>
                                {/if}
                              </div>
                              <p class="text-gray-600 text-sm">{firstAnswer.answer_text}</p>
                              <p class="text-xs text-gray-500">
                                Answered on {new Date(firstAnswer.created).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Show expand button if there are more answers -->
                        {#if question.answers.length > 1}
                          <details class="ml-4">
                            <summary class="cursor-pointer text-sm text-primary hover:text-primary/80 mb-2">
                              Show {question.answers.length - 1} more {question.answers.length - 1 === 1 ? 'reply' : 'replies'}
                            </summary>
                            {#each question.answers.filter(a => a !== firstAnswer) as answer}
                              <div class="border-l-2 border-primary/20 pl-4 py-2">
                                <div class="flex items-start gap-2">
                                  <div class="avatar placeholder flex-shrink-0">
                                    <div class="bg-primary/10 text-primary rounded-full w-6 h-6">
                                      <span class="text-xs">{answer.user?.first_name?.[0]?.toUpperCase() || 'U'}</span>
                                    </div>
                                  </div>
                                  <div class="flex-1 space-y-1">
                                    <div class="flex items-center gap-2">
                                      <span class="font-medium text-sm">{answer.user?.first_name} {answer.user?.last_name}</span>
                                      {#if answer.user?.role === 'entity'}
                                        <span class="badge badge-warning badge-sm">Seller</span>
                                      {:else if hasPurchased}
                                        <span class="badge badge-success badge-sm">Verified Buyer</span>
                                      {/if}
                                    </div>
                                    <p class="text-gray-600 text-sm">{answer.answer_text}</p>
                                    <p class="text-xs text-gray-500">
                                      Answered on {new Date(answer.created).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            {/each}
                          </details>
                        {/if}
                      {/if}
                    </div>
                  {/if}

                  <!-- Answer Input -->
                  <div class="ml-11 mt-3">
                    <div class="flex gap-2">
                      <input
                        type="text"
                        bind:value={newAnswer[question.id]}
                        placeholder="Write a reply..."
                        class="input input-bordered input-sm w-full text-sm focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        on:click={() => submitAnswer(question.id)}
                        class="btn btn-sm btn-outline btn-primary"
                        disabled={!newAnswer[question.id]?.trim()}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
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
                const dataNew = await myFetch(reviewsNext, 'GET', {}, currentUser?.access_token);
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

  <!-- Related Products Section -->
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

  <!-- Add this after the product description section -->
  <ProductOffers {product_listing} />
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
