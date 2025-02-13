<script>
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';

  import { cart } from '../stores/cart';
  import SearchBar from '$lib/components/SearchBar.svelte';

  import { user } from '$lib/stores/auth';
  import { logoutUser } from '$lib/stores/auth';

  let authUser = null;
  $: authUser = $user;

  function handleLogout() {
    logoutUser(); // Log the user out
  }

  let isMenuOpen = false;
  let isProfileDropdownOpen = false;

  function toggleProfileDropdown() {
    isProfileDropdownOpen = !isProfileDropdownOpen;
  }

  function closeProfileDropdown() {
    isProfileDropdownOpen = false;
  }

  const menuItems = [
    { label: 'HOME', href: '/home' },
    { label: 'SHOP', href: '/shop' },
    { label: 'BLOG', href: '/blog' }
  ];

  $: cartCount = $cart.reduce((total, item) => total + item.quantity, 0);

  // Click outside handler
  function clickOutside(node) {
    const handleClick = (event) => {
      if (node && !node.contains(event.target) && !event.defaultPrevented) {
        isMenuOpen = false;
      }
    };

    document.addEventListener('click', handleClick, true);

    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }

  // Close menu after navigation
  afterNavigate(() => {
    isMenuOpen = false;
  });

  // Close menu on page load/reload
  onMount(() => {
    isMenuOpen = false;
  });
</script>

<!-- Navigation Bar -->
<nav class="bg-base-100 shadow-md fixed top-0 w-full z-20">
  <div class="mx-auto md:px-8 px-4 py-1">
    <div class="flex items-center justify-between">
      <!-- Logo -->
      <a href="/home" class="flex-shrink-0">
        <img src="/img/logo.png" alt="Naigaon Market" class="h-16" />
      </a>

      <!-- Navigation Menu -->
      <div class="hidden md:flex space-x-8">
        {#each menuItems as item}
          <a 
            href={item.href}
            class="text-base-content hover:text-primary font-medium transition-colors duration-200"
          >
            {item.label}
          </a>
        {/each}
      </div>

      <!-- Right Icons -->
      <div class="flex items-center md:space-x-6 space-x-4">
        <!-- Search Bar -->
        <div class="relative">
          <SearchBar />
        </div>

        <!-- Login Button (if no authUser) -->
        {#if !authUser}
          <a
            href="/login?next=/home"
            class="btn btn-primary btn-sm"
          >
            Login
          </a>
        {/if}

        <!-- Profile Dropdown (if authUser) -->
        {#if authUser}
          <div class="dropdown dropdown-end">
            <label 
              tabindex="0" 
              class="btn btn-ghost btn-circle avatar"
            >
              <div class="w-10 rounded-full">
                <img src="https://placehold.co/100" alt="Profile" />
              </div>
            </label>
            <ul tabindex="0" class="dropdown-content menu menu-sm z-[1] p-2 shadow rounded-box w-52 text-black bg-white">
              <li>
                <a 
                  href="/profile/settings" 
                  class="hidden md:flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>View Profile</span>
                </a>
                <a 
                  href="/profile" 
                  class="md:hidden flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>View Profile</span>
                </a>
              </li> 
              <li>
                <a href="/profile/orders" class="hover:bg-base-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>My Orders</span>
                </a>
              </li>
              <li>
                <a href="/profile/wishlist" class="hover:bg-base-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Wishlist</span>
                </a>
              </li>
              <div class="divider my-0"></div>
              <li>
                <button on:click={handleLogout} class="text-error hover:bg-base-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        {/if}

        <!-- Cart Icon -->
        <div class="relative">
          <a href="/cart" class="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {#if cartCount > 0}
              <span class="absolute -top-0 -right-0 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            {/if}
          </a>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          class="md:hidden btn btn-ghost btn-circle"
          on:click={() => isMenuOpen = !isMenuOpen}
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
    <div 
      class="md:hidden bg-base-100 border-t shadow-lg"
      use:clickOutside
    >
      {#each menuItems as item}
        <a 
          href={item.href}
          class="block px-4 py-3 text-base-content hover:bg-base-200 transition-colors duration-200"
        >
          {item.label}
        </a>
      {/each}
    </div>
  {/if}
</nav>