<script>
  import { onMount } from 'svelte';

  let currentSlide = 0;
  const slides = [
    {
      image: 'https://prod-cdn-thekrazycouponlady.imgix.net/wp-content/uploads/2022/05/bluey-toys-target-2022-10-1653246893-1653246893.jpg?auto=compress',
      heading: 'Creative Toys',
      description: 'Unleash creativity with toys that make learning fun!'
    },
    {
      image: 'https://s.hdnux.com/photos/01/26/51/40/22714424/4/1200x0.jpg',
      heading: 'Interactive Learning',
      description: 'Engage young minds with interactive and educational toys.'
    },
    {
      image: 'https://th.bing.com/th/id/R.a8f6a604a36d1c2d2d0a0f5b6e47453f?rik=6syH0qNgEawdyw&riu=http%3a%2f%2fretrododo.com%2fwp-content%2fuploads%2f2022%2f08%2fbest-70s-toys-of-all-time.jpg&ehk=uYKedTboNLjOpnev3rpsMyoER61LVCqlA5%2fPgAY%2bk94%3d&risl=&pid=ImgRaw&r=0',
      heading: 'Classic Toys',
      description: 'Revisit timeless classics that spark joy and imagination.'
    }
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

<div class="relative min-h-[400px] py-12 bg-base-100 overflow-hidden">
  <!-- Decorative elements -->
  <div class="absolute inset-0 overflow-hidden">
    <!-- Dashed lines -->
    <svg class="absolute left-0 top-1/4 w-24 h-24 text-primary opacity-20 animate-float" viewBox="0 0 100 100">
      <path d="M10,50 Q25,25 40,50 T70,50" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
    </svg>

    <!-- Paper airplane -->
    <svg class="absolute left-1/4 bottom-1/4 w-12 h-12 text-primary opacity-20 animate-fly" viewBox="0 0 24 24">
      <path fill="currentColor" d="M22,2L2,11l20-2L2,22l7-11l13-9" />
    </svg>

    <!-- Light bulb icon -->
    <svg class="absolute right-1/3 top-1/4 w-8 h-8 text-primary opacity-20 animate-pulse" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z" />
    </svg>
  </div>

  <div class="mx-auto md:px-8 px-4 h-full">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
      <div class="z-10 space-y-6">
        <p class="text-primary text-xl font-medium">{slides[currentSlide].heading}</p>
        <h1 class="text-secondary text-5xl md:text-6xl font-bold leading-tight">
          {slides[currentSlide].description}
        </h1>
        <button class="btn btn-primary rounded-full px-8">
          SHOP NOW
        </button>
      </div>

      <!-- Image section -->
      <div class="relative">
        <div class="absolute inset-0 -left-32 bg-primary rounded-l-[100px]" style="clip-path: polygon(30% 0, 100% 0, 100% 100%, 0% 100%);"></div>
        {#each slides as slide, i}
          <img
            src={slide.image}
            alt="{slide.heading}"
            class="relative z-10 w-full h-full object-cover rounded-lg transition-opacity duration-500"
            style="opacity: {currentSlide === i ? '1' : '0'}; position: {i === 0 ? 'relative' : 'absolute'}; top: 0; left: 0;"
          />
        {/each}
      </div>
    </div>
  </div>

  <!-- Navigation arrows -->
  <div class="absolute inset-x-0 bottom-2 flex justify-center space-x-4">
    <button class="btn btn-circle btn-sm btn-outline" on:click={prevSlide}>
      ❮
    </button>
    <button class="btn btn-circle btn-sm btn-outline" on:click={nextSlide}>
      ❯
    </button>
  </div>
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
