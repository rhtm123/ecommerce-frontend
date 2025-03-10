<script>
  import "../app.css";
  // import Footer from "../lib/components/Footer.svelte"
  import Navigation from '../lib/components/Navigation.svelte';
  import NProgress from 'nprogress';
  import 'nprogress/nprogress.css';
  import { navigating, page } from "$app/stores";
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { PUBLIC_ENV } from "$env/dynamic/public";

  // Add this to your existing layout file
  onMount(() => {
    const unsubscribe = user.subscribe(userData => {
      // Check if user is logged in but mobile is not verified
      if (userData && !userData.mobile_verified && window.location.pathname !== '/verify-mobile') {
        // Don't redirect if already on the verification page or login page
        if (!['/verify-mobile', '/login'].includes(window.location.pathname)) {
          goto('/verify-mobile?next=' + window.location.pathname);
        }
      }
    });
    
    return () => {
      unsubscribe();
    };
  });
  $: isAdmin = $page.url.pathname.includes("admin");

  let Footer, AlertContainer, TestBanner;

  onMount(async () => {
    Footer = (await import("$lib/components/Footer.svelte")).default;
    AlertContainer = (await import("$lib/components/AlertContainer.svelte")).default;
    TestBanner = (await import("$lib/components/TestBanner.svelte")).default

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

{#if (PUBLIC_ENV!="beta")}
  <TestBanner />
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
