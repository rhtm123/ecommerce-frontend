<script>
    // Fetch order details from the API
    export let data;
    import { PUBLIC_API_URL } from "$env/static/public";

    let order = {};
    let loading = true;
    let error = null;
  
    // Replace with your actual API endpoint
    const apiUrl = `${PUBLIC_API_URL}/order/delivery-status/${data.order_number}`;
  
    async function fetchOrderDetails() {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }
        const data = await response.json();
        order = data;
        
        console.log(order);
      } catch (err) {
        error = err.message;
      } finally {
        loading = false;
      }
    }
  
    // Fetch data on component mount
    fetchOrderDetails();
  </script>
  
  {#if loading}
    <div class="min-h-screen flex items-center justify-center">
      <p class="text-lg font-medium">Loading order details...</p>
    </div>
  {:else if error}
    <div class="min-h-screen flex items-center justify-center">
      <p class="text-lg font-medium text-red-600">Error: {error}</p>
    </div>
  {:else}
    <div class="min-h-screen py-10">
      <div class="mx-auto px-4">
        <!-- Order Details Card -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 class="text-2xl font-bold mb-4">Order Details</h1>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Order Summary -->
            <div>
              <h2 class="text-lg font-semibold mb-2">Order Summary</h2>
              <p><span class="font-medium">Order ID:</span> #{order.order_id}</p>
              <p><span class="font-medium">Order Number:</span> {order.order_number}</p>
              <p><span class="font-medium">Total Amount:</span> ₹{order.total_amount}</p>
              <p><span class="font-medium">Payment Status:</span> {order.payment_status}</p>
            </div>
            <!-- Items List -->
            <div>
              <h2 class="text-lg font-semibold mb-2">Items</h2>
              <ul>
                {#each order.items_without_package as item}
                  <li class="mb-2">
                    {item.product_listing} - {item.quantity} x ₹{item.price}
                  </li>
                {/each}
                {#each order.packages as package_}
                  {#each package_.package_items as package_item}
                    <li class="mb-2">
                      {package_item.order_item.product_listing} - {package_item.quantity} x ₹{package_item.order_item.price} (In Package)
                    </li>
                  {/each}
                {/each}
              </ul>
            </div>
          </div>
        </div>
  
        <!-- Tracking Progress -->
        {#each order.packages as package_}
          <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 class="text-2xl font-bold mb-6">Package Tracking - {package_.tracking_number}</h2>
            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-8">
              <div
                class="bg-primary h-2.5 rounded-full"
                style={`width: ${(package_.status === 'delivered' ? 100 : 75)}%`}
              ></div>
            </div>
            <!-- Tracking Steps -->
            <div class="space-y-4">
              <div class="flex items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center bg-primary">
                  <svg
                    class="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="font-medium">Order Placed</p>
                  <p class="text-sm text-gray-500">{order.created}</p>
                </div>
              </div>
              <div class="flex items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center bg-primary">
                  <svg
                    class="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="font-medium">Processing</p>
                  <p class="text-sm text-gray-500">{order.created}</p>
                </div>
              </div>
              <div class="flex items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center bg-primary">
                  <svg
                    class="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="font-medium">Shipped</p>
                  <p class="text-sm text-gray-500">{package_.shipped_date || 'Not yet shipped'}</p>
                </div>
              </div>
              <div class="flex items-center">
                <div class={`w-8 h-8 rounded-full flex items-center justify-center ${package_.status === 'out_for_delivery' || package_.status === 'delivered' ? 'bg-primary' : 'bg-gray-300'}`}>
                  {#if package_.status === 'out_for_delivery' || package_.status === 'delivered'}
                    <svg
                      class="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  {:else}
                    <span class="text-white">4</span>
                  {/if}
                </div>
                <div class="ml-4">
                  <p class="font-medium">Out for Delivery</p>
                  <p class="text-sm text-gray-500">{package_.status === 'out_for_delivery' ? package_.shipped_date : 'Not yet out for delivery'}</p>
                </div>
              </div>
              <div class="flex items-center">
                <div class={`w-8 h-8 rounded-full flex items-center justify-center ${package_.status === 'delivered' ? 'bg-primary' : 'bg-gray-300'}`}>
                  {#if package_.status === 'delivered'}
                    <svg
                      class="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  {:else}
                    <span class="text-white">5</span>
                  {/if}
                </div>
                <div class="ml-4">
                  <p class="font-medium">Delivered</p>
                  <p class="text-sm text-gray-500">{package_.delivered_date || 'Not yet delivered'}</p>
                </div>
              </div>
            </div>
          </div>
        {/each}


        {#if order.items_without_package.length > 0}

        {#each order.items_without_package as order_item}
          <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 class="text-2xl font-bold mb-6">{order_item.product_listing}</h2>

            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-8">
              <div
                class="bg-primary h-2.5 rounded-full"
                style={`width: ${(order_item.status === 'delivered' ? 100 : 75)}%`}
              ></div>
            </div>

            <div class="space-y-4">
              <div class="flex items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center bg-primary">
                  <svg
                    class="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="font-medium">Order Placed</p>
                  <p class="text-sm text-gray-500">{order.created}</p>
                </div>
              </div>
              <div class="flex items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center bg-primary">
                  <svg
                    class="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="font-medium">Processing</p>
                  <p class="text-sm text-gray-500">{order.created}</p>
                </div>
              </div>
              <div class="flex items-center">
                <div class={`w-8 h-8 rounded-full flex items-center justify-center ${order.items_without_package[0].status === 'shipped' || order.items_without_package[0].status === 'delivered' ? 'bg-primary' : 'bg-gray-300'}`}>
                  {#if order.items_without_package[0].status === 'shipped' || order.items_without_package[0].status === 'delivered'}
                    <svg
                      class="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  {:else}
                    <span class="text-white">3</span>
                  {/if}
                </div>
                <div class="ml-4">
                  <p class="font-medium">Shipped</p>
                  <p class="text-sm text-gray-500">
                    {order.items_without_package[0].status === 'shipped' || order.items_without_package[0].status === 'delivered' ? 'Shipped on ' + new Date(order.updated).toLocaleDateString() : 'Not yet shipped'}
                  </p>
                </div>
              </div>
              <div class="flex items-center">
                <div class={`w-8 h-8 rounded-full flex items-center justify-center ${order.items_without_package[0].status === 'out_for_delivery' || order.items_without_package[0].status === 'delivered' ? 'bg-primary' : 'bg-gray-300'}`}>
                  {#if order.items_without_package[0].status === 'out_for_delivery' || order.items_without_package[0].status === 'delivered'}
                    <svg
                      class="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  {:else}
                    <span class="text-white">4</span>
                  {/if}
                </div>
                <div class="ml-4">
                  <p class="font-medium">Out for Delivery</p>
                  <p class="text-sm text-gray-500">
                    {order.items_without_package[0].status === 'out_for_delivery' ? 'Out for delivery on ' + new Date(order.updated).toLocaleDateString() : 'Not yet out for delivery'}
                  </p>
                </div>
              </div>
              <div class="flex items-center">
                <div class={`w-8 h-8 rounded-full flex items-center justify-center ${order.items_without_package[0].status === 'delivered' ? 'bg-primary' : 'bg-gray-300'}`}>
                  {#if order.items_without_package[0].status === 'delivered'}
                    <svg
                      class="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  {:else}
                    <span class="text-white">5</span>
                  {/if}
                </div>
                <div class="ml-4">
                  <p class="font-medium">Delivered</p>
                  <p class="text-sm text-gray-500">
                    {order.items_without_package[0].status === 'delivered' ? 'Delivered on ' + new Date(order.updated).toLocaleDateString() : 'Not yet delivered'}
                  </p>
                </div>
              </div>
            </div>


          </div>


          

        {/each}

{/if}
      </div>
    </div>
  {/if}