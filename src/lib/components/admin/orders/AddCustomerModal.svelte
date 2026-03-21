<script>
    import { createEventDispatcher } from "svelte";
    import { PUBLIC_API_URL } from "$env/static/public";
    import { myFetch } from "$lib/utils/myFetch";
    import { addAlert } from "$lib/stores/alert";

    export let token = "";

    const dispatch = createEventDispatcher();

    let newCustomer = {
        username: "",
        password: "",
        email: "",
        first_name: "",
        last_name: "",
        mobile: "",
    };
    let creating = false;

    async function create() {
        if (!newCustomer.username || !newCustomer.password) {
            addAlert("Username and password are required", "error");
            return;
        }
        creating = true;
        try {
            const payload = {
                username: newCustomer.username,
                password: newCustomer.password,
                email: newCustomer.email || null,
                first_name: newCustomer.first_name || null,
                last_name: newCustomer.last_name || null,
                mobile: newCustomer.mobile || null,
                role: "buyer",
            };
            const created = await myFetch(`${PUBLIC_API_URL}/user/users/`, "POST", payload, token);
            addAlert("Customer created successfully", "info");
            dispatch("created", created);
            dispatch("close");
        } catch (err) {
            console.error("Error creating customer:", err);
            const msg = Array.isArray(err?.detail) ? err.detail.map((d) => d?.msg || JSON.stringify(d)).join(", ") : (err?.detail || "Failed to create customer");
            addAlert(msg, "error");
        }
        creating = false;
    }

    function close() {
        dispatch("close");
    }
</script>

<div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" on:click|self={close}>
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4" on:click|stopPropagation>
        <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Add New Customer</h3>
            <form on:submit|preventDefault={create} class="space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                    <input type="text" bind:value={newCustomer.username} required class="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input type="password" bind:value={newCustomer.password} required class="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" bind:value={newCustomer.email} class="w-full border rounded-lg px-3 py-2" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input type="text" bind:value={newCustomer.first_name} class="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input type="text" bind:value={newCustomer.last_name} class="w-full border rounded-lg px-3 py-2" />
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                    <input type="text" bind:value={newCustomer.mobile} class="w-full border rounded-lg px-3 py-2" />
                </div>
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" on:click={close} class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={creating} class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        {creating ? "Creating..." : "Create"}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
