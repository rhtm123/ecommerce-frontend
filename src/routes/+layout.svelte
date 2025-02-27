<script>
  import "../app.css";
  // import Footer from "../lib/components/Footer.svelte"
  import Navigation from '../lib/components/Navigation.svelte';
  import NProgress from 'nprogress';
  import 'nprogress/nprogress.css';
  import { navigating, page } from "$app/stores";
  import { onMount } from 'svelte';

  $: isAdmin = $page.url.pathname.includes("admin");

  let Footer, AlertContainer;

  onMount(async () => {
    Footer = (await import("$lib/components/Footer.svelte")).default;
    AlertContainer = (await import("$lib/components/AlertContainer.svelte")).default;
  });


  // const protectedRoutes = ["/checkout", "/profile", "/settings", "/admin"];

  $: {
      if ($navigating) {
          NProgress.start();
      }
      if (!$navigating) {
          NProgress.done();
      }
  }
</script>

{#if AlertContainer}
<AlertContainer />
{/if}

<div class="bg-base-100">

      {#if !isAdmin}

      <Navigation />
      {/if}
      <div class={isAdmin?"":"pt-16"}> <!-- Only add padding when Navigation is present -->
        <slot />
      </div>

      {#if !isAdmin}

        {#if Footer}
        <Footer />

        {/if}
      {/if}

</div>
