<script>
    import Login from "$lib/components/Login.svelte";
    import { user } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    onMount(() => {
        // Check if user is already logged in
        const unsubscribe = user.subscribe(value => {
            if (value) {
                goto('/home'); // Redirect to home if user is logged in
            }
        });

        return () => {
            unsubscribe(); // Cleanup subscription
        };
    });
</script>

<Login />