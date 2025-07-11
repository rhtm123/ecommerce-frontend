<script>
  import { onMount } from 'svelte';
  import { afterNavigate, goto } from '$app/navigation';
  import InitialsAvatar from '$lib/components/InitialsAvatar.svelte';
  import { cart } from '../stores/cart';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import { user } from '$lib/stores/auth';
  import { logoutUser } from '$lib/stores/auth';
  import Icon from '@iconify/svelte';
  import CartSidebar from '$lib/components/CartSidebar.svelte';
  import { page } from '$app/stores';

  let authUser = null;
  let isMenuOpen = false;
  let isProfileDropdownOpen = false;
  let isSearchOpen = false;
  let isCartOpen = false;

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Blog', href: '/blog' }
  ];

  let cartCount = 0;
  $: cartCount = $cart.reduce((total, item) => total + item.quantity, 0);

  $: authUser = $user;

  function clickOutside(node) {
    const handleClick = (event) => {
      if (node && !node.contains(event.target) && !event.defaultPrevented) {
        node.dispatchEvent(new CustomEvent('outclick'));
      }
    };
    document.addEventListener('click', handleClick, true);
    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }

  afterNavigate(() => {
    isMenuOpen = false;
    isProfileDropdownOpen = false;
    isSearchOpen = false;
    isCartOpen = false;
  });

  onMount(() => {
    isMenuOpen = false;
    isProfileDropdownOpen = false;
    isSearchOpen = false;
    isCartOpen = false;
  });

  function toggleProfileDropdown(event) {
    event.stopPropagation();
    isProfileDropdownOpen = !isProfileDropdownOpen;
    isMenuOpen = false;
    isSearchOpen = false;
    isCartOpen = false;
  }

  function toggleMenuDropdown(event) {
    event.stopPropagation();
    isMenuOpen = !isMenuOpen;
    isProfileDropdownOpen = false;
    isSearchOpen = false;
    isCartOpen = false;
  }

  function toggleCart(event) {
    event.stopPropagation();
    isCartOpen = !isCartOpen;
    isProfileDropdownOpen = false;
    isMenuOpen = false;
    isSearchOpen = false;
  }

  function handleLogout() {
    logoutUser();
    isProfileDropdownOpen = false;
  }

  function handleNavClickOutside() {
    isMenuOpen = false;
    isProfileDropdownOpen = false;
    isSearchOpen = false;
  }

  function handleSearchClick() {
    goto('/search');
  }
</script>

<nav 
  use:clickOutside
  on:outclick={handleNavClickOutside}
  class="bg-white border-b border-gray-200 fixed top-0 w-full z-20"
>
  {#if $page.url.pathname === '/search'}
    <!-- Minimal Navbar for Search Page -->
    <div class="mx-auto px-4 md:px-8 lg:px-16">
      <div class="flex items-center justify-between h-16">
        <!-- Back Button -->
        <button on:click={() => window.history.length > 1 ? window.history.back() : goto('/')} class="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <!-- Logo -->
        <a href="/" class="flex-shrink-0 flex items-center justify-center">
          <img src="/img/naigaonmarketlogo1.png" alt="Logo" class="h-10" />
        </a>
        <!-- Cart -->
        <button
          on:click={toggleCart}
          class="cart-button relative flex items-center p-2 rounded-full text-gray-700 hover:text-blue-600 transition-colors"
        >
          <Icon icon="mdi:cart-outline" width="28" height="28" />
          {#if cartCount > 0}
            <span class="absolute -top-1 -right-4 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center -translate-x-1/2">
              {cartCount}
            </span>
          {/if}
        </button>
      </div>
    </div>
  {:else}
    <!-- Full Navbar for all other pages -->
    <div class="mx-auto px-4 md:px-8 lg:px-16">
      <div class="flex items-center justify-between h-16">
        <!-- Left Section -->
        <div class="flex items-center {isSearchOpen ? 'hidden' : ''}">
          <a href="/" class="md:hidden flex-shrink-0">
            <img src="/img/logo.png" alt="Logo" class="h-12" />
          </a>
          <a href="/" class="hidden md:block flex-shrink-0">
            <img src="/img/naigaonmarketlogo1.png" alt="Logo" class="h-12" />
          </a>
        </div>

        <!-- Center Section - Search Bar -->
        <div class="flex-1 max-w-3xl mx-8 hidden md:block">
          <SearchBar asButton={true} />
        </div>

        <!-- Right Section -->
        <div class="flex items-center space-x-2 md:space-x-4 {isSearchOpen ? 'hidden' : ''}">
          <!-- Mobile Search Button -->
          <button
            class="md:hidden p-2 rounded-full hover:bg-gray-100"
            on:click={handleSearchClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <!-- Profile -->
          {#if authUser}
            <div
              class="relative profile-dropdown-wrapper"
              use:clickOutside
              on:outclick={() => isProfileDropdownOpen = false}
            >
              <button
                on:click={toggleProfileDropdown}
                class="p-2 rounded-full hover:bg-gray-100"
              >
                <InitialsAvatar
                  firstName={authUser.first_name}
                  lastName={authUser.last_name}
                  size="8"
                />
              </button>
              {#if isProfileDropdownOpen}
                <div class="absolute profile-dropdown-content right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-[100] md:w-48 max-w-[90vw] md:max-w-none">
                  <a 
                    on:click={() => isProfileDropdownOpen = false} 
                    href="/profile/orders" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Orders
                  </a>
                  <a 
                    on:click={() => isProfileDropdownOpen = false} 
                    href="/profile/wishlist" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Wishlist
                  </a>
                  <a 
                    on:click={() => isProfileDropdownOpen = false} 
                    href="/profile/settings" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </a>
                  <div class="border-t my-2"></div>
                  <button 
                    on:click={handleLogout} 
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              {/if}
            </div>
          {:else}
            <a href="/login" class="flex items-center gap-1 p-2 rounded-full text-gray-700 hover:text-blue-600">
              <Icon icon="mdi:account-outline" width="24" height="24" />
              <span class="text-sm font-medium hidden md:inline">Sign Up/Sign In</span>
            </a>
          {/if}

          <!-- Cart -->
          <button
            on:click={toggleCart}
            class="cart-button relative flex items-center p-2 rounded-full text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Icon icon="mdi:cart-outline" width="28" height="28" />
            {#if cartCount > 0}
              <span class="absolute -top-1 -right-4 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center -translate-x-1/2">
                {cartCount}
              </span>
            {/if}
            <span class="font-medium ml-1 hidden md:inline">Cart</span>
          </button>

          <!-- Mobile Menu Button -->
          <button 
            class="p-2 rounded-full hover:bg-gray-100 md:hidden"
            on:click={toggleMenuDropdown}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    {#if isMenuOpen}
      <div class="bg-white border-t">
        <div class="px-2 pt-2 pb-3 space-y-1">
          {#each menuItems as item}
            <a 
              on:click={() => isMenuOpen = false} 
              href={item.href} 
              class="block px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              {item.label}
            </a>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</nav>

<!-- Cart Sidebar -->
<CartSidebar bind:isOpen={isCartOpen} />

<style>
  /* Ensure dropdown is fully visible in mobile view */
  @media (max-width: 768px) {
    .profile-dropdown-wrapper {
      position: static;
    }
    .profile-dropdown-content {
      position: fixed;
      top: 4rem; /* Height of the navbar (h-16) */
      left: 0;
      right: 0;
      width: 100%;
      max-width: 100%;
      margin: 0;
      border-radius: 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .cart-button {
      position: relative !important; /* Explicitly set for mobile with !important for overriding */
    }
  }
</style>