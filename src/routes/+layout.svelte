<script>
  import "../app.css";
  import Footer from "../lib/components/Footer.svelte"
  import Navigation from '../lib/components/Navigation.svelte';
  import NProgress from 'nprogress';
  import 'nprogress/nprogress.css';
  import { navigating } from "$app/stores";
  import { page } from '$app/stores';

  $: isMainPage = $page.url.pathname === '/';

  $: {
      if ($navigating) {
          NProgress.start();
      }
      if (!$navigating) {
          NProgress.done();
      }
  }
</script>

{#if !isMainPage}
  <Navigation />
{/if}

<div class={!isMainPage ? "pt-20 bg-base-100" : ""}> <!-- Only add padding when Navigation is present -->
  <slot />
</div>

{#if !isMainPage}
  <Footer />
{/if}