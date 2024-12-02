
<script>
    import "../app.css";
    // import Footer from "../components/Footer.svelte";
    // import Navbar from "../components/Navbar.svelte";
    import NProgress from 'nprogress';
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


<slot />
