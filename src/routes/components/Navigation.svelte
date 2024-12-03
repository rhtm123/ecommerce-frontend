<script>
    let cartCount = 2;
    let wishlistCount = 1;
    let isMenuOpen = false;
    
    const menuItems = [
      { label: 'HOME', href: '/' },
      { label: 'SHOP', href: '/shop' },
      { label: 'PRODUCT', href: '/product' },
      { label: 'BLOG', href: '/blog' },
      { label: 'PAGES', href: '/pages' }
    ];
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
          
          <button class="text-gray-700 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
  
          <div class="relative">
            <button class="text-gray-700 hover:text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {#if wishlistCount > 0}
                <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              {/if}
            </button>
          </div>
  
          <div class="relative">
            <button class="text-gray-700 hover:text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {#if cartCount > 0}
                <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              {/if}
            </button>
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