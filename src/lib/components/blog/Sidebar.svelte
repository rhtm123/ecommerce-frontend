<script>


  import { fade, fly } from 'svelte/transition';
  import blogData from '$lib/data/blog.json';

  
  let searchQuery = '';
  $: filteredPosts = blogData.posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

</script>

<!-- Search Section -->
<div class="mb-8">
    <h2 class="text-xl font-semibold mb-4">SEARCH</h2>
    <div class="form-control">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search..."
        class="input input-bordered w-full bg-white focus:outline-none focus:border-primary"
      />
    </div>
  </div>

  <!-- Categories -->
  <div class="mb-8">
    <h2 class="text-xl font-semibold mb-4">CATEGORIES</h2>
    <div class="flex flex-col gap-2">
      {#each blogData.categories as category}
        <a 
          href={`/blog/category/${category.slug}`}
          class="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
        >
          <span>{category.name}</span>
          <span class="text-gray-500">({blogData.posts.filter(p => p.category === category.slug).length})</span>
        </a>
      {/each}
    </div>
  </div>

  <!-- Latest Posts -->
  <div class="mb-8">
    <h2 class="text-xl font-semibold mb-4">LATEST POST</h2>
    <div class="flex flex-col gap-4">
      {#each blogData.posts.slice(0, 4) as post}
        <a 
          href={`/blog/${post.slug}`} 
          class="flex gap-4 group"
          in:fade
        >
          <img src={post.image} alt={post.title} class="w-24 h-24 object-cover rounded" />
          <div>
            <h3 class="font-semibold group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p class="text-sm text-gray-500">{new Date(post.date).toLocaleDateString()}</p>
          </div>
        </a>
      {/each}
    </div>
  </div>

  <!-- Tags -->
  <div>
    <h2 class="text-xl font-semibold mb-4">TAGS</h2>
    <div class="flex flex-wrap gap-2">
      {#each blogData.tags as tag}
        <a 
          href={`/blog/tag/${tag.toLowerCase().replace(' ', '-')}`}
          class="px-4 py-2 bg-gray-100 hover:bg-primary   transition-colors rounded-full text-sm"
        >
          {tag}
        </a>
      {/each}
    </div>
  </div>