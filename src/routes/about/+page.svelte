<script>
  import { onMount } from "svelte";

  // Set SEO meta tags
  onMount(() => {
    document.title = "About Us - Naigaon Market";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        "Learn more about Naigaon Market, your local e-commerce platform supporting small businesses and offering the best deals in Naigaon."
      );
  });
</script>

<svelte:head>
  <title>About Us - Naigaon Market</title>
  <meta
    name="description"
    content="Learn more about Naigaon Market, your local e-commerce platform supporting small businesses and offering the best deals in Naigaon."
  />
  <meta
    name="keywords"
    content="Naigaon Market, local e-commerce, small businesses, Naigaon, Mumbai, online shopping"
  />
  <meta name="author" content="Naigaon Market" />
  <meta property="og:title" content="About Us - Naigaon Market" />
  <meta
    property="og:description"
    content="Learn more about Naigaon Market, your local e-commerce platform supporting small businesses and offering the best deals in Naigaon."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://naigaonmarket.com/about" />
  <!-- <meta
    property="og:image"
    content="https://naigaonmarket.com/images/about-us.jpg"
  /> -->
</svelte:head>

<div class="min-h-screen bg-gray-100 py-12">
  <div class="container mx-auto px-4">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">About Naigaon Market</h1>
      <p class="text-lg text-gray-600">
        Empowering local sellers, delighting buyers, and building a stronger
        community.
      </p>
    </div>

    <!-- Mission Section -->
    <div class="bg-white rounded-lg shadow p-8 mb-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
      <p class="text-gray-600 mb-4">
        At Naigaon Market, we believe in the power of local commerce. Our mission
        is to connect buyers with the best local sellers, offering
        <strong>affordable prices</strong>, <strong>faster delivery</strong>, and
        a <strong>personalized shopping experience</strong>.
      </p>
      <p class="text-gray-600">
        By supporting small businesses, we're not just building an e-commerce
        platform—we're building a <strong>stronger community</strong>.
      </p>
    </div>

    <!-- Why Choose Us Section -->
    <div class="bg-white rounded-lg shadow p-8 mb-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Card 1 -->
        <div class="bg-base-100 p-6 rounded-lg shadow-sm">
          <div class="text-primary text-3xl mb-4">🚀</div>
          <h3 class="text-xl font-semibold mb-2">Fast Delivery</h3>
          <p class="text-gray-600">
            Get your orders delivered the same day—right to your doorstep.
          </p>
        </div>
        <!-- Card 2 -->
        <div class="bg-base-100 p-6 rounded-lg shadow-sm">
          <div class="text-primary text-3xl mb-4">💸</div>
          <h3 class="text-xl font-semibold mb-2">Affordable Prices</h3>
          <p class="text-gray-600">
            Save up to 30% compared to big e-commerce platforms.
          </p>
        </div>
        <!-- Card 3 -->
        <div class="bg-base-100 p-6 rounded-lg shadow-sm">
          <div class="text-primary text-3xl mb-4">🤝</div>
          <h3 class="text-xl font-semibold mb-2">Support Local</h3>
          <p class="text-gray-600">
            Every purchase supports a local seller in Naigaon.
          </p>
        </div>
      </div>
    </div>

  
  </div>
</div>