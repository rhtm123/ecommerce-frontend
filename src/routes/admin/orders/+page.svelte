<script>
    import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from "$env/static/public";
    import { user } from "$lib/stores/auth";
    import { myFetch } from "$lib/utils/myFetch";
    import { onDestroy } from "svelte";
    import { addAlert } from "$lib/stores/alert";
    import OrdersTable from "$lib/components/admin/orders/OrdersTable.svelte";

    let authUser;
    const unsubscribe = user.subscribe((value) => {
        authUser = value;
    });

    onDestroy(() => {
        unsubscribe();
    });

    $: if (authUser) {
        fetchOrders();
    }

    let loading = true;
    let orders = [];
    let next;
    let count = 0;
    let expandedOrderIds = new Set();
    let selectedSource = "";
    let selectedOrderType = "";
    let selectedPaymentStatus = "";
    let searchQuery = "";

    let showAddOrderModal = false;
    let showAddItemModal = false;
    let addItemOrderId = null;

    let AddOrderModalComponent = null;
    let AddItemModalComponent = null;

    $: filteredOrders = orders.filter((o) => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchSearch =
                (o.order_number && o.order_number.toLowerCase().includes(q)) ||
                (o.external_order_id && o.external_order_id.toLowerCase().includes(q));
            if (!matchSearch) return false;
        }
        if (selectedPaymentStatus && o.payment_status !== selectedPaymentStatus) return false;
        return true;
    });

    function buildOrdersUrl() {
        let url = `${PUBLIC_API_URL}/order/orders/?estore_id=${PUBLIC_ESTORE_ID}&items_needed=true&ordering=-id&page_size=20`;
        if (selectedSource) url += `&source=${selectedSource}`;
        if (selectedOrderType) url += `&order_type=${selectedOrderType}`;
        return url;
    }

    async function fetchOrders() {
        if (!authUser) return;
        loading = true;
        orders = [];
        try {
            const data = await myFetch(buildOrdersUrl(), "GET", {}, authUser.access_token);
            orders = data.results || [];
            next = data.next;
            count = data.count || orders.length;
        } catch (err) {
            console.error("Error fetching orders:", err);
            addAlert("Failed to load orders", "error");
        }
        loading = false;
    }

    async function loadMore() {
        if (!next || loading) return;
        loading = true;
        try {
            const data = await myFetch(next, "GET", {}, authUser.access_token);
            orders = [...orders, ...(data.results || [])];
            next = data.next;
        } catch (err) {
            console.error("Error loading more:", err);
            addAlert("Failed to load more orders", "error");
        }
        loading = false;
    }

    function toggleExpand(orderId) {
        expandedOrderIds = new Set(expandedOrderIds);
        if (expandedOrderIds.has(orderId)) {
            expandedOrderIds.delete(orderId);
        } else {
            expandedOrderIds.add(orderId);
        }
        expandedOrderIds = expandedOrderIds;
    }

    async function openAddOrderModal() {
        if (!AddOrderModalComponent) {
            const mod = await import("$lib/components/admin/orders/AddOrderModal.svelte");
            AddOrderModalComponent = mod.default;
        }
        showAddOrderModal = true;
    }

    async function openAddItemModal(orderId) {
        if (!AddItemModalComponent) {
            const mod = await import("$lib/components/admin/orders/AddItemModal.svelte");
            AddItemModalComponent = mod.default;
        }
        addItemOrderId = orderId;
        showAddItemModal = true;
    }

    function handleAddItem(e) {
        openAddItemModal(e.detail);
    }

    function handleOrderCreated() {
        fetchOrders();
    }

    function handleItemAdded() {
        fetchOrders();
    }

    function handleOrderUpdated(e) {
        const { orderId, field, value } = e.detail;
        const order = orders.find((o) => o.id === orderId);
        if (order) {
            order[field] = value;
            orders = [...orders];
        }
    }

    function handleItemStatusUpdated(e) {
        const { orderId, itemId, newStatus } = e.detail;
        const order = orders.find((o) => o.id === orderId);
        if (order?.items) {
            const item = order.items.find((i) => i.id === itemId);
            if (item) {
                item.status = newStatus;
                orders = [...orders];
            }
        }
    }
</script>

<svelte:window
    on:keydown={(e) => {
        if (e.key !== "Escape") return;
        if (showAddItemModal) {
            showAddItemModal = false;
            addItemOrderId = null;
        } else if (showAddOrderModal) {
            showAddOrderModal = false;
        }
    }}
/>

<div class="max-w-[1600px] mx-auto">
    <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div class="flex items-center gap-4">
            <h1 class="text-3xl font-bold text-gray-900">Order Management</h1>
            <button
                on:click={openAddOrderModal}
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                Add New Order
            </button>
        </div>
        <div class="flex flex-wrap gap-3 items-center">
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search by order # or external ID..."
                class="pl-3 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
            <select
                bind:value={selectedSource}
                on:change={fetchOrders}
                class="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All Sources</option>
                <option value="direct">Direct</option>
                <option value="amazon">Amazon</option>
                <option value="flipkart">Flipkart</option>
            </select>
            <select
                bind:value={selectedOrderType}
                on:change={fetchOrders}
                class="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All Order Types</option>
                <option value="new">New</option>
                <option value="replacement">Replacement</option>
            </select>
            <select
                bind:value={selectedPaymentStatus}
                class="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All Payment Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
            </select>
        </div>
    </div>

    <OrdersTable
        {orders}
        {filteredOrders}
        {loading}
        {next}
        {count}
        {expandedOrderIds}
        {searchQuery}
        {selectedSource}
        {selectedOrderType}
        {selectedPaymentStatus}
        token={authUser?.access_token ?? ""}
        on:toggleExpand={(e) => toggleExpand(e.detail)}
        on:loadMore={loadMore}
        on:addItem={handleAddItem}
        on:orderUpdated={handleOrderUpdated}
        on:itemStatusUpdated={handleItemStatusUpdated}
    />
</div>

{#if showAddOrderModal && AddOrderModalComponent}
    <svelte:component
        this={AddOrderModalComponent}
        token={authUser?.access_token ?? ""}
        on:created={handleOrderCreated}
        on:close={() => (showAddOrderModal = false)}
    />
{/if}

{#if showAddItemModal && AddItemModalComponent && addItemOrderId}
    <svelte:component
        this={AddItemModalComponent}
        orderId={addItemOrderId}
        token={authUser?.access_token ?? ""}
        on:added={handleItemAdded}
        on:close={() => {
            showAddItemModal = false;
            addItemOrderId = null;
        }}
    />
{/if}
