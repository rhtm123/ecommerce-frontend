<!-- SellerAdmin.svelte -->
<script>

    import { user } from "$lib/stores/auth";
    import { PUBLIC_API_URL } from "$env/static/public";
  import { myFetch } from "$lib/utils/myFetch";
  import { onDestroy } from "svelte";
  import Icon from '@iconify/svelte';
  import AlertContainer from '$lib/components/AlertContainer.svelte';
  import { alerts } from '$lib/stores/alert';

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

    let showBulkUploadModal = false;
    let bulkFile = null;
    let uploading = false;

    $: if (authUser){
        fetchProductListings();
    }

    async function fetchProductListings(){
        loading = true
        let url = `${PUBLIC_API_URL}/product/product-listings/?page=1&page_size=10&seller_id=${authUser?.entity.id}`;
        console.log(url);
        let data = await myFetch(url);
        product_listings = (data.results || []).filter(p => p && p.slug);
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

    function openBulkUploadModal() { showBulkUploadModal = true; }
    function closeBulkUploadModal() { showBulkUploadModal = false; bulkFile = null; }
    async function handleBulkUpload() {
      if (!bulkFile) return;
      uploading = true;
      const formData = new FormData();
      formData.append('file', bulkFile);
      await fetch(`${PUBLIC_API_URL}/product/upload-products/`, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${authUser?.access_token}` }
      });
      uploading = false;
      closeBulkUploadModal();
      // Show success alert
      alerts.update(alertsArr => [
        ...alertsArr,
        { id: Date.now(), message: 'Products uploaded successfully!', type: 'success', duration: 3000 }
      ]);
      // Fetch product listings again
      fetchProductListings();
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

        <!-- Analytics Page (same as before) -->

            <div class="max-w-7xl mx-auto">
                <div class="flex justify-between items-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-900">Inventory Management</h1>
                    <div class="flex gap-2">
                        <a href="/admin/inventory/add-product">
                            <button class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors mr-4" on:click={openAddProductModal}>
                                <Icon icon="mdi:plus" class="w-5 h-5 mr-2" /> Add Product
                            </button>
                        </a>
                        <button class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors" on:click={openBulkUploadModal}>
                            <Icon icon="mdi:cloud-upload" class="w-5 h-5 mr-2" /> Bulk Upload
                        </button>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <!-- <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th> -->
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>

                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                          {#if product_listings && product_listings.length > 0}
                            {#each product_listings as product (product.id)}
                              {#if product && product.slug}
                                <tr class="hover:bg-gray-50">
                                  <td class="px-6 py-4">
                                    <a href={`/admin/inventory/${product.slug}`} class="flex items-center">
                                      <div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                                        {#if product.main_image}
                                          <img src={product.main_image} class="h-full w-full object-cover rounded-md" />
                                        {:else}
                                          <span class="text-xs">Product Image</span>
                                        {/if}
                                      </div>
                                      <div class="ml-4">
                                        <div class="text-sm font-medium text-gray-900">{product.name}</div>
                                      </div>
                                    </a>
                                  </td>
                                  <td class="px-6 py-4 text-sm text-gray-900">{product.stock}</td>
                                  <td class="px-6 py-4 text-sm text-gray-900">₹ {product.price?.toFixed(2) ?? '0.00'}</td>
                                  <td class="px-6 py-4 text-sm text-gray-900">{product.approved ? 'Yes' : 'No'}</td>
                                  <td class="px-6 py-4 text-sm font-medium">
                                    <a href={`/admin/inventory/add-product?product_id=${product.product_id}&edit_step=1`}>
                                      <button class="text-blue-600 hover:text-blue-900">Edit</button>
                                    </a>
                                    <button class="text-red-600 hover:text-red-900 ml-4">Delete</button>
                                  </td>
                                </tr>
                              {/if}
                            {/each}
                          {:else}
                            <tr>
                              <td colspan="5" class="text-center text-gray-400 py-8">No products found.</td>
                            </tr>
                          {/if}

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

<!-- Keep the global style tag -->

{#if showBulkUploadModal}
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" on:click={() => closeBulkUploadModal()}>
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative" on:click|stopPropagation>
      {#if uploading}
        <div class="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-10 rounded-2xl">
          <span class="loading loading-spinner loading-lg text-green-600 mb-2"></span>
          <span class="text-green-700 font-semibold">Uploading...</span>
        </div>
      {/if}
      <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors" on:click={closeBulkUploadModal} aria-label="Close" disabled={uploading}>
        <Icon icon="mdi:close" class="w-7 h-7" />
      </button>
      <div class="flex flex-col items-center gap-6">
        <Icon icon="mdi:upload" class="w-14 h-14 text-green-600 mb-2" />
        <h2 class="text-2xl font-bold mb-2 text-gray-900">Bulk Upload Products</h2>
        <input type="file" accept=".xlsx,.xls" on:change={e => bulkFile = e.target.files[0]} class="mb-4 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100" disabled={uploading} />
        <button class="w-full py-3 px-6 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-lg shadow transition-all focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" on:click={handleBulkUpload} disabled={!bulkFile || uploading}>
          <span class="flex items-center justify-center gap-2">
            <Icon icon="mdi:cloud-upload" class="w-6 h-6" />
            Upload
          </span>
        </button>
      </div>
    </div>
  </div>
{/if}

<AlertContainer />