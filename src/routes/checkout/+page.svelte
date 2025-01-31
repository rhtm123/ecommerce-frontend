<script>
    import { cart } from '../../lib/stores/cart';
    import { fade } from 'svelte/transition';
    import { user } from '$lib/stores/auth';
    import { onDestroy, onMount } from 'svelte';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { myFetch } from '$lib/utils/myFetch';

    import { shipaddresses } from '$lib/stores/address';
    import AddressAddEdit from '$lib/components/AddressAddEdit.svelte';

    let loading = false;
    let selectedAddress;

    function selectAddress(option) {
    selectedAddress = selectedAddress === option.id ? null : option.id;
  }

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
      let url = `${PUBLIC_API_URL}/user/shipping_addresses/?page=1&page_size=50&user_id=${authUser.user_id}`
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
  
    async function handleSubmit() {
      // Implement order submission logic here
      // console.log(selectedAddress);
      let url = `${PUBLIC_API_URL}/order/orders/`;
      let order = await myFetch(url, "POST", {
        user_id: authUser?.user_id,
        shipping_address_id: selectedAddress?.id,
        total_amount: totalPrice
      }, authUser.access_token)

      console.log(order);

      let url2 = `${PUBLIC_API_URL}/order/order_items/`;

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
  

  <div class="px-4 md:px-8">

    <div class="text-sm breadcrumbs text-gray-600">
      <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/shop">Shop</a></li>
          <li>Cart</li>
        </ul>
  </div>

  <!-- Breadcrumb -->
  
  <!-- Progress Steps -->
  <div class=" mx-auto px-4 py-8">
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
        <div class={!orderdCompleted?"h-1 bg-gray-200":"h-1 bg-red-500"}>
          <div class="w-0 h-full bg-red-500"></div>
        </div>
        <div class="absolute top-0 right-0 -mr-4 mt-[-10px]">
          <div class={!orderdCompleted?"bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center text-gray-600 font-bold":"bg-red-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold"}>03</div>
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

      {#if !orderdCompleted }
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Billing Details Form -->
        <div class="space-y-6">
          
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
        <div>
          <div class="bg-white p-6 rounded shadow-sm sticky top-24">
            <h2 class="text-xl font-bold mb-6">Your Order</h2>
            <div class="border-b pb-4 mb-4">
              {#each $cart as item}
                <div class="flex justify-between mb-2">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              {/each}
            </div>
            <div class="border-b pb-4 mb-4">
              <div class="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>₹ {totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <div class="mb-6">
              <div class="flex justify-between font-bold">
                <span>Total</span>
                <span class="text-red-500">₹ {totalPrice.toFixed(2)}</span>
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
      {:else}
        <div class="text-center py-8" in:fade>

          

          <p class="text-red-500 mb-4">
            You have placed your order successfully.</p>
          <a href="/shop" class="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors">
            Continue Shopping
          </a>
        </div>
      {/if}
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