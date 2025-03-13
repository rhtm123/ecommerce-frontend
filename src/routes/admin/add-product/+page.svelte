<script>
    import { onMount, onDestroy } from 'svelte';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { myFetch } from '$lib/utils/myFetch';
    import { user } from '$lib/stores/auth';
    import TiptapEditor from '$lib/components/wyswyg/TiptapEditor.svelte';

    let authUser = $user;
    let step = 1; // Track the current step (1: Add Product, 2: Add Listing)
    let productId = null; // Store the created product ID
    let editorContent = '<p>Start writing here...</p>';

    // Product data
    let product = {
        name: '',
        stock: '',
        category: '',
        brand: '',
        base_price: '',
        isActive: true,
        description: ''
    };

    // Product Listing data
    let productListing = {
        price: '',
        stock: '',
        main_image: null,
        additional_images: [],
        mrp: '',
        buy_limit: 10
    };

    let categories = [];
    let brands = [];
    let errors = {};
    let isSubmitting = false;

    onMount(async () => {
        try {
            const categoriesResponse = await myFetch(`${PUBLIC_API_URL}/product/categories/?page=1&page_size=48`);
            const brandsResponse = await myFetch(`${PUBLIC_API_URL}/user/entities/?page=1&page_size=48&entity_type=brand`);
            categories = categoriesResponse.results;
            brands = brandsResponse.results;
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    });

    function handleEditorChange(event) {
        editorContent = event.detail;
    }

    // Handle main image upload
    function handleMainImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            productListing.main_image = file;
            errors.main_image = null;
        }
    }

    // Handle additional images upload (max 4 additional images)
    function handleAdditionalImagesUpload(event) {
        const files = event.target.files;
        if (files.length + productListing.additional_images.length > 4) {
            errors.additional_images = "You can upload a maximum of 4 additional images.";
            return;
        }
        productListing.additional_images = [...productListing.additional_images, ...files];
        errors.additional_images = null;
    }

    // Validate Step 1: Product
    function validateProductForm() {
        errors = {};
        if (!product.name?.trim()) errors.name = "Product name is required.";
        if (!product.category) errors.category = "Category is required.";
        if (!product.brand) errors.brand = "Brand is required.";
        return Object.keys(errors).length === 0;
    }

    // Validate Step 2: Product Listing
    function validateListingForm() {
        errors = {};
        if (!productListing.price || isNaN(productListing.price) || productListing.price <= 0) {
            errors.price = "Price must be a valid positive number.";
        }
        if (!productListing.stock || isNaN(productListing.stock) || productListing.stock < 0) {
            errors.stock = "Stock must be a valid positive number.";
        }
        return Object.keys(errors).length === 0;
    }

    // Submit Product (Step 1)
    async function submitProduct() {
        if (!validateProductForm()) return;

        isSubmitting = true;
        try {
            const formData = {
                name: product.name.trim(),
                stock: product.stock ? parseInt(product.stock) : 0,
                category: parseInt(product.category),
                brand: parseInt(product.brand),
                description: editorContent || null,
                base_price: product.base_price ? parseFloat(product.base_price) : 0,
                about: null,
                important_info: null,
                country_of_origin: "India",
                isActive: product.isActive
            };

            const response = await myFetch(
                `${PUBLIC_API_URL}/product/products/`,
                "POST",
                formData,
                authUser.access_token
            );
            console.log(response);

            if (response) {
                productId = response.id;
                alert("Product added successfully! Now add the product listing.");
                step = 2; // Move to Step 2
            }
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Failed to add product: " + (error.detail || error));
        } finally {
            isSubmitting = false;
        }
    }

    async function submitProductListing() {
        if (!validateListingForm()) return;

        isSubmitting = true;
        const jsonData = {
            product_id: productId,
            price: parseFloat(productListing.price) || 0,
            stock: parseInt(productListing.stock) || 0,
            mrp: productListing.mrp ? parseFloat(productListing.mrp) : undefined,
            buy_limit: productListing.buy_limit ? parseInt(productListing.buy_limit) : undefined,
        };

        // Debugging: Log JSON data
        console.log("Submitting JSON data:", jsonData);

        try {
            const response = await myFetch(
                `${PUBLIC_API_URL}/product/product-listings/`,
                "POST",
                jsonData, // Send as JSON
                authUser.access_token,
                false // Indicate JSON (not FormData)
            );

            if (response) {
                alert("Product listing created successfully!");
                resetForm();
            }
        } catch (error) {
            console.error("Error adding product listing:", error);
            let errorMessage = "Failed to add product listing: ";
            if (error.detail) {
                if (Array.isArray(error.detail)) {
                    errorMessage += error.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join('\n');
                } else {
                    errorMessage += error.detail;
                }
            }
            alert(errorMessage);
        } finally {
            isSubmitting = false;
        }
    }

    // Reset form after completion
    function resetForm() {
        step = 1;
        productId = null;
        product = { name: '', stock: '', category: '', brand: '', base_price: '', isActive: true, description: '' };
        productListing = { price: '', stock: '', main_image: null, additional_images: [], mrp: '', buy_limit: 10 };
        editorContent = '<p>Start writing here...</p>';
    }
