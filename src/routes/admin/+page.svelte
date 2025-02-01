<!-- SellerAdmin.svelte -->
<script>
    import { PUBLIC_API_URL } from "$env/static/public";
    import { myFetch } from "$lib/utils/myFetch";

    import { user } from "$lib/stores/auth";
    import LeftNav from "$lib/components/admin/LeftNav.svelte";


    let authUser;
    user.subscribe(value=>{
        authUser = value;
    })

    $: if (authUser) {
        fetchSellerAnalytics();
    }

    let data;

    async function fetchSellerAnalytics(){
        data = await myFetch(`${PUBLIC_API_URL}/order/seller-analytics?period=lifetime&seller_id=${authUser?.entity.id}`);
        console.log(data);
    }

    
    let l = '₹';
    // Sample analytics data
    const metrics = [
        { title: 'Total Sales', value: '$12,450', change: '+12.5%' },
        { title: 'Orders', value: '1,230', change: '+8.2%' },
        { title: 'Avg. Order Value', value: '$102', change: '-3.1%' },
        { title: 'Conversion Rate', value: '3.8%', change: '+1.4%' }
    ];


</script>

<div class="min-h-screen bg-gray-50">
    <!-- Left Navigation Bar -->
    <LeftNav />

    <!-- Main Content -->
    <main class="ml-64 p-8">
            <div class="max-w-7xl mx-auto">
                <h1 class="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white p-6 rounded-xl shadow-sm">
                            <h3 class="text-gray-500 text-sm font-medium">Total Sales</h3>
                            <p class="mt-2 text-3xl font-semibold text-gray-900">₹ {data?.total_revenue}</p>
                            <!-- <span class={`inline-flex items-center mt-2 text-sm ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.change.startsWith('+') ? '↑' : '↓'} {metric.change}
                            </span> -->
                        </div>

                        <div class="bg-white p-6 rounded-xl shadow-sm">
                            <h3 class="text-gray-500 text-sm font-medium">Total Orders</h3>
                            <p class="mt-2 text-3xl font-semibold text-gray-900">{data?.total_orders}</p>
                            <!-- <span class={`inline-flex items-center mt-2 text-sm ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.change.startsWith('+') ? '↑' : '↓'} {metric.change}
                            </span> -->
                        </div>


                        <div class="bg-white p-6 rounded-xl shadow-sm">
                            <h3 class="text-gray-500 text-sm font-medium">Avg Order Value</h3>
                            <p class="mt-2 text-3xl font-semibold text-gray-900">₹ {Number(data?.average_order_value).toFixed(2)}</p>
                            <!-- <span class={`inline-flex items-center mt-2 text-sm ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.change.startsWith('+') ? '↑' : '↓'} {metric.change}
                            </span> -->
                        </div>



                        <div class="bg-white p-6 rounded-xl shadow-sm">
                            <h3 class="text-gray-500 text-sm font-medium">Total Items Sold</h3>
                            <p class="mt-2 text-3xl font-semibold text-gray-900">{data?.total_items}</p>
                            <!-- <span class={`inline-flex items-center mt-2 text-sm ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.change.startsWith('+') ? '↑' : '↓'} {metric.change}
                            </span> -->
                        </div>


                        
                </div>


                <!-- Metric Cards -->
                <!-- <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {#each metrics as metric}
                        <div class="bg-white p-6 rounded-xl shadow-sm">
                            <h3 class="text-gray-500 text-sm font-medium">{metric.title}</h3>
                            <p class="mt-2 text-3xl font-semibold text-gray-900">{metric.value}</p>
                            <span class={`inline-flex items-center mt-2 text-sm ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.change.startsWith('+') ? '↑' : '↓'} {metric.change}
                            </span>
                        </div>
                    {/each}
                </div> -->

                <!-- Chart Section -->
                <div class="bg-white p-6 rounded-xl shadow-sm">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-lg font-semibold text-gray-900">Sales Overview</h2>
                        <div class="flex space-x-4">
                            <button class="text-gray-500 hover:text-gray-700 text-sm">Monthly</button>
                            <button class="text-blue-600 text-sm font-medium">Weekly</button>
                            <button class="text-gray-500 hover:text-gray-700 text-sm">Daily</button>
                        </div>
                    </div>
                    <div class="h-96 bg-gray-50 rounded-lg p-4">
                        <!-- Chart placeholder -->
                        <div class="w-full h-full flex items-center justify-center text-gray-400">
                            Chart will be displayed here
                        </div>
                    </div>
                </div>
            </div>
    </main>
</div>