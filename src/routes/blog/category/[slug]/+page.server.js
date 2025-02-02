import { PUBLIC_API_URL } from '$env/static/public';
import { myFetch } from '$lib/utils/myFetch.js';

export async function load({ params }) {

  let url = `${PUBLIC_API_URL}/product/categories/slug/${params.slug}/`

  try {
    let category = await myFetch(url);

    return {
      category: category,
      error: false,
    }
  } catch (err) { 
    return {
      error: true,
    }
  }
} 