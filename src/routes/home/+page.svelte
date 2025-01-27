<script>
    import Hero from '../../lib/components/Hero.svelte';
    // import Navigation from '../../lib/lib/components/Navigation.svelte';
    import HomeCategories from '../../lib/components/HomeCategories.svelte';

    import ProductSection from '../../lib/components/ProductSection.svelte';
    import CompanySection from '../../lib/components/CompanySection.svelte';
    import BestSelling from '../../lib/components/BestSelling.svelte';
    import Carousel from '../../lib/components/Carousel.svelte';
    import Testimonials from '../../lib/components/Testimonials.svelte';
    // import Login from '$lib/lib/components/Login.svelte';
    // import Footer from '../../lib/lib/components/Footer.svelte';
  </script>
  
  <div class="bg-base-100">
    <!-- <Login /> -->
    <Hero />
    <!-- <Navigation /> -->
    <HomeCategories />
    <ProductSection />
    <CompanySection />
    <BestSelling />
    <Carousel />
    <Testimonials />
    <!-- <Footer /> -->
  </div>