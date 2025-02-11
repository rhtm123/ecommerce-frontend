<script>
    // Sample order data
    const order = {
      id: "123456",
      date: "2023-10-15",
      total: "₹1,499",
      items: [
        { name: "Organic Tomatoes", quantity: 2, price: "₹199" },
        { name: "Handmade Jute Bag", quantity: 1, price: "₹499" },
        { name: "Fresh Coriander", quantity: 1, price: "₹29" },
      ],
      status: "Out for Delivery", // Options: Processing, Shipped, Out for Delivery, Delivered
      tracking: [
        { step: "Order Placed", date: "2023-10-15 10:00 AM", completed: true },
        { step: "Processing", date: "2023-10-15 11:30 AM", completed: true },
        { step: "Shipped", date: "2023-10-16 09:00 AM", completed: true },
        { step: "Out for Delivery", date: "2023-10-16 02:00 PM", completed: true },
        { step: "Delivered", date: "", completed: false },
      ],
    };
  
    // Calculate progress for the progress bar
    const completedSteps = order.tracking.filter((step) => step.completed).length;
    const progress = (completedSteps / order.tracking.length) * 100;
  </script>
  
  <div class="min-h-scree py-10">
    <div class="mx-auto px-4">
      <!-- Order Details Card -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 class="text-2xl font-bold mb-4">Order Details</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Order Summary -->
          <div>
            <h2 class="text-lg font-semibold mb-2">Order Summary</h2>
            <p><span class="font-medium">Order ID:</span> #{order.id}</p>
            <p><span class="font-medium">Order Date:</span> {order.date}</p>
            <p><span class="font-medium">Total Amount:</span> {order.total}</p>
          </div>
          <!-- Items List -->
          <div>
            <h2 class="text-lg font-semibold mb-2">Items</h2>
            <ul>
              {#each order.items as item}
                <li class="mb-2">
                  {item.name} - {item.quantity} x {item.price}
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
  
      <!-- Tracking Progress -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold mb-6">Order Tracking</h2>
        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-8">
          <div
            class="bg-primary h-2.5 rounded-full"
            style={`width: ${progress}%`}
          ></div>
        </div>
        <!-- Tracking Steps -->
        <div class="space-y-4">
          {#each order.tracking as step}
            <div class="flex items-center">
              <div
                class={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed ? "bg-primary" : "bg-gray-300"
                }`}
              >
                {#if step.completed}
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
                  <span class="text-white">{@index + 1}</span>
                {/if}
              </div>
              <div class="ml-4">
                <p class="font-medium">{step.step}</p>
                <p class="text-sm text-gray-500">{step.date}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>