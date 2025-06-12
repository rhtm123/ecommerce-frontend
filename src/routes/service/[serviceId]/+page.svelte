<script>
    import { page } from '$app/stores';
    import { getServiceById } from '$lib/data/services-data.js';
    import { addToCart, cart } from '$lib/stores/cart';
    import { toggleWishlistItem, wishlistIds } from '$lib/stores/wishlist';
    
    // Get the service ID from the URL
    let serviceId = $derived($page.params.serviceId);
    
    // Find the service in the data
    let service = $derived(getServiceById(serviceId));
    
    // State for image gallery
    let selectedImageIndex = $state(0);
    let showBookingModal = $state(false);
    
    // Cart and wishlist state
    let cartItem = $derived($cart.find(item => item.id === service?.id));
    let inCart = $derived(!!cartItem);
    let isWishlisted = $derived($wishlistIds.has(service?.id));
    
    // Calculate discount
    let discountPercentage = $derived(
      service?.originalPrice ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100) : 0
    );
    
    function handleBookService() {
      if (service) {
        addToCart(service);
      }
    }
    
    function handleWishlistToggle() {
      if (service) {
        toggleWishlistItem(service);
      }
    }
  </script>
  
  <svelte:head>
    <title>{service ? `${service.name}` : 'Service Not Found'} | Professional Services</title>
    
    <meta name="description" content={service ? `Book ${service.name} - ${service.description}. Professional service with ${service.rating} star rating.` : 'Service not found'} />
    
    <!-- Additional SEO Meta Tags -->
    <meta name="robots" content="index, follow" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </svelte:head>
  
  {#if !service}
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
      <div class="text-center p-8 max-w-md">
        <div class="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-4">Service Not Found</h1>
        <p class="text-gray-600 mb-8">The service you're looking for doesn't exist or may have been removed.</p>
        <a href="/services" class="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Services
        </a>
      </div>
    </div>
  {:else}
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <!-- Breadcrumb -->
      <div class="bg-white border-b">
        <div class="max-w-7xl mx-auto px-4 py-3">
          <div class="breadcrumbs text-sm">
            <ul>
              <li><a href="/" class="text-blue-600 hover:text-blue-800">Home</a></li>
              <li><a href="/services" class="text-blue-600 hover:text-blue-800">Services</a></li>
              <li><a href="/services/{service.category.toLowerCase().replace(' ', '-')}" class="text-blue-600 hover:text-blue-800">{service.category}</a></li>
              <li class="text-gray-500">{service.name}</li>
            </ul>
          </div>
        </div>
      </div>
  
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Left Column - Images -->
          <div class="space-y-4">
            <!-- Main Image -->
            <div class="relative aspect-[4/3] bg-white rounded-2xl overflow-hidden shadow-xl">
              <img 
                src={service.gallery?.[selectedImageIndex] || service.image || "/placeholder.svg?height=500&width=600"} 
                alt={service.name}
                class="w-full h-full object-cover"
              />
              
              <!-- Image Overlay Info -->
              <div class="absolute top-4 left-4 flex flex-wrap gap-2">
                {#if discountPercentage > 0}
                  <span class="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                    {discountPercentage}% OFF
                  </span>
                {/if}
                {#each service.tags.slice(0, 2) as tag}
                  <span class="bg-blue-500/90 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full shadow-lg">
                    {tag}
                  </span>
                {/each}
              </div>
  
              <!-- Wishlist Button -->
              <button
                class="absolute top-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 {isWishlisted ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}"
                onclick={handleWishlistToggle}
                aria-label="Toggle wishlist"
              >
                <svg class="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
  
            <!-- Image Gallery Thumbnails -->
            {#if service.gallery && service.gallery.length > 1}
              <div class="flex gap-3 overflow-x-auto pb-2">
                {#each service.gallery as image, index}
                  <button
                    class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all {selectedImageIndex === index ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}"
                    onclick={() => selectedImageIndex = index}
                    aria-label={`Image ${index + 1}`}
                  >
                    <img src={image || "/placeholder.svg"} alt="Gallery {index + 1}" class="w-full h-full object-cover" />
                  </button>
                {/each}
              </div>
            {/if}
          </div>
  
          <!-- Right Column - Service Details -->
          <div class="space-y-6">
            <!-- Service Header -->
            <div>
              <div class="flex items-start justify-between mb-2">
                <h1 class="text-3xl font-bold text-gray-900 leading-tight">{service.name}</h1>
                <div class="flex items-center bg-green-500 text-white px-3 py-1 rounded-lg ml-4">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="font-semibold">{service.rating}</span>
                </div>
              </div>
              <p class="text-gray-600 text-lg leading-relaxed">{service.description}</p>
            </div>
  
            <!-- Service Provider -->
            <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Service Provider
              </h3>
              <div class="flex items-center gap-4">
                <img 
                  src={service.provider.avatar || "/placeholder.svg"} 
                  alt={service.provider.name}
                  class="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h4 class="font-semibold text-gray-900">{service.provider.name}</h4>
                    {#if service.provider.verified}
                      <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                    {/if}
                  </div>
                  <div class="flex items-center gap-4 text-sm text-gray-600">
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      {service.provider.rating} rating
                    </span>
                    <span>{service.provider.experience}</span>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Service Details -->
            <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Service Details
              </h3>
              
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="flex items-center gap-2 text-gray-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="text-sm">Duration: {service.duration}</span>
                </div>
                <div class="flex items-center gap-2 text-gray-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span class="text-sm">{service.availability}</span>
                </div>
                <div class="flex items-center gap-2 text-gray-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span class="text-sm">At your location</span>
                </div>
                <div class="flex items-center gap-2 text-gray-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="text-sm">({service.reviewCount}) reviews</span>
                </div>
              </div>
  
              <p class="text-gray-700 leading-relaxed">{service.longDescription}</p>
            </div>
  
            <!-- Service Features -->
            <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                What's Included
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {#each service.features as feature}
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-gray-700 text-sm">{feature}</span>
                  </div>
                {/each}
              </div>
            </div>
  
            <!-- Pricing and Booking -->
            <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100 sticky top-4">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <div class="flex items-baseline gap-3">
                    <span class="text-3xl font-bold text-gray-900">₹{service.price}</span>
                    {#if service.originalPrice && service.originalPrice > service.price}
                      <span class="text-lg text-gray-500 line-through">₹{service.originalPrice}</span>
                      <span class="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                        Save ₹{service.originalPrice - service.price}
                      </span>
                    {/if}
                  </div>
                  <span class="text-gray-500">per service</span>
                </div>
              </div>
              
              {#if inCart}
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div class="flex items-center gap-2 text-green-700">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    <span class="font-medium">Added to cart!</span>
                  </div>
                  <p class="text-green-600 text-sm mt-1">This service has been added to your cart. You can proceed to checkout or continue browsing.</p>
                </div>
              {/if}
              
              <button 
                class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-lg"
                onclick={handleBookService}
                disabled={inCart}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {inCart ? 'Added to Cart' : 'Book This Service'}
              </button>
              
              <div class="mt-4 text-center">
                <p class="text-sm text-gray-500">
                  <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  100% satisfaction guaranteed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
  