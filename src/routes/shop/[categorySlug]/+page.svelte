<script>
  export let data;
  let currentCategory;

  $: if (data) {
    currentCategory = data.category;
  }
  // console.log(data);
  import Products from '$lib/components/Products.svelte';



</script>

<svelte:head>
  <title>Buy {currentCategory?.name} Online in Naigaon | Best Prices & Fast Delivery</title>

  <meta name="description" content="Shop {currentCategory?.name} at best prices in Naigaon. ✓Wide Selection ✓Trusted Sellers ✓Fast Delivery ✓Secure Payments. Order now from Naigaon Market!" />
  
  <meta name="keywords" content="{currentCategory?.name} Naigaon, buy {currentCategory?.name} online, best {currentCategory?.name} prices, {currentCategory?.name} shopping Naigaon, local {currentCategory?.name} store, {currentCategory?.name} delivery Naigaon" />

  <!-- Open Graph Tags -->
  <meta property="og:title" content="Buy {currentCategory?.name} Online in Naigaon | Best Prices & Fast Delivery" />
  <meta property="og:description" content="Shop {currentCategory?.name} at best prices in Naigaon. Wide Selection, Trusted Sellers & Fast Delivery!" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Naigaon Market" />

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{currentCategory?.name} - Naigaon Market" />
  <meta name="twitter:description" content="Shop {currentCategory?.name} at best prices in Naigaon. Fast & reliable delivery!" />

  <!-- Additional SEO Meta Tags -->
  <meta name="robots" content="index, follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="canonical" href="https://naigaonmarket.com/shop/{currentCategory?.slug}" />

  <!-- Structured Data for Category Page -->
  <!-- <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "{currentCategory?.name} - Naigaon Market",
      "description": "Shop {currentCategory?.name} at best prices in Naigaon with fast delivery",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://naigaonmarket.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Shop",
            "item": "https://naigaonmarket.com/shop"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "{currentCategory?.name}",
            "item": "https://naigaonmarket.com/shop/{currentCategory?.slug}"
          }
        ]
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      }
    }
  </script> -->
</svelte:head>

<!-- Template -->
<div class="mx-4 mt-2 md:mx-8 lg:mx-16">

  <div class="text-sm breadcrumbs text-gray-600">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/shop">Shop</a></li>
      <li>{currentCategory?.name}</li>
    </ul>
  </div>
  <!-- Header Section -->

  <Products currentCategory={currentCategory} />

</div>

