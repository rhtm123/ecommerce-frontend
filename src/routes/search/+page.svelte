<script>
  import SearchResults from '$lib/components/SearchResults.svelte';
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>Search Results for "{$page.url.searchParams.get('q')}"</title>
</svelte:head>

<main class="container mx-auto px-4 py-8">
  <div class="breadcrumbs text-sm mb-6">
    <ul>
      <li><a href="/">Home</a></li>
      <li>Search Results for "{$page.url.searchParams.get('q')}"</li>
    </ul>
  </div>

  <SearchResults searchQuery={$page.url.searchParams.get('q')} />
</main>