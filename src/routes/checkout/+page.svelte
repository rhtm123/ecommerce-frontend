<script>
    import { cart } from '../../lib/stores/cart';
    import { fade } from 'svelte/transition';
    import { user } from '$lib/stores/auth';
    import { onDestroy, onMount } from 'svelte';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { myFetch } from '$lib/utils/myFetch';

    import { shipaddresses } from '$lib/stores/address';
    import AddressAddEdit from '$lib/components/AddressAddEdit.svelte';

    import { addAlert } from '$lib/stores/alert';

    let loading = false;
    let selectedAddress;

    let orderPlacing = false;

    function selectAddress(option) {
    selectedAddress = selectedAddress === option.id ? null : option.id;
  }

    let orderData;

    let cartItems;

    let orderdCompleted = false;

    let addresses=[];

    shipaddresses.subscribe(value=>{
      // console.log(value);
      addresses = value;
      if (addresses.length>0)
      selectedAddress = addresses[0].id;
    })

    const unsubscribe2 = cart.subscribe(value => {
      cartItems = value;
    });

    onDestroy(() => {
      unsubscribe2(); // Cleanup to avoid memory leaks
    });



    onMount(async () => {
      loading = true;
      let url = `${PUBLIC_API_URL}/user/shipping-addresses/?page=1&page_size=50&user_id=${authUser.user_id}`
      let data = await myFetch(url);
      // console.log(data)
      addresses = data.results;
      shipaddresses.set(data.results);
      loading = false;
      // console.log(data);
    });

    let authUser;

    const unsubscribe = user.subscribe(value => {
      authUser = value;
    });

    onDestroy(() => {
      unsubscribe(); // Cleanup to avoid memory leaks
    });

  
    $: totalPrice = $cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
    let termsAccepted = false;

    async function handleSubmit() {
      if (!termsAccepted) {
        addAlert("Please accept the terms and conditions", "error");
        return;
      }

      if (!selectedAddress) {
        addAlert("Address is required to place the order", "error");
        return;
      }

      try {
        orderPlacing = true;
        let url = `${PUBLIC_API_URL}/order/orders/`;
        console.log(selectedAddress);
        let order = await myFetch(url, "POST", {
          user_id: authUser?.user_id,
          shipping_address_id: selectedAddress,
          total_amount: totalPrice
        }, authUser.access_token)

        console.log(order);
        orderData = order;

        let url2 = `${PUBLIC_API_URL}/order/order-items/`;

        console.log(cartItems);

        for (let i = 0; i < cartItems.length; i++) {
          myFetch(url2, "POST", {
            order_id: order.id,
            product_listing_id: cartItems[i].id,
            quantity:cartItems[i].quantity,
            price: cartItems[i].price,
            subtotal: cartItems[i].price
          }, authUser.access_token)
        }

        orderdCompleted = true
        addAlert("Order placed successfully ", "success")

      } catch (e) {
        addAlert("Error placing order", "error");
      } finally {
        orderPlacing = false;
      }

      cart.set([]);
      // console.log('Order submitted:', { billingDetails, items: $cart });
    }


    // function handleChange(event) {
      
    //   // selectedAddress = event.target.value;
    //   console.log('Selected Value:', event.target.value);
    // }


    let modal;

    function openModal() {
      modal.showModal(); // Opens the modal
    }

    function closeModal() {
      modal.close(); // Closes the modal
    }


    let modalEdits = {}; // Store modal references

      function openModalEdit(id) {
        if (modalEdits[id]) {
          modalEdits[id].showModal();
        }
      }

      function closeModalEdits(id) {
        modalEdit[id].close(); // Closes the modal
      }


  </script>
  
  <svelte:head>
    <title>CHECKOUT</title>
  </svelte:head>
  

  <div class="px-4 mt-5 md:px-8">

    <div class="text-sm breadcrumbs text-gray-600">
      <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/shop">Shop</a></li>
          <li>Cart</li>
        </ul>
  </div>

  <!-- Breadcrumb -->
  
  <!-- Progress Steps -->
  <div class="progress-container mb-8">
    <div class="flex items-center justify-between max-w-3xl mx-auto relative">
        <div class="absolute inset-0 flex items-center">
            <div class="h-1 w-full bg-gray-200">
                <div class={!orderdCompleted?"h-full bg-red-500 w-2/3":"h-full bg-red-500"}></div>
            </div>
        </div>
        
        <div class="relative flex-1 flex justify-start">
            <div class="bg-red-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold step-number">01</div>
            <div class="absolute mt-10 -ml-4 text-xs font-medium text-gray-600 step-text whitespace-nowrap">SHOPPING CART</div>
        </div>
        
        <div class="relative flex-1 flex justify-center">
            <div class="bg-red-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold step-number">02</div>
            <div class="absolute mt-10 -ml-4 text-xs font-medium text-red-500 step-text whitespace-nowrap">CHECKOUT</div>
        </div>
        
        <div class="relative flex-1 flex justify-end">
          
        <div class={!orderdCompleted?"h-1 bg-gray-200":"h-1 bg-red-500"}>
          <div class="w-0 h-full bg-red-500"></div>
        </div>
            <div class={!orderdCompleted?"bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center text-gray-600 font-bold":"bg-red-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold"} >03</div>
            <div class="absolute mt-10 -ml-8 text-xs font-medium text-gray-600 step-text whitespace-nowrap">ORDER COMPLETED</div>
        </div>
    </div>

  
    

    {#if !orderdCompleted }

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
        <div class="space-y-6 mt-10">
          
          <div class="bg-white p-6 rounded shadow-sm">
            
            <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold mb-4">Select Address</h2>

            <button class="btn btn-secondary btn-sm mb-4" on:click={openModal}>
              + Add
            </button>
            </div>

            <dialog bind:this={modal} class="modal">
              <AddressAddEdit authUser={authUser} modal={modal} />
            </dialog>


            <div class="space-y-4">
              
              {#each addresses as option}
                <div 
                  class={(selectedAddress==option.id)?"bg-green-300 flex justify-between items-center p-4 border rounded-lg shadow-sm cursor-pointer transition-colors":"flex justify-between items-center p-4 border rounded-lg shadow-sm cursor-pointer transition-colors"}
                  on:click={() => selectAddress(option)}
                >
                  <div>
                    <p class="font-semibold">{option.address.line1}</p>
                    <p class="text-sm text-gray-600">{option.address.city}, {option.address.state}</p>
                  </div>
                  <button class="btn btn-sm btn-outline btn-primary" on:click={() => openModalEdit(option.id)}>
                    Edit
                  </button>

                  <dialog bind:this={modalEdits[option.id]} class="modal">
                    <AddressAddEdit authUser={authUser} shipAddress={option} modal={modalEdits[option.id]} />
                  </dialog>

                </div>
              {/each}

            </div>
          </div>

          
        </div>
  
        <!-- Order Summary -->
        <div class="bg-white rounded-lg shadow-sm p-4 md:mt-10">
          <h2 class="text-lg font-bold mb-4">Your Order</h2>
          <div class="space-y-4">
              {#each $cart as item}
                  <div class="flex justify-between items-center py-2 border-b">
                      <div class="flex items-center gap-3">
                          <img src={item.main_image || "/placeholder.svg"} alt={item.name} class="w-12 h-12 object-cover rounded-md" />
                          <div>
                              <p class="font-medium">{item.name}</p>
                              <p class="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                      </div>
                      <span class="font-medium">₹ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
              {/each}

              <div class=" ">
                  <div class="flex justify-between mb-2">
                      <span class="text-gray-600">Subtotal</span>
                      <span>₹ {totalPrice.toFixed(2)}</span>
                  </div>
                  <div class="flex justify-between font-bold">
                      <span>Total</span>
                      <span class="text-red-500">₹ {totalPrice.toFixed(2)}</span>
                  </div>
              </div>

              <label class="flex items-start gap-2">
                  <input 
                      type="checkbox" 
                      class="mt-1" 
                      bind:checked={termsAccepted}
                      required 
                  />
                  <span class="text-sm text-gray-600">
                      I have read and agree to the website's 
                      <a href="/terms-of-service" class="text-red-500 hover:underline">terms and conditions</a>
                  </span>
              </label>

              <button 
                  on:click={handleSubmit}
                  class="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors"
              >
                  {orderPlacing ? "PLACING ORDER" : "PLACE ORDER"}
              </button>
          </div>
      </div>
      </div>

      {/if}



    {:else}

        <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-10">
          <h1 class="text-2xl font-bold text-center mb-4">Thank you. Your order has been received.</h1>

          <!-- Order Details -->
          <div class="space-y-4">
              <!-- Order Number -->
              <div class="flex justify-between border-b pb-2">
                  <span class="font-medium">ORDER NUMBER:</span>
                  <span>{orderData?.id}</span>
              </div>

              <!-- Date -->
              <div class="flex justify-between border-b pb-2">
                  <span class="font-medium">DATE:</span>
                  <span>{new Date(orderData?.created).toLocaleDateString()}</span>
              </div>

              <!-- Total -->
              <div class="flex justify-between border-b pb-2">
                  <span class="font-medium">TOTAL:</span>
                  <span>{orderData?.total_amount}</span>
              </div>

              <!-- Payment Method -->
              <div class="flex justify-between border-b pb-2">
                  <span class="font-medium">PAYMENT METHOD:</span>
                  <span>Cash on delivery</span>
              </div>
          </div>

          <!-- Payment Note -->
          <p class="text-center text-gray-700 mt-4">**Pay with cash upon delivery.**</p>
      </div>

        <div class="text-center py-8" in:fade>
          <a href="/shop" class="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors">
            Continue Shopping
          </a>
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

    /* Mobile-specific styles */
    @media (max-width: 768px) {
        .progress-container {
            padding: 0 1rem;
        }
        
        .step-number {
            height: 24px !important;
            width: 24px !important;
            font-size: 12px !important;
        }
        
        .step-text {
            font-size: 10px !important;
            text-align: center;
        }
    }

  
     /* Transitions */
     button {
        transition: all 0.2s ease-in-out;
    }

    button:active {
        transform: scale(0.95);
    }
  </style>