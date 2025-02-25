import { PUBLIC_API_URL } from '$env/static/public';
import { PUBLIC_ESTORE_ID } from '$env/static/public';
import { myFetch } from '$lib/utils/myFetch';
import { categoryApi } from '$lib/services/categoryApi';


// export const hydrate = false;

export const prerender = true;


export async function load() {
  
  let recentReviews = [];
  let bestProducts = [];
  let brands = [];
  let newProducts = [];
  let mainCategories = [];




  try{
    let url = `${PUBLIC_API_URL}/review/reviews/?page_size=6&estore_id=${PUBLIC_ESTORE_ID}&ordering=-id`;
    let data1 = await myFetch(url);
    recentReviews = data1.results; // Ensure this matches the API response structure
  
  } catch(e) { 

  }


  let url1 = PUBLIC_API_URL + "/product/product-listings/?page=1&page_size=12&ordering=-popularity";
    // console.log(url);
    try {
      let data = await myFetch(url1);
      bestProducts = data.results;
    } catch (e) {
      console.log(e, "Error fetching data");
    }


    try {
        let data = await myFetch(`${PUBLIC_API_URL}/user/entities/?entity_type=brand`);
        brands = data.results;
      } catch (e) {
        
      } 

      
      try {
        let url2 = PUBLIC_API_URL + "/product/product-listings/?page=1&page_size=12&ordering=-id";
        // console.log(url);
        let data = await myFetch(url2);
        // console.log(data);
        newProducts = data.results;
        
      } catch (e) {
        console.log(e, "Error fetching data");
      }

      try {
        let data = await categoryApi.getMainCategories();
        mainCategories = data.results;
    
      } catch (e) {

      }

    let heroProducts = []

    let url3 = PUBLIC_API_URL + "/product/product-listings/?page=1&page_size=5&featured=true&ordering=-popularity";
    try {
      let data = await myFetch(url3);
      heroProducts = data.results;
    } catch (e) {
      console.log(e, "Error fetching data");
    }

  return {
    recentReviews: recentReviews,
    bestProducts:bestProducts,
    brands: brands,
    newProducts: newProducts,
    mainCategories: mainCategories,
    heroProducts: heroProducts
  };
}