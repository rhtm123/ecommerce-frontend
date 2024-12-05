<script>
    import { fade, fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    
    let visible = false;
    
    onMount(() => {
      visible = true;
    });
  
    // Brand logos
    const brands = [
      {
        name: 'Puzzle Playground',
        src: 'https://th.bing.com/th/id/OIP.wIgzC4OZGRhwwqMYMmJn_wHaC-?rs=1&pid=ImgDetMain',
        alt: 'Puzzle Playground Logo'
      },
      {
        name: 'ABC Preschool',
        src: 'https://th.bing.com/th/id/OIP.wIgzC4OZGRhwwqMYMmJn_wHaC-?rs=1&pid=ImgDetMain',
        alt: 'ABC Preschool Logo'
      },
      {
        name: 'KIDS Clothing',
        src: 'https://www.lego.com/cdn/cs/history/assets/blt34fefa5d891cd982/logo_1973.JPG?disable=upscale&width=1056&quality=50',
        alt: 'KIDS Clothing Logo'
      },
      {
        name: 'First Steps',
        src: 'https://th.bing.com/th/id/OIP.wIgzC4OZGRhwwqMYMmJn_wHaC-?rs=1&pid=ImgDetMain',
        alt: 'First Steps Logo'
      },
      {
        name: 'Boss Baby',
        src: 'https://th.bing.com/th/id/OIP.wIgzC4OZGRhwwqMYMmJn_wHaC-?rs=1&pid=ImgDetMain',
        alt: 'Boss Baby Logo'
      }
    ];
  </script>
  
  <div class="relative min-h-screen bg-[#1a1f4d] overflow-hidden">
    <!-- Decorative curved shapes -->
    <div class="absolute top-0 right-0 w-1/3 h-1/3">
      <div class="absolute top-0 right-0 w-full h-full bg-pink-200 rounded-bl-[100%]"></div>
    </div>
    <div class="absolute bottom-0 left-0 w-1/3 h-1/3">
      <div class="absolute bottom-0 left-0 w-full h-full bg-pink-200 rounded-tr-[100%]"></div>
    </div>
  
    <!-- Main content -->
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <!-- Left column -->
        <div class="z-10">
          {#if visible}
            <h1 
              class="text-5xl font-bold text-white mb-6"
              in:fly="{{ y: 50, duration: 1000, delay: 200 }}"
            >
              CHARACTER SHOP
            </h1>
            
            <p 
              class="text-gray-200 text-lg mb-8 max-w-lg"
              in:fly="{{ y: 50, duration: 1000, delay: 400 }}"
            >
              Find the latest and greatest characters at Pippo's Character Shop. With dozens of characters from TV, movies and more, Pippo is sure to have your favorites.
            </p>
  
            <button 
              class="btn bg-[#ff4d4d] hover:bg-[#ff3333] text-white border-none rounded-full px-8 py-3 transform transition-transform duration-200 hover:scale-105"
              in:fly="{{ y: 50, duration: 1000, delay: 600 }}"
            >
              SHOP CATEGORIES
            </button>
          {/if}
        </div>
  
        <!-- Right column -->
        <div class="z-10">
          {#if visible}
            <div 
              class="relative"
              in:fade="{{ duration: 1000, delay: 800 }}"
            >
              <img
                src="src/assets/Toy-Names-For-Kids.webp"
                alt="Featured toy"
                class="w-full rounded-lg shadow-xl transform transition-transform duration-500 hover:scale-105"
              />
            </div>
          {/if}
        </div>
      </div>
  
      <!-- Decorative stars -->
      {#if visible}
        <div class="absolute right-1/4 top-1/3 z-0" in:fade="{{ duration: 1000, delay: 1000 }}">
          <svg class="w-8 h-8 text-[#ffd700]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.4 7.4-6-4.6-6 4.6 2.4-7.4-6-4.6h7.6z"/>
          </svg>
        </div>
        <div class="absolute right-1/3 top-1/4 z-0" in:fade="{{ duration: 1000, delay: 1200 }}">
          <svg class="w-6 h-6 text-[#ffd700]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.4 7.4-6-4.6-6 4.6 2.4-7.4-6-4.6h7.6z"/>
          </svg>
        </div>
        <div class="absolute right-1/3 bottom-1/4 z-0" in:fade="{{ duration: 1000, delay: 1400 }}">
          <svg class="w-4 h-4 text-[#ffd700]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.4 7.4-6-4.6-6 4.6 2.4-7.4-6-4.6h7.6z"/>
          </svg>
        </div>
      {/if}
  
      <!-- Brand logos -->
      {#if visible}
        <div 
          class="mt-16 grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-center"
          in:fly="{{ y: 50, duration: 1000, delay: 1600 }}"
        >
          {#each brands as brand}
            <div class="flex justify-center transform transition-transform duration-200 hover:scale-110">
              <img
                src={brand.src}
                alt={brand.alt}
                class="h-12 object-contain"
              />
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  
