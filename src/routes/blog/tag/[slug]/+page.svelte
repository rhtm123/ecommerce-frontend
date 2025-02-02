<script>
  import { page } from '$app/stores';
  import { fade, fly } from 'svelte/transition';
  import blogData from '$lib/data/blog.json';

  import NotFound from '$lib/components/error/NotFound.svelte';
  import Blogs from '$lib/components/blog/Blogs.svelte';
  import Sidebar from '$lib/components/blog/Sidebar.svelte';

  export let data;

  $: tag = data?.tag;

  $: currentTag = $page.params.slug.replace('-', ' ');
  $: posts = blogData.posts.filter(post => 
    post.tags.some(tag => tag.toLowerCase() === currentTag.toLowerCase())
  );
</script>

{#if data?.error}
  <NotFound />
{:else}



<!-- Tag Header Banner -->
<div class="mx-4 mx-8">

  <div class="text-sm breadcrumbs text-gray-600">
    <ul>
        <li><a href="/home">Home</a></li>
        <li><a href="/blog">Blog</a></li>
        <li>Tag: {tag?.name}</li>
      </ul>
</div>

</div>

<div class="text-black mx-auto px-4">
  <div class="flex flex-col lg:flex-row gap-8">
    <!-- Main Content -->
    <div class="lg:w-2/3">
      <Blogs tag_id={tag.id} />
    </div>

    <!-- Sidebar -->
    <div class="lg:w-1/3">
      <!-- Categories -->
      <Sidebar />
    </div>
  </div>
</div> 

{/if}