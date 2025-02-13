import { PUBLIC_API_URL } from '$env/static/public';
import { PUBLIC_ESTORE_ID } from '$env/static/public';
import { myFetch } from '$lib/utils/myFetch';

export const categoryApi = {
    // Get all products with filters

    getParentsChildrenCategories: async (category_id) => {
      try{
        const data = await myFetch(`${PUBLIC_API_URL}/product/categories/parents-children/${category_id}/`);
        return data  
      } catch(e){ 
        throw new Error('Failed to fetch');

      }
    },

    getMainCategories: async () => {

      try{
        const data = await myFetch(`${PUBLIC_API_URL}/product/categories/?page=1&page_size=10&estore_id=${PUBLIC_ESTORE_ID}&level=1`);
        return data  
      } catch(e){ 
        throw new Error('Failed to fetch');

      }
    },
  
    // Get single product
    getCategorySlug: async (slug) => {
      try{
      const data = await myFetch(`${PUBLIC_API_URL}/product/categories/slug/${slug}/`);
      return data  
      }
      catch(err ){
        throw new Error('Failed to fetch');
      }
    },
  };