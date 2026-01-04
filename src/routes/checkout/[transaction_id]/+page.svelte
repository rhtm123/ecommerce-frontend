<script>

  import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from '$env/static/public';
  import { myFetch } from '$lib/utils/myFetch.js';
  import { goto, invalidate } from '$app/navigation';

  import { user } from '$lib/stores/auth';


  export let data;
  export let params;
  $: payment = data?.payment;
  console.log(data);

  let authUser;
  $: authUser = $user;

  let creating = false;
  let refreshing = false;

  async function refreshPayment() {
    refreshing = true;
    await invalidate(`/checkout/${params.transaction_id}`);
    window.location.reload();
  }



  // Helper function to format payment method
  const formatPaymentMethod = (method) => {
    return method === "pg" ? "Online" : "Cash on Delivery";
  };

  async function createPayment(){
    creating = true;
    let urlp = `${PUBLIC_API_URL}/payment/payments/`;

    payment = await myFetch(urlp, "POST", {
              "order_id": payment.order_id,
              "amount": payment.amount,
              "estore_id": PUBLIC_ESTORE_ID,
              payment_method: "pg",
            }, authUser.access_token);

            if (payment.payment_method=="pg") {
              window.location = payment.payment_url 
            } else {
              goto("/checkout/"+payment.transaction_id);
            }
  }
</script>

<div class="min-h-screen flex items-center justify-center p-4">
  {#if data?.error}
    <div class="max-w-md w-full bg-red-50 p-6 rounded-lg shadow-md text-center">
      <h2 class="text-xl font-bold text-red-700 mb-4">Error Occurred</h2>
      <p class="text-red-600">Error: {data.error}</p>
      <p class="mt-2 text-gray-600">Please try again later or contact support.</p>
    </div>
  {:else if payment}
    {#if payment.status === "completed" && payment.payment_method === "pg"}
      <div class="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h1 class="text-2xl font-bold text-center mb-6 text-green-600">Payment Successful</h1>
        
        <div class="space-y-4">
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Payment Status:</span>
            <span class="capitalize">{payment.status}</span>
          </div>
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Payment Method:</span>
            <span>{formatPaymentMethod(payment.payment_method)}</span>
          </div>
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Amount:</span>
            <span>₹ {payment.amount?.toLocaleString() || 'N/A'}</span>
          </div>
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Order Number:</span>
            <span>{payment.order_number || 'N/A'}</span>
          </div>
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Date:</span>
            <span>{payment.created ? new Date(payment.created).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>

        <div class="text-center mt-6">
          <a href="/profile/orders" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors duration-200">
            Go to Orders
          </a>
        </div>
      </div>
    {:else if payment.status === "pending" && payment.payment_method === "pg"}
      <div class="max-w-md w-full bg-yellow-50 p-6 rounded-lg shadow-md text-center">
        <h2 class="text-xl font-bold text-yellow-700 mb-4">Payment Pending</h2>
        <div class="text-center mt-4 space-y-4">
          <p class="text-gray-600">Your payment is being processed. Please wait for confirmation.</p>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p class="text-sm text-blue-800 font-medium mb-2">⚠️ Payment Status Notice</p>
            <p class="text-xs text-blue-700">
              If you have already completed the payment but still see "Pending" status, please contact our support team. 
              We'll verify and update your payment status.
            </p>
          </div>

          <div class="flex flex-col gap-3 mt-4">
            <button 
              on:click={refreshPayment} 
              class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {#if refreshing}
                <span class="loading loading-spinner loading-sm"></span>
                Refreshing...
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Refresh Status
              {/if}
            </button>

            <p class="text-gray-600 text-sm">If you have not completed your payment, please</p>
            <button on:click={createPayment} class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors duration-200">
              {#if creating}
                    <span class="loading loading-spinner loading-sm mr-2"></span>
                        Creating..
                    {:else}
                        Create Payment
                    {/if}
            </button>
          </div>
        </div>
      </div>

    {:else if payment.status === "failed"}
      <div class="max-w-md w-full bg-red-50 p-6 rounded-lg shadow-md text-center">
        <h2 class="text-xl font-bold text-red-700 mb-4">Payment Failed</h2>
        <p class="text-red-600">Unfortunately, your payment could not be processed.</p>
        <p class="mt-2 text-gray-600">Please check your payment details or try again later.</p>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p class="text-sm text-blue-800 font-medium mb-2">⚠️ Payment Status Notice</p>
          <p class="text-xs text-blue-700">
            If you have already completed the payment but see "Failed" or "Cancelled" status, please contact our support team immediately. 
            We'll verify your payment and resolve the issue.
          </p>
        </div>

        <div class="flex flex-col gap-3 mt-6">
          <button 
            on:click={refreshPayment} 
            class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {#if refreshing}
              <span class="loading loading-spinner loading-sm"></span>
              Refreshing...
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh Status
            {/if}
          </button>

          <button on:click={createPayment} class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors duration-200">
            {#if creating}
                  <span class="loading loading-spinner loading-sm mr-2"></span>
                      Creating..
                  {:else}
                      Create Payment
                  {/if}
          </button>
        </div>
      </div>
    {:else if payment.status === "refunded"}
      <div class="max-w-md w-full bg-orange-50 p-6 rounded-lg shadow-md text-center">
        <h2 class="text-xl font-bold text-orange-700 mb-4">Payment Refunded</h2>
        <p class="text-orange-600">This payment has been refunded.</p>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p class="text-sm text-blue-800 font-medium mb-2">ℹ️ Need Assistance?</p>
          <p class="text-xs text-blue-700">
            If you have questions about this refund or if you believe this is an error, please contact our support team.
          </p>
        </div>

        <div class="text-center mt-6">
          <button 
            on:click={refreshPayment} 
            class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
          >
            {#if refreshing}
              <span class="loading loading-spinner loading-sm"></span>
              Refreshing...
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh Status
            {/if}
          </button>
        </div>
      </div>
    {:else if payment.payment_method === "cod"}
      <div class="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h1 class="text-2xl font-bold text-center mb-6 text-blue-600">Order Received</h1>
        
        <div class="space-y-4">
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Order Number:</span>
            <span>{payment.order_number || 'N/A'}</span>
          </div>
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Date:</span>
            <span>{payment.created ? new Date(payment.created).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Total:</span>
            <span>₹ {payment.amount?.toLocaleString() || 'N/A'}</span>
          </div>
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Payment Method:</span>
            <span>{formatPaymentMethod(payment.payment_method)}</span>
          </div>
        </div>

        <p class="text-center text-gray-600 mt-6">**Please pay with cash upon delivery.**</p>
        <div class="text-center mt-6">
          <a href="/profile/orders" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors duration-200">
            Go to Orders
          </a>
        </div>
      </div>
    {/if}
  {:else}
    <div class="max-w-md w-full bg-gray-50 p-6 rounded-lg shadow-md text-center">
      <p class="text-gray-600">No payment information available.</p>
    </div>
  {/if}
</div>