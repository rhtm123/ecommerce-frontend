import { writable } from 'svelte/store';

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
    const existingItem = items.find(item => item.id === product.id);
    if (existingItem) {
      return items.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }
    return [...items, { ...product, quantity: 1 }];
  });
}
