<script>
  import  Icon  from "@iconify/svelte";
  import { fly } from "svelte/transition";
</script>

<footer class="bg-base-200 py-12 relative overflow-hidden">
  <!-- Decorative Stars -->
  {#each [
      { size: "w-6 h-6", top: "top-4", right: "right-4", delay: 200 },
      { size: "w-4 h-4", top: "top-8", right: "right-12", delay: 400 },
      { size: "w-5 h-5", top: "top-2", right: "right-20", delay: 600 }
  ] as star}
      <div class="absolute {star.top} {star.right}" in:fly={{ y: -20, duration: 1000, delay: star.delay }}>
          <Icon icon="mdi:star" class="{star.size} text-yellow-300" />
      </div>
  {/each}

  <div class="mx-auto px-4 md:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Company Info -->
          <div class="space-y-4">
              <img 
                  src="/img/naigaonmarketlogo1.png" 
                  alt="Naigaon Market Logo" 
                  class="h-16"
              />
              <p class="text-sm opacity-85">
                  Naigaon Market promotes a circular economy where money spent stays within the community. It helps small businesses embrace digital tools, preparing them for larger markets, and fosters local pride.
              </p>
              <div class="text-lg font-semibold">+91-93703-94747</div>
              <address class="not-italic text-sm">
                  Address: 005, Jay Vijay Building 3, Naigaon East<br />
                  Maharashtra, India
              </address>
              <a href="mailto:support@naigaonmarket.com" class="block text-primary hover:underline">
                  naigaonmarket@gmail.com
              </a>
              <div class="flex space-x-4 mt-6">
                  {#each [
                      { name: "facebook", icon: "mdi:facebook", url:"https://www.facebook.com/profile.php?id=61573791421210" },
                    //   { name: "twitter", icon: "mdi:twitter" },
                      { name: "instagram", icon: "mdi:instagram", url:"https://www.instagram.com/naigaonmarket/" },
                      { name: "whatsapp", icon: "mdi:whatsapp", url:"https://whatsapp.com/channel/0029Vb7g3Q21Hsq2NLrtZX28 " }
                  ] as social}
                      <a href="{social?.url}" target="_blank" class="text-primary hover:text-primary-focus transition-colors">
                          <Icon icon={social.icon} class="w-6 h-6" />
                      </a>
                  {/each}
              </div>
          </div>

          <!-- Quick Links -->
          <div class="grid grid-cols-2 gap-6 text-sm">
              <div>
                  <h3 class="font-semibold text-lg mb-3">Quick Links</h3>
                  <ul class="space-y-2">
                      {#each [ "About", "Shop", "Contact", "Blog"] as link}
                          <li><a href="/{link.toLowerCase()}" class="hover:underline">{link}</a></li>
                      {/each}
                  </ul>
              </div>
              <div>
                  <h3 class="font-semibold text-lg mb-3">Resources</h3>
                  <ul class="space-y-2">
                      {#each ["Terms of Service","Privacy Policy","Shipping Policy","Return Policy",] as resource}
                          <li><a href="/{resource.toLowerCase().replace(/ /g, "-")}" class="hover:underline">{resource}</a></li>
                      {/each}
                  </ul>
              </div>
          </div>
      </div>
      
      <div class="mt-12 text-center text-xs border-t opacity-75">
          &copy; {new Date().getFullYear()} Naigaon Market. All rights reserved.
      </div>
  </div>
</footer>