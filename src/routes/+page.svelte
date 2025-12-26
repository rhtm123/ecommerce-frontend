<script>
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { PUBLIC_ESTORE_ID } from '$env/static/public';
  import { myFetch } from '$lib/utils/myFetch';

  export let data; 
  let recentReviews = data.recentReviews;
  let bestProducts = [];
  let brands = data.brands; 
  let newProducts = [];
  let mainCategories = data.mainCategories;
  let heroProducts = data.heroProducts;
  let homePage = data.homePage;
  let loadingBestProducts = true;
  let loadingNewProducts = true;
  // console.log(homePage);
  // console.log(recentReviews)
  // console.log(data)

  onMount(async () => {
    // Fetch bestProducts
    try {
      let url1 = PUBLIC_API_URL + "/product/product-listings/?page=1&page_size=12&ordering=-popularity&approved=true&estore_id=" + PUBLIC_ESTORE_ID;
      let data = await myFetch(url1);
      bestProducts = data.results;
    } catch (e) {
      console.log(e, "Error fetching bestProducts");
    } finally {
      loadingBestProducts = false;
    }

    // Fetch newProducts
    try {
      let url2 = PUBLIC_API_URL + "/product/product-listings/?page=1&page_size=12&ordering=-id&approved=true&estore_id=" + PUBLIC_ESTORE_ID;
      let data = await myFetch(url2);
      newProducts = data.results;
    } catch (e) {
      console.log(e, "Error fetching newProducts");
    } finally {
      loadingNewProducts = false;
    }
  });

  import Hero from '$lib/components/home/Hero.svelte';
  import HomeCategories from '$lib/components/home/HomeCategories.svelte';

  import BestDeals from '$lib/components/home/BestDeals.svelte';
  import CompanySection from '$lib/components/CompanySection.svelte';
  import BestSelling from '$lib/components/home/BestSelling.svelte';
  import Testimonials from '$lib/components/home/Testimonials.svelte';
  import SkeltonProducts from '$lib/components/skeltons/SkeltonProducts.svelte';
  // import Christmas from '$lib/components/temp/Christmas.svelte';
  // import ShopByBrands from '$lib/components/home/ShopByBrands.svelte';
  // import Ads from '$lib/components/Ads.svelte';

</script>


<svelte:head>
  <title>{homePage?.meta_title}</title>
  <meta name="description" content={homePage?.meta_description} />
  
  <meta property="og:title" content={homePage?.meta_title} />
  <meta property="og:description" content={homePage?.meta_description} />

  <meta property="og:type" content="website" />
</svelte:head>


<div class="bg-base-100">
  <Hero slides={heroProducts} />
  
  <!-- <Ads /> -->
  <HomeCategories categories={mainCategories} />

  <BestDeals products={newProducts} loading={loadingNewProducts} />

  <BestSelling products={bestProducts} loading={loadingBestProducts} />
  <!-- <Carousel /> -->
  <Testimonials recentReviews={recentReviews} />

  <div class="relative py-20 text-center animate-on-scroll bg-gradient-to-b from-base-100 via-white to-base-200">
      <div class="max-w-3xl mx-auto px-6">
        <h3 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Ready to Create Magical Moments?
        </h3>
        <p class="text-xl text-gray-600 mb-8 leading-relaxed">
          Join thousands of happy families who trust us to bring joy, learning, and endless fun to their children.
        </p>
        <div class="flex justify-center space-x-8 mb-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-700">Safety First</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-700">Quality Assured</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-700">Fast Delivery</p>
          </div>
          
        </div>
        <a href="/shop" class="btn btn-primary inline-flex items-center px-6 py-3 text-white font-semibold">
          Start Shopping
          <svg class="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
          </svg>
        </a>
      </div>
    </div>
    

  <!-- <Footer /> -->
</div>