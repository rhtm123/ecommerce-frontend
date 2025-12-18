<script>
  import { onMount } from "svelte";

  let showGreeting = false;

  onMount(() => {
    const shown = sessionStorage.getItem("christmas_greeting");

    if (!shown) {
      showGreeting = true;
      sessionStorage.setItem("christmas_greeting", "true");

      setTimeout(() => {
        showGreeting = false;
      }, 3000); // 3 seconds
    }
  });
</script>

{#if showGreeting}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="card bg-base-100 shadow-2xl animate-scale-in">
      <div class="card-body text-center space-y-3">
        <h2 class="text-3xl font-bold text-red-500">
          🎄 Christmas is Near!
        </h2>
        <p class="text-base-content/80">
          Wishing you joy, warmth & happiness
        </p>
        <span class="text-4xl">🎁 ❄️ ⭐</span>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes scale-in {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .animate-scale-in {
    animation: scale-in 0.4s ease-out;
  }
</style>
