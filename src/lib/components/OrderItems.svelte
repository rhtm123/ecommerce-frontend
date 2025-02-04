<script>
    import { myFetch } from "$lib/utils/myFetch";
    export let order_id;
    import { PUBLIC_API_URL } from "$env/static/public";

    import { onMount } from "svelte";

    let orderItems = [];
    let loading = true;

    async function fetchItemOrders(){
        let url = `${PUBLIC_API_URL}/order/order_items/?order_id=${order_id}&need_reviews=true`
        let data = await myFetch(url);
        orderItems = data.results;
        // console.log(data);
        loading = false;
    }

    $: if (order_id) {
        fetchItemOrders();
    }


</script>



{#if loading}
<div class="loading loading-spinner loading-sm"></div>

{/if}

{#each orderItems as item}
<div class="p-4 border-t">
    <div class="flex items-center justify-between">

        <div class="flex space-x-4">
            <img src={"https://placehold.co/600x400"} alt={item.name} class="w-20 h-20 object-cover rounded"/>
            <div class="flex-1">
                <h3 class="font-medium">{item?.product_listing?.name}</h3>
                <p class="text-gray-600">Quantity: {item.quantity}</p>
                <p class="text-gray-600 font-semibold">₹{item.price.toFixed(2)}</p>
            </div>
        </div>

        <div class="text-right">
            {#if item.review}
                <p class="text-gray-600">Your Rating:</p>
                <div class="flex items-center justify-end space-x-1">
                    {#each Array(item.review.rating) as _, i}
                        <span class="text-yellow-500">★</span>
                    {/each}
                    {#each Array(5 - item.review.rating) as _, i}
                        <span class="text-gray-300">★</span>
                    {/each}
                </div>
                <a class="btn btn-sm mt-2" href={"/profile/add-review/" + item.id}>View Review</a>
            {:else}
                <a class="btn btn-sm" href={"/profile/add-review/" + item.id}>Add Review</a>
            {/if}
        </div>

    </div>
</div>
{/each}
