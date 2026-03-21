<script>
    import { createEventDispatcher } from "svelte";
    import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from "$env/static/public";
    import { myFetch } from "$lib/utils/myFetch";
    import { addAlert } from "$lib/stores/alert";
    import CustomerSearch from "./CustomerSearch.svelte";
    import ProductSearch from "./ProductSearch.svelte";
    import AddCustomerModal from "./AddCustomerModal.svelte";

    export let token = "";

    const dispatch = createEventDispatcher();

    let selectedCustomer = null;
    let newOrder = {
        total_amount: 0,
        source: "direct",
        order_type: "new",
        external_order_id: "",
        package_cost: 0,
        platform_cost: 0,
        total_received: null,
    };
    let newOrderItems = [];
    let productDraft = null;
    let draftQuantity = 1;
    let creating = false;
    let showAddCustomerModal = false;

    function onCustomerSelect(e) {
        selectedCustomer = e.detail;
    }

    function onProductSelect(e) {
        productDraft = e.detail;
    }

    function addDraftItem() {
        if (!productDraft) {
            addAlert("Search and select a product first", "error");
            return;
        }
        const qty = Math.max(1, parseInt(draftQuantity) || 1);
        const price = parseFloat(productDraft.price) || 0;
        newOrderItems = [
            ...newOrderItems,
            {
                product_listing_id: productDraft.product_listing_id,
                product_name: productDraft.product_name,
                quantity: qty,
                price,
                subtotal: qty * price,
            },
        ];
        productDraft = null;
        draftQuantity = 1;
    }

    function removeDraftItem(index) {
        newOrderItems = newOrderItems.filter((_, i) => i !== index);
    }

    $: newOrderTotalFromItems = newOrderItems.reduce((sum, i) => sum + (i.subtotal || 0), 0);

    function onCustomerCreated(e) {
        selectedCustomer = e.detail;
        showAddCustomerModal = false;
    }

    async function createOrder() {
        if (!selectedCustomer) {
            addAlert("Please select a customer", "error");
            return;
        }
        creating = true;
        try {
            const totalAmount = newOrderItems.length > 0 ? newOrderTotalFromItems : (parseFloat(newOrder.total_amount) || 0);
            const payload = {
                user_id: selectedCustomer.id,
                estore_id: parseInt(PUBLIC_ESTORE_ID),
                total_amount: totalAmount,
                source: newOrder.source,
                order_type: newOrder.order_type,
                external_order_id: newOrder.external_order_id || null,
                external_shipment_id: null,
                package_cost: parseFloat(newOrder.package_cost) || 0,
                platform_cost: parseFloat(newOrder.platform_cost) || 0,
                total_received: newOrder.total_received !== "" && newOrder.total_received != null
                    ? parseFloat(newOrder.total_received)
                    : null,
            };
            const created = await myFetch(`${PUBLIC_API_URL}/order/orders/`, "POST", payload, token);
            for (const item of newOrderItems) {
                await myFetch(`${PUBLIC_API_URL}/order/order-items/`, "POST", {
                    order_id: created.id,
                    product_listing_id: item.product_listing_id,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.subtotal,
                }, token);
            }
            addAlert("Order created successfully", "info");
            dispatch("created");
            dispatch("close");
        } catch (err) {
            console.error("Error creating order:", err);
            const msg = Array.isArray(err?.detail) ? err.detail.map((d) => d?.msg || JSON.stringify(d)).join(", ") : (err?.detail || "Failed to create order");
            addAlert(msg, "error");
        }
        creating = false;
    }

    function close() {
        dispatch("close");
    }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" on:click|self={close}>
    <div class="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" on:click|stopPropagation>
        <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Add New Order</h2>
            <form on:submit|preventDefault={createOrder} class="space-y-4">
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label class="block text-sm font-medium text-gray-700">Customer *</label>
                        <button type="button" on:click={() => (showAddCustomerModal = true)} class="text-sm text-blue-600 hover:text-blue-800">
                            + Add new customer
                        </button>
                    </div>
                    <CustomerSearch
                        selected={selectedCustomer}
                        {token}
                        on:select={onCustomerSelect}
                        on:clear={() => (selectedCustomer = null)}
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Order Items</label>
                    <div class="flex gap-2 mb-2">
                        <div class="flex-1">
                            <ProductSearch
                                selected={productDraft}
                                {token}
                                placeholder="Search products (min 2 chars)..."
                                on:select={onProductSelect}
                                on:clear={() => (productDraft = null)}
                            />
                        </div>
                        <input
                            type="number"
                            min="1"
                            bind:value={draftQuantity}
                            class="w-20 border rounded-lg px-2 py-2 text-sm text-center"
                        />
                        <button type="button" on:click={addDraftItem} class="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm">
                            Add
                        </button>
                    </div>
                    {#if newOrderItems.length > 0}
                        <ul class="border rounded-lg divide-y text-sm mb-2">
                            {#each newOrderItems as item, i}
                                <li class="flex justify-between items-center px-3 py-2">
                                    <span>{item.product_name} × {item.quantity} = ₹ {item.subtotal?.toFixed(2)}</span>
                                    <button type="button" on:click={() => removeDraftItem(i)} class="text-red-600 hover:text-red-800">Remove</button>
                                </li>
                            {/each}
                        </ul>
                        <p class="text-sm text-gray-600">Subtotal: ₹ {newOrderTotalFromItems.toFixed(2)}</p>
                    {/if}
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹) {#if newOrderItems.length > 0}(auto from items){/if}</label>
                    <input
                        type="number"
                        step="0.01"
                        value={newOrderItems.length > 0 ? newOrderTotalFromItems : newOrder.total_amount}
                        disabled={newOrderItems.length > 0}
                        class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Source</label>
                        <select bind:value={newOrder.source} class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="direct">Direct</option>
                            <option value="amazon">Amazon</option>
                            <option value="flipkart">Flipkart</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                        <select bind:value={newOrder.order_type} class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="new">New</option>
                            <option value="replacement">Replacement</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">External Order ID</label>
                    <input
                        type="text"
                        bind:value={newOrder.external_order_id}
                        placeholder="Optional"
                        class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Package Cost (₹)</label>
                        <input type="number" step="0.01" bind:value={newOrder.package_cost} class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Platform Cost (₹)</label>
                        <input type="number" step="0.01" bind:value={newOrder.platform_cost} class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Total Received (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            bind:value={newOrder.total_received}
                            placeholder="Optional"
                            class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" on:click={close} class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={creating} class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {creating ? "Creating..." : "Create Order"}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

{#if showAddCustomerModal}
    <AddCustomerModal
        {token}
        on:created={onCustomerCreated}
        on:close={() => (showAddCustomerModal = false)}
    />
{/if}
