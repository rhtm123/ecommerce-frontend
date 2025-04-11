import { writable } from 'svelte/store';

export const appliedCoupon = writable(null);
export const appliedOffers = writable([]);

// Store for cart discounts
export const cartDiscounts = writable({
    couponDiscount: 0,
    offerDiscounts: [],
    totalDiscount: 0
});

// Function to update total discount
cartDiscounts.subscribe(discounts => {
    const offerTotal = discounts.offerDiscounts.reduce((sum, d) => sum + d.amount, 0);
    discounts.totalDiscount = discounts.couponDiscount + offerTotal;
}); 