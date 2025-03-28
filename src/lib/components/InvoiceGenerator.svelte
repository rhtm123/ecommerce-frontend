<script>
  import { onMount } from 'svelte';
  import { jsPDF } from 'jspdf';
  import 'jspdf-autotable';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { myFetch } from '$lib/utils/myFetch';

  export let orderId;
  let isLoading = false;

  async function generateInvoice() {
    try {
      isLoading = true;
      const [orderData, orderItemsData] = await Promise.all([
        myFetch(`${PUBLIC_API_URL}/order/orders/${orderId}/`),
        myFetch(`${PUBLIC_API_URL}/order/order-items/?order_id=${orderId}`)
      ]);
      
      console.log(orderData);
      console.log(orderItemsData);
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Use unicode rupee symbol
      const rupeeSymbol = 'INR';
      
      // Header Section with better alignment
      doc.setFontSize(24);
      doc.setTextColor(71, 52, 3);
      doc.text('INVOICE', pageWidth / 2, 20, { align: 'center' });
      
      // Business Info - Left aligned
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Naigaon Market', 20, 35);
      doc.text('123 Street Address, City, State, Zip | GSTIN: XXXXXXXXXXXXX', 20, 40);
      doc.text('Phone: +91 9876543210 | Email: hello@khilonabuddy.com', 20, 45);

      // Invoice Details Box with proper spacing
      doc.setFillColor(245, 230, 200);
      doc.rect(20, 55, pageWidth - 40, 15, 'F');
      doc.setFontSize(10);
      doc.text(`Invoice #: KB-${orderData.id}`, 25, 63);
      doc.text(`Date: ${new Date(orderData.created).toLocaleDateString('en-IN')}`, pageWidth - 25, 63, { align: 'right' });

      // Billing/Shipping Section with improved layout
      const startY = 80;
      doc.setFontSize(10);
      doc.setDrawColor(200, 200, 200);
      
      // Billing Section - Left column
      let currentY = startY;
      doc.text('BILL TO:', 20, currentY);
      currentY += 5;
      doc.text(`${orderData.user?.first_name} ${orderData.user?.last_name}`, 20, currentY);
      currentY += 5;
      doc.text(`${orderData.user?.email}`, 20, currentY);
      currentY += 5;
      doc.text(`${orderData.user?.mobile}`, 20, currentY);

      // Shipping Section - Right column
      currentY = startY;
      const address = orderData.shipping_address;
      doc.text('SHIP TO:', pageWidth - 90, currentY);
      currentY += 5;
      doc.text(address?.name, pageWidth - 90, currentY);
      currentY += 5;
      doc.text(`${address.address.line1}`, pageWidth - 90, currentY);
      if (address.address.line2) {
        currentY += 5;
        doc.text(`${address.address.line2}`, pageWidth - 90, currentY);
      }
      currentY += 5;
      doc.text(`${address.address.city}, ${address.address.state} - ${address.address.pin}`, pageWidth - 90, currentY);

      // Calculate totals and taxes
      let grandTotal = 0;
      let totalCGST = 0;
      let totalSGST = 0;
      let totalIGST = 0;

      // Items Table with improved spacing and alignment and tax calculations
      const tableColumns = [
        { header: 'Description', dataKey: 'description' },
        { header: 'Qty', dataKey: 'qty' },
        { header: 'Unit Price', dataKey: 'unitPrice' },
        { header: 'Tax', dataKey: 'tax' },
        { header: 'Total', dataKey: 'total' }
      ];

      const tableRows = orderItemsData.results.map(item => {
        const product = item.product_listing;
        const quantity = item.quantity;
        const subtotal = item.subtotal;
        
        // Get tax rates from product
        const cgstRate = product?.cgst_rate || 0;
        const sgstRate = product?.sgst_rate || 0;
        const igstRate = product?.igst_rate || 0;
        
        // Calculate total tax rate
        const totalTaxRate = cgstRate + sgstRate + igstRate;
        
        // Calculate unit price (price before tax)
        const unitPriceBeforeTax = subtotal / (1 + totalTaxRate / 100);
        
        // Calculate taxes based on unit price
        const cgstAmount = (unitPriceBeforeTax * cgstRate / 100) * quantity;
        const sgstAmount = (unitPriceBeforeTax * sgstRate / 100) * quantity;
        const igstAmount = (unitPriceBeforeTax * igstRate / 100) * quantity;
        
        // Add to totals
        totalCGST += cgstAmount;
        totalSGST += sgstAmount;
        totalIGST += igstAmount;
        grandTotal += subtotal;
        
        // Format tax display
        let taxDisplay = '';
        if (cgstRate > 0) taxDisplay += `CGST@${cgstRate}%: ${rupeeSymbol}${cgstAmount.toFixed(2)}`;
        if (sgstRate > 0) taxDisplay += taxDisplay ? `, ` : '';
        if (sgstRate > 0) taxDisplay += `SGST@${sgstRate}%: ${rupeeSymbol}${sgstAmount.toFixed(2)}`;
        if (igstRate > 0) taxDisplay += taxDisplay ? `, ` : '';
        if (igstRate > 0) taxDisplay += `IGST@${igstRate}%: ${rupeeSymbol}${igstAmount.toFixed(2)}`;
        
        return {
          description: product?.name,
          qty: quantity,
          unitPrice: `${rupeeSymbol}${unitPriceBeforeTax.toFixed(2)}`,
          tax: taxDisplay,
          total: `${rupeeSymbol}${subtotal.toFixed(2)}`
        };
      });

      doc.autoTable({
        startY: currentY + 15,
        columns: tableColumns,
        body: tableRows,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 5,
          textColor: [40, 40, 40],
          valign: 'middle',
          font: 'helvetica'
        },
        headerStyles: {
          fillColor: [71, 52, 3],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          description: { cellWidth: 70, halign: 'left' },
          qty: { cellWidth: 15, halign: 'center' },
          unitPrice: { cellWidth: 30, halign: 'right', cellPadding: { right: 5 } },
          tax: { cellWidth: 50, halign: 'left', cellPadding: { right: 5 } },
          total: { cellWidth: 25, halign: 'right', cellPadding: { right: 5 } }
        },
        margin: { left: 20, right: 20 }
      });

      // Totals Section with improved alignment
      const finalY = doc.lastAutoTable.finalY + 10;
      const totalsStartX = pageWidth - 80;

      // Create totals table with accurate tax calculations
      const totalsTable = [
        ['SUBTOTAL:', `${rupeeSymbol}${grandTotal.toFixed(2)}`]
      ];
      
      // Add discount row if applicable
      const discount = 0; // Replace with actual discount if available
      if (discount > 0) {
        totalsTable.push(['DISCOUNT:', `${rupeeSymbol}${discount.toFixed(2)}`]);
        totalsTable.push(['SUBTOTAL LESS DISCOUNT:', `${rupeeSymbol}${(grandTotal - discount).toFixed(2)}`]);
      }
      
      // Add tax rows
      if (totalCGST > 0) {
        totalsTable.push(['CGST:', `${rupeeSymbol}${totalCGST.toFixed(2)}`]);
      }
      
      if (totalSGST > 0) {
        totalsTable.push(['SGST:', `${rupeeSymbol}${totalSGST.toFixed(2)}`]);
      }
      
      if (totalIGST > 0) {
        totalsTable.push(['IGST:', `${rupeeSymbol}${totalIGST.toFixed(2)}`]);
      }
      
      // Add grand total
      const finalTotal = grandTotal;
      totalsTable.push(['GRAND TOTAL:', `${rupeeSymbol}${finalTotal.toFixed(2)}`]);

      doc.autoTable({
        startY: finalY,
        body: totalsTable,
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 4,
          valign: 'middle',
          font: 'helvetica'
        },
        columnStyles: {
          0: { 
            cellWidth: 100, 
            halign: 'right', 
            fontStyle: 'bold',
            cellPadding: { right: 10 }
          },
          1: { 
            cellWidth: 50, 
            halign: 'right',
            cellPadding: { right: 8 }
          }
        },
        margin: { left: pageWidth - 170 }
      });

      // Footer Section with proper spacing
      const footerY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(9);
      doc.text('Terms & Conditions:', 20, footerY);
      doc.text('1. This is a computer generated invoice', 20, footerY + 5);
      doc.text('2. Goods once sold will not be taken back', 20, footerY + 10);
      doc.text('3. All disputes subject to Mumbai jurisdiction', 20, footerY + 15);

      // Signature with right alignment
      doc.setFontSize(10);
      doc.text('Authorized Signature', pageWidth - 30, footerY + 25, { align: 'right' });
      doc.line(pageWidth - 70, footerY + 30, pageWidth - 20, footerY + 30);

      doc.save(`invoice-kb-${orderData.id}.pdf`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Error generating invoice. Please try again.');
    } finally {
      isLoading = false;
    }
  }
</script>

<button 
  class="text-red-500 hover:text-red-600 inline-flex items-center gap-2" 
  on:click={generateInvoice}
  disabled={isLoading}
>
  {#if isLoading}
    <div class="flex items-center gap-2">
      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Generating Invoice...
    </div>
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd" />
    </svg>
    Download Invoice
  {/if}
</button>

<style>
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>