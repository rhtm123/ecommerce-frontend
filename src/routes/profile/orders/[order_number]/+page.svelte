<script>
  export let data;
  import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from "$env/static/public";
  import { convertToIST } from "$lib/utils/myFunctions";
  import { user } from "$lib/stores/auth";
  import { myFetch } from "$lib/utils/myFetch";
  import { goto } from '$app/navigation';
  import { addAlert } from "$lib/stores/alert";


  let authUser;
  $: authUser = $user;



  let order = {};
  let loading = true;
  let error = null;
  let paymentLoading = false;
  let cancelLoading = false;
  let returnLoading = false;

  // Modal state
  let showCancelModal = false;
  let showReturnModal = false;
  let selectedItems = [];
  let cancelReason = "";
  let returnReason = "";

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

  // Check if order is delivered
  function isOrderDelivered() {
    // Check if any package is delivered
    return order.packages.some(pkg => pkg.status === 'delivered');
  }

  // Check if order can be cancelled (not delivered)
  function canCancelOrder() {
    return !isOrderDelivered() && order.payment_status === 'completed';
  }

  // Check if order can be returned (delivered)
  function canReturnOrder() {
    return isOrderDelivered() && order.payment_status === 'completed';
  }

  // Check if any item has a pending cancellation request
  function hasPendingCancelRequest() {
    // Check package items
    for (const pkg of order.packages) {
      for (const item of pkg.package_items) {
        if (item.cancel_requested && !item.cancel_approved) {
          return true;
        }
      }
    }
    
    // Check items without package
    for (const item of order.items_without_package) {
      if (item.cancel_requested && !item.cancel_approved) {
        return true;
      }
    }
    
    return false;
  }

  // Check if any item has an approved cancellation request
  function hasApprovedCancelRequest() {
    // Check package items
    for (const pkg of order.packages) {
      for (const item of pkg.package_items) {
        if (item.cancel_requested && item.cancel_approved) {
          return true;
        }
      }
    }
    
    // Check items without package
    for (const item of order.items_without_package) {
      if (item.cancel_requested && item.cancel_approved) {
        return true;
      }
    }
    
    return false;
  }

  // Check if any item has a pending return request
  function hasPendingReturnRequest() {
    // Check package items
    for (const pkg of order.packages) {
      for (const item of pkg.package_items) {
        if (item.return_requested && !item.return_approved) {
          return true;
        }
      }
    }
    
    // Check items without package
    for (const item of order.items_without_package) {
      if (item.return_requested && !item.return_approved) {
        return true;
      }
    }
    
    return false;
  }

  // Check if any item has an approved return request
  function hasApprovedReturnRequest() {
    // Check package items
    for (const pkg of order.packages) {
      for (const item of pkg.package_items) {
        if (item.return_requested && item.return_approved) {
          return true;
        }
      }
    }
    
    // Check items without package
    for (const item of order.items_without_package) {
      if (item.return_requested && item.return_approved) {
        return true;
      }
    }
    
    return false;
  }

  // Get all order items (from packages and without package)
  function getAllOrderItems() {
    let items = [];
    
    // Add items from packages
    order.packages.forEach(pkg => {
      pkg.package_items.forEach(item => {
        items.push({
          ...item,
          package_tracking: pkg.tracking_number
        });
      });
    });
    
    // Add items without package
    items = [...items, ...order.items_without_package];
    
    return items;
  }

  // Toggle item selection for cancellation/return
  function toggleItemSelection(itemId) {
    if (selectedItems.includes(itemId)) {
      selectedItems = selectedItems.filter(id => id !== itemId);
    } else {
      selectedItems = [...selectedItems, itemId];
    }
  }

  // Open cancel modal
  function openCancelModal() {
    selectedItems = [];
    cancelReason = "";
    showCancelModal = true;
  }

  // Open return modal
  function openReturnModal() {
    selectedItems = [];
    returnReason = "";
    showReturnModal = true;
  }

  // Close modals
  function closeModals() {
    showCancelModal = false;
    showReturnModal = false;
  }

  // Handle cancel request
  async function handleCancelRequest() {
    if (!authUser) {
      goto('/login');
      return;
    }

    if (selectedItems.length === 0) {
      error = "Please select at least one item to cancel";
      return;
    }

    if (!cancelReason.trim()) {
      error = "Please provide a reason for cancellation";
      return;
    }

    try {
      cancelLoading = true;
      error = null;
      
      // Process each selected item
      for (const itemId of selectedItems) {
        const cancelUrl = `${PUBLIC_API_URL}/order/order-items/${itemId}/`;
        await myFetch(cancelUrl, "PUT", {
          cancel_requested: true,
          cancel_reason: cancelReason
        }, authUser.access_token);
      }
      
      // Refresh order details
      await fetchOrderDetails();
      closeModals();
      
      // Show success alert
      addAlert("Cancellation request submitted successfully. We'll review your request shortly.", "success", 5000);
      
    } catch (err) {
      error = `Cancellation request failed: ${err.message}`;
      addAlert(`Cancellation request failed: ${err.message}`, "error", 5000);
    } finally {
      cancelLoading = false;
    }
  }

  // Handle return request
  async function handleReturnRequest() {
    if (!authUser) {
      goto('/login');
      return;
    }

    if (selectedItems.length === 0) {
      error = "Please select at least one item to return";
      return;
    }

    if (!returnReason.trim()) {
      error = "Please provide a reason for return";
      return;
    }

    try {
      returnLoading = true;
      error = null;
      
      // Process each selected item
      for (const itemId of selectedItems) {
        const returnUrl = `${PUBLIC_API_URL}/order/order-items/${itemId}/`;
        await myFetch(returnUrl, "PUT", {
          return_requested: true,
          return_reason: returnReason
        }, authUser.access_token);
      }
      
      // Refresh order details
      await fetchOrderDetails();
      closeModals();
      
      // Show success alert
      addAlert("Return request submitted successfully. We'll review your request shortly.", "success", 5000);
      
    } catch (err) {
      error = `Return request failed: ${err.message}`;
      addAlert(`Return request failed: ${err.message}`, "error", 5000);
    } finally {
      returnLoading = false;
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
<div class="mx-auto max-w-4xl px-4 py-8">
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Items in Your Order</h1>
    <div class="flex items-center gap-2">
      <p class="text-sm text-gray-600">Order #{data.order_number}</p>
      <span class="badge {order.payment_status === 'completed' ? 'badge-success' : 'badge-warning'}">
       Payment : {order.payment_status}
      </span>
    </div>
    
    <div class="flex flex-wrap gap-2 mt-4">
      {#if order.payment_status === 'pending'}
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
      {/if}

      {#if canCancelOrder() && !hasPendingCancelRequest() && !hasApprovedCancelRequest()}
        <button 
          on:click={openCancelModal}
          class="btn btn-error"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancel Order
        </button>
      {:else if hasPendingCancelRequest()}
        <div class="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Cancellation request pending approval</span>
        </div>
      {:else if hasApprovedCancelRequest()}
        <div class="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Cancellation request has been approved</span>
        </div>
      {/if}

      {#if canReturnOrder() && !hasPendingReturnRequest() && !hasApprovedReturnRequest()}
        <button 
          on:click={openReturnModal}
          class="btn btn-warning"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
          </svg>
          Return Request
        </button>
      {:else if hasPendingReturnRequest()}
        <div class="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Return request pending approval</span>
        </div>
      {:else if hasApprovedReturnRequest()}
        <div class="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Return request has been approved</span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Cancel Modal -->
  {#if showCancelModal}
    <div class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Cancel Order Items</h3>
        <p class="text-sm text-gray-600 mb-4">Select the items you want to cancel and provide a reason.</p>
        
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Reason for Cancellation</span>
          </label>
          <textarea 
            class="textarea textarea-bordered h-24" 
            placeholder="Please provide a reason for cancellation"
            bind:value={cancelReason}
          ></textarea>
        </div>
        
        <div class="mb-4">
          <label class="label">
            <span class="label-text">Select Items to Cancel</span>
          </label>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            {#each getAllOrderItems() as item}
              {#if !item.cancel_requested && !item.cancel_approved}
                <div class="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-primary" 
                    checked={selectedItems.includes(item.id)}
                    on:change={() => toggleItemSelection(item.id)}
                  />
                  <div>
                    <p class="font-medium">{item.product_listing_name}</p>
                    <p class="text-xs text-gray-500">
                      Quantity: {item.quantity} | 
                      {#if item.package_tracking}
                        Package: {item.package_tracking}
                      {:else}
                        No Package
                      {/if}
                    </p>
                  </div>
                </div>
              {:else}
                <div class="flex items-center gap-2 p-2 bg-gray-100 rounded opacity-60">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-primary" 
                    disabled
                  />
                  <div>
                    <p class="font-medium">{item.product_listing_name}</p>
                    <p class="text-xs text-gray-500">
                      Quantity: {item.quantity} | 
                      {#if item.package_tracking}
                        Package: {item.package_tracking}
                      {:else}
                        No Package
                      {/if}
                    </p>
                    <p class="text-xs text-red-500 mt-1">
                      {#if item.cancel_approved}
                        Cancellation already approved
                      {:else}
                        Cancellation request pending
                      {/if}
                    </p>
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        </div>
        
        <div class="modal-action">
          <button class="btn" on:click={closeModals}>Close</button>
          <button 
            class="btn btn-error" 
            on:click={handleCancelRequest}
            disabled={cancelLoading || selectedItems.length === 0 || !cancelReason.trim()}
          >
            {#if cancelLoading}
              <span class="loading loading-spinner"></span>
              Processing...
            {:else}
              Submit Cancellation Request
            {/if}
          </button>
        </div>
      </div>
      <div class="modal-backdrop" on:click={closeModals}></div>
    </div>
  {/if}

  <!-- Return Modal -->
  {#if showReturnModal}
    <div class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Return Order Items</h3>
        <p class="text-sm text-gray-600 mb-4">Select the items you want to return and provide a reason.</p>
        
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Reason for Return</span>
          </label>
          <textarea 
            class="textarea textarea-bordered h-24" 
            placeholder="Please provide a reason for return"
            bind:value={returnReason}
          ></textarea>
        </div>
        
        <div class="mb-4">
          <label class="label">
            <span class="label-text">Select Items to Return</span>
          </label>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            {#each getAllOrderItems() as item}
              {#if !item.return_requested && !item.return_approved}
                <div class="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-primary" 
                    checked={selectedItems.includes(item.id)}
                    on:change={() => toggleItemSelection(item.id)}
                  />
                  <div>
                    <p class="font-medium">{item.product_listing_name}</p>
                    <p class="text-xs text-gray-500">
                      Quantity: {item.quantity} | 
                      {#if item.package_tracking}
                        Package: {item.package_tracking}
                      {:else}
                        No Package
                      {/if}
                    </p>
                  </div>
                </div>
              {:else}
                <div class="flex items-center gap-2 p-2 bg-gray-100 rounded opacity-60">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-primary" 
                    disabled
                  />
                  <div>
                    <p class="font-medium">{item.product_listing_name}</p>
                    <p class="text-xs text-gray-500">
                      Quantity: {item.quantity} | 
                      {#if item.package_tracking}
                        Package: {item.package_tracking}
                      {:else}
                        No Package
                      {/if}
                    </p>
                    <p class="text-xs text-red-500 mt-1">
                      {#if item.return_approved}
                        Return already approved
                      {:else}
                        Return request pending
                      {/if}
                    </p>
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        </div>
        
        <div class="modal-action">
          <button class="btn" on:click={closeModals}>Close</button>
          <button 
            class="btn btn-warning" 
            on:click={handleReturnRequest}
            disabled={returnLoading || selectedItems.length === 0 || !returnReason.trim()}
          >
            {#if returnLoading}
              <span class="loading loading-spinner"></span>
              Processing...
            {:else}
              Submit Return Request
            {/if}
          </button>
        </div>
      </div>
      <div class="modal-backdrop" on:click={closeModals}></div>
    </div>
  {/if}

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
                <!-- Product Image -->
                <div class="w-24 h-24 flex-shrink-0">
                  <a href={`/product/${package_item.product_slug}`}>
                    <img 
                      src={package_item.product_main_image || `https://placehold.co/200x200?text=${encodeURIComponent(package_item.product_listing_name)}`} 
                      alt={package_item.product_listing_name}
                      class="w-full h-full object-cover rounded-lg shadow-sm"
                    loading="lazy"
                      on:error={(e) => e.target.src = `https://placehold.co/200x200?text=${encodeURIComponent(package_item.product_listing_name)}`}
                    />
                  </a>
                </div>
                <div class="flex-1">
                  <a href={`/product/${package_item.product_slug}`}>
                    <h3 class="font-medium text-gray-900">{package_item.product_listing_name}</h3>
                  </a>
                  <div class="mt-1 flex items-center gap-4">
                    <span class="text-sm text-gray-600">
                      Quantity: <span class="font-medium text-gray-900">{package_item.quantity}</span>
                    </span>
                    <span class="text-sm text-gray-600">
                      Price/Item: <span class="font-medium text-gray-900">₹{package_item.price}</span>
                    </span>
                  </div>
                  {#if package_item.applied_offers && package_item.applied_offers.length > 0}
                    <div class="mt-2">
                      {#each package_item.applied_offers as offer}
                        <div class="text-sm text-green-600 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span>{offer.offer_name} ({offer.offer_type}): -₹{offer.discount_amount}</span>
                        </div>
                      {/each}
                    </div>
                  {/if}
                  
                  <!-- Status Badges -->
                  <div class="mt-2 flex flex-wrap gap-2">
                    {#if package_item.cancel_requested}
                      <span class="badge {package_item.cancel_approved ? 'badge-success' : 'badge-warning'} gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {#if package_item.cancel_approved}
                          <span>Cancellation Approved</span>
                        {:else}
                          <span>Cancellation Pending</span>
                        {/if}
                      </span>
                    {/if}
                    
                    {#if package_item.return_requested}
                      <span class="badge {package_item.return_approved ? 'badge-success' : 'badge-info'} gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                        </svg>
                        {#if package_item.return_approved}
                          <span>Return Approved</span>
                        {:else}
                          <span>Return Pending</span>
                        {/if}
                      </span>
                    {/if}
                  </div>
                </div>
                <div class="md:text-right">
                  {#if package_item.discount_amount > 0}
                    <p class="text-sm text-gray-500 line-through">₹{(package_item.price * package_item.quantity).toFixed(2)}</p>
                  {/if}
                  <p class="text-lg font-semibold text-gray-900">
                    ₹{(((package_item.price * package_item.quantity) - package_item.discount_amount) ).toFixed(2)}
                  </p>
                  {#if package_item.discount_amount > 0}
                    <p class="text-sm text-green-600">Saved ₹{package_item.discount_amount}</p>
                  {/if}
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
                <!-- Product Image -->
                <div class="w-24 h-24 flex-shrink-0">
                  <a href={`/product/${item.product_slug}`}>
                    <img 
                      src={item.product_main_image || `https://placehold.co/200x200?text=${encodeURIComponent(item.product_listing_name)}`} 
                      alt={item.product_listing_name}
                    class="w-full h-full object-cover rounded-lg shadow-sm"
                    loading="lazy"
                      on:error={(e) => e.target.src = `https://placehold.co/200x200?text=${encodeURIComponent(item.product_listing_name)}`}
                    />
                  </a>
                </div>
                <div class="flex-1">
                  <a href={`/product/${item.product_slug}`}>  
                    <h3 class="font-medium text-gray-900">{item.product_listing_name}</h3>
                  </a>
                  <div class="mt-1 flex items-center gap-4">
                    <span class="text-sm text-gray-600">
                      Quantity: <span class="font-medium text-gray-900">{item.quantity}</span>
                    </span>
                    <div class="flex items-center gap-2">
                      {#if item.discount_amount > 0}
                        <span class="text-sm text-gray-600">
                          Price/Item: 
                          <span class="line-through text-gray-400">₹{item.price}</span>
                          <span class="font-medium text-gray-900">₹{((item.price * item.quantity - item.discount_amount) / item.quantity).toFixed(2)}</span>
                        </span>
                        <span class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          {Math.round((item.discount_amount / (item.price * item.quantity)) * 100)}% off
                        </span>
                      {:else}
                        <span class="text-sm text-gray-600">
                          Price/Item: <span class="font-medium text-gray-900">₹{item.price}</span>
                        </span>
                      {/if}
                    </div>
                  </div>
                  {#if item.discount_amount > 0}
                    <div class="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span>Product Offer: -₹{item.discount_amount}</span>
                    </div>
                  {/if}
                  
                  <!-- Status Badges -->
                  <div class="mt-2 flex flex-wrap gap-2">
                    {#if item.cancel_requested}
                      <span class="badge {item.cancel_approved ? 'badge-success' : 'badge-warning'} gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {#if item.cancel_approved}
                          <span>Cancellation Approved</span>
                        {:else}
                          <span>Cancellation Pending</span>
                        {/if}
                      </span>
                    {/if}
                    
                    {#if item.return_requested}
                      <span class="badge {item.return_approved ? 'badge-success' : 'badge-info'} gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                        </svg>
                        {#if item.return_approved}
                          <span>Return Approved</span>
                        {:else}
                          <span>Return Pending</span>
                        {/if}
                      </span>
                    {/if}
                  </div>
                </div>
                <div class="md:text-right">
                  {#if item.discount_amount > 0}
                    <p class="text-sm text-gray-500 line-through">₹{(item.price * item.quantity).toFixed(2)}</p>
                  {/if}
                  <p class="text-lg font-semibold text-gray-900">
                    ₹{(((item.price * item.quantity) - item.discount_amount) ).toFixed(2)}
                  </p>
                  {#if item.discount_amount > 0}
                    <p class="text-sm text-green-600">Saved ₹{item.discount_amount}</p>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Order Total -->
    <div class="p-4 bg-gray-50 border-t">
      <div class="flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Subtotal</span>
          <span class="text-gray-900">₹{order.total_amount}</span>
        </div>

        {#if order.offer}
          <div class="flex justify-between items-center text-green-600">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0 0l-4-4m4 4l4-4M12 3v1" />
              </svg>
              <span>Offer Applied: {order.offer.name}</span>
              <span class="badge badge-success badge-sm">{order.offer.get_discount_percent}% OFF</span>
            </div>
            <span>-₹{order.discount_amount_offer}</span>
          </div>
        {/if}

        {#if order.coupon}
          <div class="flex justify-between items-center text-green-600">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span>Coupon Applied: {order.coupon.code}</span>
              {#if order.coupon.discount_type === 'percentage'}
                <span class="badge badge-success badge-sm">{order.coupon.discount_value}% OFF</span>
              {:else}
                <span class="badge badge-success badge-sm">₹{order.coupon.discount_value} OFF</span>
              {/if}
            </div>
            <span>-₹{order.discount_amount_coupon}</span>
          </div>
        {/if}
        <div class="divider my-0"></div>

        
        <div class="flex justify-between items-center font-bold text-lg">
          <span>Final Amount</span>
          <span class="text-gray-900">₹{order.total_amount - order.total_discount}</span>
          
        </div>
        {#if order.total_discount > 0}
          <div class="flex justify-between items-center text-green-600 font-medium">
            <span>Total Savings</span>
            <span>-₹{order.total_discount}</span>
          </div>
        {/if}

       
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
              <p class="text-sm">{i+1}. {package_item.product_listing_name} | Quantity: {package_item.quantity}</p>
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
            <h2 class="card-title">Item: {order_item.product_listing_name}</h2>
            
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