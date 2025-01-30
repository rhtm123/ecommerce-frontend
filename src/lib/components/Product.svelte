<script>
    export let product;

    import { goto } from '$app/navigation';

    import {addToCart} from "../stores/cart";

    import { addAlert } from '$lib/stores/alert';

    function handleProductClick() {
        // console.log("HELLO ")
    goto(`/product/${product.slug}`);
  }

  function getStars(rating = 0) {
    return new Array(5).fill(false).map((_, i) => i < rating);
  }

  function AddToCardAlert(product) {
    addToCart(product);
    addAlert("Product added to cart", "success");
  }

</script>


<div class="bg-white rounded-lg p-4 hover:shadow-xl transition-shadow cursor-pointer"
                on:click={() => handleProductClick()}
              >
                <div class="relative mb-4">
                  <img 
                    src={product.main_image || '/placeholder-image.jpg'} 
                    alt={product.name}
                    class="w-full h-48 object-contain"
                  />
                </div>
                <div class="text-center">
                  <h3 class="font-medium text-sm mb-2">{product.name}</h3>
                  <!-- Rating Stars -->
                  <div class="rating rating-sm mb-2">
                    {#each getStars(product.rating) as isActive}
                      <input 
                        type="radio" 
                        class="mask mask-star-2 bg-orange-400" 
                        {isActive}
                        disabled
                      />
                    {/each}
                  </div>
                  <p class="text-primary font-bold mb-4">
                    ₹ {typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                  </p>
                  <button 
                    class="btn btn-primary btn-sm w-full"
                    on:click|stopPropagation={() => AddToCardAlert(product)}
                    disabled={!product.stock || product.stock <= 0}
                  >
                    {!product.stock || product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
            </div>