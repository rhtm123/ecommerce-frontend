<script>
    import { onMount, onDestroy } from 'svelte';
  
    export let items = [];
    export let itemsPerView = 3;
    export let autoSlideInterval = 5000;
  
    let currentIndex = 0;
    $: maxIndex = Math.ceil(items.length / itemsPerView) - 1;
  
    function slide(direction) {
      if (direction === "next" && currentIndex < maxIndex) {
        currentIndex += 1;
      } else if (direction === "prev" && currentIndex > 0) {
        currentIndex -= 1;
      }
    }
  
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
    class="relative w-full mx-auto overflow-hidden py-4"
    on:mouseenter={stopAutoSlide}
    on:mouseleave={startAutoSlide}
    on:touchstart={handleTouchStart}
    on:touchmove={handleTouchMove}
    on:touchend={handleTouchEnd}
  >
    <!-- Previous Button -->
    <button
      class="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 ease-in-out z-10 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
      on:click={() => slide("prev")}
      disabled={currentIndex === 0}
      aria-label="Previous slide"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    </button>
  
    <!-- Slider Content -->
    <div
      class="flex transition-transform duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)]"
      style="transform: translateX(-{currentIndex * 100}%);"
    >
      <slot />
    </div>
  
    <!-- Next Button -->
    <button
      class="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 ease-in-out z-10 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
      on:click={() => slide("next")}
      disabled={currentIndex === maxIndex}
      aria-label="Next slide"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
    </button>
  
    <!-- Dots Navigation (if more than one slide) -->
    {#if maxIndex > 0}
      <div class="flex justify-center mt-4 space-x-2">
        {#each Array(maxIndex + 1) as _, i}
          <button
            class="w-3 h-3 rounded-full transition-all duration-300 ease-in-out {i === currentIndex ? 'bg-primary scale-125' : 'bg-gray-300 hover:bg-gray-400'}"
            on:click={() => (currentIndex = i)}
            aria-label={`Go to slide ${i + 1}`}
          ></button>
        {/each}
      </div>
    {/if}
  </div>