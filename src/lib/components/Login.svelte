

<script>

    import { PUBLIC_API_URL } from '$env/static/public';
    import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';

    import { onMount } from "svelte";

    import { loginUser } from '../../stores/auth';
    
    let googleToken = '';

    function handleCredentialResponse(response) {
        googleToken = response.credential;

        // console.log(googleToken);

        // Send the Google token to your backend for verification
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
                    console.error('Login failed:', data.error);
                }
            })
            .catch((err) => console.error('Error:', err));
    }

    // Initialize Google Sign-In
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

<div id="googleSignInDiv">Hello</div>
