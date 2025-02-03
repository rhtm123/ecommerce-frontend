import { productApi } from '$lib/services/productApi';

export async function load({ url }) {
  const searchQuery = url.searchParams.get('q') || '';
  
  try {
    const initialProducts = await productApi.getProducts({
      search: searchQuery,
      pageSize: 12
    });

    return {
      initialProducts,
      searchQuery
    };
  } catch (error) {
    return {
      initialProducts: { results: [], count: 0 },
      searchQuery
    };
  }
}