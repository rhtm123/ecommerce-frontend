<script>
  export let data;
  import { PUBLIC_API_URL } from "$env/static/public";
  import { convertToIST } from "$lib/utils/myFunctions";

  let order = {};
  let loading = true;
  let error = null;

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
      if (!response.ok) throw new Error("Failed to fetch order details");
      order = await response.json();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
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
  <div class="mx-auto space-y-8">
    <!-- Order Details Card -->
    
    <h1 class=" text-2xl mb-4">Items in Your Order</h1>


    <div class="bg-base-100">
        
        <!-- Individual Items -->
        {#if order.items_without_package.length > 0}
          <div class="space-y-4">
            {#each order.items_without_package as item}
              <div class="flex flex-col sm:flex-row items-start gap-4 p-4 bg-base-200 rounded-lg">
                <div class="flex-1">
                  <p class="font-medium">{item.product_listing}</p>
                  <p class="text-sm text-base-content/70">Quantity: {item.quantity}</p>
                </div>
                <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">

                  <span class="text-base-content/70">Price/Item:</span>
                  <span>₹{item.price}</span>

                  <span class="font-medium">Final Price:</span>
                  <span class="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            {/each}

          </div>
        {/if}
    
        <!-- Package Items -->
        {#each order.packages as package_}
          <div class="mt-6 space-y-4">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-semibold">Package: {package_.tracking_number}</h2>
              <span class="badge badge-ghost badge-sm">Package</span>
            </div>
            {#each package_.package_items as package_item}
              <div class="flex flex-col sm:flex-row items-start gap-4 p-4 bg-base-200 rounded-lg">
                <div class="flex-1">
                  <p class="font-medium">{package_item.product_listing}</p>
                  <p class="text-sm text-base-content/70">Quantity: {package_item.quantity}</p>
                </div>
                <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  
                  <span class="text-base-content/70">Price/Item:</span>
                  <span>₹{package_item.price}</span>

                  <span class="font-medium">Final Price:</span>
                  <span class="font-medium">₹{(package_item.price * package_item.quantity).toFixed(2)}</span>
                </div>
              </div>
            {/each}
          </div>
        {/each}
    
        <!-- Total Amount -->
        <div class="mt-6 pt-4 border-t border-base-300">
          <div class="flex justify-between items-center">
            <span class="text-lg font-semibold">Order Total:</span>
            <span class="text-lg font-semibold">₹{order.total_amount}</span>
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