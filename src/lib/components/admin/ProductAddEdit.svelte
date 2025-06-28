<script>
    import { run } from 'svelte/legacy';

    import { onMount, onDestroy } from 'svelte';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { PUBLIC_ESTORE_ID } from '$env/static/public';
    import { myFetch } from '$lib/utils/myFetch';
    import { user } from '$lib/stores/auth';
    import { addAlert } from '$lib/stores/alert';
    import TiptapEditor from '$lib/components/wyswyg/TiptapEditor.svelte';

    let authUser;
    const unsubscribe = user.subscribe(value => authUser = value);
    onDestroy(() => unsubscribe());

    // State variables
    let step = $state(1); // 1: Add/Edit Product, 2: Add/Edit Listings
    let product = $state({
        id: null,
        name: '',
        about: '',
        description: '',
        important_info: '',
        base_price: '',
        category_id: null,
        brand_id: null,
        tax_category_id: null,
        country_of_origin: 'India',
        is_service: false
    });
    let productListings = $state([]);
    let currentListing = $state({
        id: null,
        product_id: null,
        name: '',
        price: '',
        mrp: '',
        stock: '',
        buy_limit: 10,
        box_items: '',
        features: [], // Changed to array for table
        approved: false,
        featured: false,
        variant_id: null,
        seller_id: null,
        packer_id: null,
        importer_id: null,
        manufacturer_id: null,
        return_exchange_policy_id: null,
        tax_category_id: null,
        estore_id: PUBLIC_ESTORE_ID,
        main_image: null
    });
    let variants = $state([]);
    let newVariant = $state({ name: '', attributes: [] }); // Changed to array for table
    let categories = $state([]);
    let brands = $state([]);
    let entities = $state([]);
    let returnExchangePolicies = $state([]);
    let taxCategories = $state([]);
    let featureTemplates = $state([]);
    let errors = $state({});
    let isSubmitting = $state(false);
    let editorContent = $state('<p></p>');
    let editMode = $state(false);
    let productId = null;
    let isProductDropdownOpen = $state(false);

    // Modal state
    let showModal = $state(false);
    let modalType = $state(''); // 'product' or 'listing'
    let modalData = $state(null);
    let modalEditorContent = $state('<p></p>');

    // Feature and attribute form states
    let newFeature = $state({ feature_template_id: null, value: '' });
    let newAttribute = $state({ name: '', value: '', real_value: '' });

    let pendingGalleryImages = $state([]);
    let galleryImages = $state([]);

    // Fetch initial data
    onMount(async () => {
        try {
            const [catRes, brandRes, entityRes, policyRes, taxRes, featureRes] = await Promise.all([
                myFetch(`${PUBLIC_API_URL}/product/categories/?page=1&page_size=100`),
                myFetch(`${PUBLIC_API_URL}/user/entities/?page=1&page_size=100&entity_type=brand`),
                myFetch(`${PUBLIC_API_URL}/user/entities/?page=1&page_size=100`),
                myFetch(`${PUBLIC_API_URL}/product/return-exchange-policies/?page=1&page_size=100`),
                myFetch(`${PUBLIC_API_URL}/taxation/tax-categories/?page=1&page_size=100`),
                myFetch(`${PUBLIC_API_URL}/product/feature-templates/?page=1&page_size=100`)
            ]);
            categories = catRes.results;
            brands = brandRes.results;
            entities = entityRes.results;
            returnExchangePolicies = policyRes.results;
            taxCategories = taxRes.results;
            featureTemplates = featureRes.results;

            const urlParams = new URLSearchParams(window.location.search);
            productId = urlParams.get('product_id');
            if (productId) {
                editMode = true;
                await fetchProductData(productId);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            addAlert('Failed to load initial data.', 'error');
        }
    });

    async function fetchProductData(id) {
        try {
            const productRes = await myFetch(`${PUBLIC_API_URL}/product/products/${id}/`, 'GET', null, authUser.access_token);
            const listingRes = await myFetch(`${PUBLIC_API_URL}/product/product-listings/?product_id=${id}`, 'GET', null, authUser.access_token);
            
            product = {
                ...productRes,
                category_id: productRes.category?.id || null,
                brand_id: productRes.brand?.id || null,
                tax_category_id: productRes.tax_category?.id || null
            };
            console.log(product)
            editorContent = productRes.description || '<p></p>';
            productListings = listingRes.results.map(listing => ({
                ...listing,
                features: listing.features?.general || [] // Convert features to array
            }));
            variants = productRes.variants || [];
            step = productListings.length > 0 ? 2 : 1;
            isProductDropdownOpen = true;
        } catch (error) {
            console.error('Error fetching product data:', error);
            addAlert('Failed to load product data.', 'error');
        }
    }

    function handleEditorChange(event) {
        editorContent = event.detail;
        product.description = editorContent;
    }

    function handleModalEditorChange(event) {
        modalEditorContent = event.detail;
        modalData.description = modalEditorContent;
    }

    function validateProductForm(data) {
        errors = {};
        if (!data.name.trim()) errors.name = 'Product name is required.';
        if (!data.category_id) errors.category_id = 'Category is required.';
        if (!data.brand_id) errors.brand_id = 'Brand is required.';
        return Object.keys(errors).length === 0;
    }

    async function submitProduct(event) {
        event.preventDefault();
        if (!validateProductForm(product)) return;
        isSubmitting = true;
        try {
            const formData = {
                ...product,
                description: editorContent || null,
                base_price: parseFloat(product.base_price) || 0
            };
            const method = editMode ? 'PUT' : 'POST';
            const url = editMode ? `${PUBLIC_API_URL}/product/products/${product.id}/` : `${PUBLIC_API_URL}/product/products/`;
            const response = await myFetch(url, method, formData, authUser.access_token);
            if (response) {
                product = { ...product, ...response };
                currentListing.product_id = response.id;
                addAlert(editMode ? 'Product updated successfully!' : 'Product added successfully! Now add a listing.', 'success');
                step = 2;
                isProductDropdownOpen = true;
            }
        } catch (error) {
            console.error('Error submitting product:', error);
            addAlert('Failed to submit product: ' + (error.detail || error), 'error');
        } finally {
            isSubmitting = false;
        }
    }

    function validateListingForm(data) {
        errors = {};
        if (!data.price || data.price <= 0) errors.price = 'Price must be a positive number.';
        if (!data.stock || data.stock < 0) errors.stock = 'Stock must be a non-negative number.';
        if (!data.buy_limit || data.buy_limit < 1) errors.buy_limit = 'Buy limit must be at least 1.';
        return Object.keys(errors).length === 0;
    }

    async function submitProductListing(event) {
        event.preventDefault();
        if (!validateListingForm(currentListing)) return;
        isSubmitting = true;
        try {
            // Ensure seller_id is set before submission
            currentListing.seller_id = authUser?.entity?.id || currentListing.seller_id;
            let formData;
            let useFormData = currentListing.main_image instanceof File;
            if (useFormData) {
                formData = new FormData();
                for (const key in currentListing) {
                    let value = currentListing[key];
                    // Only append if value is not null, undefined, or empty string
                    if (value !== null && value !== undefined && value !== "") {
                        // For integer fields, ensure we only append if value is a valid integer
                        if ([
                            'variant_id', 'manufacturer_id', 'packer_id', 'importer_id',
                            'return_exchange_policy_id', 'tax_category_id', 'estore_id',
                            'product_id', 'seller_id', 'stock', 'buy_limit', 'price', 'mrp'
                        ].includes(key)) {
                            // Only append if value is a valid number
                            if (!isNaN(Number(value))) {
                                formData.append(key, Number(value));
                            }
                        } else if (key === 'main_image' && value instanceof File) {
                            formData.append('main_image', value);
                        } else if (key === 'features') {
                            formData.append('features', JSON.stringify({ general: value }));
                        } else {
                            formData.append(key, value);
                        }
                    }
                }
            }
            const jsonData = {
                ...currentListing,
                product_id: currentListing.product_id ? parseInt(currentListing.product_id) : undefined,
                price: currentListing.price ? parseFloat(currentListing.price) : undefined,
                mrp: currentListing.mrp ? parseFloat(currentListing.mrp) : undefined,
                stock: currentListing.stock ? parseInt(currentListing.stock) : undefined,
                buy_limit: currentListing.buy_limit ? parseInt(currentListing.buy_limit) : undefined,
                seller_id: currentListing.seller_id,
                estore_id: PUBLIC_ESTORE_ID,
                variant_id: currentListing.variant_id ? parseInt(currentListing.variant_id) : undefined,
                manufacturer_id: currentListing.manufacturer_id ? parseInt(currentListing.manufacturer_id) : undefined,
                packer_id: currentListing.packer_id ? parseInt(currentListing.packer_id) : undefined,
                importer_id: currentListing.importer_id ? parseInt(currentListing.importer_id) : undefined,
                return_exchange_policy_id: currentListing.return_exchange_policy_id ? parseInt(currentListing.return_exchange_policy_id) : undefined,
                tax_category_id: currentListing.tax_category_id ? parseInt(currentListing.tax_category_id) : undefined,
                features: { general: currentListing.features }
            };
            const method = currentListing.id ? 'PUT' : 'POST';
            const url = currentListing.id ? `${PUBLIC_API_URL}/product/product-listings/${currentListing.id}/` : `${PUBLIC_API_URL}/product/product-listings/`;
            let response;
            if (useFormData) {
                response = await fetch(url, {
                    method,
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${authUser.access_token}`
                    }
                });
            } else {
                response = await fetch(url, {
                    method,
                    body: JSON.stringify(jsonData),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authUser.access_token}`
                    }
                });
            }
            if (response.ok) {
                const data = await response.json();
                if (!currentListing.id && pendingGalleryImages.length > 0) {
                    await uploadPendingGalleryImages(data.id);
                }
                if (currentListing.id) {
                    productListings = productListings.map(l => l.id === data.id ? { ...data, features: data.features?.general || [] } : l);
                } else {
                    productListings = [...productListings, { ...data, features: data.features?.general || [] }];
                }
                resetListingForm();
                addAlert('Product listing saved successfully!', 'success');
            } else {
                addAlert('Failed to submit listing', 'error');
            }
        } catch (error) {
            console.error('Error submitting listing:', error);
            addAlert('Failed to submit listing: ' + (error.detail || error), 'error');
        } finally {
            isSubmitting = false;
        }
    }

    function addFeature() {
        if (!newFeature.feature_template_id || !newFeature.value.trim()) {
            addAlert('Feature template and value are required.', 'error');
            return;
        }
        currentListing.features = [...currentListing.features, { ...newFeature }];
        newFeature = { feature_template_id: null, value: '' };
    }

    function removeFeature(index) {
        currentListing.features = currentListing.features.filter((_, i) => i !== index);
    }

    function addAttribute() {
        if (!newAttribute.name.trim() || !newAttribute.value.trim()) {
            addAlert('Attribute name and value are required.', 'error');
            return;
        }
        newVariant.attributes = [...newVariant.attributes, { ...newAttribute }];
        newAttribute = { name: '', value: '', real_value: '' };
    }

    function removeAttribute(index) {
        newVariant.attributes = newVariant.attributes.filter((_, i) => i !== index);
    }

    function resetListingForm() {
        currentListing = {
            id: null,
            product_id: product.id,
            name: '',
            price: '',
            mrp: '',
            stock: '',
            buy_limit: 10,
            box_items: '',
            features: [],
            approved: false,
            featured: false,
            variant_id: null,
            seller_id: authUser?.entity.id,
            packer_id: null,
            importer_id: null,
            manufacturer_id: null,
            return_exchange_policy_id: null,
            tax_category_id: null,
            estore_id: PUBLIC_ESTORE_ID,
            main_image: null
        };
    }

    function editProduct() {
        modalType = 'product';
        modalData = { ...product };
        modalEditorContent = product.description || '<p></p>';
        showModal = true;
    }

    function editListing(listing) {
        modalType = 'listing';
        modalData = { ...listing, features: listing.features || [] };
        showModal = true;
    }

    function deleteListing(id) {
        if (confirm('Are you sure you want to delete this listing?')) {
            myFetch(`${PUBLIC_API_URL}/product/product-listings/${id}/`, 'DELETE', null, authUser.access_token)
                .then(() => {
                    productListings = productListings.filter(l => l.id !== id);
                    addAlert('Listing deleted successfully!', 'success');
                })
                .catch(error => {
                    console.error('Error deleting listing:', error);
                    addAlert('Failed to delete listing.', 'error');
                });
        }
    }

    async function addVariant() {
        if (!newVariant.name.trim()) {
            addAlert('Variant name is required.', 'error');
            return;
        }
        try {
            const response = await myFetch(`${PUBLIC_API_URL}/product/variants/`, 'POST', {
                product_id: product.id,
                name: newVariant.name,
                attributes: newVariant.attributes.reduce((acc, attr) => {
                    acc[attr.name] = attr.value;
                    return acc;
                }, {})
            }, authUser.access_token);
            variants = [...variants, response];
            newVariant = { name: '', attributes: [] };
            addAlert('Variant added successfully!', 'success');
        } catch (error) {
            console.error('Error adding variant:', error);
            addAlert('Failed to add variant.', 'error');
        }
    }

    async function submitModalData(event) {
        event.preventDefault();
        if (modalType === 'product') {
            if (!validateProductForm(modalData)) return;
            isSubmitting = true;
            try {
                const formData = {
                    ...modalData,
                    description: modalEditorContent || null,
                    base_price: parseFloat(modalData.base_price) || 0
                };
                const response = await myFetch(`${PUBLIC_API_URL}/product/products/${modalData.id}/`, 'PUT', formData, authUser.access_token);
                if (response) {
                    product = { ...product, ...modalData, ...response };
                    addAlert('Product updated successfully!', 'success');
                    closeModal();
                }
            } catch (error) {
                console.error('Error updating product:', error);
                addAlert('Failed to update product: ' + (error.detail || error), 'error');
            } finally {
                isSubmitting = false;
            }
        } else if (modalType === 'listing') {
            if (!validateListingForm(modalData)) return;
            isSubmitting = true;
            try {
                const jsonData = {
                    ...modalData,
                    product_id: parseInt(modalData.product_id),
                    price: parseFloat(modalData.price) || 0,
                    mrp: modalData.mrp ? parseFloat(modalData.mrp) : null,
                    stock: parseInt(modalData.stock) || 0,
                    buy_limit: parseInt(modalData.buy_limit) || 10,
                    seller_id: authUser?.entity.id,
                    estore_id: PUBLIC_ESTORE_ID,
                    variant_id: modalData.variant_id ? parseInt(modalData.variant_id) : null,
                    manufacturer_id: modalData.manufacturer_id ? parseInt(modalData.manufacturer_id) : null,
                    packer_id: modalData.packer_id ? parseInt(modalData.packer_id) : null,
                    importer_id: modalData.importer_id ? parseInt(modalData.importer_id) : null,
                    return_exchange_policy_id: modalData.return_exchange_policy_id ? parseInt(modalData.return_exchange_policy_id) : null,
                    tax_category_id: modalData.tax_category_id ? parseInt(modalData.tax_category_id) : null,
                    features: { general: modalData.features }
                };
                const response = await myFetch(`${PUBLIC_API_URL}/product/product-listings/${modalData.id}/`, 'PUT', jsonData, authUser.access_token);
                if (response) {
                    productListings = productListings.map(l => l.id === response.id ? { ...response, features: response.features?.general || [] } : l);
                    addAlert('Product listing updated successfully!', 'success');
                    closeModal();
                }
            } catch (error) {
                console.error('Error updating listing:', error);
                addAlert('Failed to update listing: ' + (error.detail || error), 'error');
            } finally {
                isSubmitting = false;
            }
        }
    }

    function closeModal() {
        showModal = false;
        modalType = '';
        modalData = null;
        modalEditorContent = '<p></p>';
        errors = {};
    }

    function toggleProductDropdown() {
        isProductDropdownOpen = !isProductDropdownOpen;
    }

    function handleMainImageFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            currentListing.main_image = file;
        }
    }

    async function handleModalMainImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch(`${PUBLIC_API_URL}/product/product-listing-images/`, {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: `Bearer ${authUser.access_token}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            modalData.main_image = data.image;
        } else {
            addAlert('Failed to upload image', 'error');
        }
    }

    function handleGalleryImagesSelect(event) {
        pendingGalleryImages = Array.from(event.target.files);
    }

    async function uploadPendingGalleryImages(listingId) {
        for (const file of pendingGalleryImages) {
            const formData = new FormData();
            formData.append('product_listing_id', listingId);
            formData.append('image', file);
            await fetch(`${PUBLIC_API_URL}/product/product-listing-images/`, {
                method: 'POST',
                body: formData,
                headers: { Authorization: `Bearer ${authUser.access_token}` }
            });
        }
        pendingGalleryImages = [];
        await fetchGalleryImages(listingId);
    }

    async function fetchGalleryImages(listingId) {
        const res = await fetch(`${PUBLIC_API_URL}/product/product-listing-images/?product_listing_id=${listingId}`);
        if (res.ok) {
            const data = await res.json();
            galleryImages = data.results || [];
        }
    }

    async function deleteGalleryImage(imageId, listingId) {
        await fetch(`${PUBLIC_API_URL}/product/product-listing-images/${imageId}/`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${authUser.access_token}` }
        });
        await fetchGalleryImages(listingId);
    }

    // Fetch gallery images when a listing is selected/created
    run(() => {
        if (currentListing.id) fetchGalleryImages(currentListing.id);
    });
