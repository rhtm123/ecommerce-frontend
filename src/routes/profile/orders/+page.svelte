<script>
  let orders = [
    {
      id: 'OD123456789',
      date: '2024-02-15',
      status: 'Delivered',
      total: 149.99,
      items: [
        {
          name: "Baby's First Blocks Set",
          image: '/img/Toy-Names-For-Kids.webp',
          quantity: 2,
          price: 74.99
        }
      ]
    }
    // Add more orders as needed
  ];

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<div class="space-y-6">
  <h2 class="text-2xl font-bold">My Orders</h2>

  {#if orders.length > 0}
    <div class="space-y-4">
      {#each orders as order}
        <div class="border rounded-lg overflow-hidden">
          <!-- Order Header -->
          <div class="bg-gray-50 p-4 flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-600">Order ID: {order.id}</p>
              <p class="text-sm text-gray-600">Ordered on {formatDate(order.date)}</p>
            </div>
            <div class="text-right">
              <span class="inline-block px-3 py-1 rounded-full text-sm 
                {order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                'bg-gray-100 text-gray-800'}">
                {order.status}
              </span>
            </div>
          </div>

          <!-- Order Items -->
          {#each order.items as item}
            <div class="p-4 border-t">
              <div class="flex items-center space-x-4">
                <img src={item.image} alt={item.name} class="w-20 h-20 object-cover rounded"/>
                <div class="flex-1">
                  <h3 class="font-medium">{item.name}</h3>
                  <p class="text-gray-600">Quantity: {item.quantity}</p>
                  <p class="text-gray-600">${item.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          {/each}

          <!-- Order Footer -->
          <div class="bg-gray-50 p-4 flex justify-between items-center border-t">
            <div class="space-x-4">
              <a href="/profile/orders/{order.id}" class="text-red-500 hover:text-red-600">View Details</a>
              <button class="text-red-500 hover:text-red-600">Download Invoice</button>
            </div>
            <div class="text-lg font-medium">
              Total: ${order.total.toFixed(2)}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
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