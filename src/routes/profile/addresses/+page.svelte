<script>
  let addresses = [
    {
      id: 1,
      name: 'John Doe',
      type: 'Home',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      phone: '+1234567890',
      isDefault: true
    }
  ];

  let showAddForm = false;
  let newAddress = {
    name: '',
    type: 'Home',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    isDefault: false
  };

  function handleSubmit() {
    // Add new address logic here
    addresses = [...addresses, { ...newAddress, id: addresses.length + 1 }];
    showAddForm = false;
    newAddress = { name: '', type: 'Home', address: '', city: '', state: '', zipCode: '', phone: '', isDefault: false };
  }

  function deleteAddress(id) {
    addresses = addresses.filter(addr => addr.id !== id);
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            bind:value={newAddress.address}
            required
            class="w-full p-2 border rounded-lg"
            rows="3"
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
          <label class="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
          <input
            type="text"
            bind:value={newAddress.zipCode}
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
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
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
    {#each addresses as address (address.id)}
      <div class="border rounded-lg p-4 relative {address.isDefault ? 'border-red-500' : ''}">
        {#if address.isDefault}
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
            <p class="text-gray-600 mt-1">{address.address}</p>
            <p class="text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
            <p class="text-gray-600 mt-1">Phone: {address.phone}</p>
          </div>
          
          <div class="space-x-4">
            <button class="text-gray-600 hover:text-gray-800">Edit</button>
            <button 
              on:click={() => deleteAddress(address.id)}
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