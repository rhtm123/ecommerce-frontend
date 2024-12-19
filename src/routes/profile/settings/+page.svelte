<script>
  let profile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    gender: 'male'
  };

  let isEditing = false;

  function handleSubmit() {
    // Implement profile update logic here
    isEditing = false;
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h2 class="text-2xl font-bold">Personal Information</h2>
    <button
      on:click={() => isEditing = !isEditing}
      class="text-red-500 hover:text-red-600"
    >
      {isEditing ? 'Cancel' : 'Edit'}
    </button>
  </div>

  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
        <input
          type="text"
          bind:value={profile.firstName}
          disabled={!isEditing}
          class="w-full p-2 border rounded-lg {!isEditing ? 'bg-gray-50' : 'bg-white'}"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
        <input
          type="text"
          bind:value={profile.lastName}
          disabled={!isEditing}
          class="w-full p-2 border rounded-lg {!isEditing ? 'bg-gray-50' : 'bg-white'}"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          type="email"
          bind:value={profile.email}
          disabled={!isEditing}
          class="w-full p-2 border rounded-lg {!isEditing ? 'bg-gray-50' : 'bg-white'}"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
        <input
          type="tel"
          bind:value={profile.phone}
          disabled={!isEditing}
          class="w-full p-2 border rounded-lg {!isEditing ? 'bg-gray-50' : 'bg-white'}"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
        <div class="space-x-4">
          <label class="inline-flex items-center">
            <input
              type="radio"
              bind:group={profile.gender}
              value="male"
              disabled={!isEditing}
              class="form-radio text-red-500"
            />
            <span class="ml-2">Male</span>
          </label>
          <label class="inline-flex items-center">
            <input
              type="radio"
              bind:group={profile.gender}
              value="female"
              disabled={!isEditing}
              class="form-radio text-red-500"
            />
            <span class="ml-2">Female</span>
          </label>
        </div>
      </div>
    </div>

    {#if isEditing}
      <div class="flex justify-end">
        <button
          type="submit"
          class="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Save Changes
        </button>
      </div>
    {/if}
  </form>

  <div class="border-t pt-6 mt-6">
    <h3 class="text-lg font-semibold mb-4">FAQs</h3>
    <div class="space-y-4">
      <div>
        <h4 class="font-medium mb-2">What happens when I update my email address?</h4>
        <p class="text-gray-600">Your login email ID is changed. You'll receive all account related communication on your updated email address.</p>
      </div>
      <div>
        <h4 class="font-medium mb-2">When will my Flipkart account be updated with the new email address?</h4>
        <p class="text-gray-600">It happens as soon as you confirm the verification code sent to your email address.</p>
      </div>
    </div>
  </div>
</div> 