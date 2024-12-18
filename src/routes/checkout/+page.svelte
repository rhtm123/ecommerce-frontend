<script>
    import { cart } from '$lib/stores/cart';
    import { fade } from 'svelte/transition';
  
    let billingDetails = {
      firstName: '',
      lastName: '',
      companyName: '',
      country: '',
      streetAddress: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      notes: ''
    };
  
    $: totalPrice = $cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
    function handleSubmit() {
      // Implement order submission logic here
      console.log('Order submitted:', { billingDetails, items: $cart });
    }
  </script>
  
  <svelte:head>
    <title>CHECKOUT</title>
  </svelte:head>
  

  <div class="bg-[#FDF6F4]">
  <!-- Breadcrumb -->
  <div class="bg-[#f7e4de] py-16">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold text-center text-[#1A1A1A] mb-4">CHECKOUT</h1>
      <div class="flex justify-center items-center gap-2 text-sm">
        <a href="/" class="text-[#1A1A1A] hover:text-red-500">Home</a>
        <span class="text-red-500">></span>
        <a href="/cart " class="text-[#1A1A1A] hover:text-red-500">Cart</a>
        <span class="text-red-500">></span>
        <span class="text-red-500">Checkout</span>
      </div>
    </div>
  </div>
  
  <!-- Progress Steps -->
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center justify-between max-w-3xl mx-auto mb-12">
      <div class="flex-1 relative">
        <div class="h-1 bg-red-500">
          <div class="w-full h-full bg-red-500"></div>
        </div>
        <div class="absolute top-0 -ml-4 mt-[-10px]">
          <div class="bg-red-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold">01</div>
          <div class="text-xs mt-2 text-gray-600 font-medium">SHOPPING CART</div>
        </div>
      </div>
      <div class="flex-1 relative">
        <div class="h-1 bg-red-500">
          <div class="w-full h-full bg-red-500"></div>
        </div>
        <div class="absolute top-0 left-1/2 -ml-4 mt-[-10px]">
          <div class="bg-red-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold">02</div>
          <div class="text-xs mt-2 text-red-500 font-medium">CHECKOUT</div>
        </div>
      </div>
      <div class="flex-1 relative">
        <div class="h-1 bg-gray-200">
          <div class="w-0 h-full bg-red-500"></div>
        </div>
        <div class="absolute top-0 right-0 -mr-4 mt-[-10px]">
          <div class="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center text-gray-600 font-bold">03</div>
          <div class="text-xs mt-2 text-gray-600 font-medium">ORDER COMPLETED</div>
        </div>
      </div>
    </div>
  
    {#if $cart.length === 0}
      <div class="text-center py-8" in:fade>
        <p class="text-red-500 mb-4">Please add some items to your cart before checking out.</p>
        <a href="/shop" class="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors">
          Continue Shopping
        </a>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Billing Details Form -->
        <div class="space-y-6">
          <div class="bg-white p-6 rounded shadow-sm">
            <h2 class="text-xl font-bold mb-6">Billing Details</h2>
            <form class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm mb-1">First Name *</label>
                  <input 
                    type="text" 
                    bind:value={billingDetails.firstName} 
                    required
                    class="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label class="block text-sm mb-1">Last Name *</label>
                  <input 
                    type="text" 
                    bind:value={billingDetails.lastName} 
                    required
                    class="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
  
              <div>
                <label class="block text-sm mb-1">Company Name (optional)</label>
                <input 
                  type="text" 
                  bind:value={billingDetails.companyName}
                  class="w-full border rounded px-3 py-2"
                />
              </div>
  
              <div>
                <label class="block text-sm mb-1">Country *</label>
                <input 
                  type="text" 
                  bind:value={billingDetails.country}
                  required
                  class="w-full border rounded px-3 py-2"
                />
              </div>
  
              <div>
                <label class="block text-sm mb-1">Street Address *</label>
                <input 
                  type="text" 
                  bind:value={billingDetails.streetAddress}
                  required
                  placeholder="House number and street name"
                  class="w-full border rounded px-3 py-2 mb-2"
                />
                <input 
                  type="text" 
                  bind:value={billingDetails.apartment}
                  placeholder="Apartment, suite, unit, etc. (optional)"
                  class="w-full border rounded px-3 py-2"
                />
              </div>
  
              <div>
                <label class="block text-sm mb-1">Town / City *</label>
                <input 
                  type="text" 
                  bind:value={billingDetails.city}
                  required
                  class="w-full border rounded px-3 py-2"
                />
              </div>
  
              <div>
                <label class="block text-sm mb-1">State *</label>
                <input 
                  type="text" 
                  bind:value={billingDetails.state}
                  required
                  class="w-full border rounded px-3 py-2"
                />
              </div>
  
              <div>
                <label class="block text-sm mb-1">ZIP Code *</label>
                <input 
                  type="text" 
                  bind:value={billingDetails.zipCode}
                  required
                  class="w-full border rounded px-3 py-2"
                />
              </div>
  
              <div>
                <label class="block text-sm mb-1">Phone *</label>
                <input 
                  type="tel" 
                  bind:value={billingDetails.phone}
                  required
                  class="w-full border rounded px-3 py-2"
                />
              </div>
  
              <div>
                <label class="block text-sm mb-1">Email Address *</label>
                <input 
                  type="email" 
                  bind:value={billingDetails.email}
                  required
                  class="w-full border rounded px-3 py-2"
                />
              </div>
  
              <div>
                <label class="block text-sm mb-1">Order Notes (optional)</label>
                <textarea 
                  bind:value={billingDetails.notes}
                  placeholder="Notes about your order, e.g. special notes for delivery"
                  class="w-full border rounded px-3 py-2 h-32 resize-none"
                ></textarea>
              </div>
            </form>
          </div>
        </div>
  
        <!-- Order Summary -->
        <div>
          <div class="bg-white p-6 rounded shadow-sm sticky top-24">
            <h2 class="text-xl font-bold mb-6">Your Order</h2>
            <div class="border-b pb-4 mb-4">
              {#each $cart as item}
                <div class="flex justify-between mb-2">
                  <span>{item.name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              {/each}
            </div>
            <div class="border-b pb-4 mb-4">
              <div class="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <div class="mb-6">
              <div class="flex justify-between font-bold">
                <span>Total</span>
                <span class="text-red-500">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
  
            <!-- Terms and Conditions -->
            <div class="mb-6">
              <label class="flex items-start gap-2">
                <input type="checkbox" class="mt-1" required />
                <span class="text-sm">
                  I have read and agree to the website's 
                  <a href="/terms" class="text-red-500 hover:underline">terms and conditions</a>
                </span>
              </label>
            </div>
  
            <button 
              on:click={handleSubmit}
              class="w-full bg-red-500 text-white py-3 rounded hover:bg-red-600 transition-colors"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
  
  <style>
    input, textarea {
      background-color: #f8f8f8;
    }
  
    input:focus, textarea:focus {
      outline: none;
      border-color: #ef4444;
      background-color: white;
    }
  
    /* Add smooth transitions */
    button, input, textarea {
      transition: all 0.2s ease-in-out;
    }
  
    button:active {
      transform: scale(0.95);
    }
  
    .container {
      max-width: 1200px;
    }
  </style>