<script>
    const categories = [
      {
        name: "ACTION TOYS",
        products: 4,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>`
      },
      {
        name: "PRE-SCHOOL TOYS",
        products: 5,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="8" r="5"/>
          <path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2"/>
        </svg>`
      },
      {
        name: "ELECTRONIC TOYS",
        products: 2,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="10" rx="2"/>
          <circle cx="12" cy="16" r="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>`
      },
      {
        name: "EDUCATIONAL TOYS",
        products: 7,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>`
      },
      {
        name: "TRANSPORT & CAR TOYS",
        products: 7,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="6" width="18" height="12" rx="2"/>
          <circle cx="7" cy="18" r="2"/>
          <circle cx="17" cy="18" r="2"/>
        </svg>`
      }
    ];
  </script>
  
  <section class="py-12   bg-yellow-50 ">
    <div class="text-center ">
      <p class="text-red-500 text-sm mb-2">Our Category</p>
      <h2 class="text-2xl font-bold text-[#2D2D2D]">CATEGORIES YOU'LL LOVE</h2>
    </div>
  
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
      {#each categories as category}
        <div class="flex flex-col items-center">
          <div class="w-24 h-24 flex items-center justify-center mb-4 text-gray-600">
            {@html category.icon}
          </div>
          <h3 class="text-sm font-medium text-center mb-1">{category.name}</h3>
          <p class="text-xs text-gray-500">{category.products} Products</p>
        </div>
      {/each}
    </div>
  </section>
  
  <section class="py-12 px-4  bg-amber-200 ">
    <div class="grid md:grid-cols-3 gap-8">
      <!-- Voucher Card -->
      <div class="bg-gray-100 rounded-lg p-6 text-center relative overflow-hidden">
        <img
          src="src\assets\Toy-Names-For-Kids.webp"
          alt="Teddy Bear with Gifts"
          class="w-full h-48 object-cover rounded-lg mb-4"
        />
        <h3 class="text-xl font-bold mb-2">YOU COULD WIN A $25 VOUCHER</h3>
        <p class="text-sm text-gray-600 mb-4">When You Sign Up For A FREE Copy Of The Catalogue</p>
        <button class="btn btn-outline rounded-full px-8">SIGN UP NOW</button>
      </div>
  
      <!-- Educational Toys Card -->
      <div class="bg-gray-100 rounded-lg p-6 text-center relative overflow-hidden">
        <img
          src="src\assets\Toy-Names-For-Kids.webp"
          alt="Educational Toys"
          class="w-full h-48 object-cover rounded-lg mb-4"
        />
        <h3 class="text-xl font-bold mb-2">NEW IN CHILDREN'S EDUCATIONAL TOYS</h3>
        <p class="text-sm text-gray-600 mb-4">Up To 40% Off Educational Toys</p>
        <button class="btn btn-primary rounded-full px-8">SHOP NOW</button>
      </div>
      <!-- Educational Toys Card -->
      <div class="bg-gray-100 rounded-lg p-6 text-center relative overflow-hidden">
        <img
          src="src\assets\Toy-Names-For-Kids.webp"
          alt="Educational Toys"
          class="w-full h-48 object-cover rounded-lg mb-4"
        />
        <h3 class="text-xl font-bold mb-2">NEW IN CHILDREN'S EDUCATIONAL TOYS</h3>
        <p class="text-sm text-gray-600 mb-4">Up To 40% Off Educational Toys</p>
        <button class="btn btn-primary rounded-full px-8">SHOP NOW</button>
      </div>
    </div>
  </section>
  
  <style>
    :global(.btn) {
      text-transform: uppercase;
      font-size: 0.875rem;
    }
  </style>