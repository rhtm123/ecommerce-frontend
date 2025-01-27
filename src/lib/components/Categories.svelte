<script>
    export let currentCategory;
    import { onMount } from "svelte";
    import { categoryApi } from "$lib/services/categoryApi";

    import { goto } from "$app/navigation";

    let parentsCategories = [];
    let childrenCategories = []

    let categories = [];

    async function loadParentsChildrenCategories() {
        let data = await categoryApi.getParentsChildrenCategories(currentCategory.id);
        // console.log("Parent Children");
        // console.log(data);
        parentsCategories = data.parents;
        childrenCategories = data.children;
    }

    $: if (currentCategory){
        loadParentsChildrenCategories();
    }

    onMount(async()=>{

        if (!currentCategory){ 
            let data = await categoryApi.getMainCategories();
            categories = data.results;
         }
    });


    function handleCategoryClick(slug) {
      goto(`/shop/${slug}`);
    }




</script>



<h3 class="font-bold text-lg mb-4">Categories</h3>


{#each parentsCategories as category}
    <div class="mb-2">
    <button 
        class="w-full text-left px-2 py-1 rounded hover:bg-amber-50 transition-colors flex justify-between items-center"
        on:click={() => handleCategoryClick(category.slug)}
    >
        <span>{category.name}</span>
    </button>                  
    </div>
{/each}



<div class="space-y-2">
{#each categories as category}
    <div class="mb-2">
    <button 
        class="w-full text-left px-2 py-1 rounded hover:bg-amber-50 transition-colors flex justify-between items-center"
        on:click={() => handleCategoryClick(category.slug)}
    >
        <span>{category.name}</span>
    </button>                  
    </div>
{/each}

{#if currentCategory}
    <span>{currentCategory?.name}</span>
{/if}

{#each childrenCategories as category}
    <div class="mb-2">
    <button 
        class="w-full text-left px-2 py-1 rounded hover:bg-amber-50 transition-colors flex justify-between items-center"
        on:click={() => handleCategoryClick(category.slug)}
    >
        <span>{category.name}</span>
    </button>                  
    </div>
{/each}

</div>
