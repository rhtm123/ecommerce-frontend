
<script>
    import "../app.css";
    import Footer from "$lib/components/Footer.svelte";
    // import Navbar from "../components/Navbar.svelte";
    import NProgress from 'nprogress';
    import Navigation from '$lib/components/Navigation.svelte';
    import 'nprogress/nprogress.css';
    import { navigating } from "$app/stores";

    $: {
		if ($navigating) {
			NProgress.start();
		}
		if (!$navigating) {
			NProgress.done();
		}
	}


</script>


<Navigation />

<div class="pt-20"> <!-- Added padding-top to prevent content from hiding under fixed navbar -->
  <slot />
</div>

<Footer />

