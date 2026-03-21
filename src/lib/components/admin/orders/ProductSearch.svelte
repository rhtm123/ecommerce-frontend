<script>
    import { createEventDispatcher } from "svelte";
    import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from "$env/static/public";
    import { myFetch } from "$lib/utils/myFetch";

    export let selected = null;
    export let token = "";
    export let placeholder = "Search products (min 2 chars)...";

    const dispatch = createEventDispatcher();

    let searchQuery = "";
    let searchResults = [];
    let loading = false;
    let showDropdown = false;
    let debounceTimer;

    async function search(query) {
        if (!query || query.length < 2) {
            searchResults = [];
            return;
        }
        loading = true;
        try {
            const data = await myFetch(
                `${PUBLIC_API_URL}/product/product-listings/?estore_id=${PUBLIC_ESTORE_ID}&approved=true&search=${encodeURIComponent(query)}&page_size=20&ordering=-id`,
                "GET",
                {},
                token
            );
            searchResults = data.results || [];
        } catch {
            searchResults = [];
        }
        loading = false;
    }

    function onInput() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => search(searchQuery), 300);
        showDropdown = true;
    }

    function select(pl) {
        const item = {
            product_listing_id: pl.id,
            product_name: pl.name,
            price: parseFloat(pl.price) || 0,
        };
        showDropdown = false;
        searchQuery = "";
        searchResults = [];
        dispatch("select", item);
    }

    function changeSelection() {
        selected = null;
        showDropdown = false;
        dispatch("clear");
    }

    function handleClickOutside(e) {
        if (showDropdown && !e.target.closest("[data-search-dropdown]")) {
            showDropdown = false;
        }
    }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="relative" data-search-dropdown>
    {#if selected}
        <div class="flex items-center gap-2 p-2 border rounded-lg bg-gray-50 text-sm">
            <span class="flex-1 truncate">₹ {selected.price?.toFixed(2)} – {selected.product_name}</span>
            <button type="button" on:click={changeSelection} class="text-blue-600 hover:text-blue-800 text-xs">Change</button>
        </div>
    {:else}
        <input
            type="text"
            bind:value={searchQuery}
            on:input={onInput}
            on:focus={() => searchQuery.length >= 2 && (showDropdown = true)}
            {placeholder}
            class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {#if showDropdown}
            <div class="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {#if loading}
                    <div class="p-3 text-sm text-gray-500">Searching...</div>
                {:else if searchResults.length === 0}
                    <div class="p-3 text-sm text-gray-500">{searchQuery.length >= 2 ? "No results" : "Type at least 2 characters to search"}</div>
                {:else}
                    {#each searchResults as pl}
                        <button
                            type="button"
                            on:click={() => select(pl)}
                            class="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm"
                        >
                            ₹ {pl.price?.toFixed(2)} – {pl.name}
                        </button>
                    {/each}
                {/if}
            </div>
        {/if}
    {/if}
</div>
