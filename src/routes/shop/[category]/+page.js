import { error } from '@sveltejs/kit';
import productData from '../../../lib/data/product.json';

export function load({ params }) {
  const validCategories = productData.categories.map(cat => cat.slug);

  if (!validCategories.includes(params.category)) {
    throw error(404, 'Category not found');
  }

  return {
    category: params.category
  };
}