<script>
  import "../app.css";
  // import Footer from "../lib/components/Footer.svelte"
  import Navigation from '../lib/components/Navigation.svelte';
  import NProgress from 'nprogress';
  import 'nprogress/nprogress.css';
  import { navigating, page } from "$app/stores";
  import { onMount } from 'svelte';
  import { user } from "$lib/stores/auth";
  // import Login from "$lib/components/Login.svelte";
  // import AlertContainer from "$lib/components/AlertContainer.svelte";
  // import { checkUser } from "$lib/stores/auth";

  $: isMainPage = $page.url.pathname.includes("admin");

  // checkUser();

  let loading = true;
  let isAuthenticated = false;
  let showLogin = false;

  let Login, Footer, AlertContainer;



  onMount(async () => {
    Login = (await import("$lib/components/Login.svelte")).default;
    Footer = (await import("$lib/components/Footer.svelte")).default;
    AlertContainer = (await import("$lib/components/AlertContainer.svelte")).default;
  });


  // const protectedRoutes = ["/checkout", "/profile", "/settings", "/admin"];


  $: if (user) {
    loading = true;
    const unsubscribe = user.subscribe(value => {
          isAuthenticated = value?.access_token ? true : false;
          loading = false; // Hide loading once authentication is checked
          // console.log($page.url.pathname);
          if (($page.url.pathname.includes('profile') || $page.url.pathname.includes('checkout')) && !isAuthenticated) {
            showLogin = true;
            // console.log("Redirecting to login page")
          }
          else {
            loading = false; // Hide loading once authentication is checked
            if (($page.url.pathname.includes('profile') || $page.url.pathname.includes('checkout'))) {
            showLogin = true;
            // console.log("Redirecting to login page")
            }
            showLogin = false;
          }
      });
  }






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

{#if loading}
  <!-- Show a loading indicator while checking authentication -->
  <div class="fixed inset-0 flex items-center justify-cente">
    <div class="spinner"></div> <!-- Replace with your preferred spinner -->
  </div>
{:else}

    {#if showLogin}
    <div class="flex justify-center py-4 items-center">

      {#if Login}
     <Login />
     {/if}
    </div>
    {:else}

      {#if !isMainPage}

      <Navigation />
      {/if}
      <div class={isMainPage?"":"pt-16"}> <!-- Only add padding when Navigation is present -->
        <slot />
      </div>

      {#if !isMainPage}

        {#if Footer}
        <Footer />

        {/if}
      {/if}

    {/if}

{/if}

</div>
