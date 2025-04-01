<script>
  import { onDestroy, onMount } from "svelte";
  import { PUBLIC_API_URL } from "$env/static/public";
  import { myFetch } from "$lib/utils/myFetch";
  import { user } from "$lib/stores/auth";
  import OrderItems from "$lib/components/OrderItems.svelte";
  import InvoiceGenerator from "$lib/components/InvoiceGenerator.svelte";

  let authUser;
  $: authUser = $user;

  let loading = true;
  let loadingMore = false;

  let orders = [];
  let next;

  onMount(async ()=>{

    let url = `${PUBLIC_API_URL}/order/orders/?items_needed=true&user_id=${authUser.user_id}&ordering=-id`;
    let data = await myFetch(url);
    orders = data.results;
    next = data.next;
    loading = false;
    console.log("orders",data);
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

<h2 class="text-2xl font-bold md:block hidden py-4 sticky top-0 z-10 ">My Orders</h2>

<div class="space-y-2 md:space-y-4">
  {#if loading}
    <div class="p-4 flex justify-center">
      <span class="loading loading-spinner loading-sm"></span>
    </div>
  {/if}

  {#if orders.length > 0}
    <div class="space-y-6">
      {#each orders as order}
        <div class="bg-white border rounded-lg">
          <!-- Order Header -->
          <div class="p-3 flex justify-between items-center border-b">
            <p class="text text-gray-600">#{order.order_number}</p>
            <a class="btn btn-outline btn-primary" href={"/profile/orders/"+order.order_number}>
              Details & Track
            </a>
          </div>

          <OrderItems order_id={order.id} items={order.items} />

          <!-- Order Footer -->
          <div class="p-3 flex justify-between items-center border-t bg-gray-50">
            <InvoiceGenerator orderId={order.id} />
            <div class="text-base font-medium">
              Total: ₹{order.total_amount.toFixed(2)}
            </div>
          </div>
        </div>
      {/each}

      {#if loadingMore}
        <div class="p-4 flex justify-center">
          <span class="loading loading-spinner loading-sm"></span>
        </div>
      {/if}

      {#if (next && !loadingMore && !loading)}
        <div class="flex justify-center p-4">
          <button class="btn btn-sm btn-outline" on:click={loadMore}>Load More</button>
        </div>
      {/if}
    </div>
  {:else if (!loading)}
    <div class="text-center py-8 px-4">
      <div class="mb-4">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900">No orders yet</h3>
      <p class="mt-1 text-gray-500">Start shopping to see your orders here</p>
      <div class="mt-6">
        <a href="/shop" class="btn btn-primary">
          Continue Shopping
        </a>
      </div>
    </div>
  {/if}
</div>