import { productApi } from '$lib/services/api';

export async function load({ params }) {
  try {
    // Get initial data
    console.log("params.category", params.category);
    const [productsData, categoriesData, filtersData] = await Promise.all([
      productApi.getProduct( params.category ),
      productApi.getCategories(),
      productApi.getFilters( params.category )
    ]);

    console.log(categoriesData);
    // console.log(params.category);
    // console.log(params.category_id);  
    return {
      products: productsData.results,
      totalProducts: productsData.count,
      category: productsData.category?.name,
      categoryId: productsData.category?.id,
      filters: filtersData,
      currentCategory: params.category_id
    };
  } catch (error) {
    console.error('Error loading shop data:', error);
    return {
      products: [],
      totalProducts: 0,
      categories: [],
      filters: {},
      currentCategory: params.category_id
    };
  }
}