<script>



  export let data;
  let currentCategory;

  $: if (data) {
    currentCategory = data.category;
  }
  // console.log(data);
  import Products from '$lib/components/Products.svelte';




</script>

<!-- Template -->
<div class="mx-4 md:mx-8">

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

