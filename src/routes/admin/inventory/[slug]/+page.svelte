<script>
    import { onMount } from 'svelte';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { myFetch } from '$lib/utils/myFetch';
    import { user } from '$lib/stores/auth';
    import { addAlert } from '$lib/stores/alert';
    import { goto } from '$app/navigation';
    
    export let data;
    const slug = data.slug;
    let authUser;
    user.subscribe(value => authUser = value);
    
    let product = null;
    let galleryImages = [];
    let isEditing = false;
    let editFields = {};
    let editDetailsFields = {};
    let editFeatures = [];
    let editReturnPolicyId = null;
    let editDescription = '';
    let editCategoryId = null;
    let editBrandId = null;
    let editVariantId = null;
    let editMainImageFile = null;
    let editGalleryImageFiles = [];
    let editBoxItems = '';
    let editProduct = null;
    let editProductDetails = null;
    let editProductFeatures = [];
    let editProductDescription = '';
    let editProductCategoryId = null;
    let editProductBrandId = null;
    let editProductVariantId = null;
    let editProductReturnPolicyId = null;
    let editProductMainImageFile = null;
    let editProductGalleryImageFiles = [];
    let editProductBoxItems = '';
    let editProductName = '';
    let editProductMRP = '';
    let editProductPrice = '';
    let editProductStock = '';
    let editProductBuyLimit = '';
    let editProductApproved = false;
    let editProductId = null;
    let editProductSlug = '';
    let editProductCreated = '';
    let editProductUpdated = '';
    let editProductRating = '';
    let editProductReviewCount = '';
    let editProductPopularity = '';
    let editProductMainImage = '';
    let editProductGalleryImages = [];
    let editProductFeaturesGeneral = [];
    let editProductReturnExchangePolicy = null;
    let editProductCategory = null;
    let editProductBrand = null;
    let editProductVariant = null;
    let editProductSeller = null;
    let editProductBoxContents = '';
    let editProductAnalytics = null;
    let editProductPerformance = null;
    let editProductPerformanceChart = null;
    let editProductPerformanceOverview = null;
    let editProductPerformanceStats = null;
    let editProductPerformanceViews = null;
    let editProductPerformanceOrders = null;
    let editProductPerformanceRating = null;
    let editProductPerformancePopularity = null;
    let editProductPerformanceLastUpdated = null;
    let editProductPerformanceAnalytics = null;
    let editProductPerformanceAnalyticsChart = null;
    let editProductPerformanceAnalyticsOverview = null;
    let editProductPerformanceAnalyticsStats = null;
    let editProductPerformanceAnalyticsViews = null;
    let editProductPerformanceAnalyticsOrders = null;
    let editProductPerformanceAnalyticsRating = null;
    let editProductPerformanceAnalyticsPopularity = null;
    let editProductPerformanceAnalyticsLastUpdated = null;
    let editProductPerformanceAnalyticsPerformance = null;
    let editProductPerformanceAnalyticsPerformanceChart = null;
    let editProductPerformanceAnalyticsPerformanceOverview = null;
    let editProductPerformanceAnalyticsPerformanceStats = null;
    let editProductPerformanceAnalyticsPerformanceViews = null;
    let editProductPerformanceAnalyticsPerformanceOrders = null;
    let editProductPerformanceAnalyticsPerformanceRating = null;
    let editProductPerformanceAnalyticsPerformancePopularity = null;
    let editProductPerformanceAnalyticsPerformanceLastUpdated = null;
    let editProductPerformanceAnalyticsPerformanceAnalytics = null;
    let editProductPerformanceAnalyticsPerformanceAnalyticsChart = null;
    let editProductPerformanceAnalyticsPerformanceAnalyticsOverview = null;
    let editProductPerformanceAnalyticsPerformanceAnalyticsStats = null;
    let editProductPerformanceAnalyticsPerformanceAnalyticsViews = null;
    let editProductPerformanceAnalyticsPerformanceAnalyticsOrders = null;
    let editProductPerformanceAnalyticsPerformanceAnalyticsRating = null;
    let editProductPerformanceAnalyticsPerformanceAnalyticsPopularity = null;
    let editProductPerformanceAnalyticsPerformanceAnalyticsLastUpdated = null;
    let editProductPerformanceAnalyticsPerformanceAnalyticsPerformance = null;
    let editProductPerformanceAnalyticsPerformanceAnalyticsPerformanceChart = null;
    let editProductPerformanceAnalyticsPerformanceAnalyticsPerformanceOverview = null;
    let editProductPerformanceAnalyticsPerformanceAnalyticsPerformanceStats = null;
    let editProductPerformanceAnalyticsPerformanceAnalyticsPerformanceViews = null;
    let editProductPerformanceAnalyticsPerformanceAnalyticsPerformanceOrders = null;
    let editProductPerformanceAnalyticsPerformanceAnalyticsPerformanceRating = null;
    let editProductPerformanceAnalyticsPerformanceAnalyticsPerformancePopularity = null;
    let editProductPerformanceAnalyticsPerformanceAnalyticsPerformanceLastUpdated = null;
    let loading = false;
    let activeTab = 'overview';
    let mainImagePreview = null;
    
    let selectedCategoryId = null;
    let selectedBrandId = null;
    let selectedVariantId = null;
    let selectedSeller = null;
    let selectedReturnPolicyId = null;
    let selectedFeaturesGeneral = '';
    let selectedDescription = '';
    
    let categories = [];
    let brands = [];
    let variants = [];
    let entities = [];
    let featureTemplates = [];
    let features = [];
    let newFeature = { feature_template_id: '', value: '' };
    
    onMount(async () => {
        // Fetch all required lists
        [categories, brands, entities, featureTemplates] = await Promise.all([
            myFetch(`${PUBLIC_API_URL}/product/categories/?page=1&page_size=100`).then(r => r.results || []),
            myFetch(`${PUBLIC_API_URL}/user/entities/?page=1&page_size=100&entity_type=brand`).then(r => r.results || []),
            myFetch(`${PUBLIC_API_URL}/user/entities/?page=1&page_size=100`).then(r => r.results || []),
            myFetch(`${PUBLIC_API_URL}/product/feature-templates/?page=1&page_size=100`).then(r => r.results || []),
        ]);
        // Optionally fetch variants if needed
        // variants = ...
        await fetchProduct();
    });
    
    async function fetchProduct() {
        loading = true;
        const res = await fetch(`${PUBLIC_API_URL}/product/product-listings/slug/${slug}/`);
        if (res.ok) {
            product = await res.json();
            console.log('Fetched product:', product);
            await fetchGalleryImages(product.id);
            editFields = {
                name: product.name,
                price: product.price,
                mrp: product.mrp,
                stock: product.stock,
                buy_limit: product.buy_limit,
                approved: product.approved,
                box_items: product.box_items,
            };
        } else {
            addAlert('Failed to load product', 'error');
        }
        loading = false;
    }
    
    async function fetchGalleryImages(listingId) {
        const res = await fetch(`${PUBLIC_API_URL}/product/product-listing-images/?product_listing_id=${listingId}`);
        if (res.ok) {
            const data = await res.json();
            console.log('Fetched gallery images:', data);
            galleryImages = data.results || [];
        }
    }
    
    async function saveEdits() {
        loading = true;
        const payload = {
            name: editFields.name,
            price: parseFloat(editFields.price),
            mrp: editFields.mrp ? parseFloat(editFields.mrp) : null,
            stock: parseInt(editFields.stock),
            buy_limit: parseInt(editFields.buy_limit),
            approved: editFields.approved,
            box_items: editFields.box_items,
        };
        const res = await fetch(`${PUBLIC_API_URL}/product/product-listings/${product.id}/`, {
            method: 'PUT',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authUser?.access_token}`
            }
        });
        if (res.ok) {
            addAlert('Product updated successfully!', 'success');
            isEditing = false;
            await fetchProduct();
        } else {
            addAlert('Failed to update product', 'error');
        }
        loading = false;
    }
    
    async function deleteGalleryImage(imageId) {
        if (confirm('Are you sure you want to delete this image?')) {
            await fetch(`${PUBLIC_API_URL}/product/product-listing-images/${imageId}/`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authUser?.access_token}` }
            });
            await fetchGalleryImages(product.id);
            addAlert('Image deleted successfully!', 'success');
        }
    }
    
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function getStatusColor(approved) {
        return approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    }
    
    function getStatusText(approved) {
        return approved ? 'Approved' : 'Pending Approval';
    }
    
    function handleMainImageFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            editMainImageFile = file;
            mainImagePreview = URL.createObjectURL(file);
        }
    }

    function addFeature() {
        if (!newFeature.feature_template_id || !newFeature.value.trim()) {
            addAlert('Feature template and value are required.', 'error');
            return;
        }
        features = [...features, { ...newFeature }];
        newFeature = { feature_template_id: '', value: '' };
    }

    function removeFeature(index) {
        features = features.filter((_, i) => i !== index);
    }
