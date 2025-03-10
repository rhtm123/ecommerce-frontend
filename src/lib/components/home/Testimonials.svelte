<script>
  import Slider from "../Slider.svelte";
  export let recentReviews;

  const StarIcon = ({ filled }) => `
    <svg class="w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  `;
</script>


<section class="py-16 bg-blue-50 bg-opacity-60">
  <div class="mx-auto px-4 md:px-8 lg:px-16">
    <!-- Section Header -->
    <div class="mb-12">
      <h4 class="text-primary text-sm text text-center font-medium mb-2 animate-fade-in">Client Feedback</h4>
      <h2 class="text-3xl md:text-4xl font-bold text-center text-[#2D3748]">WHAT OUR CUSTOMERS SAY</h2>
    </div>


    <Slider items={recentReviews}>
      {#each recentReviews as review}
        <div class="item snap-start bg-white rounded-lg p-6  transform hover:-translate-y-2 transition-transform duration-300 w-[300px] flex-shrink-0">
          <div class="flex items-center mb-4">
            <img
              src={review?.product_listing?.main_image}
              alt={review?.product_listing?.name}
              class="w-16 h-16 rounded-full border-4 border-pink-100 object-cover"
            />
            <div class="ml-4">
              <h3 class="font-bold text-lg">{review?.user?.first_name} {review?.user?.last_name}</h3>
              <p class="text-xs text-gray-600">Product: {review?.product_listing?.name}</p>
            </div>
          </div>
          <div class="flex mb-4">
            {#each Array(5) as _, i}
              {@html StarIcon({ filled: i < review.rating })}
            {/each}
          </div>
          <p class="text-gray-700 italic">"{review.comment}"</p>
        </div>
      {/each}
    </Slider>
  </div>
</section>
