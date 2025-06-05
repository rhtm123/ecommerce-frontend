<script>
    import { addToCart, cart } from '../../stores/cart';
    import { toggleWishlistItem, wishlistIds } from '../../stores/wishlist';
    
    let { service } = $props();
    let isWishlisted = $derived($wishlistIds.has(service.id));
  
    // Cart quantity logic
    let cartItem = $derived($cart.find(item => item.id === service.id));
    let inCart = $derived(!!cartItem);
    let cartQuantity = $derived(cartItem ? cartItem.quantity : 0);
  
    function handleWishlistClick(event) {
      event.stopPropagation();
      toggleWishlistItem(service);
    }
  
    function handleBookService() {
      addToCart(service);
    }
  
    function handleIncrement() {
      if (cartQuantity < 5) {
        cart.update(items => items.map(item => item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
    }
    
    function handleDecrement() {
      if (cartQuantity > 1) {
        cart.update(items => items.map(item => item.id === service.id ? { ...item, quantity: item.quantity - 1 } : item));
      }
    }
    
    function handleRemove() {
      cart.update(items => items.filter(item => item.id !== service.id));
    }
  
    // Calculate discount percentage
    let discountPercentage = $derived(
      service.originalPrice ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100) : 0
    );
  </script>
  
  <!-- Clean and Spacious Service Card -->
  <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 h-full flex flex-col">
    
    <!-- Service Image Section -->
    <div class="relative h-48 overflow-hidden">
      <img 
        src={service.image || "/placeholder.svg?height=200&width=300"} 
        alt={service.name}
        class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />
      
      <!-- Top Badges -->
      <div class="absolute top-3 left-3">
        {#if discountPercentage > 0}
          <span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            {discountPercentage}% OFF
          </span>
        {/if}
      </div>
  
      <!-- Wishlist Button -->
      <button
        class="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-md hover:shadow-lg transition-all duration-300 {isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}"
        onclick={handleWishlistClick}
        aria-label="Toggle wishlist"
      >
        <svg class="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
  
      <!-- Duration Badge -->
      <div class="absolute bottom-3 left-3">
        <div class="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-md shadow-sm flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {service.duration}
        </div>
      </div>
    </div>
  
    <!-- Service Content -->
    <div class="p-6 flex flex-col flex-1">
      
      <!-- Service Title and Description -->
      <div class="mb-4">
        <a href="/service/{service.id}" class="block hover:text-blue-600 transition-colors">
          <h3 class="font-bold text-lg text-gray-900 mb-2 line-clamp-2 leading-tight">
            {service.name}
          </h3>
        </a>
        <p class="text-gray-600 text-sm line-clamp-2 leading-relaxed">
          {service.description}
        </p>
      </div>
  
      <!-- Provider Section -->
      <div class="mb-4 p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-3">
          <img 
            src={service.provider.avatar || "/placeholder.svg"} 
            alt={service.provider.name}
            class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <p class="font-medium text-gray-900 text-sm truncate">{service.provider.name}</p>
              {#if service.provider.verified}
                <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              {/if}
            </div>
            <p class="text-xs text-gray-500">{service.provider.experience}</p>
          </div>
          <div class="flex items-center gap-1">
            <svg class="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span class="text-xs font-medium text-gray-700">{service.provider.rating}</span>
          </div>
        </div>
      </div>
  
      <!-- Rating and Availability -->
      <div class="mb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white text-[10px] px-2 py-1 rounded-md text-sm font-semibold">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              {service.rating}
            </div>
            <span class="text-sm text-gray-500">({service.reviewCount})</span>
          </div>
          
          <div class="text-right">
            <span class="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-md">
              {service.availability}
            </span>
          </div>
        </div>
      </div>
  
      <!-- Pricing Section -->
      <div class="mt-auto">
        <div class="flex items-center justify-between mb-4">
          <div>
            <div class="flex items-baseline gap-2 mb-1">
              <span class="text-2xl font-bold text-gray-900">₹{service.price}</span>
              {#if service.originalPrice && service.originalPrice > service.price}
                <span class="text-sm text-gray-500 line-through">₹{service.originalPrice}</span>
              {/if}
            </div>
            <span class="text-xs text-gray-500">per service</span>
          </div>
        </div>
  
        <!-- Book Service Button -->
        <div class="w-full">
          {#if inCart}
            <div class="flex items-center justify-center bg-green-50 border-2 border-green-500 rounded-lg px-4 py-3 gap-4">
              <button 
                class="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-100 rounded-full transition-colors"
                onclick={cartQuantity > 1 ? handleDecrement : handleRemove}
                aria-label={cartQuantity > 1 ? 'Decrement quantity' : 'Remove from cart'}
              >
                {#if cartQuantity === 1}
                  <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                {:else}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                  </svg>
                {/if}
              </button>
              <span class="font-bold text-green-600 text-lg min-w-[2rem] text-center">{cartQuantity}</span>
              <button 
                class="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-100 rounded-full transition-colors"
                onclick={handleIncrement}
                disabled={cartQuantity >= 5}
                aria-label="Increment quantity"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </button>
            </div>
          {:else}
            <button 
              class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              onclick={handleBookService}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              BOOK NOW
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
  
  <style>
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  </style>
  