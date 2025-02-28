<script>
  import { page } from '$app/stores';
  import { fade, fly } from 'svelte/transition';

  import NotFound from '$lib/components/error/NotFound.svelte';
  import Blogs from '$lib/components/blog/Blogs.svelte';
  import Sidebar from '$lib/components/blog/Sidebar.svelte';

  export let data;

  $: tag = data?.tag;

</script>

{#if data?.error}
  <NotFound />
{:else}

<!-- Tag Header Banner -->

  <div class="text-sm breadcrumbs text-gray-600">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/blog">Blog</a></li>
        <li>Tag: {tag?.name}</li>
      </ul>

<Blogs tag_id={tag.id} />


  </div>

{/if}