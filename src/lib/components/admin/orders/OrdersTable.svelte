<script>
    import { createEventDispatcher } from "svelte";
    import { PUBLIC_API_URL } from "$env/static/public";
    import { myFetch } from "$lib/utils/myFetch";
    import { addAlert } from "$lib/stores/alert";
    import { ORDER_ITEM_STATUSES, PAYMENT_STATUSES } from "./constants.js";

    export let orders = [];
    export let filteredOrders = [];
    export let loading = false;
    export let next = null;
    export let count = 0;
    export let expandedOrderIds = new Set();
    export let searchQuery = "";
    export let selectedSource = "";
    export let selectedOrderType = "";
    export let selectedPaymentStatus = "";
    export let token = "";

    const dispatch = createEventDispatcher();

    function getCustomerName(order) {
        if (!order.user) return `User #${order.user_id}`;
        const { first_name, last_name, email } = order.user;
        const name = [first_name, last_name].filter(Boolean).join(" ");
        return name || email || `User #${order.user_id}`;
    }

    function formatDate(d) {
        if (!d) return "-";
        const date = new Date(d);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    function toggleExpand(orderId) {
        dispatch("toggleExpand", orderId);
    }

    async function updateOrder(orderId, field, value) {
        const order = orders.find((o) => o.id === orderId);
        if (!order) return;
        try {
            await myFetch(`${PUBLIC_API_URL}/order/orders/${orderId}/`, "PUT", { [field]: value }, token);
            addAlert(`Order #${order.order_number} updated`, "info");
            dispatch("orderUpdated", { orderId, field, value });
        } catch (err) {
            console.error("Error updating order:", err);
            addAlert("Failed to update order", "error");
        }
    }

    async function updateOrderItemStatus(orderId, itemId, newStatus) {
        const order = orders.find((o) => o.id === orderId);
        if (!order || !order.items) return;
        const item = order.items.find((i) => i.id === itemId);
        if (!item) return;
        try {
            await myFetch(`${PUBLIC_API_URL}/order/order-items/${itemId}/`, "PUT", { status: newStatus }, token);
            addAlert(`Item #${itemId} status updated`, "info");
            dispatch("itemStatusUpdated", { orderId, itemId, newStatus });
        } catch (err) {
            console.error("Error updating item status:", err);
            addAlert("Failed to update item status", "error");
        }
    }

    function openAddItem(orderId) {
        dispatch("addItem", orderId);
    }
</script>

<div class="bg-white rounded-xl shadow-sm overflow-x-auto">
    <table class="w-full min-w-[1200px]">
        <thead class="bg-gray-50">
            <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-8"></th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">External ID</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pkg Cost</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Platform Cost</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Received</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
            {#each filteredOrders as order (order.id)}
                <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3">
                        <button on:click={() => toggleExpand(order.id)} class="text-gray-500 hover:text-gray-700">
                            {#if expandedOrderIds.has(order.id)}
                                <span class="text-lg">−</span>
                            {:else}
                                <span class="text-lg">+</span>
                            {/if}
                        </button>
                    </td>
                    <td class="px-4 py-3 text-sm font-medium text-blue-600">#{order.order_number}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{formatDate(order.created)}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{getCustomerName(order)}</td>
                    <td class="px-4 py-3">
                        <select
                            value={order.source}
                            on:change={(e) => updateOrder(order.id, "source", e.target.value)}
                            class="border rounded px-2 py-1 text-sm"
                        >
                            <option value="direct">Direct</option>
                            <option value="amazon">Amazon</option>
                            <option value="flipkart">Flipkart</option>
                        </select>
                    </td>
                    <td class="px-4 py-3">
                        <input
                            type="text"
                            value={order.external_order_id ?? ""}
                            placeholder="-"
                            on:blur={(e) => updateOrder(order.id, "external_order_id", e.target.value || null)}
                            on:keydown={(e) => e.key === "Enter" && e.target.blur()}
                            class="w-28 border rounded px-2 py-1 text-sm"
                        />
                    </td>
                    <td class="px-4 py-3">
                        <select
                            value={order.order_type}
                            on:change={(e) => updateOrder(order.id, "order_type", e.target.value)}
                            class="border rounded px-2 py-1 text-sm"
                        >
                            <option value="new">New</option>
                            <option value="replacement">Replacement</option>
                        </select>
                    </td>
                    <td class="px-4 py-3 text-sm text-right">₹ {order.total_amount?.toFixed(2) ?? "0.00"}</td>
                    <td class="px-4 py-3">
                        <input
                            type="number"
                            step="0.01"
                            value={order.package_cost ?? 0}
                            on:blur={(e) => updateOrder(order.id, "package_cost", parseFloat(e.target.value) || 0)}
                            on:keydown={(e) => e.key === "Enter" && e.target.blur()}
                            class="w-20 border rounded px-2 py-1 text-sm text-right"
                        />
                    </td>
                    <td class="px-4 py-3">
                        <input
                            type="number"
                            step="0.01"
                            value={order.platform_cost ?? 0}
                            on:blur={(e) => updateOrder(order.id, "platform_cost", parseFloat(e.target.value) || 0)}
                            on:keydown={(e) => e.key === "Enter" && e.target.blur()}
                            class="w-20 border rounded px-2 py-1 text-sm text-right"
                        />
                    </td>
                    <td class="px-4 py-3">
                        <input
                            type="number"
                            step="0.01"
                            value={order.total_received ?? ""}
                            placeholder="-"
                            on:blur={(e) => {
                                const v = e.target.value;
                                updateOrder(order.id, "total_received", v === "" ? null : parseFloat(v));
                            }}
                            on:keydown={(e) => e.key === "Enter" && e.target.blur()}
                            class="w-24 border rounded px-2 py-1 text-sm text-right"
                        />
                    </td>
                    <td class="px-4 py-3">
                        <select
                            value={order.payment_status}
                            on:change={(e) => updateOrder(order.id, "payment_status", e.target.value)}
                            class="border rounded px-2 py-1 text-sm"
                        >
                            {#each PAYMENT_STATUSES as ps}
                                <option value={ps}>{ps}</option>
                            {/each}
                        </select>
                    </td>
                </tr>
                {#if expandedOrderIds.has(order.id)}
                    <tr class="bg-gray-50">
                        <td colspan="12" class="px-4 py-3">
                            <div class="ml-8 border-l-2 border-gray-200 pl-4">
                                <div class="flex justify-between items-center mb-2">
                                    <p class="text-xs font-medium text-gray-500 uppercase">Order Items ({order.items?.length ?? 0})</p>
                                    <button on:click={() => openAddItem(order.id)} class="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                                        + Add item
                                    </button>
                                </div>
                                {#if order.items?.length}
                                    <table class="w-full text-sm">
                                        <thead>
                                            <tr class="text-left text-gray-500">
                                                <th class="pb-2">Product</th>
                                                <th class="pb-2">Qty</th>
                                                <th class="pb-2 text-right">Price</th>
                                                <th class="pb-2 text-right">MRP</th>
                                                <th class="pb-2 text-right">Cost</th>
                                                <th class="pb-2 text-right">Subtotal</th>
                                                <th class="pb-2">Status</th>
                                                <th class="pb-2">Cancel/Return</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {#each order.items as item (item.id)}
                                                <tr class="border-t border-gray-200">
                                                    <td class="py-2">{item.product_listing_name}</td>
                                                    <td class="py-2">{item.quantity}</td>
                                                    <td class="py-2 text-right">₹ {item.price?.toFixed(2) ?? "0.00"}</td>
                                                    <td class="py-2 text-right">₹ {item.mrp?.toFixed(2) ?? "0.00"}</td>
                                                    <td class="py-2 text-right">
                                                        {item.product_cost != null ? `₹ ${item.product_cost.toFixed(2)}` : "-"}
                                                    </td>
                                                    <td class="py-2 text-right">₹ {item.subtotal?.toFixed(2) ?? "0.00"}</td>
                                                    <td class="py-2">
                                                        <select
                                                            value={item.status}
                                                            on:change={(e) => updateOrderItemStatus(order.id, item.id, e.target.value)}
                                                            class="border rounded px-2 py-1 text-xs"
                                                        >
                                                            {#each ORDER_ITEM_STATUSES as s}
                                                                <option value={s}>{s.replace(/_/g, " ")}</option>
                                                            {/each}
                                                        </select>
                                                    </td>
                                                    <td class="py-2">
                                                        {#if item.cancel_requested}
                                                            <span class="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">Cancel</span>
                                                        {/if}
                                                        {#if item.return_requested}
                                                            <span class="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-800">Return</span>
                                                        {/if}
                                                        {#if !item.cancel_requested && !item.return_requested}
                                                            <span class="text-gray-400">-</span>
                                                        {/if}
                                                    </td>
                                                </tr>
                                            {/each}
                                        </tbody>
                                    </table>
                                {:else}
                                    <p class="text-sm text-gray-500 py-2">No items yet. Click "Add item" to add products.</p>
                                {/if}
                            </div>
                        </td>
                    </tr>
                {/if}
            {/each}

            {#if loading && orders.length === 0}
                <tr>
                    <td colspan="12" class="px-6 py-12 text-center text-gray-500">
                        <span class="loading loading-spinner loading-md"></span>
                        <p class="mt-2">Loading orders...</p>
                    </td>
                </tr>
            {/if}
            {#if !loading && filteredOrders.length === 0}
                <tr>
                    <td colspan="12" class="px-6 py-12 text-center text-gray-500">No orders found</td>
                </tr>
            {/if}
        </tbody>
    </table>
</div>

<div class="mt-2 flex justify-between items-center px-6 py-3 bg-white rounded-b-xl shadow-sm">
    <div>
        {#if next && !loading}
            <button on:click={() => dispatch("loadMore")} class="px-4 py-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200">
                Load More
            </button>
        {/if}
    </div>
    <div class="text-sm text-gray-500">
        Showing {filteredOrders.length} of {count} results
    </div>
</div>
