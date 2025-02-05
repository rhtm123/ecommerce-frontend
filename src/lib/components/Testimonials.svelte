<script>
    import data from '$lib/data/testimonials.json';

    import { user } from '$lib/stores/auth';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { PUBLIC_ESTORE_ID } from '$env/static/public';
    import { myFetch } from '$lib/utils/myFetch';
    import { onMount, onDestroy } from 'svelte';


  let authUser;
  const unsubscribe = user.subscribe(value => {
    authUser = value;
  });

  onDestroy(() => {
    unsubscribe(); // Cleanup to avoid memory leaks
  });


  let recentReviews = []
  let loading = false;
  async function fetchReviews() {
    loading = true
    try{
    let url = `${PUBLIC_API_URL}/review/reviews/?page_size=6&estore_id=${PUBLIC_ESTORE_ID}&ordering=-id`;
    let data = await myFetch(url);
    recentReviews = data.results;
    console.log(recentReviews);
    } catch (e) {
    } finally {
        loading = false;
    }
  }

  onMount(()=>{
    fetchReviews();
  })


    const testimonials = data.testimonials;
  
    const StarIcon = ({ filled }) => `
      <svg class="w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    `;
  </script>
  
  <section class="py-16 bg-[#FFF5F5]">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <div class="mb-12">
        <h4 class="text-[#FF6B6B] text-sm text text-center font-medium mb-2 animate-fade-in">Client Feedback</h4>
        <h2 class="text-3xl md:text-4xl font-bold text-center text-[#2D3748]">WHAT OUR CUSTOMERS SAY</h2>
      </div>
  
      <!-- Testimonials Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

        {#each recentReviews as review }
          <div class="bg-white rounded-lg p-6 shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
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
            
            <!-- Star Rating -->
            <div class="flex mb-4">
              {#each Array(5) as _, i}
                {@html StarIcon({ filled: i < review.rating })}
              {/each}
            </div>
            
            <p class="text-gray-700 italic">"{review.comment}"</p>
          </div>
        {/each}

        {#if loading}
            <div class="p-4">
                <span class="loading loading-spinner loading-sm"></span>
            </div>
        {/if}


       
      </div>
    </div>
  </section>
  
  <style>
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  
    .animate-fade-in {
      animation: fade-in 0.6s ease-out forwards;
    }
  </style>