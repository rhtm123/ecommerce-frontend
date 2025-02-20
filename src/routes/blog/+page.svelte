<script>
  import { fade, fly } from 'svelte/transition';

  import Blogs from '$lib/components/blog/Blogs.svelte';

</script>

<!-- Blog Header Banner -->
<div class="mx-4 md:mx-8">
  <div class="text-sm breadcrumbs text-gray-600">
    <ul>
        <li><a href="/">Home</a></li>
        <li>Blog</li>
      </ul>
</div>



      <!-- Blog Posts Grid -->
      <Blogs />

</div>