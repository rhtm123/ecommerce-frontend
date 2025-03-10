<script>
    export let currentCategory;
    import { onMount } from "svelte";
    import { categoryApi } from "$lib/services/categoryApi";
    import { goto } from "$app/navigation";

    let parentsCategories = [];
    let childrenCategories = [];
    let categories = [];

    const loadParentsChildrenCategories = async () => {
        const data = await categoryApi.getParentsChildrenCategories(currentCategory.id);
        parentsCategories = data.parents;
        childrenCategories = data.children;
    };

    $: if (currentCategory) loadParentsChildrenCategories();

    onMount(async () => {
        if (!currentCategory) {
            const data = await categoryApi.getMainCategories();
            categories = data.results;
        }
    });

    const navigateToCategory = (slug) => goto(`/shop/${slug}`);

    const handleBackClick = () => {
        const parentSlug = parentsCategories.length > 0 
            ? parentsCategories[parentsCategories.length - 1].slug 
            : null;
        parentSlug ? navigateToCategory(parentSlug) : goto('/shop');
    };
</script>

<div class="categories-container">
    <h3 class="flex items-center gap-3 mb-2 text-lg font-bold">
        {#if currentCategory}
            <button 
                class="p-1 rounded-full hover:bg-gray-100 transition-colors"
                on:click={handleBackClick}
            >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 18l-6-6 6-6"/>
                </svg>
            </button>
        {/if}
        Categories
    </h3>

    <div class="space-y-1">
        {#each parentsCategories as category (category.id)}
            <div class="category-item">
                <button 
                    class="category-button text-gray-600 hover:text-gray-900"
                    on:click={() => navigateToCategory(category.slug)}
                >
                    <span>{category.name}</span>
                    <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>
            </div>
        {/each}

        {#if currentCategory}
            <div class="category-item">
                <div class="current-category">
                    {#if parentsCategories.length > 0}
                        <span class="connector"></span>
                    {/if}
                    <span>{currentCategory.name}</span>
                    {#if childrenCategories.length > 0}
                        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    {/if}
                </div>
            </div>
        {/if}

        {#each childrenCategories as category (category.id)}
            <div class="category-item child">
                <button 
                    class="category-button group"
                    on:click={() => navigateToCategory(category.slug)}
                >
                    <span class="connector"></span>
                    <span class="relative z-10">{category.name}</span>
                    <svg class="chevron relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                    <div class="absolute inset-0 rounded-lg bg-blue-50 opacity-0 transition-opacity group-hover:opacity-100"></div>
                </button>
            </div>
        {/each}

        {#if !currentCategory}
            {#each categories as category (category.id)}
                <div class="category-item">
                    <button 
                        class="category-button group"
                        on:click={() => navigateToCategory(category.slug)}
                    >
                        <span class="relative z-10">{category.name}</span>
                        <svg class="chevron relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                        <div class="absolute inset-0 rounded-lg bg-blue-50 opacity-0 transition-opacity group-hover:opacity-100"></div>
                    </button>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .categories-container {
        @apply bg-white rounded-2xl p-4 shadow-sm;
    }

    .category-item {
        @apply relative;
    }

    .category-item.child {
        @apply pl-5;
    }

    .category-button {
        @apply w-full flex items-center py-1 rounded-lg transition-colors text-left relative;
    }

    .current-category {
        @apply w-full py-1 px-2 bg-blue-50 rounded-lg flex items-center font-medium relative;
    }

    .chevron {
        @apply w-4 h-4 ml-auto;
    }

    .connector {
        @apply absolute -left-4 top-1/2 w-4 h-0.5 bg-blue-50;
    }

    .category-item.child .connector::before {
        content: '';
        @apply absolute left-0 top-0 w-0.5 h-3.5 bg-blue-50 -translate-y-full;
    }
</style>