<script>
  import { user } from "$lib/stores/auth";
  import { onMount, onDestroy } from "svelte";
  import { PUBLIC_API_URL } from "$env/static/public";
  import { myFetch } from "$lib/utils/myFetch";

  let authUser;
  let loading = false;

  let newAddress = {
    name: '',
    type: 'home',
    line1: '',
    line2: '',
    landmark: '',
    city: '',
    state: '',
    pin: '',
    mobile: '',
    is_default: false
  };

  
  const unsubscribe = user.subscribe(value => {
    authUser = value;
    newAddress['name'] = value?.first_name + ' ' + value?.last_name;
  });

  onDestroy(() => {
    unsubscribe(); // Cleanup to avoid memory leaks
  });


  let addresses = []


  onMount(async () => {
    loading = true;
    let url = `${PUBLIC_API_URL}/user/shipping_addresses/?page=1&page_size=50&user_id=${authUser.user_id}`
    let data = await myFetch(url);
    console.log(data)
    addresses = data.results;
    loading = false;
    // console.log(data);
  });
  

  let showAddForm = false;

  async function handleSubmit() {
    // Add new address logic here

    loading = true;

    showAddForm = false;

    let url1 = `${PUBLIC_API_URL}/location/addresses/`;
    let address = await myFetch(url1, "POST", newAddress, authUser.access_token)

    // console.log(address);

    let url2 = `${PUBLIC_API_URL}/user/shipping_addresses/`;
    let data = await myFetch(url2, "POST", 
    {
      user_id: authUser.user_id,
      address_id: address.id,
      is_default: newAddress.is_default,
      name: newAddress.name,
      mobile: newAddress.mobile, 
      type: newAddress.type,
    }, authUser.access_token)

    console.log(data);

    addresses = [{ ...data }, ...addresses];
    loading = false;
    newAddress = { name: '', type: 'home', line1: '', line2:"" ,city: '', state: '', pin: '', mobile: '', is_default: false };
  }

  async function deleteAddress(address) {
    let url2 = `${PUBLIC_API_URL}/user/shipping_addresses/${address.id}/`;
    myFetch(url2, "DELETE", {}, authUser.access_token);
    let url1 = `${PUBLIC_API_URL}/location/addresses/${address.address.id}/`;
    myFetch(url1, "DELETE", {}, authUser.access_token);
    addresses = addresses.filter(addr => addr.id !== address.id);
  }

  function setDefaultAddress(id) {
    addresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h2 class="text-2xl font-bold">Manage Addresses</h2>
    <button
      on:click={() => showAddForm = true}
      class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
    >
      + Add New Address
    </button>
  </div>

  {#if showAddForm}
    <div class="border rounded-lg p-6 bg-gray-50">
      <h3 class="text-lg font-medium mb-4">Add New Address</h3>
      <form on:submit|preventDefault={handleSubmit} class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            bind:value={newAddress.name}
            required
            class="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            bind:value={newAddress.phone}
            required
            class="w-full p-2 border rounded-lg"
          />
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Line1 [Flat/Building]</label>
          <textarea
            bind:value={newAddress.line1}
            required
            class="w-full p-2 border rounded-lg"
            rows="2"
          ></textarea>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Line2 [Locality]</label>
          <textarea
            bind:value={newAddress.line2}
            class="w-full p-2 border rounded-lg"
            rows="2"
          ></textarea>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">landmark (if any)</label>
          <textarea
            bind:value={newAddress.landmark}
            class="w-full p-2 border rounded-lg"
            rows="1"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            bind:value={newAddress.city}
            required
            class="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            bind:value={newAddress.state}
            required
            class="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
          <input
            type="text"
            bind:value={newAddress.pin}
            required
            class="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
          <select
            bind:value={newAddress.type}
            class="w-full p-2 border rounded-lg"
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="md:col-span-2">
          <label class="inline-flex items-center">
            <input
              type="checkbox"
              bind:checked={newAddress.isDefault}
              class="form-checkbox text-red-500"
            />
            <span class="ml-2">Make this my default address</span>
          </label>
        </div>

        <div class="md:col-span-2 flex justify-end space-x-4">
          <button
            type="button"
            on:click={() => showAddForm = false}
            class="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Save Address
          </button>
        </div>
      </form>
    </div>
  {/if}

  <div class="space-y-4">

    {#if loading}
                <div class="loading loading-spinner loading-lg"></div>
    {/if}

    {#each addresses as address (address.id)}
      <div class="border rounded-lg p-4 relative {address.is_default ? 'border-red-500' : ''}">
        {#if address.is_default}
          <span class="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            Default
          </span>
        {/if}
        
        <div class="flex justify-between items-start">
          <div>
            <div class="flex items-center space-x-2">
              <h3 class="font-medium">{address.name}</h3>
              <span class="text-sm text-gray-500">({address.type})</span>
            </div>
            <p class="text-gray-600 mt-1">{address.address.line1}</p>
            <p class="text-gray-600">{address.address.city}, {address.address.state} {address.address.pin}</p>
            <p class="text-gray-600 mt-1">Phone: {address.phone}</p>
          </div>
          
          <div class="space-x-4">
            <button class="text-gray-600 hover:text-gray-800">Edit</button>
            <button 
              on:click={() => deleteAddress(address)}
              class="text-red-500 hover:text-red-600"
            >
              Delete
            </button>
          </div>
        </div>

        {#if !address.isDefault}
          <button
            on:click={() => setDefaultAddress(address.id)}
            class="mt-4 text-red-500 hover:text-red-600 text-sm"
          >
            Set as Default
          </button>
        {/if}
      </div>
    {/each}

    
  </div>
</div> 