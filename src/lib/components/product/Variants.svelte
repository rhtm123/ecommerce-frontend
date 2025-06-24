<script>
  let variants = [];
  let loadingVariants = false;

  async function fetchVariants() {
    loadingVariants = true;
    try {
      // const response = await myFetch(`${PUBLIC_API_URL}/product-listings/${product_listing.id}/variants/`);
      // variants = response;
      // // Ensure the current product_listing is included in variants
      // if (!variants.find(v => v.id === product_listing.id)) {
      //   variants = [product_listing, ...variants];
      // }
    } catch (e) {
      console.error('Error fetching variants:', e);
    //   addAlert('Failed to load variants', 'error');
    } finally {
      loadingVariants = false;
    }
  }
</script>