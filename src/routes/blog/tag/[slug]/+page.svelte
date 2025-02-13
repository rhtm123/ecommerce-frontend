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
<div class="mx-4 md:mx-8">

  <div class="text-sm breadcrumbs text-gray-600">
    <ul>
        <li><a href="/home">Home</a></li>
        <li><a href="/blog">Blog</a></li>
        <li>Tag: {tag?.name}</li>
      </ul>
</div>

<Blogs tag_id={tag.id} />


</div>



{/if}