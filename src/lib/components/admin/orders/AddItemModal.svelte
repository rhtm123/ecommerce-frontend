<script>
    import { createEventDispatcher } from "svelte";
    import { PUBLIC_API_URL } from "$env/static/public";
    import { myFetch } from "$lib/utils/myFetch";
    import { addAlert } from "$lib/stores/alert";
    import ProductSearch from "./ProductSearch.svelte";

    export let orderId = null;
    export let token = "";

    const dispatch = createEventDispatcher();

    let productSelected = null;
    let quantity = 1;
    let adding = false;

    function onProductSelect(e) {
        productSelected = e.detail;
    }

    async function addItem() {
        if (!orderId || !productSelected) {
            addAlert("Search and select a product first", "error");
            return;
        }
        const qty = Math.max(1, parseInt(quantity) || 1);
        const price = parseFloat(productSelected.price) || 0;
        adding = true;
        try {
            const payload = {
                order_id: orderId,
                product_listing_id: productSelected.product_listing_id,
                quantity: qty,
                price,
                subtotal: qty * price,
            };
            await myFetch(`${PUBLIC_API_URL}/order/order-items/`, "POST", payload, token);
            addAlert("Item added successfully", "info");
            dispatch("added");
            dispatch("close");
        } catch (err) {
            console.error("Error adding item:", err);
            const msg = Array.isArray(err?.detail) ? err.detail.map((d) => d?.msg || JSON.stringify(d)).join(", ") : (err?.detail || "Failed to add item");
            addAlert(msg, "error");
        }
        adding = false;
    }

    function close() {
        dispatch("close");
    }
</script>

<div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" on:click|self={close}>
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4" on:click|stopPropagation>
        <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Add Item to Order</h3>
            <form on:submit|preventDefault={addItem} class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <ProductSearch
                        selected={productSelected}
                        {token}
                        on:select={onProductSelect}
                        on:clear={() => (productSelected = null)}
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input type="number" min="1" bind:value={quantity} class="w-full border rounded-lg px-3 py-2" />
                </div>
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" on:click={close} class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={adding} class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        {adding ? "Adding..." : "Add Item"}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
