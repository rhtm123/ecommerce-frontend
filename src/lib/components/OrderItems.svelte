<script>
    import { myFetch } from "$lib/utils/myFetch";
    export let order_id;
    import { PUBLIC_API_URL } from "$env/static/public";

    import { onMount } from "svelte";

    let orderItems = [];
    let loading = true;

    async function fetchItemOrders(){
        let url = `${PUBLIC_API_URL}/order/order_items/?order_id=${order_id}`
        let data = await myFetch(url);
        orderItems = data.results;
        console.log(data);
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
        <div class="flex items-center space-x-4">


        
        <img src={"https://placehold.co/600x400"} alt={item.name} class="w-20 h-20 object-cover rounded"/>
        <div class="flex-1">
            <h3 class="font-medium">{item?.product_listing?.name}</h3>
            <p class="text-gray-600">Quantity: {item.quantity}</p>
            <p class="text-gray-600">{item.price.toFixed(2)}</p>
        </div>
        </div>
    </div>
{/each}