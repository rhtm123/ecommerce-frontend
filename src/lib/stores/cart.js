import { writable } from 'svelte/store';
import { addAlert } from './alert';

import { cartLimit } from '$lib/utils/myConstants';

// Function to get cart data from localStorage
function getCartFromLocalStorage() {
  if (typeof localStorage !== 'undefined') {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
  }
  return [];
}

// Initialize cart store with data from localStorage
export const cart = writable(getCartFromLocalStorage());

// Subscribe to store changes and update localStorage
cart.subscribe(items => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(items));
  }
});

export function addToCart(product) {
  cart.update(items => {
    // Calculate current total quantity in cart
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const existingItem = items.find(item => item.id === product.id);

    if (existingItem) {
      // Check individual item limit (10) and total cart limit (25)
      if (existingItem.quantity >= 10) {
        addAlert(`Cannot add more: Item limit (10) reached`, "error")
        // console.log(`Cannot add more of ${product.name}: Item limit (10) reached`);
        return items; // No change
      }
      if (totalQuantity >= cartLimit) {
        addAlert(`Can't add to cart: Total cart limit (${cartLimit}) reached`, "error")
        // console.log('Cannot add to cart: Total cart limit (25) reached');
        return items; // No change
      }
      // Update quantity for existing item
      addAlert(`Item Added to the Cart`, "success");
      return items.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      addAlert(`Item Added to the Cart`, "success");
      return [...items, { ...product, quantity: 1 }];
    }
  });
}