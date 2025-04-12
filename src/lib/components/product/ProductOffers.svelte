<script>
    export let product;
    import { fade, slide } from 'svelte/transition';
    import { offerApi } from '$lib/services/offerApi';
    import { cart } from '$lib/stores/cart';
    import { appliedOffer, appliedCoupon } from '$lib/stores/offers';
    import { addAlert } from '$lib/stores/alert';

    let showAllOffers = false;
    let loading = false;

    async function applyOffer(offer) {
        // Check if a coupon is already applied
        if ($appliedCoupon) {
            addAlert('Please remove the applied coupon before applying an offer', 'error');
            return;
        }

        loading = true;
        try {
            const cartItems = $cart;
            const productIds = cartItems.map(item => item.id);
            const quantities = cartItems.map(item => item.quantity);
            
            const validation = await offerApi.validateOffer(
                offer.id,
                productIds,
                quantities
            );

            if (validation.is_valid) {
                appliedOffer.set({
                    ...offer,
                    discount_amount: parseFloat(validation.discount_amount) || 0
                });
                addAlert('Offer applied successfully', 'success');
            } else {
                addAlert(validation.message, 'error');
            }
        } catch (error) {
            addAlert('Failed to apply offer', 'error');
        } finally {
            loading = false;
        }
    }
</script>

{#if product?.active_offers?.length > 0}
<div class="bg-white rounded-lg shadow-sm p-4 mb-4" in:fade>
    <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Available Offers</h3>
        {#if product.active_offers.length > 2}
            <button 
                class="text-sm text-primary hover:underline"
                on:click={() => showAllOffers = !showAllOffers}
            >
                {showAllOffers ? 'Show Less' : 'View All'}
            </button>
        {/if}
    </div>

    <div class="space-y-4">
        {#each product.active_offers.slice(0, showAllOffers ? undefined : 2) as offer}
            <div 
                class="border rounded-lg p-4 hover:border-primary transition-colors"
                in:slide
            >
                <div class="flex justify-between items-start">
                    <div>
                        <span class="badge badge-primary mb-2">{offer.offer_type}</span>
                        <h4 class="font-semibold">{offer.name}</h4>
                        <p class="text-sm text-gray-600 mt-1">{offer.description}</p>
                        
                        {#if offer.offer_type === 'buy_x_get_y'}
                            <p class="text-sm mt-2">
                                Buy {offer.buy_quantity} items, get {offer.get_quantity} items at {offer.get_discount_percent}% off
                            </p>
                        {:else if offer.offer_type === 'bundle'}
                            <p class="text-sm mt-2">
                                Save when bought together
                            </p>
                        {/if}
                    </div>
                    
                    <button 
                        class="btn btn-primary btn-sm"
                        disabled={loading || $appliedCoupon !== null}
                        on:click={() => applyOffer(offer)}
                    >
                        {#if loading}
                            <span class="loading loading-spinner loading-xs"></span>
                        {:else if $appliedCoupon}
                            Remove Coupon First
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

{#if product?.applicable_coupons?.length > 0}
<div class="bg-white rounded-lg shadow-sm p-4" in:fade>
    <h3 class="text-lg font-semibold mb-4">Available Coupons</h3>
    
    <div class="space-y-4">
        {#each product.applicable_coupons as coupon}
            <div class="border rounded-lg p-4 hover:border-primary transition-colors">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-lg font-bold text-primary">{coupon.code}</span>
                            <span class="badge badge-ghost">
                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                            </span>
                        </div>
                        {#if coupon.max_discount_amount}
                            <p class="text-sm text-gray-600">
                                Maximum discount: ₹{coupon.max_discount_amount}
                            </p>
                        {/if}
                    </div>
                    <button 
                        class="btn btn-outline btn-primary btn-sm"
                        disabled={$appliedOffer !== null}
                        on:click={() => {
                            if ($appliedOffer) {
                                addAlert('Please remove the applied offer before copying a coupon code', 'error');
                                return;
                            }
                            navigator.clipboard.writeText(coupon.code);
                            addAlert('Coupon code copied!', 'success');
                        }}
                    >
                        {#if $appliedOffer}
                            Remove Offer First
                        {:else}
                            Copy Code
                        {/if}
                    </button>
                </div>
            </div>
        {/each}
    </div>
</div>
{/if}

<style>
    .badge {
        text-transform: capitalize;
    }
</style> 