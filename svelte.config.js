import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  kit: {
    adapter: adapter({
      // Optional: Customize Vercel deployment options
    }),
  },
  preprocess: vitePreprocess(),
};