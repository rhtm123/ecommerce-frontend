<script>
    import { onMount, onDestroy } from 'svelte';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { myFetch } from '$lib/utils/myFetch';

    import { user } from '$lib/stores/auth';

    // import Tiptap from '$lib/components/wyswyg/Tiptap.svelte';
    import TiptapEditor from '$lib/components/wyswyg/TiptapEditor.svelte';
    let editorContent = '<p>Start writing here...</p>';

	function handleEditorChange(content) {
		editorContent = content;
        // console.log(content);
	}

    let authUser = $user;

    
    let product = {
        name: '',
        // sku: '',
        // price: '',
        stock: '',
        category: '',
        brand: '',
        // description: '',
        // images: [],
        attributes: [],
        // shippingDetails: {
        //     weight: '',
        //     dimensions: {
        //         length: '',
        //         width: '',
        //         height: ''
        //     }
        // },
        isActive: true
    };

    let categories = []; // Populate with your categories
    let brands = []; // Populate with your brands
    let errors = {};
    let isSubmitting = false;

    // Fetch categories and brands on mount
    onMount(async () => {
        try {
            const categoriesResponse = await myFetch(`${PUBLIC_API_URL}/product/categories/?page=1&page_size=48`);
            const brandsResponse = await myFetch(`${PUBLIC_API_URL}/user/entities/?page=1&page_size=48&entity_type=brand`);
            categories = categoriesResponse.results;
            brands = brandsResponse.results;
            console.log(categories)
            console.log(brands)
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    });

    // Handle file upload
    function handleImageUpload(event) {
        const files = event.target.files;
        if (files.length > 5) {
            errors.images = "You can upload a maximum of 5 images.";
            return;
        }
        product.images = [...files];
        errors.images = null;
    }

    // Validate form
    function validateForm() {
        errors = {};
        if (!product.name) errors.name = "Product name is required.";
        // if (!product.sku) errors.sku = "SKU is required.";
        // if (!product.price || isNaN(product.price)) errors.price = "Price must be a valid number.";
        if (!product.stock || isNaN(product.stock)) errors.stock = "stock must be a valid number.";
        if (!product.category) errors.category = "Category is required.";
        if (!product.brand) errors.brand = "Brand is required.";
        if (!editorContent) errors.description = "Description is required.";
        // if (product.images.length === 0) errors.images = "At least one image is required.";
        return Object.keys(errors).length === 0;
    }

    // Submit form
    async function submitForm() {
        if (!validateForm()) return;

        isSubmitting = true;
        try {

            const formData = {
                name: product.name,
                stock: product.stock,
                category: product.category,
                brand: product.brand,
                description: editorContent,
                base_price: 0,
            }
            // const formData = new FormData();
            // formData.append('name', product.name);
            // // formData.append('sku', product.sku);
            // // formData.append('price', product.price);
            // formData.append('stock', product.stock);
            // formData.append('category', product.category);
            // formData.append('brand', product.brand);
            // formData.append('description', editorContent);
            // // product.images.forEach((file, index) => {
            // //     formData.append(`image_${index}`, file);
            // // });
            // // formData.append('shippingDetails', JSON.stringify(product.shippingDetails));
            // formData.append('isActive', product.isActive);

            const data = await myFetch(`${PUBLIC_API_URL}/product/products/`, "POST", formData, authUser.access_token);

            // console.log(data);
            // if (!response.ok) throw new Error("Failed to add product.");
            // alert("Product added successfully!");
            // Reset form
            product = {
                name: '',
                sku: '',
                price: '',
                stock: '',
                category: '',
                brand: '',
                description: '',
                // images: [],
                // attributes: [],
                // shippingDetails: {
                //     weight: '',
                //     dimensions: {
                //         length: '',
                //         width: '',
                //         height: ''
                //     }
                // },
                isActive: true
            };
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Failed to add product. Please try again.");
        } finally {
            isSubmitting = false;
        }
    }

</script>

<div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6">Add New Product</h2>

    <!-- Product Name -->
    <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
        <input
            type="text"
            bind:value={product.name}
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter product name"
        />
        {#if errors.name}
            <p class="text-sm text-red-500 mt-1">{errors.name}</p>
        {/if}
    </div>




    <!-- SKU -->
    <!-- <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">SKU</label>
        <input
            type="text"
            bind:value={product.sku}
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter SKU"
        />
        {#if errors.sku}
            <p class="text-sm text-red-500 mt-1">{errors.sku}</p>
        {/if}
    </div> -->

    <!-- Price & stock -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
            <input
                type="number"
                bind:value={product.price}
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter price"
            />
            {#if errors.price}
                <p class="text-sm text-red-500 mt-1">{errors.price}</p>
            {/if}
        </div> -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">stock</label>
            <input
                type="number"
                bind:value={product.stock}
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter stock"
            />
            {#if errors.stock}
                <p class="text-sm text-red-500 mt-1">{errors.stock}</p>
            {/if}
        </div>
    </div>

    <!-- Category & Brand -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
                bind:value={product.category}
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <label class="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <select
                bind:value={product.brand}
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

    <!-- Description -->
    <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <!-- <EditorContent editor={$editor} /> -->
        <TiptapEditor bind:content={editorContent} on:change={handleEditorChange} />


        {#if errors.description}
            <p class="text-sm text-red-500 mt-1">{errors.description}</p>
        {/if}
    </div>

    <!-- Images -->
    <!-- <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
        <input
            type="file"
            accept="image/*"
            multiple
            on:change={handleImageUpload}
            class="w-full px-4 py-2 border rounded-lg"
        />
        {#if errors.images}
            <p class="text-sm text-red-500 mt-1">{errors.images}</p>
        {/if}
    </div> -->

    <!-- Shipping Details -->
    <!-- <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Shipping Details</label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="block text-sm text-gray-600 mb-2">Weight (kg)</label>
                <input
                    type="number"
                    bind:value={product.shippingDetails.weight}
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter weight"
                />
            </div>
            <div>
                <label class="block text-sm text-gray-600 mb-2">Dimensions (L x W x H)</label>
                <div class="grid grid-cols-3 gap-2">
                    <input
                        type="number"
                        bind:value={product.shippingDetails.dimensions.length}
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Length"
                    />
                    <input
                        type="number"
                        bind:value={product.shippingDetails.dimensions.width}
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Width"
                    />
                    <input
                        type="number"
                        bind:value={product.shippingDetails.dimensions.height}
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Height"
                    />
                </div>
            </div>
        </div>
    </div> -->

    <!-- Submit Button -->
    <div class="mt-8">
        <button
            on:click={submitForm}
            disabled={isSubmitting}
            class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
            {isSubmitting ? 'Adding Product...' : 'Add Product'}
        </button>
    </div>
</div>