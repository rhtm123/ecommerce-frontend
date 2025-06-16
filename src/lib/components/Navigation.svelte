<script>
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import InitialsAvatar from '$lib/components/InitialsAvatar.svelte';
  import { cart } from '../stores/cart';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import { user } from '$lib/stores/auth';
  import { logoutUser } from '$lib/stores/auth';
  import Icon from '@iconify/svelte';
  import CartSidebar from '$lib/components/CartSidebar.svelte';
  import { derived } from 'svelte/store';

  let authUser = $derived($user);

  let isMenuOpen = false;
  let isProfileDropdownOpen = false;
  let isSearchOpen = false;
  let isCartOpen = $state(false);

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Blog', href: '/blog' }
  ];

  const cartCount = derived(cart, ($cart) => $cart.reduce((total, item) => total + item.quantity, 0));

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

  function toggleCart() {
    isCartOpen = !isCartOpen;
  }
</script>

<nav 
  use:clickOutside
  onoutclick={()=> isMenuOpen=false}
  class="bg-white border-b border-gray-200 fixed top-0 w-full z-20">

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
          onclick={() => isSearchOpen = true}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <!-- Profile -->
        {#if authUser}
          <div class="relative"
            use:clickOutside
            onoutclick={()=> isProfileDropdownOpen=false}
          >
            <button
              onclick={toggleProfileDropdown}
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
                <a onclick={()=>{isProfileDropdownOpen=false}} href="/profile/orders" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</a>
                <a onclick={()=>{isProfileDropdownOpen=false}} href="/profile/wishlist" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Wishlist</a>
                <a onclick={()=>{isProfileDropdownOpen=false}} href="/profile/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                <div class="border-t my-2"></div>
                <button onclick={handleLogout} class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Sign Out
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <a href="/login" class="flex items-center gap-1 text-gray-700 hover:text-blue-600">
            <Icon icon="mdi:account-outline" width="22" height="22" />
            <span class="text-sm font-medium">Sign Up/Sign In</span>
          </a>
        {/if}

        <!-- Cart -->
        <button 
          onclick={toggleCart}
          class="flex p-2 rounded-full text-gray-700 hover:text-blue-600 relative transition-colors"
        >
          <Icon icon="mdi:cart-outline" width="28" height="28" />
          <span class="font-medium">Cart</span>
          {#if $cartCount > 0}
            <span class="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {$cartCount}
            </span>
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Search Overlay -->
  {#if isSearchOpen}
    <div class="md:hidden fixed inset-0 bg-white z-50">
      <div class="flex items-center p-4 border-b">
        <button 
          class="p-2"
          onclick={() => isSearchOpen = false}
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

<!-- Cart Sidebar -->
<CartSidebar bind:isOpen={isCartOpen} />
