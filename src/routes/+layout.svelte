<script>
  import "../app.css";
  import Footer from "../lib/components/Footer.svelte"
  import Navigation from '../lib/components/Navigation.svelte';
  import NProgress from 'nprogress';
  import 'nprogress/nprogress.css';
  import { navigating } from "$app/stores";
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { user } from "$lib/stores/auth";
  import Login from "$lib/components/Login.svelte";
  import AlertContainer from "$lib/components/AlertContainer.svelte";


  $: isMainPage = $page.url.pathname === '/';

  let loading = true;
  let isAuthenticated = false;
  let showLogin = false;

  $: if (user || $page.url.pathname) {
    loading = true;
    const unsubscribe = user.subscribe(value => {
          isAuthenticated = value?.access_token ? true : false;
          loading = false; // Hide loading once authentication is checked
          // console.log($page.url.pathname);
          if (protectedRoutes.includes($page.url.pathname) && !isAuthenticated) {
              // goto('/login'); // Redirect to login page
              showLogin = true;
              console.log("Redirecting to login page")
          } else {
            showLogin = false;
          }
      });
  }



  const protectedRoutes = ["/checkout", "/profile", "/settings"];



  $: {
      if ($navigating) {
          NProgress.start();
      }
      if (!$navigating) {
          NProgress.done();
      }
  }
</script>


<AlertContainer />

{#if loading}
  <!-- Show a loading indicator while checking authentication -->
  <div class="fixed inset-0 flex items-center justify-center bg-gray-100">
    <div class="spinner"></div> <!-- Replace with your preferred spinner -->
  </div>
{:else}

    {#if showLogin}
    <div class="flex justify-center py-4 items-center">
     <Login />
    </div>
    {:else}

      {#if !isMainPage}
      <Navigation />
      {/if}
      <div class={isMainPage?"bg-base-100":"pt-20 bg-base-100"}> <!-- Only add padding when Navigation is present -->
        <slot />
      </div>

      {#if !isMainPage}
      <Footer />
      {/if}

    {/if}

{/if}