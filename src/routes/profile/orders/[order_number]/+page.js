   // src/routes/product/[id]/+page.js

   export async function load({ params }) {
     
      //  console.log(product);
      //  const relatedProducts = await productApi.getProducts({
      //    category_id: product.category?.id,
      //    page_size: 4,
      //    exclude: params.id
      //  });

       return {
        //  relatedProducts: [],
       order_number: params.order_number
       };
      
   }