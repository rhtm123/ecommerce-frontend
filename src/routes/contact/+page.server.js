export const prerender = true;

import { PUBLIC_ESTORE_ID } from '$env/static/public';
import { PUBLIC_API_URL } from '$env/static/public';
import { myFetch } from '$lib/utils/myFetch';

export async function load() {

  let estore;

    try {
      let url = `${PUBLIC_API_URL}/estore/estores/${PUBLIC_ESTORE_ID}`;
      let data1 = await myFetch(url);
      estore = data1 || {};
    } catch (e) {
      console.error("Error fetching estore data:", e);
    }


  return {
    estore
  };
}