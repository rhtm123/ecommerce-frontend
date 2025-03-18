<script>
    import { onMount, onDestroy } from 'svelte';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { PUBLIC_ESTORE_ID } from '$env/static/public';
    import { myFetch } from '$lib/utils/myFetch';
    import { user } from '$lib/stores/auth';
    import TiptapEditor from '$lib/components/wyswyg/TiptapEditor.svelte';
    import { addAlert } from '$lib/stores/alert';

    let authUser;
    const unsubscribe = user.subscribe(value => authUser = value);
    onDestroy(() => unsubscribe());

    // State variables
    let step = 1; // 1: Add/Edit Product, 2: Add/Edit Listings
    let product = {
        id: null,
        name: '',
        about: '',
        description: '',
        important_info: '',
        base_price: '',
        category: '',
        brand: '',
        tax_category: '',
        country_of_origin: 'India'
    };
    let productListings = [];
    let currentListing = {
        product_id: null,
        name: '',
        price: '',
        mrp: '',
        stock: '',
        buy_limit: 10,
        box_items: '',
        features: {},
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
    };
    let variants = [];
    let newVariant = { name: '', attributes: {} };

    let categories = [];
    let brands = [];
    let entities = [];
    let errors = {};
    let isSubmitting = false;
    let editorContent = '<p></p>';
    let editMode = false;
    let productId = null;
    let isProductDropdownOpen = false;

    // Modal state
    let showModal = false;
    let modalType = ''; // 'product' or 'listing'
    let modalData = null; // Data to edit (product or listing)
    let modalEditorContent = '<p></p>';

    // Fetch initial data
    onMount(async () => {
        try {
            const [catRes, brandRes, entityRes] = await Promise.all([
                myFetch(`${PUBLIC_API_URL}/product/categories/?page=1&page_size=100`),
                myFetch(`${PUBLIC_API_URL}/user/entities/?page=1&page_size=100&entity_type=brand`),
                myFetch(`${PUBLIC_API_URL}/user/entities/?page=1&page_size=100`)
            ]);
            categories = catRes.results;
            brands = brandRes.results;
            entities = entityRes.results;

            const urlParams = new URLSearchParams(window.location.search);
            productId = urlParams.get('product_id');
            if (productId) {
                editMode = true;
                await fetchProductData(productId);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    });

    async function fetchProductData(id) {
        try {
            const productRes = await myFetch(`${PUBLIC_API_URL}/product/products/${id}/`, 'GET', null, authUser.access_token);
            const listingRes = await myFetch(`${PUBLIC_API_URL}/product/product-listings/?product_id=${id}`, 'GET', null, authUser.access_token);
            console.log("listingRes", listingRes);
            
            // Get category and brand from the first listing if available
            const firstListing = listingRes.results[0];
            product = { 
                ...productRes,
                // Use category and brand from the listing
                category: firstListing?.category || null,
                brand: firstListing?.brand || null
            };
            
            editorContent = product.description || '<p></p>';
            productListings = listingRes.results;
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
        if (!data.category) errors.category = 'Category is required.';
        if (!data.brand) errors.brand = 'Brand is required.';
        return Object.keys(errors).length === 0;
    }

    async function submitProduct() {
        if (!validateProductForm(product)) return;
        isSubmitting = true;
        try {
            const formData = {
                ...product,
                category_id: parseInt(product.category),
                brand_id: parseInt(product.brand),
                description: editorContent || null
            };
            delete formData.category;
            delete formData.brand;

            const method = editMode ? 'PUT' : 'POST';
            const url = editMode ? `${PUBLIC_API_URL}/product/products/${product.id}/` : `${PUBLIC_API_URL}/product/products/`;
            const response = await myFetch(url, method, formData, authUser.access_token);
            if (response) {
                product = response;
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

    async function submitProductListing() {
        if (!validateListingForm(currentListing)) return;
        isSubmitting = true;
        try {
            const jsonData = {
                ...currentListing,
                product_id: parseInt(currentListing.product_id),
                price: parseFloat(currentListing.price) || 0,
                mrp: currentListing.mrp ? parseFloat(currentListing.mrp) : null,
                stock: parseInt(currentListing.stock) || 0,
                buy_limit: parseInt(currentListing.buy_limit) || 10,
                seller_id: authUser?.entity.id,
                estore_id: PUBLIC_ESTORE_ID,
                variant_id: currentListing.variant_id ? parseInt(currentListing.variant_id) : null,
                manufacturer_id: currentListing.manufacturer_id ? parseInt(currentListing.manufacturer_id) : null,
                packer_id: currentListing.packer_id ? parseInt(currentListing.packer_id) : null,
                importer_id: currentListing.importer_id ? parseInt(currentListing.importer_id) : null,
                features: currentListing.features || {}
            };
            const method = currentListing.id ? 'PUT' : 'POST';
            const url = currentListing.id 
                ? `${PUBLIC_API_URL}/product/product-listings/${currentListing.id}/` 
                : `${PUBLIC_API_URL}/product/product-listings/`;
            const response = await myFetch(url, method, jsonData, authUser.access_token);
            if (response) {
                if (currentListing.id) {
                    productListings = productListings.map(l => l.id === response.id ? response : l);
                } else {
                    productListings = [...productListings, response];
                }
                resetListingForm();
                addAlert('Product listing saved successfully!', 'success');
            }
        } catch (error) {
            console.error('Error submitting listing:', error);
            addAlert('Failed to submit listing: ' + (error.detail || error), 'error');
        } finally {
            isSubmitting = false;
        }
    }

    async function submitModalData() {
        if (modalType === 'product') {
            if (!validateProductForm(modalData)) return;
            isSubmitting = true;
            try {
                const formData = {
                    ...modalData,
                    category_id: parseInt(modalData.category),
                    brand_id: parseInt(modalData.brand),
                    description: modalEditorContent || null
                };
                delete formData.category;
                delete formData.brand;

                const response = await myFetch(`${PUBLIC_API_URL}/product/products/${modalData.id}/`, 'PUT', formData, authUser.access_token);
                if (response) {
                    product = response;
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
                    features: modalData.features || {}
                };
                const response = await myFetch(`${PUBLIC_API_URL}/product/product-listings/${modalData.id}/`, 'PUT', jsonData, authUser.access_token);
                if (response) {
                    productListings = productListings.map(l => l.id === response.id ? response : l);
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

    function resetListingForm() {
        currentListing = {
            product_id: product.id,
            name: '',
            price: '',
            mrp: '',
            stock: '',
            buy_limit: 10,
            box_items: '',
            features: {},
            approved: false,
            featured: false,
            variant_id: null,
            seller_id: authUser?.entity.id,
            packer_id: null,
            importer_id: null,
            manufacturer_id: null,
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
        modalData = { ...listing };
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

    function addVariant() {
        if (!newVariant.name.trim()) {
            addAlert('Variant name is required.', 'error');
            return;
        }
        variants = [...variants, { ...newVariant, product_id: product.id }];
        newVariant = { name: '', attributes: {} };
        addAlert('Variant added successfully!', 'success');
    }

    function toggleProductDropdown() {
        isProductDropdownOpen = !isProductDropdownOpen;
    }

    function closeModal() {
        showModal = false;
        modalType = '';
        modalData = null;
        modalEditorContent = '<p></p>';
        errors = {};
    }
</script>

<div class="max-w-6xl mx-auto px-4 py-8">
    <div class="bg-white rounded-xl shadow-lg p-8">
        {#if step === 1}
            <!-- Product Form -->
            <h1 class="text-3xl font-bold text-gray-900 mb-8">{editMode ? 'Edit Product' : 'Add New Product'}</h1>
            <div class="space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="label"><span class="label-text">Product Name *</span></label>
                        <input type="text" bind:value={product.name} class="input input-bordered w-full" placeholder="Enter product name" />
                        {#if errors.name}<p class="text-error text-sm mt-1">{errors.name}</p>{/if}
                    </div>
                    <div>
                        <label class="label"><span class="label-text">Category *</span></label>
                        <select bind:value={product.category} class="select select-bordered w-full">
                            <option value="">Select category</option>
                            {#each categories as category}
                                <option value={category.id}>{category.name}</option>
                            {/each}
                        </select>
                        {#if errors.category}<p class="text-error text-sm mt-1">{errors.category}</p>{/if}
                    </div>
                    <div>
                        <label class="label"><span class="label-text">Brand *</span></label>
                        <select bind:value={product.brand} class="select select-bordered w-full">
                            <option value="">Select brand</option>
                            {#each brands as brand}
                                <option value={brand.id}>{brand.name}</option>
                            {/each}
                        </select>
                        {#if errors.brand}<p class="text-error text-sm mt-1">{errors.brand}</p>{/if}
                    </div>
                    <div>
                        <label class="label"><span class="label-text">Country of Origin</span></label>
                        <input type="text" bind:value={product.country_of_origin} class="input input-bordered w-full" placeholder="India" />
                    </div>
                </div>
                <div>
                    <label class="label"><span class="label-text">About</span></label>
                    <textarea bind:value={product.about} class="textarea textarea-bordered w-full" placeholder="Brief about the product"></textarea>
                </div>
                <div>
                    <label class="label"><span class="label-text">Important Info</span></label>
                    <textarea bind:value={product.important_info} class="textarea textarea-bordered w-full" placeholder="Important information"></textarea>
                </div>
                <div>
                    <label class="label"><span class="label-text">Description</span></label>
                    <TiptapEditor content={editorContent} on:change={handleEditorChange} />
                </div>
                <div class="flex justify-end">
                    <button on:click={submitProduct} disabled={isSubmitting} class="btn btn-primary">
                        {#if isSubmitting}
                            <span class="loading loading-spinner"></span> Saving...
                        {:else}
                            {editMode ? 'Update Product' : 'Next: Add Listing'}
                        {/if}
                    </button>
                </div>
            </div>
        {:else}
            <!-- Product Dropdown -->
            <div class="collapse collapse-arrow border border-base-300 bg-base-100 mb-8">
                <input type="checkbox" bind:checked={isProductDropdownOpen} />
                <div class="collapse-title text-xl font-medium" on:click={toggleProductDropdown}>
                    Product: {product.name}
                </div>
                <div class="collapse-content">
                    <div class="space-y-4">
                        <p><strong>Name:</strong> {product.name}</p>
                        <p><strong>Category:</strong> {product.category?.name || 'N/A'}</p>
                        <p><strong>Brand:</strong> {product.brand?.name || 'N/A'}</p>
                        <p><strong>Country of Origin:</strong> {product.country_of_origin}</p>
                        <p><strong>About:</strong> {product.about || 'N/A'}</p>
                        <p><strong>Important Info:</strong> {product.important_info || 'N/A'}</p>
                        <div><strong>Description:</strong> {@html product.description || 'N/A'}</div>
                        <button on:click={editProduct} class="btn btn-secondary">Edit Product</button>
                    </div>
                </div>
            </div>

            <!-- Listings Section -->
            <div class="flex">
                <h1 class="text-3xl font-bold text-gray-900 mb-8 justify-start">Manage Listings for {product.name}</h1>
                <div class="flex items-end justify-end w-full">
                    <button on:click={resetListingForm} class="btn btn-success mb-8">Add New Listing</button>
                </div>
            </div>
            {#if productListings.length === 0}
                <div class="alert alert-warning">Please add at least one listing to make this product visible.</div>
            {/if}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {#each productListings as listing (listing.id)}
                    <div class="card bg-base-100 shadow-xl">
                        <div class="card-body">
                            <h2 class="card-title">{listing.name || product.name}</h2>
                            <p>Price: ₹{listing.price}</p>
                            <p>Stock: {listing.stock}</p>
                            <p>Variant: {variants.find(v => v.id === listing.variant_id)?.name || 'None'}</p>
                            <div class="card-actions justify-end">
                                <button on:click={() => editListing(listing)} class="btn btn-sm btn-primary">Edit</button>
                                <button on:click={() => deleteListing(listing.id)} class="btn btn-sm btn-error">Delete</button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Add Listing Form (only for adding new listings) -->
            {#if !currentListing.id}
                <div class="space-y-8">
                    <h2 class="text-2xl font-semibold text-gray-800">Add Listing</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="label"><span class="label-text">Listing Name</span></label>
                            <input type="text" bind:value={currentListing.name} class="input input-bordered w-full" placeholder="Optional custom name" />
                        </div>
                        <div>
                            <label class="label"><span class="label-text">Price (₹) *</span></label>
                            <input type="number" bind:value={currentListing.price} class="input input-bordered w-full" placeholder="0.00" step="0.01" />
                            {#if errors.price}<p class="text-error text-sm mt-1">{errors.price}</p>{/if}
                        </div>
                        <div>
                            <label class="label"><span class="label-text">MRP (₹)</span></label>
                            <input type="number" bind:value={currentListing.mrp} class="input input-bordered w-full" placeholder="0.00" step="0.01" />
                        </div>
                        <div>
                            <label class="label"><span class="label-text">Stock *</span></label>
                            <input type="number" bind:value={currentListing.stock} class="input input-bordered w-full" placeholder="0" />
                            {#if errors.stock}<p class="text-error text-sm mt-1">{errors.stock}</p>{/if}
                        </div>
                        <div>
                            <label class="label"><span class="label-text">Buy Limit *</span></label>
                            <input type="number" bind:value={currentListing.buy_limit} class="input input-bordered w-full" placeholder="10" />
                            {#if errors.buy_limit}<p class="text-error text-sm mt-1">{errors.buy_limit}</p>{/if}
                        </div>
                        <div>
                            <label class="label"><span class="label-text">Variant</span></label>
                            <select bind:value={currentListing.variant_id} class="select select-bordered w-full">
                                <option value="">No variant</option>
                                {#each variants as variant}
                                    <option value={variant.id}>{variant.name}</option>
                                {/each}
                            </select>
                        </div>
                        <div>
                            <label class="label"><span class="label-text">Manufacturer</span></label>
                            <select bind:value={currentListing.manufacturer_id} class="select select-bordered w-full">
                                <option value="">Select manufacturer</option>
                                {#each entities as entity}
                                    <option value={entity.id}>{entity.name}</option>
                                {/each}
                            </select>
                        </div>
                        <div>
                            <label class="label"><span class="label-text">Packer</span></label>
                            <select bind:value={currentListing.packer_id} class="select select-bordered w-full">
                                <option value="">Select packer</option>
                                {#each entities as entity}
                                    <option value={entity.id}>{entity.name}</option>
                                {/each}
                            </select>
                        </div>
                        <div>
                            <label class="label"><span class="label-text">Importer</span></label>
                            <select bind:value={currentListing.importer_id} class="select select-bordered w-full">
                                <option value="">Select importer</option>
                                {#each entities as entity}
                                    <option value={entity.id}>{entity.name}</option>
                                {/each}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="label"><span class="label-text">Box Items</span></label>
                        <textarea bind:value={currentListing.box_items} class="textarea textarea-bordered w-full" placeholder="Items included in the box"></textarea>
                    </div>
                    <div>
                        <label class="label"><span class="label-text">Features (JSON)</span></label>
                        <textarea bind:value={currentListing.features} class="textarea textarea-bordered w-full" placeholder='{"general:" [{"name": "RAM", "value": "6GB"}]}'></textarea>
                    </div>
                    <div>
                        <label class="label"><span class="label-text">Main Image URL</span></label>
                        <input type="text" bind:value={currentListing.main_image} class="input input-bordered w-full" placeholder="Paste image URL" />
                    </div>
                    <div class="flex justify-between">
                        <button on:click={() => step = 1} class="btn btn-secondary">Back to Product</button>
                        <button on:click={submitProductListing} disabled={isSubmitting} class="btn btn-primary">
                            {#if isSubmitting}
                                <span class="loading loading-spinner"></span> Saving...
                            {:else}
                                Add Listing
                            {/if}
                        </button>
                    </div>
                </div>
            {/if}

            <!-- Variants Section -->
            <div class="mt-8">
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">Variants</h2>
                {#each variants as variant (variant.id || variant.name)}
                    <div class="card bg-base-100 shadow-md mb-4">
                        <div class="card-body">
                            <p>{variant.name} - {JSON.stringify(variant.attributes)}</p>
                        </div>
                    </div>
                {/each}
                <div class="flex gap-4">
                    <input type="text" bind:value={newVariant.name} class="input input-bordered" placeholder="Variant Name (e.g., Red, 128GB)" />
                    <input type="text" bind:value={newVariant.attributes} class="input input-bordered" placeholder='{"'color': 'Red'"}' />
                    <button on:click={addVariant} class="btn btn-accent">Add Variant</button>
                </div>
            </div>
        {/if}
    </div>

    <!-- Modal for Editing -->
    {#if showModal}
        <div class="modal modal-open">
            <div class="modal-box max-w-4xl">
                <h3 class="font-bold text-lg">{modalType === 'product' ? 'Edit Product' : 'Edit Listing'}</h3>
                <div class="space-y-6 mt-4">
                    {#if modalType === 'product'}
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="label"><span class="label-text">Product Name *</span></label>
                                <input type="text" bind:value={modalData.name} class="input input-bordered w-full" placeholder="Enter product name" />
                                {#if errors.name}<p class="text-error text-sm mt-1">{errors.name}</p>{/if}
                            </div>
                            <div>
                                <label class="label"><span class="label-text">Category *</span></label>
                                <select bind:value={modalData.category} class="select select-bordered w-full">
                                    <option value="">Select category</option>
                                    {#each categories as category}
                                        <option value={category.id}>{category.name}</option>
                                    {/each}
                                </select>
                                {#if errors.category}<p class="text-error text-sm mt-1">{errors.category}</p>{/if}
                            </div>
                            <div>
                                <label class="label"><span class="label-text">Brand *</span></label>
                                <select bind:value={modalData.brand} class="select select-bordered w-full">
                                    <option value="">Select brand</option>
                                    {#each brands as brand}
                                        <option value={brand.id}>{brand.name}</option>
                                    {/each}
                                </select>
                                {#if errors.brand}<p class="text-error text-sm mt-1">{errors.brand}</p>{/if}
                            </div>
                            <div>
                                <label class="label"><span class="label-text">Country of Origin</span></label>
                                <input type="text" bind:value={modalData.country_of_origin} class="input input-bordered w-full" placeholder="India" />
                            </div>
                        </div>
                        <div>
                            <label class="label"><span class="label-text">About</span></label>
                            <textarea bind:value={modalData.about} class="textarea textarea-bordered w-full" placeholder="Brief about the product"></textarea>
                        </div>
                        <div>
                            <label class="label"><span class="label-text">Important Info</span></label>
                            <textarea bind:value={modalData.important_info} class="textarea textarea-bordered w-full" placeholder="Important information"></textarea>
                        </div>
                        <div>
                            <label class="label"><span class="label-text">Description</span></label>
                            <TiptapEditor content={modalEditorContent} on:change={handleModalEditorChange} />
                        </div>
                    {:else}
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="label"><span class="label-text">Listing Name</span></label>
                                <input type="text" bind:value={modalData.name} class="input input-bordered w-full" placeholder="Optional custom name" />
                            </div>
                            <div>
                                <label class="label"><span class="label-text">Price (₹) *</span></label>
                                <input type="number" bind:value={modalData.price} class="input input-bordered w-full" placeholder="0.00" step="0.01" />
                                {#if errors.price}<p class="text-error text-sm mt-1">{errors.price}</p>{/if}
                            </div>
                            <div>
                                <label class="label"><span class="label-text">MRP (₹)</span></label>
                                <input type="number" bind:value={modalData.mrp} class="input input-bordered w-full" placeholder="0.00" step="0.01" />
                            </div>
                            <div>
                                <label class="label"><span class="label-text">Stock *</span></label>
                                <input type="number" bind:value={modalData.stock} class="input input-bordered w-full" placeholder="0" />
                                {#if errors.stock}<p class="text-error text-sm mt-1">{errors.stock}</p>{/if}
                            </div>
                            <div>
                                <label class="label"><span class="label-text">Buy Limit *</span></label>
                                <input type="number" bind:value={modalData.buy_limit} class="input input-bordered w-full" placeholder="10" />
                                {#if errors.buy_limit}<p class="text-error text-sm mt-1">{errors.buy_limit}</p>{/if}
                            </div>
                            <div>
                                <label class="label"><span class="label-text">Variant</span></label>
                                <select bind:value={modalData.variant_id} class="select select-bordered w-full">
                                    <option value="">No variant</option>
                                    {#each variants as variant}
                                        <option value={variant.id}>{variant.name}</option>
                                    {/each}
                                </select>
                            </div>
                            <div>
                                <label class="label"><span class="label-text">Manufacturer</span></label>
                                <select bind:value={modalData.manufacturer_id} class="select select-bordered w-full">
                                    <option value="">Select manufacturer</option>
                                    {#each entities as entity}
                                        <option value={entity.id}>{entity.name}</option>
                                    {/each}
                                </select>
                            </div>
                            <div>
                                <label class="label"><span class="label-text">Packer</span></label>
                                <select bind:value={modalData.packer_id} class="select select-bordered w-full">
                                    <option value="">Select packer</option>
                                    {#each entities as entity}
                                        <option value={entity.id}>{entity.name}</option>
                                    {/each}
                                </select>
                            </div>
                            <div>
                                <label class="label"><span class="label-text">Importer</span></label>
                                <select bind:value={modalData.importer_id} class="select select-bordered w-full">
                                    <option value="">Select importer</option>
                                    {#each entities as entity}
                                        <option value={entity.id}>{entity.name}</option>
                                    {/each}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="label"><span class="label-text">Box Items</span></label>
                            <textarea bind:value={modalData.box_items} class="textarea textarea-bordered w-full" placeholder="Items included in the box"></textarea>
                        </div>
                        <div>
                            <label class="label"><span class="label-text">Features (JSON)</span></label>
                            <textarea bind:value={modalData.features} class="textarea textarea-bordered w-full" placeholder='{"general:" [{"name": "RAM", "value": "6GB"}]}'></textarea>
                        </div>
                        <div>
                            <label class="label"><span class="label-text">Main Image URL</span></label>
                            <input type="text" bind:value={modalData.main_image} class="input input-bordered w-full" placeholder="Paste image URL" />
                        </div>
                    {/if}
                </div>
                <div class="modal-action">
                    <button on:click={closeModal} class="btn btn-secondary">Cancel</button>
                    <button on:click={submitModalData} disabled={isSubmitting} class="btn btn-primary">
                        {#if isSubmitting}
                            <span class="loading loading-spinner"></span> Saving...
                        {:else}
                            Update
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>