
<script>

let pincode = '';
  let pincodeResult = '';
  let pinData = null;
  import { PUBLIC_API_URL } from "$env/static/public";
  import  Icon  from '@iconify/svelte';


  async function checkPincodeAvailability() {
    if (!pincode) return; // Don't do anything if pincode is empty
    
    if (pincode.length === 6) {
      const response = await fetch(`${PUBLIC_API_URL}/estore/delivery-pins/?page=1&page_size=10`);
      const data = await response.json();
      const foundPinData = data.results.find(pin => pin.pin_code === pincode);
      
      pinData = foundPinData;
      
      if (foundPinData) {
        pincodeResult = `Delivery is available in ${foundPinData.city}, ${foundPinData.state}. COD is ${foundPinData.cod_available ? 'available' : 'not available'}.`;
      } else {
        pincodeResult = 'Delivery is not available for this pincode.';
      }
    } else if (pincode.length > 0) {
      pincodeResult = 'Please enter a valid 6-digit pincode.';
      pinData = null;
    }
  }

</script>

<div class="flex flex-col gap-2">
          <div class=" font-medium">Check Delivery Availability</div>
          <div class="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Enter Pincode" 
              bind:value={pincode}
              class="input input-bordered input-sm h-9 w-32 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              maxlength="6"
            />
            <button 
              class="btn btn-primary btn-sm h-9 px-4"
              on:click={checkPincodeAvailability}
            >
              Check
            </button>
          </div>
          {#if pincode && pincodeResult}
            <div class="flex items-start gap-2">
              <Icon 
                icon={pinData ? "mdi:check-circle" : "mdi:alert-circle"} 
                class="w-4 h-4 mt-0.5 {pinData ? 'text-green-500' : 'text-red-500'}"
              />
              <div class="flex flex-col">
                {#if pinData}
                  <p class="text-xs text-green-700">
                    Delivery is available in <span class="font-medium">{pinData.city}, {pinData.state}</span>
                  </p>
                  <p class="text-xs {pinData.cod_available ? 'text-green-700' : 'text-red-600'}">
                    COD is <span class="font-medium">{pinData.cod_available ? 'available' : 'not available'}</span>
                  </p>
                {:else}
                  <p class="text-xs text-red-600">{pincodeResult}</p>
                {/if}
              </div>
            </div>
          {/if}
        </div>