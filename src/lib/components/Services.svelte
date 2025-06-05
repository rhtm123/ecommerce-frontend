<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import Service from '$lib/components/service/Service.svelte';
    import { servicesData, getCategoryBySlug } from '$lib/data/services-data.js';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
  
    let { currentCategory = null, searchQuery = '' } = $props();
  
    // State
    let services = $state([]);
    let categories = $state(servicesData.categories);
    let allCategories = $state([]);
    let loading = $state(true);
    let error = $state(null);
    let showFilters = $state(false);
    let displayCategories = $state([]);
    let parentCategory = $state(null);
  
    // Filter states
    let selectedPriceRange = $state([0, 200]);
    let sortOption = $state('default');
    let selectedRating = $state(0);
    let totalServices = $state(0);
  
    // Flatten all categories and subcategories for easy access
    function flattenCategories() {
      const flattened = [];
      categories.forEach(category => {
        flattened.push(category);
        if (category.subcategories) {
          category.subcategories.forEach(subcategory => {
            flattened.push({
              ...subcategory,
              parentCategory: category
            });
          });
        }
      });
      allCategories = flattened;
    }
  
    function updateCategoryContext() {
      if (!currentCategory) {
        displayCategories = categories;
        parentCategory = null;
        return;
      }
  
      // Find if current category is a main category or subcategory
      const mainCategory = categories.find(cat => cat.id === currentCategory.id);
      if (mainCategory) {
        // This is a main category, show its subcategories
        displayCategories = mainCategory.subcategories || [];
        parentCategory = null;
      } else {
        // This might be a subcategory, find its parent
        const subcategory = allCategories.find(cat => cat.id === currentCategory.id);
        if (subcategory && subcategory.parentCategory) {
          parentCategory = subcategory.parentCategory;
          displayCategories = subcategory.parentCategory.subcategories || [];
        }
      }
    }
  
    function loadServices() {
      loading = true;
      services = [];
      
      try {
        let filteredServices = [];
        
        if (currentCategory) {
          // Find services in current category
          const category = categories.find(cat => cat.id === currentCategory.id);
          if (category) {
            // Main category - get all services from all subcategories
            filteredServices = category.subcategories.flatMap(sub => sub.services || []);
          } else {
            // Subcategory - get services from this subcategory
            const subcategory = allCategories.find(cat => cat.id === currentCategory.id);
            if (subcategory) {
              filteredServices = subcategory.services || [];
            }
          }
        } else {
          // No category selected - show all services
          filteredServices = categories.flatMap(cat => 
            cat.subcategories.flatMap(sub => sub.services || [])
          );
        }
  
        // Apply search filter
        if (searchQuery) {
          filteredServices = filteredServices.filter(service =>
            service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
  
        // Apply price filter
        filteredServices = filteredServices.filter(service =>
          service.price >= selectedPriceRange[0] && service.price <= selectedPriceRange[1]
        );
  
        // Apply rating filter
        if (selectedRating > 0) {
          filteredServices = filteredServices.filter(service =>
            service.rating >= selectedRating
          );
        }
  
        // Apply sorting
        switch (sortOption) {
          case 'price_asc':
            filteredServices.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            filteredServices.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            filteredServices.sort((a, b) => b.rating - a.rating);
            break;
          case 'popularity':
            filteredServices.sort((a, b) => b.reviewCount - a.reviewCount);
            break;
          default:
            // Keep original order
            break;
        }
  
        services = filteredServices;
        totalServices = filteredServices.length;
      } catch (err) {
        error = 'Failed to load services';
        console.error(err);
      } finally {
        loading = false;
      }
    }
  
    function clearCategory() {
      currentCategory = null;
      parentCategory = null;
      displayCategories = categories;
      loadServices();
      goto('/services');
    }
  
    function goToParentCategory() {
      if (parentCategory) {
        goto(`/services/${parentCategory.slug}`);
      } else {
        clearCategory();
      }
    }
  
    function applyFilters() {
      loadServices();
    }
  
    onMount(() => {
      flattenCategories();
      updateCategoryContext();
      loadServices();
    });
  
    // Reactive updates
    $effect(() => {
      if (currentCategory !== undefined) {
        updateCategoryContext();
        loadServices();
      }
    });
  
    $effect(() => {
      if (searchQuery !== undefined) {
        loadServices();
      }
    });
  </script>
  
  <!-- Desktop Services Layout -->
  <div class="h-screen bg-gray-50">
    <div class="flex h-full">
      <!-- Left Sidebar - Categories -->
      <div class="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200 bg-white">
          <h2 class="font-bold text-gray-800 text-lg flex items-center gap-3">
            {#if currentCategory}
              <button 
                class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onclick={parentCategory ? goToParentCategory : clearCategory}
                aria-label="Back to parent category"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <span>{currentCategory.name}</span>
            {:else}
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              <span>All Services</span>
            {/if}
          </h2>
          <p class="text-gray-500 text-sm mt-1">Choose a service category</p>
        </div>
  
        <!-- Category List -->
        <div class="flex-1 overflow-y-auto p-4">
          <div class="space-y-2">
            {#each displayCategories as category (category.id)}
              <a 
                href="/services/{category.slug}"
                class="block w-full p-4 flex items-center gap-4 hover:bg-blue-50 rounded-xl transition-all duration-200 text-left group {currentCategory?.id === category.id ? 'bg-blue-100 text-blue-700 font-semibold shadow-sm' : 'text-gray-700 hover:text-blue-600'}"
              >
                <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm overflow-hidden group-hover:shadow-md transition-shadow">
                  <img 
                    src={category.image || "/placeholder.svg?height=48&width=48"} 
                    alt={category.name}
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-base truncate">{category.name}</h3>
                  <p class="text-sm text-gray-500 truncate">{category.description}</p>
                </div>
                
                {#if category.subcategories && category.subcategories.length > 0}
                  <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                {:else if category.services && category.services.length > 0}
                  <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                    {category.services.length}
                  </span>
                {/if}
              </a>
            {/each}
          </div>
        </div>
      </div>
  
      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col">
        <!-- Header Section -->
        <div class="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {currentCategory ? currentCategory.name : 'All Services'}
            </h1>
            <p class="text-gray-600 mt-1">
              {totalServices} professional services available
            </p>
          </div>
          
          <div class="flex items-center gap-4">
            <!-- Sort Dropdown -->
            <select 
              class="select select-bordered bg-white text-sm border-gray-300 focus:border-blue-500"
              bind:value={sortOption}
              onchange={applyFilters}
            >
              <option value="default">Default Sorting</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
            </select>
            
            <!-- Filter Button -->
            <button 
              class="btn btn-outline gap-2 border-gray-300 hover:border-blue-500 hover:text-blue-600"
              onclick={() => showFilters = !showFilters}
              aria-label="Toggle filters"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
              Filters
            </button>
          </div>
        </div>
  
        <!-- Services Grid with Filter Sidebar -->
        <div class="flex-1 overflow-hidden relative">
          <div class="flex h-full">
            <!-- Main Services Area -->
            <div class="flex-1 overflow-y-auto p-6">
              {#if loading}
                <div class="flex justify-center items-center py-20">
                  <div class="text-center">
                    <div class="loading loading-spinner loading-lg text-blue-500 mb-4"></div>
                    <p class="text-gray-600">Loading services...</p>
                  </div>
                </div>
              {:else if error}
                <div class="text-center py-20">
                  <div class="text-red-400 mb-4">
                    <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                  </div>
                  <p class="text-red-500 text-lg font-medium">{error}</p>
                </div>
              {:else if services.length === 0}
                <div class="text-center py-20">
                  <div class="text-gray-400 mb-4">
                    <svg class="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
                  <p class="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for</p>
                  <button class="btn btn-primary" onclick={clearCategory}>
                    View All Services
                  </button>
                </div>
              {:else}
                <!-- Responsive Grid with Better Spacing -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {#each services as service (service.id)}
                    <Service {service} />
                  {/each}
                </div>
              {/if}
            </div>
  
            <!-- Filter Sidebar -->
            {#if showFilters}
              <div class="w-80 bg-white border-l border-gray-200 overflow-y-auto shadow-lg" transition:fly="{{ x: 300, duration: 300 }}">
                <div class="p-6">
                  <div class="flex items-center justify-between mb-6">
                    <h3 class="font-bold text-gray-900 text-lg">Filters</h3>
                    <button 
                      class="btn btn-ghost btn-sm"
                      onclick={() => showFilters = false}
                      aria-label="Close filters"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
  
                  <!-- Price Range Filter -->
                  <div class="mb-8">
                    <h4 class="font-semibold text-gray-900 mb-4">Price Range</h4>
                    <div class="space-y-4">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        bind:value={selectedPriceRange[1]}
                        onchange={applyFilters}
                        class="range range-primary w-full"
                      />
                      <div class="flex justify-between text-sm text-gray-600">
                        <span>$0</span>
                        <span class="font-semibold text-blue-600">${selectedPriceRange[1]}</span>
                        <span>$200</span>
                      </div>
                    </div>
                  </div>
  
                  <!-- Rating Filter -->
                  <div class="mb-8">
                    <h4 class="font-semibold text-gray-900 mb-4">Minimum Rating</h4>
                    <div class="space-y-3">
                      {#each [4.5, 4.0, 3.5, 3.0] as rating}
                        <label class="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                          <input 
                            type="radio" 
                            name="rating"
                            class="radio radio-primary"
                            checked={selectedRating === rating}
                            onclick={() => {
                              selectedRating = rating;
                              applyFilters();
                            }}
                          />
                          <span class="font-medium">{rating} ★ & up</span>
                        </label>
                      {/each}
                    </div>
                  </div>
  
                  <!-- Apply Filters Button -->
                  <button class="btn btn-primary w-full" onclick={applyFilters}>
                    Apply Filters
                  </button>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
  