import { PUBLIC_API_URL } from '$env/static/public';
import { PUBLIC_ESTORE_ID } from '$env/static/public';
import { myFetch } from '$lib/utils/myFetch';
import { categoryApi } from '$lib/services/categoryApi';





// export const hydrate = false;

export const prerender = true;


export async function load() {
  
  let estore;

    try {
      let url = `${PUBLIC_API_URL}/estore/estores/${PUBLIC_ESTORE_ID}`;
      let data1 = await myFetch(url);
    //   console.log("Estore data:", data1);
      estore = data1;
    } catch (e) {
      console.error("Error fetching estore data:", e);
  }





  return {

    estore: estore,
  };
}