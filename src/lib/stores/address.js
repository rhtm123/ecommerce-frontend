import { writable } from 'svelte/store';

export const shipaddresses = writable([]);


export function addToShipAddress(shipaddress) {
    shipaddresses.update(items => {
    const existingItem = items.find(item => item.id === shipaddress.id);
    if (existingItem) {
      return items.map(item =>
        item.id === shipaddress.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }
    return [{ ...shipaddress },...items];
  });
}