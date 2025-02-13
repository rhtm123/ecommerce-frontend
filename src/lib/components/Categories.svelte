<script>
    export let currentCategory;
    import { onMount } from "svelte";
    import { categoryApi } from "$lib/services/categoryApi";
    import { goto } from "$app/navigation";

    let parentsCategories = [];
    let childrenCategories = [];
    let categories = [];

    async function loadParentsChildrenCategories() {
        let data = await categoryApi.getParentsChildrenCategories(currentCategory.id);
        parentsCategories = data.parents;
        childrenCategories = data.children;
    }

    $: if (currentCategory) {
        loadParentsChildrenCategories();
    }

    onMount(async () => {
        if (!currentCategory) { 
            let data = await categoryApi.getMainCategories();
            categories = data.results;
        }
    });

    function handleCategoryClick(slug) {
        goto(`/shop/${slug}`);
    }

    function handleBackClick() {
        if (parentsCategories.length > 0) {
            const parentSlug = parentsCategories[parentsCategories.length - 1].slug;
            handleCategoryClick(parentSlug);
        } else {
            goto('/shop');
        }
    }
</script>

<div class="categories-container">
    <h3 class="font-bold text-lg mb-2 flex items-center gap-3">
        {#if currentCategory}
            <button 
                class="p-1 rounded-full hover:bg-gray-100 transition-colors"
                on:click={handleBackClick}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 18l-6-6 6-6"/>
                </svg>
            </button>
        {/if}
        Categories
    </h3>

    <div class="space-y-1">
        <!-- Parent Categories -->
        {#each parentsCategories as category, i}
            <div class="category-item">
                <button 
                    class="w-full text-left py-1 rounded-lg transition-colors flex items-center text-gray-600 hover:text-gray-900"
                    on:click={() => handleCategoryClick(category.slug)}
                >
                    <span>{category.name}</span>
                    <svg class="ml-auto" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>
            </div>
        {/each}

        <!-- Current Category -->
        {#if currentCategory}
            <div class="category-item">
                <div class="w-full py-1 px-2 bg-amber-50 rounded-lg flex items-center font-medium">
                    {#if parentsCategories.length > 0}
                        <span class="connector"></span>
                    {/if}
                    <span>{currentCategory.name}</span>
                    {#if childrenCategories.length > 0}
                        <svg class="ml-auto" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    {/if}
                </div>
            </div>
        {/if}

        <!-- Children Categories -->
        {#each childrenCategories as category, i}
            <div class="category-item child">
                <button 
                    class="w-full text-left py-1 px-2 rounded-lg transition-colors flex items-center relative group"
                    on:click={() => handleCategoryClick(category.slug)}
                >
                    <span class="connector"></span>
                    <span class="relative z-10">{category.name}</span>
                    <svg class="ml-auto relative z-10" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                    <div class="absolute inset-0 rounded-lg opacity-0 bg-amber-50 transition-opacity group-hover:opacity-100"></div>
                </button>
            </div>
        {/each}

        <!-- Main Categories -->
        {#if !currentCategory}
            {#each categories as category}
                <div class="category-item">
                    <button 
                        class="w-full text-left py-1 rounded-lg transition-colors flex items-center relative group"
                        on:click={() => handleCategoryClick(category.slug)}
                    >
                        <span class="relative z-10">{category.name}</span>
                        <svg class="ml-auto relative z-10" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                        <div class="absolute inset-0 rounded-lg opacity-0 bg-amber-50 transition-opacity group-hover:opacity-100"></div>
                    </button>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .categories-container {
        background-color: white;
        border-radius: 1rem;
        padding: 1rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .category-item {
        position: relative;
    }

    .category-item.child {
        padding-left: 1.25rem;
    }

    .connector {
        position: absolute;
        left: -1rem;
        top: 50%;
        width: 1rem;
        height: 2px;
        background-color: rgb(253 230 138);
    }

    .category-item.child .connector::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 2px;
        height: 14px;
        background-color: rgb(253 230 138);
        transform: translateY(-100%);
    }
</style>