</script>

<div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-6xl mx-auto px-4">
        <!-- Header -->
        <div class="mb-10 text-center">
            <h1 class="text-4xl font-bold text-gray-900">Add New Product</h1>
            <p class="mt-3 text-lg text-gray-600">
                Step {step} of 2: {step === 1 ? 'Add Product Details' : 'Add Listing Details'}
            </p>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-xl shadow-lg p-8">
            {#if step === 1}
                <!-- Step 1: Product Details -->
                <div class="space-y-8">
                    <!-- Basic Information -->
                    <div>
                        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Product Information</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                                <input
                                    type="text"
                                    bind:value={product.name}
                                    class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter product name"
                                />
                                {#if errors.name}
                                    <p class="text-sm text-red-500 mt-1">{errors.name}</p>
                                {/if}
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Base Price</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-3 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        bind:value={product.base_price}
                                        class="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                                <input
                                    type="number"
                                    bind:value={product.stock}
                                    class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter stock quantity"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Classification -->
                    <div>
                        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Classification</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                <select
                                    bind:value={product.category}
                                    class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">Select category</option>
                                    {#each categories as category}
                                        <option value={category.id}>{category.name}</option>
                                    {/each}
                                </select>
                                {#if errors.category}
                                    <p class="text-sm text-red-500 mt-1">{errors.category}</p>
                                {/if}
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                                <select
                                    bind:value={product.brand}
                                    class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">Select brand</option>
                                    {#each brands as brand}
                                        <option value={brand.id}>{brand.name}</option>
                                    {/each}
                                </select>
                                {#if errors.brand}
                                    <p class="text-sm text-red-500 mt-1">{errors.brand}</p>
                                {/if}
                            </div>
                        </div>
                    </div>

                    <!-- Description -->
                    <div>
                        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Description</h2>
                        <TiptapEditor content={editorContent} on:change={handleEditorChange} />
                    </div>

                    <!-- Submit Button -->
                    <div class="flex justify-end">
                        <button
                            on:click={submitProduct}
                            disabled={isSubmitting}
                            class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {#if isSubmitting}
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adding Product...
                            {:else}
                                Next: Add Listing
                            {/if}
                        </button>
                    </div>
                </div>
                {:else if step === 2}
                <!-- Step 2: Product Listing Details (no images) -->
                <div class="space-y-8">
                    <!-- Pricing and Stock -->
                    <div>
                        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Pricing & Stock</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-3 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        bind:value={productListing.price}
                                        class="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>
                                {#if errors.price}
                                    <p class="text-sm text-red-500 mt-1">{errors.price}</p>
                                {/if}
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">MRP</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-3 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        bind:value={productListing.mrp}
                                        class="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                                <input
                                    type="number"
                                    bind:value={productListing.stock}
                                    class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter stock quantity"
                                />
                                {#if errors.stock}
                                    <p class="text-sm text-red-500 mt-1">{errors.stock}</p>
                                {/if}
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Buy Limit</label>
                                <input
                                    type="number"
                                    bind:value={productListing.buy_limit}
                                    class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="10"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="flex justify-between">
                        <button
                            on:click={() => (step = 1)}
                            class="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            Back
                        </button>
                        <button
                            on:click={submitProductListing}
                            disabled={isSubmitting}
                            class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {#if isSubmitting}
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Listing...
                            {:else}
                                Finish
                            {/if}
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>