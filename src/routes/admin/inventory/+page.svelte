<!-- SellerAdmin.svelte -->
<script>

    import LeftNav from "$lib/components/admin/LeftNav.svelte";
    import { user } from "$lib/stores/auth";
    import { PUBLIC_API_URL } from "$env/static/public";
  import { myFetch } from "$lib/utils/myFetch";
  import { onDestroy } from "svelte";

    let authUser;
    const unsubscribe = user.subscribe(value => {
        authUser = value;
    });

    onDestroy(() => {
        unsubscribe(); // Cleanup to avoid memory leaks
    });

    let loading = false;

    let product_listings = []
    let next;
    let count = 0;

    $: if (authUser){
        fetchProductListings();
    }

    async function fetchProductListings(){
        loading = true
        let url = `${PUBLIC_API_URL}/product/product-listings/?page=1&page_size=10&seller_id=${authUser?.entity.id}`;
        let data = await myFetch(url);
        product_listings = data.results;
        next = data.next;
        count = data.count;
        loading = false;
    }

    async function loadMore() {
        loading = true;
            // console.log("Hello Bhai")
        const dataNew = await myFetch(next);
        console.log(dataNew);
        product_listings = [...product_listings,...dataNew.results];
        next = dataNew.next;
        loading = false
    }

    
    

    // Inventory data
    // let products = [
    //     { id: 1, name: "Premium T-Shirt", sku: "TSHIRT-001", stock: 150, price: 29.99, status: "In Stock", image: "" },
    //     { id: 2, name: "Wireless Headphones", sku: "HEADPH-002", stock: 23, price: 149.99, status: "Low Stock" },
    //     { id: 3, name: "Stainless Steel Bottle", sku: "BOTTLE-003", stock: 0, price: 39.99, status: "Out of Stock" },
    // ];

    const logout = () => {
        // Add your logout logic here
        alert('Logout clicked');
    };
</script>

<div class="min-h-screen bg-gray-50">
    <!-- Left Navigation Bar -->
    <LeftNav />

    <!-- Main Content -->
    <main class="ml-64 p-8">
        <!-- Analytics Page (same as before) -->

            <div class="max-w-7xl mx-auto">
                <div class="flex justify-between items-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-900">Inventory Management</h1>
                    <a href="/admin/add-product">
                    <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Product
                    </button>
                    </a>

                </div>

                <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            {#each product_listings as product (product.id)}
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center">
                                            <div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                                                {#if product.main_image}
                                                    <img src={product.main_image} class="h-full w-full object-cover rounded-md">
                                                {:else}
                                                    <span class="text-xs">Product Image</span>
                                                {/if}
                                            </div>
                                            <div class="ml-4">
                                                <div class="text-sm font-medium text-gray-900">{product.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-500">{product.sku}</td>
                                    <td class="px-6 py-4 text-sm text-gray-900">{product.stock}</td>
                                    <td class="px-6 py-4 text-sm text-gray-900">₹ {product.price.toFixed(2)}</td>
                                    <td class="px-6 py-4">
                                        {#if product.status === 'In Stock'}
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                In Stock
                                            </span>
                                        {:else if product.status === 'Low Stock'}
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Low Stock
                                            </span>
                                        {:else}
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Out of Stock
                                            </span>
                                        {/if}
                                    </td>
                                    <td class="px-6 py-4 text-sm font-medium">
                                        <button class="text-blue-600 hover:text-blue-900">Edit</button>
                                        <button class="text-red-600 hover:text-red-900 ml-4">Delete</button>
                                    </td>
                                </tr>
                            {/each}

                            {#if loading}
                                <div class="p-4">
                                    <span class="loading loading-spinner loading-sm"></span>
                                </div>
                            {/if}
                        </tbody>
                    </table>
                </div>

                <div class="mt-2 flex justify-between items-center px-6 py-3 bg-white rounded-b-xl shadow-sm">
        
                    <div class="flex space-x-2">
                        {#if (next && !loading)}
                        <button on:click={loadMore} class="px-3 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200">
                            Load More
                        </button>
                        {/if}
                    </div>
            
                    <div class="text-sm text-gray-500">
                        Showing {product_listings.length} of {count} results
                    </div>
                    
                </div>

            </div>
    </main>
</div>

<!-- Keep the global style tag -->