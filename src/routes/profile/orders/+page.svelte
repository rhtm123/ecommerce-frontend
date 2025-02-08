<script>
  import { onDestroy, onMount } from "svelte";
  import { PUBLIC_API_URL } from "$env/static/public";
  import { myFetch } from "$lib/utils/myFetch";
  import { user } from "$lib/stores/auth";
  import OrderItems from "$lib/components/OrderItems.svelte";
  import InvoiceGenerator from "$lib/components/InvoiceGenerator.svelte";

  let authUser;
  const unsubscribe = user.subscribe(value => {
    authUser = value;
  });

  let loading = true;
  let loadingMore = false;

  onDestroy(() => {
    unsubscribe(); // Cleanup to avoid memory leaks
  });

  let orders = [];
  let next;

  onMount(async ()=>{

    let url = `${PUBLIC_API_URL}/order/orders/?user_id=${authUser.user_id}&ordering=-id`;
    let data = await myFetch(url);
    orders = data.results;
    next = data.next;
    loading = false;
    // console.log(data);
  })

  async function loadMore() {
    loadingMore = true;
        // console.log("Hello Bhai")
		const dataNew = await myFetch(next);
        console.log(dataNew);
    orders = [...orders,...dataNew.results];
    next = dataNew.next;
    loadingMore = false
    }


  // let orders = [
  //   {
  //     id: 'OD123456789',
  //     date: '2024-02-15',
  //     status: 'Delivered',
  //     total: 149.99,
  //     items: [
  //       {
  //         name: "Baby's First Blocks Set",
  //         image: '/img/Toy-Names-For-Kids.webp',
  //         quantity: 2,
  //         price: 74.99
  //       }
  //     ]
  //   }
  //   // Add more orders as needed
  // ];

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<h2 class="text-2xl font-bold md:block hidden">My Orders</h2>

<div class="space-y-6 md:mt-0 mt-2">
  {#if loading}
    <div class="p-4">
      <span class="loading loading-spinner loading-sm"></span>
    </div>
  {/if}

  {#if orders.length > 0}
    <div class="space-y-4">
      {#each orders as order}
        <div class="border md:rounded-lg overflow-hidden">
          <!-- Order Header -->
          <div class="bg-gray-50 p-4 flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-600">Order ID: {order.id}</p>
              <!-- <p class="text-sm text-gray-600">Ordered on {formatDate(order.created)}</p> -->
            </div>
            <div class="text-right">
              <span class="inline-block px-3 py-1 rounded-full text-sm 
                {order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                'bg-gray-100 text-gray-800'}">
                {order.status}
              </span>
            </div>
          </div>

          <OrderItems order_id={order.id} />

          <!-- Order Footer -->
          <div class="bg-gray-50 p-4 flex justify-between items-center border-t">
            <div class="space-x-4 flex">
              <!-- <a href="/profile/orders/{order.id}" class="text-red-500 hover:text-red-600">View Details</a> -->
              <InvoiceGenerator orderId={order.id} />
            </div>
            <div class="text-lg font-medium">
              Total: {order.total_amount.toFixed(2)}
            </div>
          </div>
        </div>
      {/each}

      {#if loadingMore}
          <div class="p-4">
            <span class="loading loading-spinner loading-sm"></span>
          </div>
      {/if}


      {#if (next && !loadingMore && !loading)}
        <button class="btn btn-sm my-4" on:click={loadMore}>Load More</button>
      {/if}

    </div>
  {:else if (!loading)}
    <div class="text-center py-12">
      <div class="mb-4">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900">No orders yet</h3>
      <p class="mt-1 text-gray-500">Start shopping to see your orders here</p>
      <div class="mt-6">
        <a href="/shop" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600">
          Continue Shopping
        </a>
      </div>
    </div>
  {/if}
</div> 