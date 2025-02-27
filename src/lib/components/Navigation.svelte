<script>
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import InitialsAvatar from '$lib/components/InitialsAvatar.svelte';
  import { cart } from '../stores/cart';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import { user } from '$lib/stores/auth';
  import { logoutUser } from '$lib/stores/auth';

  let authUser = null;
  $: authUser = $user;

  let isMenuOpen = false;
  let isProfileDropdownOpen = false;
  let isSearchOpen = false;

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Blog', href: '/blog' }
  ];

  $: cartCount = $cart.reduce((total, item) => total + item.quantity, 0);

  function clickOutside(node) {
    const handleClick = (event) => {
      if (node && !node.contains(event.target) && !event.defaultPrevented) {
        node.dispatchEvent(new CustomEvent('outclick'));
      }
    };
    document.addEventListener('click', handleClick, true);
    return { destroy() { document.removeEventListener('click', handleClick, true); } };
  }

  afterNavigate(() => isMenuOpen = false);
  onMount(() => isMenuOpen = false);

  function handleClickOutside() {
    isMenuOpen = false;
    isProfileDropdownOpen = false;
  }

  function toggleProfileDropdown(){
    isProfileDropdownOpen = !isProfileDropdownOpen;
  }

  function toggleMenuDropdown(){
    isMenuOpen = !isMenuOpen;
  }

  function handleLogout(){
    logoutUser();
  }

</script>

<nav 
  use:clickOutside
  on:outclick={()=> isMenuOpen=false}
  class="bg-white shadow-md fixed top-0 w-full z-20">
  <div class="mx-auto px-4 md:px-8 lg:px-16 ">
    <div class="flex items-center justify-between h-16">
      <!-- Left Section -->
      <div class="flex items-center">
        <a href="/" class="md:hidden flex-shrink-0">
          <img src="/img/logo.png" alt="Logo" class="h-12" />
        </a>

        <a href="/" class="hidden md:block flex-shrink-0">
          <img src="/img/naigaonmarketlogo1.png" alt="Logo" class="h-12" />
        </a>
        <!-- <div class="hidden md:flex items-center ml-8 space-x-6">
          {#each menuItems as item}
            <a href={item.href} class="text-gray-700 hover:text-black font-medium">{item.label}</a>
          {/each}
        </div> -->
      </div>

      <!-- Center Section - Search Bar -->
      <div class="flex-1 max-w-3xl mx-8 hidden md:block">
        <SearchBar />
      </div>

      <!-- Right Section -->
      <div class="flex items-center space-x-4">
        <!-- Mobile Search Button -->
        <button
          class="md:hidden p-2 rounded-full hover:bg-gray-100"
          on:click|stopPropagation={() => isSearchOpen = true}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <!-- Cart -->
        <a href="/cart" class="p-2 rounded-full hover:bg-gray-100 relative">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {#if cartCount > 0}
            <span class="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          {/if}
        </a>

        <!-- Profile -->
        {#if authUser}
          <div class="relative"
          
          use:clickOutside
          on:outclick={()=> isProfileDropdownOpen=false}

          >
            <button
              on:click={toggleProfileDropdown}
              class="p-1 rounded-full hover:bg-gray-100"
            >
              <InitialsAvatar 
                firstName={authUser.first_name} 
                lastName={authUser.last_name}
                size="8"
              />
            </button>
            {#if isProfileDropdownOpen}
              <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <a on:click={()=>{isProfileDropdownOpen=false}} href="/profile/orders" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Orders</a>
                <a on:click={()=>{isProfileDropdownOpen=false}} href="/profile/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                <div class="border-t my-2"></div>
                <button on:click={handleLogout} class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Sign Out
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <a href="/login" class="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700">
            Sign In
          </a>
        {/if}

        <!-- Mobile Menu Button -->

        <div class="relative"
          
          use:clickOutside
          on:outclick={()=> isMenuOpen=false}

          >
            <button
              on:click={toggleMenuDropdown}
              class="p-1 rounded-full hover:bg-gray-100"
            >

            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>

            </button>
            {#if isMenuOpen}
              <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                {#each menuItems as item}
                  <a on:click={()=>{isMenuOpen=false}} href={item.href} class="block px-3 py-2 text-gray-700 hover:bg-gray-100">{item.label}</a>
                {/each}
              </div>
            {/if}
          </div>


        <!-- <button 
          class="p-2 rounded-full hover:bg-gray-100"
          on:click={() => isMenuOpen = !isMenuOpen}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button> -->
      </div>
    </div>
  </div>

  <!-- Mobile Menu -->
  <!-- {#if isMenuOpen}
    <div class=" bg-white border-t">
      <div class="px-2 pt-2 pb-3 space-y-1">
        {#each menuItems as item}
          <a on:click={()=>{isMenuOpen=false}} href={item.href} class="block px-3 py-2 text-gray-700 hover:bg-gray-100">{item.label}</a>
        {/each}
      </div>
    </div>
  {/if} -->

  <!-- Mobile Search Overlay -->
  {#if isSearchOpen}
    <div class="md:hidden fixed inset-0 bg-white z-50">
      <div class="flex items-center p-4 border-b">
        <button 
          class="p-2"
          on:click={() => isSearchOpen = false}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div class="flex-1 ml-2">
          <SearchBar on:closeSearch={() => isSearchOpen = false} autoFocus={true} />
        </div>
      </div>
    </div>
  {/if}
</nav>