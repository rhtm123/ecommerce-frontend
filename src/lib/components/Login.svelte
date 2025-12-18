<script>
    import { PUBLIC_API_URL, PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
    import { onMount } from "svelte";
    import { loginUser } from '$lib/stores/auth';
    import { myFetch } from '$lib/utils/myFetch';
    import { goto } from '$app/navigation'; // Import the goto function for navigation

    export let redirectAfterLogin;

    let googleToken = '';
    let username = '';
    let password = '';
    let errorMessage = '';
    let isLoading = false; // Add a loading state

    function handleCredentialResponse(response) {
        googleToken = response.credential;
        isLoading = true; // Start loading

        // console.log('JWT:', googleToken);

        fetch(`${PUBLIC_API_URL}/user/auth/google/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: googleToken }),
            credentials: 'include' 
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.access_token) {
                loginUser(data);
                const urlParams = new URLSearchParams(window.location.search);
                const nextPage = urlParams.get('next'); // Get the 'next' query parameter

                if (!data.mobile_verified) {
                    goto('/verify-mobile?next=' + encodeURIComponent(nextPage));
                } else {
                    redirectAfterLogin(); // Only redirect if mobile is verified
                }
            } else {
                errorMessage = 'Login failed: ' + data.error;
            }
        })
        .catch((err) => {
            console.error('Error:', err);
            errorMessage = 'Failed to connect to the server.';
        })
        .finally(() => {
            isLoading = false; // Stop loading
        });
    }

    async function handleLogin(event) {
        event.preventDefault();
        isLoading = true; // Start loading

        try{

            const res = await fetch("http://localhost:8000/api/user/auth/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password }),
            credentials: "include", // 🔥 This is essential!
        });


        let data = await res.json();
        

        if (data.access_token) {
            loginUser(data);
            redirectAfterLogin();
            // if (!data.user.mobile_verified) {
            //     goto('/verify-mobile?next=' + encodeURIComponent(redirectAfterLogin));
            // } else {
            //     redirectAfterLogin(); // Only redirect if mobile is verified
            // }
        } else {
            errorMessage = 'Login failed: ' + data.error;
        }
        } catch (e) { 

        } finally { 
            isLoading = false; // Stop loading
        }
    }
    
    function initializeGoogleSignIn() {
        google.accounts.id.initialize({
            client_id: PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: true, // enables automatic sign-in
            // cancel_on_tap_outside: false,
        });


        google.accounts.id.renderButton(
            document.getElementById('googleSignInDiv'),
            { theme: 'outline', size: 'large' }
        );

        // window.google?.accounts.id.prompt(); // shows the One Tap prompt
    }

    onMount(() => {
        initializeGoogleSignIn();
    });
</script>

<div class="min-h-screen flex items-center justify-center bg-base-200 px-4">
  <div class="card w-full max-w-sm bg-base-100 ">
    <div class="card-body space-y-4">

      <!-- Header -->
      <div class="text-center">
        <h2 class="text-2xl font-bold">Welcome Back</h2>
        <p class="text-sm text-base-content/70">
          Sign in to continue
        </p>
      </div>

      <!-- Error -->
      {#if errorMessage}
        <div class="alert alert-error text-sm">
          <span>{errorMessage}</span>
        </div>
      {/if}

      <!-- Google Sign In -->
      <div id="googleSignInDiv" class="justify-center w-full"></div>

      <div class="divider text-xs">OR CONTINUE WITH</div>

      <!-- Login Form -->
      <form on:submit={handleLogin} class="space-y-3">

        <!-- Username -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Username</span>
          </label>
          <input
            type="text"
            placeholder="Enter your username"
            bind:value={username}
            class="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <!-- Password -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Password</span>
            <a href="/forgot-password" class="label-text-alt link link-hover">
              Forgot?
            </a>
          </label>
          <input
            type="password"
            placeholder="••••••••"
            bind:value={password}
            class="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="btn btn-primary w-full mt-4"
          disabled={isLoading}
        >
          {#if isLoading}
            <span class="loading loading-spinner loading-sm"></span>
            Logging in...
          {:else}
            Login
          {/if}
        </button>
      </form>

      <!-- Footer -->
      <p class="text-center text-sm text-base-content/70">
        {`Don’t have an account?`}
        <a href="/register" class="link link-primary font-medium">
          Sign up
        </a>
      </p>

    </div>
  </div>
</div>