</script>
    
    {#if loading}
        <div class="min-h-screen bg-gray-50 flex items-center justify-center">
            <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p class="text-gray-600">Loading product details...</p>
            </div>
        </div>
    {:else if product}
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <div class="bg-white shadow-sm border-b border-gray-200">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between py-6">
                        <div class="flex items-center space-x-4">
                            <button 
                                onclick={() => goto('/admin/inventory')}
                                class="inline-flex items-center text-gray-500 hover:text-gray-700"
                            >
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                                </svg>
                                
                            </button>
                            <div class="h-6 w-px bg-gray-300"></div>
                            <div>
                                <h1 class="text-2xl font-bold text-gray-900">{product.name}</h1>
                                <p class="text-sm text-gray-500">Product ID: {product.id} • Created {formatDate(product.created)}</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-3">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getStatusColor(product.approved)}">
                                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                </svg>
                                {getStatusText(product.approved)}
                            </span>
                            
                            {#if isEditing}
                                <button 
                                    onclick={saveEdits}
                                    disabled={loading}
                                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    {#if loading}
                                        <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    {:else}
                                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                        </svg>
                                        Save Changes
                                    {/if}
                                </button>
                                <button 
                                    onclick={() => isEditing = false}
                                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                            {:else}
                                <button 
                                    onclick={() => isEditing = true}
                                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                    Edit Product
                                </button>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
    
            <!-- Content -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <!-- Tabs -->
                <div class="border-b border-gray-200 mb-8">
                    <nav class="-mb-px flex space-x-8">
                        <button 
                            onclick={() => activeTab = 'overview'}
                            class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                        >
                            Overview
                        </button>
                        <button 
                            onclick={() => activeTab = 'details'}
                            class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                        >
                            Product Details
                        </button>
                        <button 
                            onclick={() => activeTab = 'images'}
                            class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'images' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                        >
                            Images ({galleryImages.length + 1})
                        </button>
                        <button 
                            onclick={() => activeTab = 'analytics'}
                            class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'analytics' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                        >
                            Analytics
                        </button>
                    </nav>
                </div>
    
                {#if activeTab === 'overview'}
                    <!-- Overview Tab -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- Main Product Info -->
                        <div class="lg:col-span-2 space-y-6">
                            <!-- Basic Information Card -->
                            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div class="px-6 py-4 border-b border-gray-200">
                                    <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                                        <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        Basic Information
                                    </h2>
                                </div>
                                <div class="px-6 py-6">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <!-- Product Name -->
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                                            {#if isEditing}
                                                <input 
                                                    type="text" 
                                                    bind:value={editFields.name}
                                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            {:else}
                                                <p class="text-gray-900 font-medium">{product.name}</p>
                                            {/if}
                                        </div>
    
                                        <!-- Price -->
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Selling Price</label>
                                            {#if isEditing}
                                                <div class="relative">
                                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span class="text-gray-500 sm:text-sm">₹</span>
                                                    </div>
                                                    <input 
                                                        type="number" 
                                                        bind:value={editFields.price}
                                                        class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        step="0.01"
                                                    />
                                                </div>
                                            {:else}
                                                <p class="text-2xl font-bold text-green-600">₹{product.price.toLocaleString()}</p>
                                            {/if}
                                        </div>
    
                                        <!-- MRP -->
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">MRP</label>
                                            {#if isEditing}
                                                <div class="relative">
                                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span class="text-gray-500 sm:text-sm">₹</span>
                                                    </div>
                                                    <input 
                                                        type="number" 
                                                        bind:value={editFields.mrp}
                                                        class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        step="0.01"
                                                    />
                                                </div>
                                            {:else}
                                                <p class="text-gray-900 font-medium">
                                                    {product.mrp ? `₹${product.mrp.toLocaleString()}` : 'Not set'}
                                                    {#if product.mrp && product.mrp > product.price}
                                                        <span class="ml-2 text-sm text-green-600 font-medium">
                                                            ({Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off)
                                                        </span>
                                                    {/if}
                                                </p>
                                            {/if}
                                        </div>
    
                                        <!-- Stock -->
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                                            {#if isEditing}
                                                <input 
                                                    type="number" 
                                                    bind:value={editFields.stock}
                                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            {:else}
                                                <div class="flex items-center">
                                                    <p class="text-gray-900 font-medium mr-3">{product.stock} units</p>
                                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                                                        {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                                                    </span>
                                                </div>
                                            {/if}
                                        </div>
    
                                        <!-- Buy Limit -->
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Buy Limit</label>
                                            {#if isEditing}
                                                <input 
                                                    type="number" 
                                                    bind:value={editFields.buy_limit}
                                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            {:else}
                                                <p class="text-gray-900 font-medium">{product.buy_limit} per customer</p>
                                            {/if}
                                        </div>
    
                                        <!-- Approval Status -->
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Approval Status</label>
                                            {#if isEditing}
                                                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getStatusColor(product.approved)}">
                                                    {getStatusText(product.approved)}
                                                </span>
                                            {:else}
                                                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getStatusColor(product.approved)}">
                                                    {getStatusText(product.approved)}
                                                </span>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            </div>
    
                            <!-- Box Items -->
                            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div class="px-6 py-4 border-b border-gray-200">
                                    <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                                        <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                                        </svg>
                                        Box Contents
                                    </h2>
                                </div>
                                <div class="px-6 py-6">
                                    {#if isEditing}
                                        <textarea 
                                            bind:value={editFields.box_items}
                                            rows="4"
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            placeholder="List items included in the box..."
                                        ></textarea>
                                    {:else}
                                        <p class="text-gray-900 whitespace-pre-wrap">{product.box_items || 'No box contents specified'}</p>
                                    {/if}
                                </div>
                            </div>
                        </div>
    
                        <!-- Sidebar -->
                        <div class="space-y-6">
                            <!-- Product Image -->
                            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div class="px-6 py-4 border-b border-gray-200">
                                    <h2 class="text-lg font-semibold text-gray-900">Main Image</h2>
                                </div>
                                <div class="px-6 py-6">
                                    <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                        {#if isEditing}
                                            <input type="file" accept="image/*" onchange={handleMainImageFileChange} />
                                            <img src={mainImagePreview || product.main_image || '/placeholder.svg?height=400&width=400'} alt={product.name} class="w-full h-full object-cover" />
                                        {:else}
                                            <img 
                                                src={product.main_image || '/placeholder.svg?height=400&width=400'} 
                                                alt={product.name}
                                                class="w-full h-full object-cover"
                                            />
                                        {/if}
                                    </div>
                                </div>
                            </div>
    
                            <!-- Quick Stats -->
                            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div class="px-6 py-4 border-b border-gray-200">
                                    <h2 class="text-lg font-semibold text-gray-900">Quick Stats</h2>
                                </div>
                                <div class="px-6 py-6 space-y-4">
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-500">Rating</span>
                                        <div class="flex items-center">
                                            <span class="text-sm font-medium text-gray-900">{product.rating || 0}</span>
                                            <svg class="w-4 h-4 ml-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-500">Reviews</span>
                                        <span class="text-sm font-medium text-gray-900">{product.review_count || 0}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-500">Popularity</span>
                                        <span class="text-sm font-medium text-gray-900">{product.popularity || 0}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-500">Last Updated</span>
                                        <span class="text-sm font-medium text-gray-900">{formatDate(product.updated)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
    
                {:else if activeTab === 'details'}
                    <!-- Product Details Tab -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Product Information -->
                        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div class="px-6 py-4 border-b border-gray-200">
                                <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                                    </svg>
                                    Product Information
                                </h2>
                            </div>
                            <div class="px-6 py-6 space-y-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    {#if isEditing}
                                        <select 
                                            bind:value={selectedCategoryId}
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select a category</option>
                                            {#each categories as category}
                                                <option value={category.id}>{category.name}</option>
                                            {/each}
                                        </select>
                                    {:else}
                                        <div class="flex items-center">
                                            <img 
                                                src={product.category?.image || '/placeholder.svg?height=40&width=40'} 
                                                alt={product.category?.name}
                                                class="w-10 h-10 rounded-lg object-cover mr-3"
                                            />
                                            <div>
                                                <p class="font-medium text-gray-900">{product.category?.name || 'N/A'}</p>
                                                <p class="text-sm text-gray-500">{product.category?.description || ''}</p>
                                            </div>
                                        </div>
                                    {/if}
                                </div>
    
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                                    {#if isEditing}
                                        <select 
                                            bind:value={selectedBrandId}
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select a brand</option>
                                            {#each brands as brand}
                                                <option value={brand.id}>{brand.name}</option>
                                            {/each}
                                        </select>
                                    {:else}
                                        <p class="font-medium text-gray-900">{product.brand?.name || 'N/A'}</p>
                                    {/if}
                                </div>
    
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Variant</label>
                                    {#if isEditing}
                                        <select 
                                            bind:value={selectedVariantId}
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select a variant</option>
                                            {#each product.variants as variant}
                                                <option value={variant.id}>{variant.name}</option>
                                            {/each}
                                        </select>
                                    {:else}
                                        <p class="font-medium text-gray-900">{product.variant_name || 'No variant'}</p>
                                    {/if}
                                </div>
    
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Seller</label>
                                    {#if isEditing}
                                        <select 
                                            bind:value={selectedSeller}
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select a seller</option>
                                            {#each entities as entity}
                                                <option value={entity.id}>{entity.name}</option>
                                            {/each}
                                        </select>
                                    {:else}
                                        <p class="font-medium text-gray-900">{product.seller?.name || 'N/A'}</p>
                                    {/if}
                                </div>
    
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Product Description</label>
                                    {#if isEditing}
                                        <textarea 
                                            bind:value={selectedDescription}
                                            rows="4"
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            placeholder="Enter product description..."
                                        ></textarea>
                                    {:else}
                                        <div class="prose prose-sm max-w-none">
                                            {@html product.product?.description || '<p class="text-gray-500">No description available</p>'}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </div>
    
                        <!-- Features & Policies -->
                        <div class="space-y-6">
                            <!-- Features -->
                            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div class="px-6 py-4 border-b border-gray-200">
                                    <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                                        <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        Product Features
                                    </h2>
                                </div>
                                <div class="px-6 py-6">
                                    {#if isEditing}
                                        <div>
                                            <select bind:value={newFeature.feature_template_id} class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                                <option value="">Select a feature template</option>
                                                {#each featureTemplates as ft}
                                                    <option value={ft.id}>{ft.name}</option>
                                                {/each}
                                            </select>
                                        </div>
                                        <input bind:value={newFeature.value} class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter feature value..." />
                                        <button onclick={addFeature} class="mt-2 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Add Feature</button>
                                        <ul class="mt-2">
                                            {#each features as feature, i}
                                                <li class="flex items-center justify-between">
                                                    {feature.name} - {feature.value}
                                                    <button onclick={() => removeFeature(i)} class="text-red-500 hover:text-red-600">Remove</button>
                                                </li>
                                            {/each}
                                        </ul>
                                    {:else}
                                        <div class="space-y-3">
                                            {#each product.features?.general as feature}
                                                <div class="flex items-start">
                                                    <svg class="w-4 h-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                                    </svg>
                                                    <div>
                                                        <p class="text-sm font-medium text-gray-900">{feature.name || 'Feature'}</p>
                                                        <p class="text-sm text-gray-600">{feature.value}</p>
                                                    </div>
                                                </div>
                                            {/each}
                                        </div>
                                    {/if}
                                </div>
                            </div>
    
                            <!-- Return Policy -->
                            {#if isEditing}
                                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div class="px-6 py-4 border-b border-gray-200">
                                        <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                                            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                            </svg>
                                            Return & Exchange Policy
                                        </h2>
                                    </div>
                                    <div class="px-6 py-6 space-y-4">
                                        <div>
                                            <h3 class="font-medium text-gray-900 mb-2">{editReturnExchangePolicy?.name}</h3>
                                            <div class="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span class="text-gray-500">Return Available:</span>
                                                    <span class="ml-2 font-medium {editReturnExchangePolicy?.return_available ? 'text-green-600' : 'text-red-600'}">
                                                        {editReturnExchangePolicy?.return_available ? 'Yes' : 'No'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span class="text-gray-500">Return Days:</span>
                                                    <span class="ml-2 font-medium text-gray-900">{editReturnExchangePolicy?.return_days} days</span>
                                                </div>
                                                <div>
                                                    <span class="text-gray-500">Exchange Available:</span>
                                                    <span class="ml-2 font-medium {editReturnExchangePolicy?.exchange_available ? 'text-green-600' : 'text-red-600'}">
                                                        {editReturnExchangePolicy?.exchange_available ? 'Yes' : 'No'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span class="text-gray-500">Exchange Days:</span>
                                                    <span class="ml-2 font-medium text-gray-900">{editReturnExchangePolicy?.exchange_days} days</span>
                                                </div>
                                            </div>
                                            <div class="mt-4">
                                                <span class="text-gray-500 text-sm">Conditions:</span>
                                                <p class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{editReturnExchangePolicy?.conditions}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
    
                {:else if activeTab === 'images'}
                    <!-- Images Tab -->
                    <div class="space-y-6">
                        <!-- Main Image -->
                        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div class="px-6 py-4 border-b border-gray-200">
                                <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                    Main Product Image
                                </h2>
                            </div>
                            <div class="px-6 py-6">
                                {#if isEditing}
                                    <div class="max-w-md mx-auto">
                                        <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                                            <img 
                                                src={editMainImageFile || product.main_image || '/placeholder.svg?height=400&width=400'} 
                                                alt={product.name}
                                                class="w-full h-full object-cover"
                                            />
                                        </div>
                                        <p class="text-sm text-gray-500 text-center mt-2">Main product image</p>
                                    </div>
                                {:else}
                                    <div class="max-w-md mx-auto">
                                        <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                            <img 
                                                src={product.main_image || '/placeholder.svg?height=400&width=400'} 
                                                alt={product.name}
                                                class="w-full h-full object-cover"
                                            />
                                        </div>
                                        <p class="text-sm text-gray-500 text-center mt-2">Main product image</p>
                                    </div>
                                {/if}
                            </div>
                        </div>
    
                        <!-- Gallery Images -->
                        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div class="px-6 py-4 border-b border-gray-200">
                                <div class="flex items-center justify-between">
                                    <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                                        <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                                        </svg>
                                        Gallery Images ({galleryImages.length})
                                    </h2>
                                    <button class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                        </svg>
                                        Add Images
                                    </button>
                                </div>
                            </div>
                            <div class="px-6 py-6">
                                {#if galleryImages.length > 0}
                                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {#each galleryImages as img}
                                            <div class="relative group">
                                                <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                    <img 
                                                        src={img.image || '/placeholder.svg?height=200&width=200'} 
                                                        alt="Gallery"
                                                        class="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                                                    />
                                                </div>
                                                <button 
                                                    onclick={() => deleteGalleryImage(img.id)}
                                                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                >
                                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        {/each}
                                    </div>
                                {:else}
                                    <div class="text-center py-12">
                                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                        <h3 class="mt-2 text-sm font-medium text-gray-900">No gallery images</h3>
                                        <p class="mt-1 text-sm text-gray-500">Get started by uploading some product images.</p>
                                        <div class="mt-6">
                                            <button class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                                </svg>
                                                Upload Images
                                            </button>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
    
                {:else if activeTab === 'analytics'}
                    <!-- Analytics Tab -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <!-- Stats Cards -->
                        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Views</p>
                                    <p class="text-2xl font-semibold text-gray-900">1,234</p>
                                </div>
                            </div>
                        </div>
    
                        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                                        </svg>
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Orders</p>
                                    <p class="text-2xl font-semibold text-gray-900">89</p>
                                </div>
                            </div>
                        </div>
    
                        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                        </svg>
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Rating</p>
                                    <p class="text-2xl font-semibold text-gray-900">{product.rating || 0}</p>
                                </div>
                            </div>
                        </div>
    
                        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                                        </svg>
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Popularity</p>
                                    <p class="text-2xl font-semibold text-gray-900">{product.popularity || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
    
                    <!-- Performance Chart Placeholder -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h2 class="text-lg font-semibold text-gray-900">Performance Overview</h2>
                        </div>
                        <div class="px-6 py-12">
                            <div class="text-center">
                                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4"/>
                                </svg>
                                <h3 class="mt-2 text-sm font-medium text-gray-900">Analytics Coming Soon</h3>
                                <p class="mt-1 text-sm text-gray-500">Detailed analytics and performance metrics will be available here.</p>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    {:else}
        <div class="min-h-screen bg-gray-50 flex items-center justify-center">
            <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Product Not Found</h3>
                <p class="mt-1 text-sm text-gray-500">The product you're looking for doesn't exist or may have been removed.</p>
                <div class="mt-6">
                    <button 
                        onclick={() => goto('/admin/inventory')}
                        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        
                    </button>
                </div>
            </div>
        </div>
    {/if}