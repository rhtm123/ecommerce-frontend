<script>
  import { page } from '$app/stores';
  import { fade, fly } from 'svelte/transition';
  import blogData from '$lib/data/blog.json';
  
  $: category = blogData.categories.find(c => c.slug === $page.params.slug);
  $: posts = blogData.posts.filter(post => post.category === $page.params.slug);
</script>

<!-- Category Header Banner -->
<div class="mx-4 md:mx-8">

  <div class="text-sm breadcrumbs text-gray-600">
    <ul>
        <li><a href="/home">Home</a></li>
        <li><a href="/blog">Blog</a></li>
        <li>Category : {category?.name}</li>
      </ul>
</div>

  <!-- <div class="container text-black mx-auto px-4 py-16">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-bold mb-2">POSTS TAGGED "{category?.name}"</h1>
        <div class="flex items-center gap-2">
          <a href="/home" class="text-gray-600 hover:text-primary">Home</a>
          <span class="text-gray-400">/</span>
          <a href="/blog" class="text-gray-600 hover:text-primary">Blog</a>
          <span class="text-gray-400">/</span>
          <span class="text-primary">{category?.name}</span>
        </div>
      </div>
    </div>
  </div> -->
</div>

<div class="text-black mx-auto px-4">
  <div class="flex flex-col lg:flex-row gap-8">
    <!-- Main Content -->
    <div class="lg:w-2/3">
      {#if category && posts.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          {#each posts as post, index (post.id)}
            <article 
              class="card bg-white hover:shadow-lg transition-all duration-300"
              in:fly="{{ y: 50, duration: 500, delay: index * 100 }}"
            >
              <figure class="relative h-64">
                <img src={post.image} alt={post.title} class="w-full h-full object-cover" />
                <div class="absolute top-4 left-4 flex gap-2">
                  {#each post.tags.slice(0, 1) as tag}
                    <span class="badge badge-primary">{tag}</span>
                  {/each}
                </div>
              </figure>
              <div class="p-6">
                <div class="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span>{post.readTime}</span>
                </div>
                <h3 class="text-xl font-bold mb-3 hover:text-primary transition-colors">
                  <a href={`/blog/${post.slug}`}>{post.title}</a>
                </h3>
                <p class="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                <a 
                  href={`/blog/${post.slug}`} 
                  class="text-primary font-semibold hover:underline inline-flex items-center gap-2"
                >
                  READ MORE
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </a>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <div class="text-center py-12">
          <h2 class="text-2xl font-bold mb-4">No posts found</h2>
          <p class="text-gray-600">There are no posts in this category yet.</p>
        </div>
      {/if}
    </div>

    <!-- Sidebar -->
    <div class="lg:w-1/3">
      <!-- Categories -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">CATEGORIES</h2>
        <div class="flex flex-col gap-2">
          {#each blogData.categories as cat}
            <a 
              href={`/blog/category/${cat.slug}`}
              class="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
              class:text-primary={cat.slug === category?.slug}
            >
              <span>{cat.name}</span>
              <span class="text-gray-500">({blogData.posts.filter(p => p.category === cat.slug).length})</span>
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
              class="px-4 py-2 bg-gray-100 hover:bg-primary hover:text-white transition-colors rounded-full text-sm"
            >
              {tag}
            </a>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div> 