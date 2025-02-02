<script>
  import { fade, fly } from 'svelte/transition';

  import BlogCard from '$lib/components/blog/BlogCard.svelte';
  import Blogs from '$lib/components/blog/Blogs.svelte';

  import Sidebar from '$lib/components/blog/Sidebar.svelte';
  

</script>

<!-- Blog Header Banner -->
<div class="mx-4 md:mx-8">
  <div class="text-sm breadcrumbs text-gray-600">
    <ul>
        <li><a href="/home">Home</a></li>
        <li>Blog</li>
      </ul>
</div>


<div class="mx-auto py-2">
  <div class="flex flex-col lg:flex-row gap-8">
    <!-- Main Content -->
    <div class="lg:w-2/3">
      <!-- Blog Posts Grid -->
      <Blogs />
    </div>

    <!-- Sidebar -->
    <div class="lg:w-1/3">
      <Sidebar />
    </div>
  </div>
</div> 

</div>
