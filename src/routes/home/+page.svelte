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


  <svelte:head>
    <title>Naigaon Bazaar – Your Local Online Shopping Hub | Fresh Deals Daily</title>
    <meta name="description" content="Shop locally in Naigaon with Naigaon Bazaar! Find fresh groceries, fashion, electronics, and more at the best prices. Fast delivery, secure payments & exclusive deals!" />
    <meta name="keywords" content="Naigaon online shopping, Naigaon market, buy online Naigaon, local e-commerce Naigaon, Naigaon grocery store, Naigaon fashion, Naigaon electronics, Naigaon delivery service, best deals Naigaon" />

    <meta property="og:title" content="Naigaon Bazaar – Your Local Online Shopping Hub" />
    <meta property="og:description" content="Shop locally in Naigaon! Get fresh groceries, fashion, electronics, and more with fast delivery and secure payments." />

    <meta property="og:type" content="website" />
  </svelte:head>

  
  <div class="bg-base-100">
    <!-- <Login /> -->
    <Hero />
    <!-- <Navigation /> -->
    <HomeCategories />
    <ProductSection />
    <CompanySection />
    <BestSelling />
    <!-- <Carousel /> -->
    <Testimonials />
    <!-- <Footer /> -->
  </div>