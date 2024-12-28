<script>
  import { cart } from '$lib/stores/cart';
  
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
    { label: 'PRODUCT', href: '/product' },
    { label: 'BLOG', href: '/blog' }
  ];

  $: cartCount = $cart.reduce((total, item) => total + item.quantity, 0);
</script>

<!-- Navigation Bar -->
<nav class="bg-white shadow-sm fixed top-0 w-full z-50">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-20">
      <!-- Logo -->
      <a href="/" class="flex-shrink-0">
        <img src="https://th.bing.com/th/id/OIP.fyTJQxz_hAqGTkhRcWQ27AHaHa?&c=7&r=0&o=5&dpr=1.3&pid=1.7" alt="Pippo" class="h-16" />
      </a>

      <!-- Navigation Menu -->
      <div class="hidden md:flex space-x-8">
        {#each menuItems as item}
          <a 
            href={item.href}
            class="text-gray-700 hover:text-red-500 font-medium"
          >
            {item.label}
          </a>
        {/each}
      </div>

      <!-- Right Icons -->
      <div class="flex items-center space-x-6">
        <button class="text-gray-700 hover:text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        
        <div class="dropdown dropdown-hover dropdown-end ">
          <label 
            tabindex="0" 
            class="btn btn-ghost btn-circle avatar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </label>
          
          <ul tabindex="0" class="dropdown-content menu menu-sm z-[1] p-2 shadow  rounded-box w-52 text-black bg-white">
            <li>
              <a href="/profile/settings" class="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>View Profile</span>
              </a>
            </li>
            
            <li>
              <a href="/profile/orders" class="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>My Orders</span>
              </a>
            </li>
            
            <li>
              <a href="/profile/wishlist" class="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Wishlist</span>
              </a>
            </li>
            
            <div class="divider my-0"></div>
            
            <li>
              <button class="flex items-center space-x-2 text-red-500 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>

        <div class="relative">
          <a href="/cart" class="text-gray-700 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {#if cartCount > 0}
              <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            {/if}
          </a>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          class="md:hidden text-gray-700 hover:text-red-500"
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
    <div class="md:hidden bg-white border-t">
      {#each menuItems as item}
        <a 
          href={item.href}
          class="block px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          {item.label}
        </a>
      {/each}
    </div>
  {/if}
</nav>

<style>
  /* Add hover effect for dropdown */
  .dropdown:hover .dropdown-content {
    display: block;
  }
  
  /* Smooth transition for hover effects */
  .btn-ghost:hover {
    background-color: rgba(0, 0, 0, 0.05);
    transition: background-color 0.2s ease-in-out;
  }
  
  /* Style menu items */
  .menu li > * {
    padding: 0.75rem 1rem;
  }
  
  .menu li > *:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
</style>