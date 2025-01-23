   // src/routes/product/[id]/+page.js
   import { error } from '@sveltejs/kit';
   import { productApi } from '$lib/services/api';

   export async function load({ params }) {
     
       const product = await productApi.getProduct(params.slug);
       console.log(product);
       const relatedProducts = await productApi.getProducts({
         category_id: product.category?.id,
         page_size: 4,
         exclude: params.id
       });

       return {
         product,
         relatedProducts: relatedProducts.results,
         category: product.category?.name,
         categoryId: product.category?.id
       };
      
   }