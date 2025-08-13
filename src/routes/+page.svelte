<script>

  export let data; 
  let recentReviews = data.recentReviews;
  let bestProducts = data.bestProducts;
  let brands = data.brands; 
  let newProducts = data.newProducts;
  let mainCategories = data.mainCategories;
  let heroProducts = data.heroProducts;
  let homePage = data.homePage;
  console.log(homePage);
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
  <BestDeals products={newProducts} />

  <ShopByBrands brands={brands} />
  <!-- <CompanySection /> -->
  <BestSelling products={bestProducts} />
  <!-- <Carousel /> -->
  <Testimonials recentReviews={recentReviews} />

  <!-- <Footer /> -->
</div>