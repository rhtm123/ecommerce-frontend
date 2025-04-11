<script>
    import { fade, slide } from 'svelte/transition';
    import { offerApi } from '$lib/services/offerApi';
    import { cart } from '$lib/stores/cart';
    import { appliedOffers, cartDiscounts } from '$lib/stores/offers';
    import { addAlert } from '$lib/stores/alert';

    let loading = false;
    let availableOffers = [];
    let isExpanded = false;

    async function loadAvailableOffers() {
        loading = true;
        try {
            const offers = await offerApi.getActiveOffers();
            const offersArray = Array.isArray(offers) ? offers : (offers?.results || []);
            availableOffers = offersArray.filter(offer => {
                return !$appliedOffers.some(appliedOffer => appliedOffer.id === offer.id);
            });
        } catch (error) {
            console.error('Error loading offers:', error);
            addAlert('Failed to load offers', 'error');
        } finally {
            loading = false;
        }
    }

    async function applyOffer(offer) {
        loading = true;
        try {
            const cartItems = $cart;
            if (!cartItems || cartItems.length === 0) {
                addAlert('Your cart is empty', 'error');
                return;
            }

            const productIds = cartItems.map(item => item.id);
            const quantities = cartItems.map(item => item.quantity);
            
            const validation = await offerApi.validateOffer(
                offer.id,
                productIds,
                quantities
            );

            if (validation?.is_valid) {
                appliedOffers.update(offers => [...offers, offer]);
                cartDiscounts.update(discounts => ({
                    ...discounts,
                    offerDiscounts: [
                        ...discounts.offerDiscounts,
                        {
                            offerId: offer.id,
                            amount: parseFloat(validation.discount_amount) || 0
                        }
                    ]
                }));
                addAlert('Offer applied successfully', 'success');
                availableOffers = availableOffers.filter(o => o.id !== offer.id);
            } else {
                addAlert(validation?.message || 'Offer cannot be applied', 'error');
            }
        } catch (error) {
            console.error('Error applying offer:', error);
            addAlert('Failed to apply offer', 'error');
        } finally {
            loading = false;
        }
    }

    function removeOffer(offer) {
        appliedOffers.update(offers => offers.filter(o => o.id !== offer.id));
        cartDiscounts.update(discounts => ({
            ...discounts,
            offerDiscounts: discounts.offerDiscounts.filter(d => d.offerId !== offer.id)
        }));
        availableOffers = [...availableOffers, offer];
        addAlert('Offer removed', 'info');
    }

    $: if ($cart.length > 0) {
        loadAvailableOffers();
    }
</script>

<div class="space-y-4">
    <!-- Applied Offers -->
    {#if $appliedOffers.length > 0}
        <div class="bg-white rounded-lg shadow-sm p-4" in:fade>
            <h3 class="text-lg font-semibold mb-4">Applied Offers</h3>
            <div class="space-y-3">
                {#each $appliedOffers as offer}
                    <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg" in:slide>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="badge badge-success">{offer.type}</span>
                                <span class="font-medium">{offer.name}</span>
                            </div>
                            <p class="text-sm text-gray-600 mt-1">{offer.description}</p>
                        </div>
                        <button 
                            class="btn btn-sm btn-ghost text-red-500"
                            on:click={() => removeOffer(offer)}
                        >
                            Remove
                        </button>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Available Offers Collapsible Section -->
    {#if availableOffers.length > 0}
        <div class="bg-white rounded-lg shadow-sm" in:fade>
            <button 
                class="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                on:click={() => isExpanded = !isExpanded}
            >
                <div class="flex items-center gap-2">
                    <span class="text-lg font-semibold">Available Offers</span>
                    <span class="badge badge-primary">{availableOffers.length}</span>
                </div>
                <svg 
                    class="w-5 h-5 transform transition-transform {isExpanded ? 'rotate-180' : ''}"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {#if isExpanded}
                <div class="p-4 border-t" transition:slide>
                    <div class="space-y-4">
                        {#each availableOffers as offer}
                            <div class="border rounded-lg p-4 hover:border-primary transition-colors">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <span class="badge badge-primary mb-2">{offer.type}</span>
                                        <h4 class="font-semibold">{offer.name}</h4>
                                        <p class="text-sm text-gray-600 mt-1">{offer.description}</p>
                                        
                                        {#if offer.type === 'buy_x_get_y'}
                                            <p class="text-sm mt-2">
                                                Buy {offer.buy_quantity} items, get {offer.get_quantity} items at {offer.discount_percent}% off
                                            </p>
                                        {:else if offer.type === 'bundle'}
                                            <p class="text-sm mt-2">
                                                Save {offer.discount_percent}% when bought together
                                            </p>
                                        {/if}
                                    </div>
                                    
                                    <button 
                                        class="btn btn-primary btn-sm"
                                        disabled={loading}
                                        on:click={() => applyOffer(offer)}
                                    >
                                        {#if loading}
                                            <span class="loading loading-spinner loading-xs"></span>
                                        {:else}
                                            Apply
                                        {/if}
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    {:else if !loading}
        <div class="text-center py-4 text-gray-500">
            No additional offers available
        </div>
    {/if}

    {#if loading}
        <div class="flex justify-center py-4">
            <span class="loading loading-spinner loading-md"></span>
        </div>
    {/if}
</div>

<style>
    .badge {
        text-transform: capitalize;
    }
</style> 