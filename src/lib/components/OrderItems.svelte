<script>
    import { myFetch } from "$lib/utils/myFetch";
    import Icon from '@iconify/svelte';
    // export let order_id;
    import { PUBLIC_API_URL } from "$env/static/public";
    import { onMount } from "svelte";
    export let items;
    let orderItems = items;
    console.log(items);

    import OrderItemReview from "./OrderItemReview.svelte";
    // let loading = true;

    // Status configurations with icons and colors
    const statusConfig = {
        'pending': {
            icon: 'material-symbols:pending-actions',
            color: 'bg-yellow-100 text-yellow-800',
            label: 'Pending'
        },
        'order_placed': {
            icon: 'material-symbols:order-approve-outline',
            color: 'bg-blue-100 text-blue-800',
            label: 'Order Placed'
        },
        'shipped': {
            icon: 'material-symbols:local-shipping-outline',
            color: 'bg-purple-100 text-purple-800',
            label: 'Shipped'
        },
        'ready_for_delivery': {
            icon: 'material-symbols:package-2-outline',
            color: 'bg-yellow-100 text-yellow-800',
            label: 'Ready for Delivery'
        },
        'out_for_delivery': {
            icon: 'material-symbols:delivery-dining',
            color: 'bg-orange-100 text-orange-800',
            label: 'Out for Delivery'
        },
        'delivered': {
            icon: 'material-symbols:check-circle-outline',
            color: 'bg-green-100 text-green-800',
            label: 'Delivered'
        },
        'canceled': {
            icon: 'material-symbols:cancel-outline',
            color: 'bg-red-100 text-red-800',
            label: 'Canceled'
        }
    };

    // Function to get order summary status
    function getOrderSummaryStatus(items) {
        if (!items || items.length === 0) return null;
        
        const statusPriority = {
            'canceled': 0,
            'order_placed': 1,
            'pending': 1,
            'shipped': 2,
            'ready_for_delivery': 3,
            'out_for_delivery': 4,
            'delivered': 5
        };

        const statuses = items.map(item => item.status);
        const uniqueStatuses = [...new Set(statuses)];

        if (uniqueStatuses.length === 1) {
            return uniqueStatuses[0];
        }

        // If all items are delivered except some canceled ones
        if (uniqueStatuses.every(status => status === 'delivered' || status === 'canceled')) {
            return 'delivered';
        }

        // Return the status with the lowest priority (earliest in the fulfillment process)
        return uniqueStatuses.reduce((a, b) => 
            statusPriority[a] < statusPriority[b] ? a : b
        );
    }

    // async function fetchItemOrders() {
    //     let url = `${PUBLIC_API_URL}/order/order-items/?order_id=${order_id}&need_reviews=true`;
    //     let data = await myFetch(url);
    //     orderItems = data.results;
    //     console.log("Order Items",orderItems)
    //     loading = false;
    // }

    // $: if (order_id) {
    //     fetchItemOrders();
    // }

    // Get unique statuses for an order
    $: orderStatuses = [...new Set(orderItems.map(item => item.status))];
</script>


    <!-- Order Status Summary -->
    {#if orderItems.length > 0}
        <div class="px-4 py-2 border-b">
            <div class="flex flex-wrap gap-2 items-center">
                <span class="text-sm font-medium text-gray-600">Status:</span>
                {#each orderStatuses as status}
                    <div class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium {statusConfig[status].color}">
                        <Icon icon={statusConfig[status].icon} class="w-4 h-4" />
                        <span>{statusConfig[status].label}</span>
                        <span class="ml-1 bg-white/50 px-1.5 rounded-full">
                            {orderItems.filter(item => item.status === status).length}
                        </span>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Order Items -->
    {#each orderItems as item}
        <div class="p-4 border-b last:border-b-0">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-start space-x-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2">
                            <h3 class="font-medium">{item?.product_listing_name}</h3>
                            <!-- Individual Item Status -->
                            <div class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium {statusConfig[item.status].color}">
                                <Icon icon={statusConfig[item.status].icon} class="w-3 h-3" />
                                <span class="hidden md:inline">{statusConfig[item.status].label}</span>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                            <p>Quantity: {item.quantity}</p>
                            <p class="font-semibold">₹{item.price.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <OrderItemReview order_item_id={item.id} />

                    
            </div>
        </div>
    {/each}

<style>
    /* Smooth transitions */
    .transition-colors {
        transition: all 0.2s ease-in-out;
    }

    /* Status badge hover effect */
    div[class*="bg-"] {
        transition: transform 0.2s ease;
    }
    
    div[class*="bg-"]:hover {
        transform: scale(1.05);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .flex-col-mobile {
            flex-direction: column;
        }
    }
</style>