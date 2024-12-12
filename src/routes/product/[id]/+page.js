   // src/routes/product/[id]/+page.js
   import { error } from '@sveltejs/kit';
   import productData from '../../../lib/data/product.json';

   export function load({ params }) {
    // console.log(params.id);
    // console.log(productData.products);
    // console.log(productData.products.find(p => p.id.toString() === params.id));
     const product = productData.products.find(p => p.id.toString() === params.id);
    //  console.log(product);
     
     if (!product) {
       throw error(404, 'Product not found');
     }

     const relatedProducts = productData.products
       .filter(p => p.category === product.category && p.id !== product.id)
       .slice(0, 4);

     return {
       product,
       relatedProducts
     };
   }