<script>
    import { onMount } from "svelte";
  
    // Set SEO meta tags
    onMount(() => {
      document.title = "Contact Us - Naigaon Market";
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute(
          "content",
          "Get in touch with Naigaon Market. Contact us for support, business inquiries, or feedback."
        );
    });
  
    let name = "";
    let email = "";
    let message = "";
    let error = "";
  
    const submitForm = () => {
      if (!name || !email || !message) {
        error = "All fields are required.";
        return;
      }
      error = "";
      alert("Your message has been sent!");
      name = "";
      email = "";
      message = "";
    };
  </script>
  
  <svelte:head>
    <title>Contact Us - Naigaon Market</title>
    <meta
      name="description"
      content="Get in touch with Naigaon Market. Contact us for support, business inquiries, or feedback."
    />
    <meta
      name="keywords"
      content="Naigaon Market, contact us, customer support, business inquiries, feedback"
    />
    <meta name="author" content="Naigaon Market" />
    <meta property="og:title" content="Contact Us - Naigaon Market" />
    <meta
      property="og:description"
      content="Get in touch with Naigaon Market. Contact us for support, business inquiries, or feedback."
    />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://naigaonmarket.com/contact" />
  </svelte:head>
  
  <div class="min-h-screen bg-gray-100 py-12">
    <div class="container mx-auto px-4">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p class="text-lg text-gray-600">
          Have questions? We'd love to hear from you!
        </p>
      </div>
  
      <!-- Contact Form -->
      <div class="bg-white rounded-lg shadow p-8 max-w-lg mx-auto">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Send us a message</h2>
  
        {#if error}
          <p class="text-red-500 mb-4">{error}</p>
        {/if}
  
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Name</label>
          <input
            type="text"
            bind:value={name}
            class="input input-bordered w-full"
            placeholder="Your Name"
          />
        </div>
  
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            bind:value={email}
            class="input input-bordered w-full"
            placeholder="Your Email"
          />
        </div>
  
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Message</label>
          <textarea
            bind:value={message}
            class="textarea textarea-bordered w-full"
            placeholder="Your Message"
            rows="4"
          ></textarea>
        </div>
  
        <button class="btn btn-primary w-full" on:click={submitForm}>
          Send Message
        </button>
      </div>
  
      <!-- Contact Details -->
      <div class="text-center mt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Other ways to contact us</h2>
        <p class="text-gray-600">
          📧 Email: <a href="mailto:naigaonmarket@gmail.com" class="text-blue-500">naigaonmarket@gmail.com</a>
        </p>
        <p class="text-gray-600 py-2">
          📍 Address: 005 Jay Vijay Building 3, Naigaon East, Mumbai, India
        </p>
      </div>
    </div>
  </div>
  