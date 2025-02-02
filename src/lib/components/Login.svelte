<script>
    import { PUBLIC_API_URL, PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
    import { onMount } from "svelte";
    import { loginUser } from '../stores/auth';
    
    let googleToken = '';
    let username = '';
    let password = '';
    let errorMessage = '';

    function handleCredentialResponse(response) {
        googleToken = response.credential;

        fetch(`${PUBLIC_API_URL}/user/auth/google/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: googleToken }),
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.access_token) {
                loginUser(data);
            } else {
                errorMessage = 'Login failed: ' + data.error;
            }
        })
        .catch((err) => {
            console.error('Error:', err);
            errorMessage = 'Failed to connect to the server.';
        });
    }

    function handleLogin(event) {
        event.preventDefault();
        fetch(`${PUBLIC_API_URL}/user/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.access_token) {
                loginUser(data);
            } else {
                errorMessage = 'Login failed: ' + data.error;
            }
        })
        .catch((err) => {
            console.error('Error:', err);
            errorMessage = 'Failed to connect to the server.';
        });
    }

    function initializeGoogleSignIn() {
        google.accounts.id.initialize({
            client_id: PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
        });
        google.accounts.id.renderButton(
            document.getElementById('googleSignInDiv'),
            { theme: 'outline', size: 'large' }
        );
    }

    onMount(() => {
        initializeGoogleSignIn();
    });
</script>

<div class="min-h-screen flex items-center justify-center bg-base-100">
    <div class="card w-96 bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">Login</h2>
            {#if errorMessage}
                <div class="alert alert-error">
                    <div class="flex-1">
                        <label>{errorMessage}</label>
                    </div>
                </div>
            {/if}
            <form on:submit={handleLogin}>
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Username</span>
                    </label>
                    <input type="text" placeholder="Username" bind:value={username} class="input input-bordered" required />
                </div>
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Password</span>
                    </label>
                    <input type="password" placeholder="Password" bind:value={password} class="input input-bordered" required />
                </div>
                <div class="form-control mt-6">
                    <button type="submit" class="btn btn-primary">Login</button>
                </div>
            </form>
            <div class="divider">OR</div>
            <div id="googleSignInDiv"></div>
        </div>
    </div>
</div>