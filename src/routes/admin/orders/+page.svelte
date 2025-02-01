<!-- Orders Page Section -->
<script>

    import LeftNav from "$lib/components/admin/LeftNav.svelte";
    import { PUBLIC_API_URL } from "$env/static/public";

    import { user } from "$lib/stores/auth";
    import { myFetch } from "$lib/utils/myFetch";
    import { onMount, onDestroy } from "svelte";

    let authUser;
    const unsubscribe = user.subscribe(value => {
        authUser = value;
    });

    onDestroy(() => {
        unsubscribe(); // Cleanup to avoid memory leaks
    });


    $: if (authUser || selectedStatus){
        fetchOrderItems();
    }
    let loading = true;
    let orderItems = [];
    let next;
    let count = 0;

    let selectedStatus = ''


    async function fetchOrderItems(){
        loading = true;
        orderItems = [];
        let url = `${PUBLIC_API_URL}/order/order_items/?page_size=6&seller_id=${authUser?.entity.id}&status=${selectedStatus}`;
        let data = await myFetch(url);
        orderItems = data.results;
        next = data.next;
        count = data.count;
        loading = false;
        // console.log(data);
    }

    async function loadMore() {
    loading = true;
        // console.log("Hello Bhai")
	const dataNew = await myFetch(next);
    console.log(dataNew);
    orderItems = [...orderItems,...dataNew.results];
    next = dataNew.next;
    loading = false
    }



</script>
<div class="min-h-screen bg-gray-50">
    <!-- Left Navigation Bar -->
    <LeftNav />

    <!-- Main Content -->
    <main class="ml-64 p-8">
<div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Order Management</h1>
        <div class="flex space-x-4">
            <div class="relative">
                <input 
                    type="text" 
                    placeholder="Search orders..." 
                    class="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                <svg class="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <select bind:value={selectedStatus} class="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Completed</option>
                <option value="cancelled">Cancelled</option>
            </select>
        </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>

            <tbody class="divide-y divide-gray-200">
                {#each orderItems as orderItem (orderItem.id)}
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm font-medium text-blue-600">#{orderItem.id}</td>
                    <!-- <td class="px-6 py-4">
                        <div class="text-sm text-gray-900">{order.customer.name}</div>
                        <div class="text-sm text-gray-500">{order.customer.email}</div>
                    </td> -->
                    <td class="px-6 py-4 text-sm text-gray-500">{orderItem.created}</td>
                    <td class="px-6 py-4">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            {orderItem.status === 'delivered' ? 'bg-green-100 text-green-800' :
                             orderItem.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                             orderItem.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                             orderItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                             'bg-red-100 text-red-800'}">
                            {orderItem.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900 text-right">${orderItem.subtotal.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm font-medium space-x-4">
                        <button class="text-blue-600 hover:text-blue-900">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                        <button class="text-gray-600 hover:text-gray-900">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
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

    <!-- Pagination -->
    <div class="mt-2 flex justify-between items-center px-6 py-3 bg-white rounded-b-xl shadow-sm">
        
        <div class="flex space-x-2">
            {#if (next && !loading)}
            <button on:click={loadMore} class="px-3 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200">
                Load More
            </button>
            {/if}
        </div>

        <div class="text-sm text-gray-500">
            Showing {orderItems.length} of {count} results
        </div>
        
    </div>
</div>

    </main>
</div>