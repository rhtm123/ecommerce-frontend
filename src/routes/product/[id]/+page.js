   // src/routes/product/[id]/+page.js
   import { error } from '@sveltejs/kit';
   import { productApi } from '$lib/services/api';

   export async function load({ params }) {
     try {
       const product = await productApi.getProduct(params.id);
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
     } catch (err) {
       throw error(404, 'Product not found');
     }
   }