   // src/routes/product/[id]/+page.js
   import { error } from '@sveltejs/kit';
   import { productApi } from '$lib/services/productApi';

   export async function load({ params }) {
     
       const product_listing = await productApi.getProduct(params.slug);
      //  console.log(product_listing);
      //  const relatedProducts = await productApi.getProducts({
      //    category_id: product.category?.id,
      //    page_size: 4,
      //    exclude: params.id
      //  });

       return {
         product_listing,
        //  relatedProducts: [],
         category: product_listing.category,
       };
      
   }