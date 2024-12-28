<script>
  import { page } from '$app/stores';
  import Comments from '$lib/components/Comments.svelte';
  import blogData from '$lib/data/blog.json';
  
  $: post = blogData.posts.find(p => p.slug === $page.params.slug);
  $: category = blogData.categories.find(c => c.slug === post?.category);
</script>

{#if post}
  <article class="container text-black mx-auto px-4 py-8 max-w-4xl">
    <!-- Header -->
    <header class="mb-8">
      <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <a href={`/blog/category/${category.slug}`} class="badge badge-primary">
          {category.name}
        </a>
        <span>•</span>
        <span>{post.readTime}</span>
        <span>•</span>
        <span>{new Date(post.date).toLocaleDateString()}</span>
      </div>
      <h1 class="text-4xl font-bold mb-4">{post.title}</h1>
      <div class="flex items-center gap-4">
        <div class="avatar">
          <div class="w-12 h-12 rounded-full bg-gray-200"></div>
        </div>
        <div>
          <div class="font-medium">{post.author}</div>
          <div class="text-sm text-gray-600">Author</div>
        </div>
      </div>
    </header>

    <!-- Featured Image -->
    <img 
      src={post.image} 
      alt={post.title}
      class="w-full h-[400px] object-cover rounded-lg mb-8"
    />

    <!-- Content -->
    <div class="prose max-w-none">
      {@html post.content}
    </div>

    <!-- Tags -->
    <div class="mt-8">
      <div class="flex flex-wrap gap-2">
        {#each post.tags as tag}
          <a 
            href={`/blog/tag/${tag.toLowerCase().replace(' ', '-')}`}
            class="badge badge-outline hover:badge-primary transition-colors"
          >
            {tag}
          </a>
        {/each}
      </div>
    </div>

    <!-- Comments Section -->
    <Comments comments={post.comments} />
  </article>
{:else}
  <div class="container mx-auto px-4 py-8 text-center">
    <h1 class="text-2xl font-bold">Post not found</h1>
  </div>
{/if} 