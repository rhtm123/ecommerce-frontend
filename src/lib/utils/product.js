import productData from '../data/product.json';

export function getAllProducts() {
    return productData.products;
}

export function getProductsByCategory(category) {
  return productData.products.filter(product => product.category === category);
}

export function getBestSellingProducts() {
  return productData.products.filter(product => product.isBestSeller);
}

export function getProductsByAge(ageRange) {
  return productData.products.filter(product => product.ageRange === ageRange);
}

export function getAllCategories() {
  return productData.categories;
}

export function getAgeCategories() {
  return productData.ageCategories;
}