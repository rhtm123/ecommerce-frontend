<script>
  import { onMount } from "svelte";

  onMount(() => {
    document.title = "About Us - Naigaon Market";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        "Discover how Naigaon Market is transforming local shopping — supporting small businesses, empowering local sellers, and making doorstep delivery fast and affordable in Naigaon."
      );
  });
</script>

<svelte:head>
  <title>About Us - Naigaon Market</title>
  <meta
    name="description"
    content="Discover how Naigaon Market is transforming local shopping — supporting small businesses, empowering local sellers, and making doorstep delivery fast and affordable in Naigaon."
  />
  <meta
    name="keywords"
    content="Naigaon Market, local e-commerce, support local businesses, Naigaon delivery, online shopping Naigaon, Mumbai shopping"
  />
  <meta name="author" content="Naigaon Market" />
  <meta property="og:title" content="About Us - Naigaon Market" />
  <meta
    property="og:description"
    content="Discover how Naigaon Market is transforming local shopping — supporting small businesses, empowering local sellers, and making doorstep delivery fast and affordable in Naigaon."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://naigaonmarket.com/about" />
</svelte:head>

<div class="min-h-screen bg-gray-100 py-12">
  <div class="container mx-auto px-4">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">About Naigaon Market</h1>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Your neighborhood’s very own online marketplace — bridging tradition with technology, and bringing Naigaon together, one order at a time.
      </p>
    </div>

    <!-- Mission Section -->
    <div class="bg-white rounded-lg shadow p-8 mb-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
      <p class="text-gray-600 mb-4">
        At <strong>Naigaon Market</strong>, our mission is to bring convenience to your fingertips while keeping the heart of shopping—local connections—alive. We strive to:
      </p>
      <ul class="list-disc list-inside text-gray-600 mb-4">
        <li>Empower local vendors and shopkeepers with digital tools.</li>
        <li>Deliver quality goods faster, cheaper, and directly to your home.</li>
        <li>Foster a thriving community economy that benefits every household.</li>
      </ul>
      <p class="text-gray-600">
        We're not just another online store — we're a <strong>movement to uplift Naigaon</strong>.
      </p>
    </div>

    <!-- Vision Section -->
    <div class="bg-white rounded-lg shadow p-8 mb-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
      <p class="text-gray-600 mb-4">
        We envision Naigaon as a digitally connected, self-reliant town where every family can shop smart and every seller thrives. By blending technology with trust, we aim to make Naigaon a role model for hyperlocal e-commerce across India.
      </p>
    </div>

    <!-- Why Choose Us Section -->
    <div class="bg-white rounded-lg shadow p-8 mb-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-8">Why Choose Us?</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-base-100 p-6 rounded-lg shadow-sm">
          <div class="text-primary text-3xl mb-4">🚀</div>
          <h3 class="text-xl font-semibold mb-2">Lightning-Fast Delivery</h3>
          <p class="text-gray-600">
            Same-day or next-day delivery across Naigaon. Groceries, gifts, and essentials — we bring it home.
          </p>
        </div>
        <div class="bg-base-100 p-6 rounded-lg shadow-sm">
          <div class="text-primary text-3xl mb-4">💸</div>
          <h3 class="text-xl font-semibold mb-2">Pocket-Friendly Prices</h3>
          <p class="text-gray-600">
            Enjoy local deals and fair prices — up to 30% cheaper than big platforms.
          </p>
        </div>
        <div class="bg-base-100 p-6 rounded-lg shadow-sm">
          <div class="text-primary text-3xl mb-4">🤝</div>
          <h3 class="text-xl font-semibold mb-2">Support Naigaon Sellers</h3>
          <p class="text-gray-600">
            Every order helps a neighborhood business grow. Shop with pride.
          </p>
        </div>
      </div>
    </div>

    <!-- Community Section -->
    <div class="bg-white rounded-lg shadow p-8 mb-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">The Naigaon Spirit</h2>
      <p class="text-gray-600">
        From the sabziwala down your lane to the local dairy and kirana store, we celebrate the people who keep Naigaon running. We’re proud to create a platform that brings their services online — so you can buy fresh, buy local, and buy with confidence.
      </p>
    </div>

    <!-- Closing -->
    <div class="text-center mt-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Join the Movement</h2>
      <p class="text-gray-600 max-w-xl mx-auto">
        Whether you're a resident looking for easy shopping or a local business ready to grow, Naigaon Market is built for you. Together, let’s make Naigaon the most connected town in Mumbai.
      </p>
    </div>
  </div>
</div>
