<script>
    import { onMount, onDestroy } from 'svelte';
  
    export let items = []; // Array of items to display
    export let itemsPerView = 3; // Default items per view
    export let autoSlideInterval = 5000; // Auto-slide interval in ms (0 to disable)
  
    let currentIndex = 0;
    $: maxIndex = Math.ceil(items.length / itemsPerView) - 1;
  
    // Slide navigation
    function slide(direction) {
      if (direction === "next" && currentIndex < maxIndex) {
        currentIndex += 1;
      } else if (direction === "prev" && currentIndex > 0) {
        currentIndex -= 1;
      }
    }
  
    // Swipe functionality
    let touchStartX = 0;
    let touchMoveX = 0;
  
    function handleTouchStart(event) {
      touchStartX = event.touches[0].clientX;
    }
  
    function handleTouchMove(event) {
      touchMoveX = event.touches[0].clientX;
    }
  
    function handleTouchEnd() {
      const swipeDistance = touchStartX - touchMoveX;
      if (swipeDistance > 50) slide("next");
      else if (swipeDistance < -50) slide("prev");
    }
  
    // Auto-slide
    let autoSlide;
    function startAutoSlide() {
      if (autoSlideInterval > 0) {
        autoSlide = setInterval(() => slide("next"), autoSlideInterval);
      }
    }
    function stopAutoSlide() {
      clearInterval(autoSlide);
    }
  
    onMount(() => {
      startAutoSlide();
    });
  
    onDestroy(() => {
      stopAutoSlide();
    });
  </script>
  
  <div
    class="relative w-full mx-auto overflow-hidden"
    on:mouseenter={stopAutoSlide}
    on:mouseleave={startAutoSlide}
    on:touchstart={handleTouchStart}
    on:touchmove={handleTouchMove}
    on:touchend={handleTouchEnd}
  >
    <button
      class="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 disabled:opacity-30 disabled:cursor-not-allowed"
      on:click={() => slide("prev")}
      disabled={currentIndex === 0}
    >
      ❮
    </button>
  
    <div
      class="flex transition-transform duration-500 ease-in-out"
      style="transform: translateX(-{currentIndex * 100}%);"
    >
      <slot />
    </div>
  
    <button
      class="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 disabled:opacity-30 disabled:cursor-not-allowed"
      on:click={() => slide("next")}
      disabled={currentIndex === maxIndex}
    >
      ❯
    </button>
  
    {#if maxIndex > 0}
      <div class="flex justify-center space-x-2 py-4">
        {#each Array(maxIndex + 1) as _, i}
          <span
            class="w-3 h-3 rounded-full cursor-pointer {i === currentIndex ? 'bg-gray-800' : 'bg-gray-400'}"
            on:click={() => (currentIndex = i)}
          ></span>
        {/each}
      </div>
    {/if}
  </div>