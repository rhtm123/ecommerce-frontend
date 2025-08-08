export const prerender = true;

import { get } from 'svelte/store';
import estoreData from "$lib/stores/estore";

export async function load() {

  const estore = get(estoreData);

  return {
    estore
  };
}