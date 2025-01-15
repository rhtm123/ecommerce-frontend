import { PUBLIC_API_URL } from '$env/static/public';

const API_BASE_URL = PUBLIC_API_URL.endsWith('/') ? PUBLIC_API_URL.slice(0, -1) : PUBLIC_API_URL;

const processCategories = (categories) => {
  // Create a map to store product counts
  const categoryCounts = {};
  
  // First pass: Create a map of all categories
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = {
      ...cat,
      children: [],
      productCount: 0
    };
    return acc;
  }, {});

  // Second pass: Build the tree structure
  const rootCategories = [];
  categories.forEach(cat => {
    const category = categoryMap[cat.id];
    
    if (cat.level === 1) {
      rootCategories.push(category);
    } else {
      // Find parent category by name prefix
      const parentName = cat.name.split(' - ')[0];
      const parent = Object.values(categoryMap).find(c => 
        c.level === cat.level - 1 && cat.name.startsWith(c.name)
      );
      
      if (parent) {
        parent.children.push(category);
      }
    }
  });

  return rootCategories;
};

export const productApi = {
    // Get all products with filters
    getProducts: async (params = {}) => {
      try {
        const queryParams = new URLSearchParams({
          page: params.page || '1',
          page_size: params.pageSize || '10',
          ...(params.category_id && { category_id: params.category_id.toString() }),
          ...(params.search && { search: params.search }),
          ...(params.ordering && { ordering: params.ordering }),
          ...(params.brand_ids && { brand_ids: params.brand_ids }),
          ...(params.min_price && { min_price: params.min_price }),
          ...(params.max_price && { max_price: params.max_price }),
          ...(params.feature_filters && { feature_filters: JSON.stringify(params.feature_filters) })
        });
  
        const response = await fetch(`${API_BASE_URL}/product/product_listings/?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
  
        // Normalize the data
        return {
          ...data,
          results: data.results.map(product => ({
            ...product,
            rating: typeof product.rating === 'number' ? 
              Math.min(Math.max(Math.round(product.rating), 0), 5) : 0
          }))
        };
      } catch (error) {
        console.error('Error fetching products:', error);
        return { results: [], count: 0 };
      }
    },
  
    // Get single product
    getProduct: async (id) => {
      const response = await fetch(`${API_BASE_URL}/product/product_listings/${id}/`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    },
  
    // Get filter options
    getFilters: async (params = {}) => {
      const queryParams = new URLSearchParams({
        ...(params.category_id && { category_id: params.category_id }),
        ...(params.brand_ids && { brand_ids: params.brand_ids }),
        ...(params.min_price && { min_price: params.min_price }),
        ...(params.max_price && { max_price: params.max_price })
      });
      const response = await fetch(`${API_BASE_URL}/product/sidebar_filters/?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch filters');
      return response.json();
    },
  
    // Get categories
    getCategories: async () => {
      const response = await fetch(`${API_BASE_URL}/product/categories/`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  };