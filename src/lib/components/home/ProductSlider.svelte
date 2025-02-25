<script>
    import { onMount } from 'svelte';
    import Slider from '../Slider.svelte';
  
    let products = [
      { id: 1, name: "Product 1", price: 29.99, image: "https://via.placeholder.com/200x150?text=Product+1" },
      { id: 2, name: "Product 2", price: 39.99, image: "https://via.placeholder.com/200x150?text=Product+2" },
      { id: 3, name: "Product 3", price: 19.99, image: "https://via.placeholder.com/200x150?text=Product+3" },
      { id: 4, name: "Product 4", price: 49.99, image: "https://via.placeholder.com/200x150?text=Product+4" },
      { id: 5, name: "Product 5", price: 59.99, image: "https://via.placeholder.com/200x150?text=Product+5" },
      { id: 6, name: "Product 6", price: 24.99, image: "https://via.placeholder.com/200x150?text=Product+6" },
    ];
  
    let itemsPerView = 3; // Default for desktop
  
    onMount(() => {
      updateItemsPerView();
      window.addEventListener("resize", updateItemsPerView);
    });
  
    function updateItemsPerView() {
      if (window.innerWidth < 640) {
        itemsPerView = 1; // Mobile
      } else if (window.innerWidth < 1024) {
        itemsPerView = 2; // Tablet
      } else {
        itemsPerView = 3; // Desktop
      }
    }
  </script>
  
  <Slider {itemsPerView} items={products} autoSlideInterval={5000}>
    {#each products as product (product.id)}
      <div class="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 p-4">
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            class="w-full h-40 object-cover"
          />
          <div class="p-4">
            <h3 class="text-md font-semibold truncate">{product.name}</h3>
            <p class="text-gray-600">${product.price.toFixed(2)}</p>
          </div>
        </div>
      </div>
    {/each}
  </Slider>