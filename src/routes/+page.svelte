<script>

  export let data; 
  let recentReviews = data.recentReviews;
  let bestProducts = data.bestProducts;
  let brands = data.brands; 
  let newProducts = data.newProducts;
  let mainCategories = data.mainCategories;
  let heroProducts = data.heroProducts;

  // console.log(recentReviews)
  // console.log(data)
  import Hero from '$lib/components/home/Hero.svelte';
  import HomeCategories from '$lib/components/home/HomeCategories.svelte';

  import BestDeals from '$lib/components/home/BestDeals.svelte';
  import CompanySection from '$lib/components/CompanySection.svelte';
  import BestSelling from '$lib/components/home/BestSelling.svelte';
  import Testimonials from '$lib/components/home/Testimonials.svelte';
  import ShopByBrands from '$lib/components/home/ShopByBrands.svelte';
  // import Ads from '$lib/components/Ads.svelte';

</script>


<svelte:head>
  <title>Naigaon Market – Your Local Online Shopping Hub | Fresh Deals Daily</title>
  <meta name="description" content="Shop locally in Naigaon with Naigaon Bazaar! Find fresh groceries, fashion, electronics, and more at the best prices. Fast delivery, secure payments & exclusive deals!" />
  <meta name="keywords" content="Naigaon online shopping, Naigaon Market, buy online Naigaon, local e-commerce Naigaon, Naigaon grocery store, Naigaon fashion, Naigaon electronics, Naigaon delivery service, best deals Naigaon" />

  <meta property="og:title" content="Naigaon Market – Your Local Online Shopping Hub" />
  <meta property="og:description" content="Shop locally in Naigaon! Get fresh groceries, fashion, electronics, and more with fast delivery and secure payments." />

  <meta property="og:type" content="website" />
</svelte:head>


<div class="bg-base-100">
  <Hero slides={heroProducts} />
  <!-- <Ads /> -->
  <HomeCategories categories={mainCategories} />
  <BestDeals products={newProducts} />

  <ShopByBrands brands={brands} />
  <!-- <CompanySection /> -->
  <BestSelling products={bestProducts} />
  <!-- <Carousel /> -->
  <Testimonials recentReviews={recentReviews} />

  <!-- <Footer /> -->
</div>