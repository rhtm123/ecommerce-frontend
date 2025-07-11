<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  export let productListings = [];
  export let currentListing = {};
  export let variants = [];
  export let entities = [];
  export let returnExchangePolicies = [];
  export let taxCategories = [];
  export let featureTemplates = [];
  export let errors = {};
  export let isSubmitting = false;
  export let pendingGalleryImages = [];
  export let galleryImages = [];
  export let newFeature = { feature_template_id: null, value: '' };
  export let productId = null;
  let showModal = false;
  let modalMode = 'add'; // 'add' or 'edit'
  let modalGalleryImages = [];

  const dispatch = createEventDispatcher();

  console.log("clistings",currentListing )
  console.log("plistings",productListings )

  // Ensure all fields are set when editing a listing
  onMount(() => {
    console.log(currentListing)
    if (currentListing && currentListing.id) {
      if (!currentListing.features) currentListing.features = [];
      if (!currentListing.manufacturer_id) currentListing.manufacturer_id = '';
      if (!currentListing.packer_id) currentListing.packer_id = '';
      if (!currentListing.importer_id) currentListing.importer_id = '';
      if (!currentListing.return_exchange_policy_id) currentListing.return_exchange_policy_id = '';
      if (!currentListing.tax_category_id) currentListing.tax_category_id = '';
      if (!currentListing.box_items) currentListing.box_items = '';
      if (!currentListing.variant_id) currentListing.variant_id = '';
    }
  });

  function handleInputChange(e) {
    dispatch('change', { currentListing });
  }
  function handleAddFeature() {
    if (!newFeature.feature_template_id || !newFeature.value.trim()) return;
    if (!currentListing.features) currentListing.features = [];
    currentListing.features = [...currentListing.features, { ...newFeature }];
    dispatch('change', { currentListing });
    newFeature = { feature_template_id: null, value: '' };
  }
  function handleRemoveFeature(index) {
    if (!currentListing.features) return;
    currentListing.features = currentListing.features.filter((_, i) => i !== index);
    dispatch('change', { currentListing });
  }
  function handleSubmitListing(e) {
    e.preventDefault();
    dispatch('submitListing');
  }
  function handleEditListing(listing) {
    // Instead of deep copy, emit event to parent to fetch full details
    dispatch('editListing', { listing });
  }
  function handleDeleteListing(id) {
    dispatch('deleteListing', { id });
  }
  function handleMainImageChange(event) {
    const file = event.target.files[0];
    dispatch('mainImageChange', { file });
  }
  function handleDeleteMainImage() {
    dispatch('mainImageChange', { file: null });
  }
  function handleGalleryImagesSelect(event) {
    dispatch('galleryImagesSelect', { files: Array.from(event.target.files) });
  }
  function handleDeleteGalleryImage(imageId, listingId) {
    dispatch('deleteGalleryImage', { imageId, listingId });
  }
  function handleResetListingForm() {
    dispatch('resetListingForm');
  }

  async function openModal(mode, listing = null) {
    modalMode = mode;
    if (mode === 'edit' && listing) {
      // Fetch full listing data from API (keep this logic)
      const res = await fetch(`${PUBLIC_API_URL}/product/product-listings/${listing.id}/`);
      if (res.ok) {
        const data = await res.json();
        currentListing = {
          id: data.id,
          product_id: data.product?.id || data.product_id || null,
          name: data.name || '',
          price: data.price || '',
          mrp: data.mrp || '',
          stock: data.stock || '',
          buy_limit: data.buy_limit || 10,
          box_items: data.box_items || '',
          features: (data.features?.general || []).map(f => ({
            feature_template_id: f.feature_template_id,
            value: f.value
          })),
          approved: data.approved || false,
          featured: data.featured || false,
          variant_id: data.variant?.id || '',
          seller_id: data.seller?.id || '',
          packer_id: data.packer?.id || '',
          importer_id: data.importer?.id || '',
          manufacturer_id: data.manufacturer?.id || '',
          return_exchange_policy_id: data.return_exchange_policy?.id || '',
          tax_category_id: data.tax_category?.id || '',
          estore_id: data.estore_id || '',
          main_image: data.main_image || null
        };
        // Fetch gallery images for this listing
        const galleryRes = await fetch(`${PUBLIC_API_URL}/product/product-listing-images/?product_listing_id=${data.id}`);
        if (galleryRes.ok) {
          const galleryData = await galleryRes.json();
          modalGalleryImages = galleryData.results || [];
        } else {
          modalGalleryImages = [];
        }
        showModal = true;
      } else {
        // fallback to previous logic if API fails
        currentListing = JSON.parse(JSON.stringify(listing));
        modalGalleryImages = [];
        showModal = true;
      }
    } else {
      // Blank template for new listing
      currentListing = {
        id: null,
        product_id: productId,
        name: '',
        price: '',
        mrp: '',
        stock: '',
        buy_limit: 10,
        box_items: '',
        features: [],
        approved: false,
        featured: false,
        variant_id: '',
        seller_id: '',
        packer_id: '',
        importer_id: '',
        manufacturer_id: '',
        return_exchange_policy_id: '',
        tax_category_id: '',
        estore_id: '',
        main_image: null
      };
      modalGalleryImages = [];
      showModal = true;
    }
  }

  function closeModal() {
    showModal = false;
  }

  function handleModalInputChange(e, field) {
    currentListing[field] = e.target.value;
  }

  function handleModalSelectChange(e, field) {
    currentListing[field] = e.target.value;
  }

  function handleModalAddFeature() {
    if (!newFeature.feature_template_id || !newFeature.value.trim()) return;
    if (!currentListing.features) currentListing.features = [];
    currentListing.features = [...currentListing.features, { ...newFeature }];
    newFeature = { feature_template_id: null, value: '' };
  }

  function handleModalRemoveFeature(index) {
    if (!currentListing.features) return;
    currentListing.features = currentListing.features.filter((_, i) => i !== index);
  }

  function validateModalListingForm(data) {
    errors = {};
    const price = parseFloat(data.price);
    const stock = parseInt(data.stock);
    const buy_limit = parseInt(data.buy_limit);
    if (isNaN(price) || price <= 0) errors.price = 'Price must be a positive number.';
    if (isNaN(stock) || stock < 0) errors.stock = 'Stock must be a non-negative number.';
    if (isNaN(buy_limit) || buy_limit < 1) errors.buy_limit = 'Buy limit must be at least 1.';
    return Object.keys(errors).length === 0;
  }

  function handleModalSubmit(e) {
    e.preventDefault();
    if (!validateModalListingForm(currentListing)) return;
    dispatch('submitListing', { currentListing });
    // Only close modal if submit is successful (parent should control this)
    closeModal();
  }

  function handleModalClick(e) {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  }

  function handleEscape(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  });

  $: isEditing = !!currentListing.id;
  $: mainImagePreview = currentListing.main_image && typeof currentListing.main_image === 'string'
    ? currentListing.main_image
    : (currentListing.main_image instanceof File ? URL.createObjectURL(currentListing.main_image) : null);
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
    <h2 class="text-lg font-semibold text-gray-900 flex items-center">
      <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>
      Product Listings ({productListings.length})
    </h2>
    <button 
      on:click={handleResetListingForm} 
      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
    >
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
      </svg>
      Add New Listing
    </button>
  </div>
  <div class="px-6 py-6">
    <!-- Listing Cards -->
    {#if productListings.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {#each productListings as listing (listing.id)}
          <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer {currentListing.id === listing.id ? 'ring-2 ring-blue-500' : ''}"
            on:click={() => openModal('edit', listing)}>
            <div class="flex items-start justify-between mb-3">
              <h3 class="font-medium text-gray-900 truncate">{listing.name || `Listing #${listing.id}`}</h3>
              <div class="flex items-center space-x-2 ml-2">
                <button 
                  type="button"
                  on:click|stopPropagation={() => handleEditListing(listing)} 
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >Edit</button>
                <button 
                  type="button"
                  on:click|stopPropagation={() => handleDeleteListing(listing.id)} 
                  class="text-red-600 hover:text-red-800 text-sm font-medium"
                >Delete</button>
              </div>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Price:</span>
                <span class="font-medium text-gray-900">₹{listing.price}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Stock:</span>
                <span class="font-medium text-gray-900">{listing.stock}</span>
              </div>
              <!-- <div class="flex justify-between">
                <span class="text-gray-500">Variant:</span>
                <span class="font-medium text-gray-900">{variants.find(v => v.id === listing.variant_id)?.name || 'None'}</span>
              </div> -->
            </div>
          </div>
        {/each}
      </div>
    {/if}
    <!-- Add Listing Button -->
    <button 
      on:click={() => openModal('add')}
      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mb-4"
    >
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
      </svg>
      Add New Listing
    </button>
    <!-- Listing Modal -->
    {#if showModal}
      <div class="modal-overlay fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" on:click={handleModalClick}>
        <div class="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative" on:click|stopPropagation>
          <form on:submit={handleModalSubmit} class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="listing-name" class="block text-sm font-medium text-gray-700 mb-2">Listing Name</label>
                <input 
                  type="text" 
                  bind:value={currentListing.name}
                  id="listing-name"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional custom name"
                  on:input={handleInputChange}
                />
              </div>
              <div>
                <label for="listing-price" class="block text-sm font-medium text-gray-700 mb-2">Price (₹) <span class="text-red-500">*</span></label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input 
                    type="number" 
                    bind:value={currentListing.price}
                    id="listing-price"
                    class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {errors.price ? 'border-red-500' : ''}"
                    placeholder="0.00" 
                    step="0.01"
                    on:input={handleInputChange}
                  />
                </div>
                {#if errors.price}
                  <p class="mt-1 text-sm text-red-600 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    {errors.price}
                  </p>
                {/if}
              </div>
              <div>
                <label for="listing-mrp" class="block text-sm font-medium text-gray-700 mb-2">MRP (₹)</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input 
                    type="number" 
                    bind:value={currentListing.mrp}
                    id="listing-mrp"
                    class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00" 
                    step="0.01"
                    on:input={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <label for="listing-stock" class="block text-sm font-medium text-gray-700 mb-2">Stock <span class="text-red-500">*</span></label>
                <input 
                  type="number" 
                  bind:value={currentListing.stock}
                  id="listing-stock"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {errors.stock ? 'border-red-500' : ''}"
                  placeholder="0"
                  on:input={handleInputChange}
                />
                {#if errors.stock}
                  <p class="mt-1 text-sm text-red-600 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    {errors.stock}
                  </p>
                {/if}
              </div>
              <div>
                <label for="listing-buy-limit" class="block text-sm font-medium text-gray-700 mb-2">Buy Limit <span class="text-red-500">*</span></label>
                <input 
                  type="number" 
                  bind:value={currentListing.buy_limit}
                  id="listing-buy-limit"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {errors.buy_limit ? 'border-red-500' : ''}"
                  placeholder="10"
                  on:input={handleInputChange}
                />
                {#if errors.buy_limit}
                  <p class="mt-1 text-sm text-red-600 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    {errors.buy_limit}
                  </p>
                {/if}
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Variant</label>
                <select 
                  bind:value={currentListing.variant_id} 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  on:change={handleInputChange}
                >
                  <option value="">No variant</option>
                  {#each variants as variant}
                    <option value={variant.id}>{variant.name}</option>
                  {/each}
                </select>
              </div>
            </div>

            <!-- Additional Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                <select 
                  bind:value={currentListing.manufacturer_id} 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  on:change={handleInputChange}
                >
                  <option value="">Select manufacturer</option>
                  {#each entities as entity}
                    <option value={entity.id}>{entity.name}</option>
                  {/each}
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Packer</label>
                <select 
                  bind:value={currentListing.packer_id} 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  on:change={handleInputChange}
                >
                  <option value="">Select packer</option>
                  {#each entities as entity}
                    <option value={entity.id}>{entity.name}</option>
                  {/each}
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Importer</label>
                <select 
                  bind:value={currentListing.importer_id} 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  on:change={handleInputChange}
                >
                  <option value="">Select importer</option>
                  {#each entities as entity}
                    <option value={entity.id}>{entity.name}</option>
                  {/each}
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Return/Exchange Policy</label>
                <select 
                  bind:value={currentListing.return_exchange_policy_id} 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  on:change={handleInputChange}
                >
                  <option value="">Select policy</option>
                  {#each returnExchangePolicies as policy}
                    <option value={policy.id}>{policy.name}</option>
                  {/each}
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tax Category</label>
                <select 
                  bind:value={currentListing.tax_category_id} 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  on:change={handleInputChange}
                >
                  <option value="">Select tax category</option>
                  {#each taxCategories as tax}
                    <option value={tax.id}>{tax.name}</option>
                  {/each}
                </select>
              </div>
            </div>

            <!-- Box Items -->
            <div class="mt-8">
              <label class="block text-sm font-medium text-gray-700 mb-2">Box Items</label>
              <textarea 
                bind:value={currentListing.box_items} 
                rows="3"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="List items included in the box"
                on:input={handleInputChange}
              ></textarea>
            </div>

            <!-- Features Section -->
            <div class="mt-8">
              <h3 class="text-md font-semibold text-gray-800 mb-2">Features</h3>
              <div class="flex items-center space-x-2 mb-4">
                <select bind:value={newFeature.feature_template_id} class="border border-gray-300 rounded-lg px-3 py-2" style="min-width: 180px;">
                  <option value="">Select Feature</option>
                  {#each featureTemplates as ft}
                    <option value={ft.id}>{ft.name}</option>
                  {/each}
                </select>
                <input type="text" bind:value={newFeature.value} class="border border-gray-300 rounded-lg px-3 py-2" placeholder="Value" style="min-width: 120px;" />
                <button type="button" on:click={handleAddFeature} class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
              </div>
              {#if currentListing.features && currentListing.features.length > 0}
                <table class="min-w-full divide-y divide-gray-200 bg-white border rounded-lg">
                  <thead>
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Feature</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                      <th class="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each currentListing.features as feature, i}
                      <tr>
                        <td class="px-4 py-2">{featureTemplates.find(ft => ft.id == feature.feature_template_id)?.name || feature.feature_template_id}</td>
                        <td class="px-4 py-2">{feature.value}</td>
                        <td class="px-4 py-2 text-right">
                          <button type="button" on:click={() => handleRemoveFeature(i)} class="text-red-600 hover:text-red-800">Remove</button>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              {:else}
                <p class="text-gray-500 text-sm">No features added yet.</p>
              {/if}
            </div>

            <!-- Main Image Upload -->
            <div class="mt-8">
              <h3 class="text-md font-semibold text-gray-800 mb-2">Main Image</h3>
              {#if currentListing.main_image}
                <div class="mt-2 relative inline-block">
                  <img src={currentListing.main_image} alt="Main Image Preview" class="h-32 rounded border" />
                  <button type="button" class="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-600 hover:text-red-800" on:click={handleDeleteMainImage}>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              {/if}
              <input type="file" accept="image/*" on:change={handleMainImageChange} class="mt-2" />
            </div>

            <!-- Gallery Images Upload -->
            <div class="mt-8">
              <h3 class="text-md font-semibold text-gray-800 mb-2">Gallery Images</h3>
              <input type="file" accept="image/*" multiple on:change={handleGalleryImagesSelect} />
              <div class="flex flex-wrap gap-4 mt-2">
                {#if modalGalleryImages.length > 0}
                  {#each modalGalleryImages as img}
                    <div class="relative group">
                      <img src={img.image || img.url} alt="Gallery" class="h-24 w-24 object-cover rounded border" />
                      <button type="button" class="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition" on:click={() => handleDeleteGalleryImage(img.id, currentListing.id)}>
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  {/each}
                {/if}
              </div>
            </div>

            <div class="flex justify-end pt-6 border-t border-gray-200">
              <button type="button" on:click={closeModal} class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-100 mr-2">Cancel</button>
              <button type="submit" disabled={isSubmitting} class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {#if isSubmitting}
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                {:else}
                  {modalMode === 'edit' ? 'Update Listing' : 'Add Listing'}
                {/if}
              </button>
            </div>
          </form>
        </div>
      </div>
    {/if}
  </div>
</div> 