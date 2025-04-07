<script>
  export let data;
  import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from "$env/static/public";
  import { convertToIST } from "$lib/utils/myFunctions";
  import { user } from "$lib/stores/auth";
  import { myFetch } from "$lib/utils/myFetch";
  import { goto } from '$app/navigation';


  let authUser;
  $: authUser = $user;



  let order = {};
  let loading = true;
  let error = null;
  let paymentLoading = false;

  let statuses = ['order_placed', 'shipped', "ready_for_delivery", 'out_for_delivery', 'delivered'];

  function getWidth(status) { 
    let i = statuses.indexOf(status) + 1;
    let total = statuses.length;
    return i / total * 100;
  }

  function getCheck(itemStatus, status) { 
    let i_item = statuses.indexOf(itemStatus);
    let i_status = statuses.indexOf(status);
    return i_item >= i_status;
  }

  function formatText(text) {
    return text
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const apiUrl = `${PUBLIC_API_URL}/order/delivery-status/${data.order_number}`;

  async function fetchOrderDetails() {
    try {
      const response = await fetch(apiUrl);
      // console.log(response);
      if (!response.ok) throw new Error("Failed to fetch order details");
      order = await response.json();
      console.log(order);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function handlePayment() {
    if (!authUser) {
      goto('/login');
      return;
    }

    try {
      paymentLoading = true;
      // console.log(order);
      // console.log('Payment payload:', {
      //   order_id: order.id,
      //   amount: order.total_amount,
      //   estore_id: PUBLIC_ESTORE_ID || '1',
      //   payment_method: "pg"
      // });
      // Create payment request similar to checkout
      const paymentUrl = `${PUBLIC_API_URL}/payment/payments/`;
      const payment = await myFetch(paymentUrl, "POST", {
        "order_id": order.order_id,
        "amount": order.total_amount,
        "estore_id": PUBLIC_ESTORE_ID || '1', // You might need to adjust this
        "payment_method": 'pg' // PhonePe payment gateway
      }, authUser.access_token);

      console.log(payment);
      if (payment.payment_url) {
        window.location = payment.payment_url; // Redirect to PhonePe payment page
      }
      else {
        error = `Payment initiation failed: ${payment.error}`;
        goto("/profile/orders/"+data.order_number);
      }

    } catch (err) {
      error = `Payment initiation failed: ${err.message}`;
    } finally {
      paymentLoading = false;
    }
  }
  fetchOrderDetails();
</script>

{#if loading}
<div class="min-h-screen flex items-center justify-center">
  <div class="loading loading-spinner loading-lg text-primary"></div>
</div>
{:else if error}
<div class="min-h-screen flex items-center justify-center">
  <div class="alert alert-error max-w-md">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>Error: {error}</span>
  </div>
</div>
{:else}
<div class="mx-auto max-w-4xl ">
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Items in Your Order</h1>
    <div class="flex items-center gap-2">
      <p class="text-sm text-gray-600">Order #{data.order_number}</p>
      <span class="badge {order.payment_status === 'completed' ? 'badge-success' : 'badge-warning'}">
       Payment : {order.payment_status}
      </span>
    </div>
    
    {#if order.payment_status === 'pending'}
      <div class="mt-4">
        <button 
          on:click={handlePayment}
          class="btn btn-primary"
          disabled={paymentLoading}
        >
          {#if paymentLoading}
            <span class="loading loading-spinner"></span>
            Processing...
          {:else}
            Pay Now via PhonePe
          {/if}
        </button>
      </div>
    {/if}
  </div>

    <div class="bg-white shadow rounded-lg mb-4 overflow-hidden">
      <!-- Package Items -->
      {#each order.packages as package_}
        <div class="border-b last:border-b-0">
          <div class="p-4 bg-gray-50 border-b">
            <div class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <div>
                <h2 class="font-semibold text-gray-900">Package: {package_.tracking_number}</h2>
                <span class="inline-block mt-1 text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  Tracking ID
                </span>
              </div>
            </div>
          </div>

          {#each package_.package_items as package_item}
            <div class="p-4 hover:bg-gray-50 transition-colors">
              <div class="flex flex-col md:flex-row md:items-center gap-4">
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900">{package_item.product_listing}</h3>
                  <div class="mt-1 flex items-center gap-4">
                    <span class="text-sm text-gray-600">
                      Quantity: <span class="font-medium text-gray-900">{package_item.quantity}</span>
                    </span>
                    <span class="text-sm text-gray-600">
                      Price/Item: <span class="font-medium text-gray-900">₹{package_item.price}</span>
                    </span>
                  </div>
                </div>
                <div class="md:text-right">
                  <p class="text-sm text-gray-600">Subtotal</p>
                  <p class="text-lg font-semibold text-gray-900">
                    ₹{(package_item.price * package_item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/each}

      <!-- Individual Items without Package -->
      {#if order.items_without_package.length > 0}
        <div class="border-t">
          {#each order.items_without_package as item}
            <div class="p-4 hover:bg-gray-50 transition-colors">
              <div class="flex flex-col md:flex-row md:items-center gap-4">
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900">{item.product_listing}</h3>
                  <div class="mt-1 flex items-center gap-4">
                    <span class="text-sm text-gray-600">
                      Quantity: <span class="font-medium text-gray-900">{item.quantity}</span>
                    </span>
                    <span class="text-sm text-gray-600">
                      Price/Item: <span class="font-medium text-gray-900">₹{item.price}</span>
                    </span>
                  </div>
                </div>
                <div class="md:text-right">
                  <p class="text-sm text-gray-600">Subtotal</p>
                  <p class="text-lg font-semibold text-gray-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Order Total -->
    <div class="p-4 bg-gray-50 border-t">
      <div class="flex justify-between items-center">
        <div>
          <span class="font-medium text-gray-900">Order Total</span>
          <!-- {#if order.payment_status === 'pending'}
            <p class="text-sm text-warning">Payment Pending</p>
          {/if} -->
        </div>
        <span class="text-xl font-bold text-gray-900">₹{order.total_amount}</span>
      </div>
    </div>
  </div>

    <h1 class="text-2xl mb-4">Track Your Items</h1>

    <!-- Package Tracking -->
    {#each order.packages as package_}
      <div class="card bg-base-100">
        <div class="card-body">
          <h2 class="card-title">Package Tracking - {package_.tracking_number}</h2>
          
          <div class="mb-6 prose">
            {#each package_.package_items as package_item, i}
              <p class="text-sm">{i+1}. {package_item.product_listing} | Quantity: {package_item.quantity}</p>
            {/each}
          </div>

          <progress 
            class="progress progress-primary w-full" 
            value={getWidth(package_.status)} 
            max="100"
          ></progress>

          <div class="space-y-6 mt-6">
            {#each statuses as status, i}
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center {getCheck(package_.status, status) ? 'bg-primary text-white' : 'bg-base-300'}">
                    {#if getCheck(package_.status, status)}
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    {:else}
                      <span>{i+1}</span>
                    {/if}
                  </div>
                </div>
                <div class="ml-4">
                  <p class="font-medium">{formatText(status)}</p>
                  {#if !getCheck(package_.status, status)}
                    <p class="text-sm text-base-content/70">Not yet {formatText(status)}</p>
                  {:else}
                    {#if status === "order_placed"}
                      <p class="text-sm text-base-content/70">{convertToIST(package_.package_items[0].created)}</p>
                    {:else if status === "shipped"}
                      <p class="text-sm text-base-content/70">{convertToIST(package_.package_items[0].shipped_date)}</p>
                    {:else if status === "ready_for_delivery"}
                      <p class="text-sm text-base-content/70">{convertToIST(package_.created)}</p>
                    {:else if status === "out_for_delivery"}
                      <p class="text-sm text-base-content/70">{convertToIST(package_.delivery_out_date)}</p>
                    {:else if status === "delivered"}
                      <p class="text-sm text-base-content/70">{convertToIST(package_.delivered_date)}</p>
                    {/if}
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/each}

    <!-- Individual Items -->
    {#if order.items_without_package.length > 0}
      {#each order.items_without_package as order_item}
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Item: {order_item.product_listing}</h2>
            
            <progress 
              class="progress progress-primary w-full" 
              value={getWidth(order_item.status)} 
              max="100"
            ></progress>

            <div class="space-y-6 mt-6">
              {#each statuses as status, i}
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center {getCheck(order_item.status, status) ? 'bg-primary text-white' : 'bg-base-300'}">
                      {#if getCheck(order_item.status, status)}
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      {:else}
                        <span>{i+1}</span>
                      {/if}
                    </div>
                  </div>
                  <div class="ml-4">
                    <p class="font-medium">{formatText(status)}</p>
                    {#if !getCheck(order_item.status, status)}
                      <p class="text-sm text-base-content/70">Not yet {formatText(status)}</p>
                    {:else}
                      {#if status === "order_placed"}
                        <p class="text-sm text-base-content/70">{convertToIST(order_item.created)}</p>
                      {:else if status === "shipped"}
                        <p class="text-sm text-base-content/70">{convertToIST(order_item.shipped_date)}</p>
                      {/if}
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
{/if}