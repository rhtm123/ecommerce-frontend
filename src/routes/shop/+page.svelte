<script>
import Products from "$lib/components/Products.svelte";
</script>

<svelte:head>
  <title>Shop Online in Naigaon Market | Best Deals on Groceries, Toys & More</title>
  
  <meta name="description" content="Discover amazing deals on groceries, toys, electronics, and more at Naigaon Market. Shop from trusted local sellers with fast delivery and secure payments." />
  
  <meta name="keywords" content="Naigaon online shopping, local marketplace Naigaon, best deals Naigaon, grocery shopping Naigaon, toys Naigaon, electronics Naigaon, home essentials, daily needs, fast delivery Naigaon" />

  <!-- Open Graph Tags -->
  <meta property="og:title" content="Shop Online in Naigaon Market | Best Deals on Groceries, Toys & More" />
  <meta property="og:description" content="Discover amazing deals on groceries, toys, electronics, and more. Shop from trusted local sellers with fast delivery!" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Naigaon Market" />

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Shop Online in Naigaon Market | Best Local Deals" />
  <meta name="twitter:description" content="Discover amazing deals on groceries, toys, electronics, and more. Fast delivery in Naigaon!" />

  <!-- Additional SEO Meta Tags -->
  <meta name="robots" content="index, follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="canonical" href="https://naigaonmarket.com/shop" />

  <!-- Structured Data for Rich Results -->
  <!-- <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "Naigaon Market",
      "description": "Your local online shopping destination in Naigaon",
      "image": "https://naigaonmarket.com/logo.png",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Naigaon",
        "addressRegion": "Maharashtra",
        "addressCountry": "IN"
      },
      "priceRange": "₹₹",
      "telephone": "+91-XXXXXXXXXX",
      "openingHours": "Mo-Su 00:00-23:59",
      "hasMap": "https://naigaonmarket.com/store-location",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://naigaonmarket.com/shop/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  </script> -->
</svelte:head>

<div class="mx-4 mt-2 md:mx-8 lg:mx-16">
  
  <div class="breadcrumbs text-sm">
    <ul>
      <li><a href="/">Home</a></li>
      <li>Shop</li>
    </ul>
  </div>

  <Products />

</div>
