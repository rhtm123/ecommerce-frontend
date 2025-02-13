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
  <title>Shop {currentCategory?.name} Online in Naigaon | Best Deals & Fast Delivery</title>

  <meta name="description" content="Discover the best {currentCategory?.name} in Naigaon. Shop now for great prices & fast delivery!">
<!-- {Highlight Feature 1}, {Highlight Feature 2}, and more. -->

</svelte:head>

<!-- Template -->
<div class="mx-4 mt-5 md:mx-8">

  <div class="text-sm breadcrumbs text-gray-600">
    <ul>
      <li><a href="/home">Home</a></li>
      <li><a href="/shop">Shop</a></li>
      <li>{currentCategory?.name} </li>
    </ul>
  </div>
  <!-- Header Section -->

  <Products currentCategory={currentCategory} />

</div>

