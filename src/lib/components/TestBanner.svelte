<script>
    import { onMount } from "svelte";
  
    let showBanner = true;
  
    // Show the banner after 1 minute (60000ms)
    onMount(() => {
      setTimeout(() => {
        showBanner = true;
      }, 6000);
    });  
  
    function closeBanner() {
      showBanner = false;
    }
  </script>
  
  {#if showBanner}
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-red-600 text-white p-4 rounded-lg shadow-lg w-96 text-center">
        <p class="font-semibold">
          🚧 Our website is in beta testing. Orders placed now will not be delivered. 🚧
        </p>
        <button on:click={closeBanner} class="mt-3 bg-white text-red-600 px-4 py-2 rounded-md font-semibold hover:bg-gray-200">
          Close
        </button>
      </div>
    </div>
  {/if}
  