<script>
  import { onMount } from 'svelte';
  
  let currentSlide = 0;
  const slides = [
    'https://prod-cdn-thekrazycouponlady.imgix.net/wp-content/uploads/2022/05/bluey-toys-target-2022-10-1653246893-1653246893.jpg?auto=compress',
    'https://s.hdnux.com/photos/01/26/51/40/22714424/4/1200x0.jpg',
    'https://th.bing.com/th/id/R.a8f6a604a36d1c2d2d0a0f5b6e47453f?rik=6syH0qNgEawdyw&riu=http%3a%2f%2fretrododo.com%2fwp-content%2fuploads%2f2022%2f08%2fbest-70s-toys-of-all-time.jpg&ehk=uYKedTboNLjOpnev3rpsMyoER61LVCqlA5%2fPgAY%2bk94%3d&risl=&pid=ImgRaw&r=0'
  ];

  // Auto-scroll functionality
  onMount(() => {
    const interval = setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
    }, 5000);

    return () => clearInterval(interval);
  });

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  }
</script>

<div class="relative min-h-[600px] py-32 bg-pink-200 overflow-hidden">
  <!-- Decorative elements -->
  <div class="absolute inset-0 overflow-hidden">
    <!-- Dashed lines -->
    <svg class="absolute left-0 top-1/4 w-24 h-24 text-navy-blue opacity-20 animate-float" viewBox="0 0 100 100">
      <path d="M10,50 Q25,25 40,50 T70,50" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"/>
    </svg>
    
    <!-- Paper airplane -->
    <svg class="absolute left-1/4 bottom-1/4 w-12 h-12 text-navy-blue opacity-20 animate-fly" viewBox="0 0 24 24">
      <path fill="currentColor" d="M22,2L2,11l20-2L2,22l7-11l13-9"/>
    </svg>
    
    <!-- Light bulb icon -->
    <svg class="absolute right-1/3 top-1/4 w-8 h-8 text-navy-blue opacity-20 animate-pulse" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z"/>
    </svg>
  </div>

  <div class="container mx-auto px-4 h-full">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
      <div class="z-10 space-y-6">
        <p class="text-red-500 text-xl font-medium">Best Education</p>
        <h1 class="text-[#1a237e] text-5xl md:text-6xl font-bold leading-tight">
          FOR KIDS
        </h1>
        <button class="btn bg-red-500 hover:bg-red-600 text-white border-none rounded-full px-8">
          SHOP NOW
        </button>
      </div>

      <!-- Update the image section -->
      <div class="relative">
        <div class="absolute inset-0 -left-32 bg-red-500 rounded-l-[100px]" style="clip-path: polygon(30% 0, 100% 0, 100% 100%, 0% 100%);"></div>
        {#each slides as src, i}
          <img
            src={src}
            alt="Kids playing with educational toys"
            class="relative z-10 w-full h-full object-cover rounded-lg transition-opacity duration-500"
            style="opacity: {currentSlide === i ? '1' : '0'}; position: {i === 0 ? 'relative' : 'absolute'}; top: 0; left: 0;"
          />
        {/each}
      </div>
    </div>
  </div>

  <!-- Navigation arrows -->
  <button
    class="absolute left-4 top-1/2 -translate-y-1/2 btn btn-circle bg-white hover:bg-gray-100 border-none shadow-lg z-20"
    on:click={prevSlide}
  >
    <svg class="w-6 h-6 text-navy-blue" viewBox="0 0 24 24">
      <path fill="currentColor" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"/>
    </svg>
  </button>

  <button
    class="absolute right-4 top-1/2 -translate-y-1/2 btn btn-circle bg-white hover:bg-gray-100 border-none shadow-lg z-20"
    on:click={nextSlide}
  >
    <svg class="w-6 h-6 text-navy-blue" viewBox="0 0 24 24">
      <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
    </svg>
  </button>
</div>

<style>
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes fly {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(20px, -20px) rotate(15deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }

  :global(.animate-float) {
    animation: float 3s ease-in-out infinite;
  }

  :global(.animate-fly) {
    animation: fly 4s ease-in-out infinite;
  }
</style>