</script>

<!-- Main Container -->
<div class="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">
                        {editMode ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <p class="mt-2 text-gray-600">
                        {step === 1 ? 'Create your product details' : 'Manage product listings and variants'}
                    </p>
                </div>
                
                <!-- Progress Steps -->
                <div class="hidden sm:flex items-center space-x-4">
                    <div class="flex items-center">
                        <div class="flex items-center justify-center w-8 h-8 rounded-full {step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} font-semibold text-sm">
                            1
                        </div>
                        <span class="ml-2 text-sm font-medium {step >= 1 ? 'text-blue-600' : 'text-gray-500'}">Product</span>
                    </div>
                    <div class="w-8 h-0.5 {step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}"></div>
                    <div class="flex items-center">
                        <div class="flex items-center justify-center w-8 h-8 rounded-full {step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} font-semibold text-sm">
                            2
                        </div>
                        <span class="ml-2 text-sm font-medium {step >= 2 ? 'text-blue-600' : 'text-gray-500'}">Listings</span>
                    </div>
                </div>
            </div>
        </div>

        {#if step === 1}
            <!-- Product Form -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-8 sm:px-8">
                    <form onsubmit={submitProduct} class="space-y-8">
                        <!-- Basic Information -->
                    <div>
                            <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                Basic Information
                            </h2>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Product Name -->
                                <div class="md:col-span-2">
                                    <label for="product-name" class="block text-sm font-medium text-gray-700 mb-2">
                                        Product Name <span class="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        bind:value={product.name}
                                        id="product-name"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors {errors.name ? 'border-red-500' : ''}"
                                        placeholder="Enter a descriptive product name"
                                    />
                                    {#if errors.name}
                                        <p class="mt-1 text-sm text-red-600 flex items-center">
                                            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                            </svg>
                                            {errors.name}
                                        </p>
                                    {/if}
                    </div>

                                <!-- Category -->
                    <div>
                                    <label for="product-category" class="block text-sm font-medium text-gray-700 mb-2">
                                        Category <span class="text-red-500">*</span>
                                    </label>
                                    <select 
                                        bind:value={product.category_id}
                                        id="product-category"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors {errors.category_id ? 'border-red-500' : ''}"
                                    >
                                        <option value="">Select a category</option>
                            {#each categories as category}
                                <option value={category.id}>{category.name}</option>
                            {/each}
                        </select>
                                    {#if errors.category_id}
                                        <p class="mt-1 text-sm text-red-600 flex items-center">
                                            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                            </svg>
                                            {errors.category_id}
                                        </p>
                                    {/if}
                    </div>

                                <!-- Brand -->
                    <div>
                                    <label for="product-brand" class="block text-sm font-medium text-gray-700 mb-2">
                                        Brand <span class="text-red-500">*</span>
                                    </label>
                                    <select 
                                        bind:value={product.brand_id}
                                        id="product-brand"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors {errors.brand_id ? 'border-red-500' : ''}"
                                    >
                                        <option value="">Select a brand</option>
                            {#each brands as brand}
                                <option value={brand.id}>{brand.name}</option>
                            {/each}
                        </select>
                                    {#if errors.brand_id}
                                        <p class="mt-1 text-sm text-red-600 flex items-center">
                                            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                            </svg>
                                            {errors.brand_id}
                                        </p>
                                    {/if}
                    </div>

                                <!-- Tax Category -->
                    <div>
                                    <label for="product-tax" class="block text-sm font-medium text-gray-700 mb-2">Tax Category</label>
                                    <select 
                                        bind:value={product.tax_category_id}
                                        id="product-tax"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                            <option value="">Select tax category</option>
                            {#each taxCategories as tax}
                                <option value={tax.id}>{tax.name}</option>
                            {/each}
                        </select>
                    </div>

                                <!-- Country of Origin -->
                    <div>
                                    <label for="product-country" class="block text-sm font-medium text-gray-700 mb-2">Country of Origin</label>
                                    <input 
                                        type="text" 
                                        bind:value={product.country_of_origin}
                                        id="product-country"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="e.g., India"
                                    />
                    </div>

                                <!-- Base Price -->
                    <div>
                                    <label for="product-base-price" class="block text-sm font-medium text-gray-700 mb-2">Base Price (₹)</label>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span class="text-gray-500 sm:text-sm">₹</span>
                    </div>
                                        <input 
                                            type="number" 
                                            bind:value={product.base_price}
                                            id="product-base-price"
                                            class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="0.00" 
                                            step="0.01"
                                        />
                    </div>
                </div>

                                <!-- Is Service -->
                                <div class="flex items-center">
                                    <div class="flex items-center h-5">
                                        <input 
                                            type="checkbox" 
                                            bind:checked={product.is_service} 
                                            class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                    </div>
                                    <div class="ml-3">
                                        <label class="text-sm font-medium text-gray-700">This is a service</label>
                                        <p class="text-sm text-gray-500">Check if this product is a service rather than a physical item</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Product Details -->
                <div>
                            <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                Product Details
                            </h2>

                            <div class="space-y-6">
                                <!-- About -->
                                <div>
                                    <label for="product-about" class="block text-sm font-medium text-gray-700 mb-2">About</label>
                                    <textarea 
                                        bind:value={product.about}
                                        id="product-about"
                                        rows="3"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                        placeholder="Brief description about the product"
                                    ></textarea>
                </div>

                                <!-- Important Info -->
                <div>
                                    <label for="product-important-info" class="block text-sm font-medium text-gray-700 mb-2">Important Information</label>
                                    <textarea 
                                        bind:value={product.important_info}
                                        id="product-important-info"
                                        rows="3"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                        placeholder="Important information customers should know"
                                    ></textarea>
                </div>

                                <!-- Description -->
                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Detailed Description</label>
                                    <div class="border border-gray-300 rounded-lg overflow-hidden">
                    <TiptapEditor content={editorContent} on:change={handleEditorChange} />
                </div>
                                </div>
                            </div>
                        </div>

                        <!-- Submit Button -->
                        <div class="flex justify-end pt-6 border-t border-gray-200">
                            <button 
                                type="submit"
                                disabled={isSubmitting} 
                                class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                        {#if isSubmitting}
                                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                        {:else}
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    {editMode ? 'Update Product' : 'Continue to Listings'}
                        {/if}
                    </button>
                </div>
                    </form>
            </div>
            </div>

        {:else}
            <!-- Step 2: Listings Management -->
            <div class="space-y-8">
                <!-- Product Summary Card -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200 cursor-pointer" onclick={toggleProductDropdown}>
                        <div class="flex items-center justify-between">
                            <div>
                                <h2 class="text-lg font-semibold text-gray-900">{product.name}</h2>
                                <p class="text-sm text-gray-500">Product Details</p>
                </div>
                            <div class="flex items-center space-x-3">
                                <button 
                                    onclick={editProduct}
                                    class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                    Edit
                                </button>
                                <svg class="w-5 h-5 text-gray-400 transform transition-transform {isProductDropdownOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                {#if isProductDropdownOpen}
                        <div class="px-6 py-4 bg-gray-50">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span class="font-medium text-gray-700">Category:</span>
                                    <span class="ml-2 text-gray-900">{categories.find(c => c.id === product.category_id)?.name || 'N/A'}</span>
                                </div>
                                <div>
                                    <span class="font-medium text-gray-700">Brand:</span>
                                    <span class="ml-2 text-gray-900">{brands.find(b => b.id === product.brand_id)?.name || 'N/A'}</span>
                                </div>
                                <div>
                                    <span class="font-medium text-gray-700">Country:</span>
                                    <span class="ml-2 text-gray-900">{product.country_of_origin}</span>
                                </div>
                                <div>
                                    <span class="font-medium text-gray-700">Base Price:</span>
                                    <span class="ml-2 text-gray-900">₹{product.base_price || '0'}</span>
                                </div>
                                <div>
                                    <span class="font-medium text-gray-700">Type:</span>
                                    <span class="ml-2 text-gray-900">{product.is_service ? 'Service' : 'Product'}</span>
                                </div>
                            </div>
                            {#if product.about}
                                <div class="mt-4">
                                    <span class="font-medium text-gray-700">About:</span>
                                    <p class="mt-1 text-gray-900">{product.about}</p>
                                </div>
                            {/if}
                    </div>
                {/if}
            </div>

                <!-- Variants Section -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-4-8a2 2 0 01-2-2V7a2 2 0 012-2h2m0 0V3a2 2 0 012-2h4a2 2 0 012 2v2M9 7h6"/>
                            </svg>
                            Product Variants
                        </h2>
                        <p class="text-sm text-gray-500 mt-1">Create different variations of your product (e.g., size, color, model)</p>
                    </div>

                    <div class="px-6 py-6">
                        <!-- Existing Variants -->
                        {#if variants.length > 0}
                            <div class="space-y-4 mb-8">
                                {#each variants as variant (variant.id || variant.name)}
                                    <div class="border border-gray-200 rounded-lg p-4">
                                        <h3 class="font-medium text-gray-900 mb-3">{variant.name}</h3>
                                        <div class="overflow-x-auto">
                                            <table class="min-w-full divide-y divide-gray-200">
                                                <thead class="bg-gray-50">
                                                    <tr>
                                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attribute</th>
                                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody class="bg-white divide-y divide-gray-200">
                                                    {#each Object.entries(variant.attributes) as [name, value]}
                                                        <tr>
                                                            <td class="px-4 py-2 text-sm font-medium text-gray-900">{name}</td>
                                                            <td class="px-4 py-2 text-sm text-gray-500">{value}</td>
                                                        </tr>
                                                    {/each}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {/if}

                        <!-- Add New Variant -->
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Variant</h3>
                            
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Variant Name</label>
                                    <input 
                                        type="text" 
                                        bind:value={newVariant.name} 
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., Red 128GB, Large Size, etc."
                                    />
                                </div>

                                <!-- Attributes Table -->
                                {#if newVariant.attributes.length > 0}
                                    <div class="overflow-x-auto">
                                        <table class="min-w-full divide-y divide-gray-200">
                                            <thead class="bg-gray-50">
                                                <tr>
                                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Real Value</th>
                                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody class="bg-white divide-y divide-gray-200">
                                                {#each newVariant.attributes as attribute, index}
                                                    <tr>
                                                        <td class="px-4 py-2 text-sm text-gray-900">{attribute.name}</td>
                                                        <td class="px-4 py-2 text-sm text-gray-900">{attribute.value}</td>
                                                        <td class="px-4 py-2 text-sm text-gray-900">{attribute.real_value}</td>
                                                        <td class="px-4 py-2">
                                                            <button 
                                                                onclick={() => removeAttribute(index)} 
                                                                class="text-red-600 hover:text-red-800 text-sm font-medium"
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                {/each}
                                            </tbody>
                                        </table>
                                    </div>
                                {/if}

                                <!-- Add Attribute Form -->
                                <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                    <input 
                                        type="text" 
                                        bind:value={newAttribute.name} 
                                        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Attribute name"
                                    />
                                    <input 
                                        type="text" 
                                        bind:value={newAttribute.value} 
                                        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Value"
                                    />
                                    <input 
                                        type="text" 
                                        bind:value={newAttribute.real_value} 
                                        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Real value"
                                    />
                                    <button 
                                        onclick={addAttribute} 
                                        class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                        </svg>
                                        Add
                                    </button>
                                </div>

                                <div class="flex justify-end">
                                    <button 
                                        onclick={addVariant} 
                                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                        </svg>
                                        Add Variant
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>

            <!-- Listings Section -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                                    </svg>
                                    Product Listings ({productListings.length})
                                </h2>
                                <p class="text-sm text-gray-500 mt-1">Manage pricing, inventory, and availability</p>
            </div>
                            <button 
                                onclick={resetListingForm} 
                                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                </svg>
                                Add New Listing
                            </button>
                        </div>
                    </div>

                    <div class="px-6 py-6">
            {#if productListings.length === 0}
                            <div class="text-center py-12">
                                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7"/>
                                </svg>
                                <h3 class="mt-2 text-sm font-medium text-gray-900">No listings yet</h3>
                                <p class="mt-1 text-sm text-gray-500">Get started by creating your first product listing.</p>
                                <div class="mt-6">
                                    <button 
                                        onclick={resetListingForm} 
                                        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                        </svg>
                                        Create First Listing
                                    </button>
                                </div>
                            </div>
                        {:else}
                            <!-- Existing Listings Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {#each productListings as listing (listing.id)}
                                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div class="flex items-start justify-between mb-3">
                                            <h3 class="font-medium text-gray-900 truncate">{listing.name || product.name}</h3>
                                            <div class="flex items-center space-x-2 ml-2">
                                                <button 
                                                    onclick={() => editListing(listing)} 
                                                    class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onclick={() => deleteListing(listing.id)} 
                                                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
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
                                            <div class="flex justify-between">
                                                <span class="text-gray-500">Variant:</span>
                                                <span class="font-medium text-gray-900">{variants.find(v => v.id === listing.variant_id)?.name || 'None'}</span>
                                            </div>
                        </div>
                    </div>
                {/each}
            </div>
                        {/if}

                        <!-- Add New Listing Form -->
            {#if !currentListing.id}
                            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-6">Add New Listing</h3>
                                
                                <form onsubmit={submitProductListing} class="space-y-6">
                                    <!-- Basic Listing Info -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                                            <label for="listing-name" class="block text-sm font-medium text-gray-700 mb-2">Listing Name</label>
                                            <input 
                                                type="text" 
                                                bind:value={currentListing.name}
                                                id="listing-name"
                                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Optional custom name"
                                            />
                        </div>

                        <div>
                                            <label for="listing-price" class="block text-sm font-medium text-gray-700 mb-2">
                                                Price (₹) <span class="text-red-500">*</span>
                                            </label>
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
                                                />
                                            </div>
                                        </div>

                        <div>
                                            <label for="listing-stock" class="block text-sm font-medium text-gray-700 mb-2">
                                                Stock <span class="text-red-500">*</span>
                                            </label>
                                            <input 
                                                type="number" 
                                                bind:value={currentListing.stock}
                                                id="listing-stock"
                                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {errors.stock ? 'border-red-500' : ''}"
                                                placeholder="0"
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
                                            <label for="listing-buy-limit" class="block text-sm font-medium text-gray-700 mb-2">
                                                Buy Limit <span class="text-red-500">*</span>
                                            </label>
                                            <input 
                                                type="number" 
                                                bind:value={currentListing.buy_limit}
                                                id="listing-buy-limit"
                                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {errors.buy_limit ? 'border-red-500' : ''}"
                                                placeholder="10"
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
                                            >
                                <option value="">No variant</option>
                                {#each variants as variant}
                                    <option value={variant.id}>{variant.name}</option>
                                {/each}
                            </select>
                        </div>
                                    </div>

                                    <!-- Additional Details -->
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                                            <select 
                                                bind:value={currentListing.manufacturer_id} 
                                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                            >
                                <option value="">Select tax category</option>
                                {#each taxCategories as tax}
                                    <option value={tax.id}>{tax.name}</option>
                                {/each}
                            </select>
                        </div>
                    </div>

                                    <!-- Box Items -->
                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Box Items</label>
                                        <textarea 
                                            bind:value={currentListing.box_items} 
                                            rows="3"
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            placeholder="List items included in the box"
                                        ></textarea>
                    </div>

                                    <!-- Features Section -->
                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-4">Product Features</label>
                                        
                                        {#if currentListing.features.length > 0}
                                            <div class="mb-4 overflow-x-auto">
                                                <table class="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                                    <thead class="bg-gray-50">
                                                        <tr>
                                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                                    <tbody class="bg-white divide-y divide-gray-200">
                                    {#each currentListing.features as feature, index}
                                        <tr>
                                                                <td class="px-4 py-3 text-sm text-gray-900">
                                                                    {featureTemplates.find(ft => ft.id === feature.feature_template_id)?.name || 'N/A'}
                                                                </td>
                                                                <td class="px-4 py-3 text-sm text-gray-900">{feature.value}</td>
                                                                <td class="px-4 py-3">
                                                                    <button 
                                                                        onclick={() => removeFeature(index)} 
                                                                        class="text-red-600 hover:text-red-800 text-sm font-medium"
                                                                    >
                                                                        Remove
                                                                    </button>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                                        {/if}

                                        <!-- Add Feature Form -->
                                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <select 
                                                bind:value={newFeature.feature_template_id} 
                                                class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                <option value="">Select feature</option>
                                {#each featureTemplates as ft}
                                    <option value={ft.id}>{ft.name}</option>
                                {/each}
                            </select>
                                            <input 
                                                type="text" 
                                                bind:value={newFeature.value} 
                                                class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Feature value"
                                            />
                                            <button 
                                                type="button"
                                                onclick={addFeature} 
                                                class="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                            >
                                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                                </svg>
                                                Add
                                            </button>
                        </div>
                    </div>

                                    <!-- Images Section -->
                                    <div class="space-y-6">
                                        <!-- Main Image -->
                    <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Main Image</label>
                                            <div class="flex items-center space-x-4">
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onchange={handleMainImageFileChange} 
                                                    class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                {#if currentListing.main_image && typeof currentListing.main_image === 'string'}
                                                    <img src={currentListing.main_image || "/placeholder.svg"} alt="Main Image" class="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                            {/if}
                    </div>
                </div>

                                        <!-- Gallery Images -->
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                multiple 
                                                onchange={handleGalleryImagesSelect} 
                                                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                            
                                            {#if !currentListing.id && pendingGalleryImages.length > 0}
                                                <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                                    {#each pendingGalleryImages as file}
                                                        <div class="relative">
                                                            <img src={URL.createObjectURL(file) || "/placeholder.svg"} alt="Preview" class="h-20 w-20 object-cover rounded-lg border border-gray-200" />
                                                        </div>
                                    {/each}
                        </div>
                                            {/if}
                                            
                                            {#if currentListing.id && galleryImages.length > 0}
                                                <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                                    {#each galleryImages as img}
                                                        <div class="relative">
                                                            <img src={img.image || "/placeholder.svg"} alt="Gallery" class="h-20 w-20 object-cover rounded-lg border border-gray-200" />
                                                            <button 
                                                                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500" 
                                                                onclick={() => deleteGalleryImage(img.id, currentListing.id)}
                                                            >
                                                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                                                </svg>
                                                            </button>
                    </div>
                {/each}
                    </div>
                                            {/if}
                    </div>
                    </div>

                                    <!-- Form Actions -->
                                    <div class="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 space-y-4 sm:space-y-0">
                                        <button 
                                            type="button"
                                            onclick={() => step = 1} 
                                            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                                            </svg>
                                            Back to Product
                                        </button>
                                        
                                        <button 
                                            type="submit"
                                            disabled={isSubmitting} 
                                            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {#if isSubmitting}
                                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            {:else}
                                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                                </svg>
                                                Add Listing
                                            {/if}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
    </div>

    <!-- Modal for Editing -->
    {#if showModal}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <!-- Modal Header -->
                <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900">
                        {modalType === 'product' ? 'Edit Product' : 'Edit Listing'}
                    </h3>
                    <button 
                        onclick={closeModal}
                        class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <!-- Modal Content -->
                <div class="px-6 py-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <form onsubmit={submitModalData} class="space-y-6">
                    {#if modalType === 'product'}
                            <!-- Product Edit Form -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="md:col-span-2">
                                    <label for="modal-product-name" class="block text-sm font-medium text-gray-700 mb-2">
                                        Product Name <span class="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        bind:value={modalData.name}
                                        id="modal-product-name"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {errors.name ? 'border-red-500' : ''}"
                                        placeholder="Enter product name"
                                    />
                                    {#if errors.name}
                                        <p class="mt-1 text-sm text-red-600">{errors.name}</p>
                                    {/if}
                            </div>

                            <div>
                                    <label for="modal-product-category" class="block text-sm font-medium text-gray-700 mb-2">
                                        Category <span class="text-red-500">*</span>
                                    </label>
                                    <select 
                                        bind:value={modalData.category_id}
                                        id="modal-product-category"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {errors.category_id ? 'border-red-500' : ''}"
                                    >
                                    <option value="">Select category</option>
                                    {#each categories as category}
                                        <option value={category.id}>{category.name}</option>
                                    {/each}
                                </select>
                                    {#if errors.category_id}
                                        <p class="mt-1 text-sm text-red-600">{errors.category_id}</p>
                                    {/if}
                            </div>

                            <div>
                                    <label for="modal-product-brand" class="block text-sm font-medium text-gray-700 mb-2">
                                        Brand <span class="text-red-500">*</span>
                                    </label>
                                    <select 
                                        bind:value={modalData.brand_id}
                                        id="modal-product-brand"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {errors.brand_id ? 'border-red-500' : ''}"
                                    >
                                    <option value="">Select brand</option>
                                    {#each brands as brand}
                                        <option value={brand.id}>{brand.name}</option>
                                    {/each}
                                </select>
                                    {#if errors.brand_id}
                                        <p class="mt-1 text-sm text-red-600">{errors.brand_id}</p>
                                    {/if}
                            </div>

                            <div>
                                    <label for="modal-product-tax" class="block text-sm font-medium text-gray-700 mb-2">Tax Category</label>
                                    <select 
                                        bind:value={modalData.tax_category_id}
                                        id="modal-product-tax"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                    <option value="">Select tax category</option>
                                    {#each taxCategories as tax}
                                        <option value={tax.id}>{tax.name}</option>
                                    {/each}
                                </select>
                            </div>

                            <div>
                                    <label for="modal-product-country" class="block text-sm font-medium text-gray-700 mb-2">Country of Origin</label>
                                    <input 
                                        type="text" 
                                        bind:value={modalData.country_of_origin}
                                        id="modal-product-country"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="India"
                                    />
                            </div>

                            <div>
                                    <label for="modal-product-base-price" class="block text-sm font-medium text-gray-700 mb-2">Base Price (₹)</label>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span class="text-gray-500 sm:text-sm">₹</span>
                            </div>
                                        <input 
                                            type="number" 
                                            bind:value={modalData.base_price}
                                            id="modal-product-base-price"
                                            class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0.00" 
                                            step="0.01"
                                        />
                            </div>
                        </div>

                                <div class="flex items-center">
                                    <div class="flex items-center h-5">
                                        <input 
                                            type="checkbox" 
                                            bind:checked={modalData.is_service} 
                                            class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                    </div>
                                    <div class="ml-3">
                                        <label class="text-sm font-medium text-gray-700">This is a service</label>
                                    </div>
                                </div>
                            </div>

                        <div>
                                <label for="modal-product-about" class="block text-sm font-medium text-gray-700 mb-2">About</label>
                                <textarea 
                                    bind:value={modalData.about}
                                    id="modal-product-about"
                                    rows="3"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    placeholder="Brief about the product"
                                ></textarea>
                        </div>

                        <div>
                                <label for="modal-product-important-info" class="block text-sm font-medium text-gray-700 mb-2">Important Info</label>
                                <textarea 
                                    bind:value={modalData.important_info}
                                    id="modal-product-important-info"
                                    rows="3"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    placeholder="Important information"
                                ></textarea>
                        </div>

                        <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <div class="border border-gray-300 rounded-lg overflow-hidden">
                            <TiptapEditor content={modalEditorContent} on:change={handleModalEditorChange} />
                        </div>
                            </div>

                    {:else}
                            <!-- Listing Edit Form -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                    <label for="modal-listing-name" class="block text-sm font-medium text-gray-700 mb-2">Listing Name</label>
                                    <input 
                                        type="text" 
                                        bind:value={modalData.name}
                                        id="modal-listing-name"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Optional custom name"
                                    />
                            </div>

                            <div>
                                    <label for="modal-listing-price" class="block text-sm font-medium text-gray-700 mb-2">
                                        Price (₹) <span class="text-red-500">*</span>
                                    </label>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span class="text-gray-500 sm:text-sm">₹</span>
                            </div>
                                        <input 
                                            type="number" 
                                            bind:value={modalData.price}
                                            id="modal-listing-price"
                                            class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {errors.price ? 'border-red-500' : ''}"
                                            placeholder="0.00" 
                                            step="0.01"
                                        />
                                    </div>
                                    {#if errors.price}
                                        <p class="mt-1 text-sm text-red-600">{errors.price}</p>
                                    {/if}
                                </div>

                            <div>
                                    <label for="modal-listing-mrp" class="block text-sm font-medium text-gray-700 mb-2">MRP (₹)</label>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span class="text-gray-500 sm:text-sm">₹</span>
                            </div>
                                        <input 
                                            type="number" 
                                            bind:value={modalData.mrp}
                                            id="modal-listing-mrp"
                                            class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0.00" 
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                            <div>
                                    <label for="modal-listing-stock" class="block text-sm font-medium text-gray-700 mb-2">
                                        Stock <span class="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        bind:value={modalData.stock}
                                        id="modal-listing-stock"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {errors.stock ? 'border-red-500' : ''}"
                                        placeholder="0"
                                    />
                                    {#if errors.stock}
                                        <p class="mt-1 text-sm text-red-600">{errors.stock}</p>
                                    {/if}
                            </div>

                            <div>
                                    <label for="modal-listing-buy-limit" class="block text-sm font-medium text-gray-700 mb-2">
                                        Buy Limit <span class="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        bind:value={modalData.buy_limit}
                                        id="modal-listing-buy-limit"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {errors.buy_limit ? 'border-red-500' : ''}"
                                        placeholder="10"
                                    />
                                    {#if errors.buy_limit}
                                        <p class="mt-1 text-sm text-red-600">{errors.buy_limit}</p>
                                    {/if}
                            </div>

                            <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Variant</label>
                                    <select 
                                        bind:value={modalData.variant_id} 
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                    <option value="">No variant</option>
                                    {#each variants as variant}
                                        <option value={variant.id}>{variant.name}</option>
                                    {/each}
                                </select>
                            </div>

                            <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                                    <select 
                                        bind:value={modalData.manufacturer_id} 
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                        bind:value={modalData.packer_id} 
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                        bind:value={modalData.importer_id} 
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                        bind:value={modalData.return_exchange_policy_id} 
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                        bind:value={modalData.tax_category_id} 
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                    <option value="">Select tax category</option>
                                    {#each taxCategories as tax}
                                        <option value={tax.id}>{tax.name}</option>
                                    {/each}
                                </select>
                            </div>
                        </div>

                        <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Box Items</label>
                                <textarea 
                                    bind:value={modalData.box_items} 
                                    rows="3"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    placeholder="Items included in the box"
                                ></textarea>
                        </div>

                            <!-- Features in Modal -->
                        <div>
                                <label class="block text-sm font-medium text-gray-700 mb-4">Features</label>
                                
                                {#if modalData.features && modalData.features.length > 0}
                                    <div class="mb-4 overflow-x-auto">
                                        <table class="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                            <thead class="bg-gray-50">
                                                <tr>
                                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                            <tbody class="bg-white divide-y divide-gray-200">
                                        {#each modalData.features as feature, index}
                                            <tr>
                                                        <td class="px-4 py-3 text-sm text-gray-900">
                                                            {featureTemplates.find(ft => ft.id === feature.feature_template_id)?.name || 'N/A'}
                                                        </td>
                                                        <td class="px-4 py-3 text-sm text-gray-900">{feature.value}</td>
                                                        <td class="px-4 py-3">
                                                            <button 
                                                                onclick={() => modalData.features = modalData.features.filter((_, i) => i !== index)} 
                                                                class="text-red-600 hover:text-red-800 text-sm font-medium"
                                                            >
                                                                Remove
                                                            </button>
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                                {/if}

                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <select 
                                        bind:value={newFeature.feature_template_id} 
                                        class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                    <option value="">Select feature</option>
                                    {#each featureTemplates as ft}
                                        <option value={ft.id}>{ft.name}</option>
                                    {/each}
                                </select>
                                    <input 
                                        type="text" 
                                        bind:value={newFeature.value} 
                                        class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Feature value"
                                    />
                                    <button 
                                        type="button"
                                        onclick={() => { 
                                            if (!modalData.features) modalData.features = [];
                                            modalData.features = [...modalData.features, { ...newFeature }]; 
                                            newFeature = { feature_template_id: null, value: '' }; 
                                        }} 
                                        class="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                        </svg>
                                        Add
                                    </button>
                            </div>
                        </div>

                        <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Main Image</label>
                                <div class="flex items-center space-x-4">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onchange={handleModalMainImageUpload} 
                                        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    {#if modalData.main_image}
                                        <img src={modalData.main_image || "/placeholder.svg"} alt="Main Image" class="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                                    {/if}
                                </div>
                        </div>
                    {/if}
                    </form>
                </div>

                <!-- Modal Footer -->
                <div class="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                    <button 
                        onclick={closeModal} 
                        class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button 
                        onclick={submitModalData} 
                        disabled={isSubmitting} 
                        class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {#if isSubmitting}
                            <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        {:else}
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            Update
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>
