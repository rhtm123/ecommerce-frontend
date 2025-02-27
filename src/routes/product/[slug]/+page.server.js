// src/routes/product/[id]/+page.server.js
import { error } from '@sveltejs/kit';
import { productApi } from '$lib/services/productApi';

export async function load({ params }) {
    try {
        const product_listing = await productApi.getProduct(params.slug);
        
        if (!product_listing) {
            throw error(404, 'Product not found');
        }

        return {
            product_listing,
            category: product_listing.category,
        };
    } catch (err) {
        throw error(500, 'Failed to fetch product data');
    }
}
