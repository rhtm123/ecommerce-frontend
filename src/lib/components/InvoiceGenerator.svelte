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
      // Use unicode rupee symbol
      const rupeeSymbol = 'INR';

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Set document properties
      doc.setProperties({
        title: `Invoice KB-${orderId}`,
        subject: 'Invoice',
        author: 'Naigaon Market',
        creator: 'Invoice Generator'
      });
      
      // Add border to the page - slightly thicker for more professional look
      doc.setDrawColor(100, 100, 100);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      // Header Section
      doc.setFontSize(22);
      doc.setTextColor(71, 52, 3);
      doc.text('INVOICE', pageWidth / 2, 25, { align: 'center' });
      
      // Business Info - fixed alignment
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Naigaon Market', 20, 40);
      
      // Handle long address with proper wrapping and fixed position
      const address = '005, Jay Vijay Nagar Building 3, Opposite Seven Square Academy School, Naigaon East, Maharashtra | GSTIN: 27AAECA000000000';
      const addressLines = doc.splitTextToSize(address, pageWidth - 40);
      doc.text(addressLines, 20, 45);
      
      // Calculate position for contact info based on address height
      const contactY = 45 + (addressLines.length * 5);
      doc.text('Phone: +91 9876543210 | Email: hello@khilonabuddy.com', 20, contactY);

      // Invoice Details Box with border - aligned with page border
      const invoiceBoxY = contactY + 10;
      doc.setFillColor(245, 230, 200);
      doc.rect(20, invoiceBoxY, pageWidth - 40, 15, 'F');
      doc.setDrawColor(0);
      doc.rect(20, invoiceBoxY, pageWidth - 40, 15);
      doc.setFontSize(10);
      doc.text(`Invoice #: KB-${orderData.id || 'N/A'}`, 25, invoiceBoxY + 10);
      doc.text(`Date: ${orderData.created ? new Date(orderData.created).toLocaleDateString('en-IN') : 'N/A'}`, pageWidth - 25, invoiceBoxY + 10, { align: 'right' });

      // Billing/Shipping Section with proper alignment and borders
      const addressBoxY = invoiceBoxY + 25;
      doc.setFontSize(10);
      doc.setDrawColor(0);
      
      // Calculate box widths to align with invoice box
      const boxWidth = (pageWidth - 40 - 10) / 2; // Total width minus margins minus gap
      
      // Set consistent border style for boxes
      doc.setDrawColor(0, 0, 0); // Pure black for borders

      // Function to draw a complete box with header
      function drawBox(x, y, width, height, headerText) {
        // Draw the main box with stroke
        doc.setDrawColor(0);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, width, height, 0, 0, 'FD'); // Fill and Draw

        // Draw header background
        doc.setFillColor(245, 245, 245);
        doc.rect(x, y, width, 6, 'F');

        // Redraw borders to ensure they're complete
        doc.setDrawColor(0);
        // Top
        doc.line(x, y, x + width, y);
        // Right
        doc.line(x + width, y, x + width, y + height);
        // Bottom
        doc.line(x, y + height, x + width, y + height);
        // Left
        doc.line(x, y, x, y + height);

        // Add header text
        doc.text(headerText, x + 5, y + 4);
      }

      // Draw Billing Box
      drawBox(20, addressBoxY, boxWidth, 35, 'BILL TO:');
      
      // Add Billing Content
      const billName = `${orderData.user?.first_name || ''} ${orderData.user?.last_name || ''}`.trim() || 'N/A';
      const billEmail = orderData.user?.email || 'N/A';
      const billPhone = orderData.user?.mobile || 'N/A';
      
      doc.text(billName, 25, addressBoxY + 12);
      doc.text(billEmail, 25, addressBoxY + 19);
      doc.text(billPhone, 25, addressBoxY + 26);
      
      // Draw Shipping Box
      const shippingBoxX = 20 + boxWidth + 10;
      drawBox(shippingBoxX, addressBoxY, boxWidth, 35, 'SHIP TO:');
      
      // Shipping Content
      const address_data = orderData.shipping_address || {};
      const shipName = address_data.name || 'N/A';
      
      let shipAddressLine1 = 'N/A';
      let shipAddressLine2 = '';
      let shipCity = '';
      
      if (address_data.address) {
        shipAddressLine1 = address_data.address.line1 || 'N/A';
        shipAddressLine2 = address_data.address.line2 || '';
        shipCity = `${address_data.address.city || ''}, ${address_data.address.state || ''} - ${address_data.address.pin || ''}`.trim() || 'N/A';
      }
      
      // Format and wrap shipping address text to fit within the box
      const maxLineWidth = boxWidth - 10; // Allow for margins
      
      doc.text(shipName, shippingBoxX + 5, addressBoxY + 12);
      
      // Wrap address line 1 if needed
      const wrappedLine1 = doc.splitTextToSize(shipAddressLine1, maxLineWidth);
      doc.text(wrappedLine1, shippingBoxX + 5, addressBoxY + 19);
      
      let currentY = addressBoxY + 19 + (wrappedLine1.length * 5);
      
      // Add line 2 if it exists
      if (shipAddressLine2) {
        const wrappedLine2 = doc.splitTextToSize(shipAddressLine2, maxLineWidth);
        doc.text(wrappedLine2, shippingBoxX + 5, currentY);
        currentY += wrappedLine2.length * 5;
      }
      
      // Add city/state/pin
      if (shipCity) {
        const wrappedCity = doc.splitTextToSize(shipCity, maxLineWidth);
        doc.text(wrappedCity, shippingBoxX + 5, currentY);
      }

      // Items Table with improved styling - aligned with address boxes
      const tableStartY = addressBoxY + 45;
      
      // Calculate totals and taxes
      let grandTotal = 0;
      let totalCGST = 0;
      let totalSGST = 0;
      let totalIGST = 0;
      
      const tableRows = (orderItemsData.results || []).map(item => {
        const product = item.product_listing || {};
        const quantity = item.quantity || 0;
        const originalSubtotal = item.subtotal || 0;
        
        console.log('Original Subtotal:', originalSubtotal);
        console.log('Quantity:', quantity);
        
        // Calculate discount per item if offer exists
        const discountPercent = orderData.offer ? parseFloat(orderData.offer.get_discount_percent) : 0;
        const itemDiscount = orderData.offer ? 
          (originalSubtotal * discountPercent / 100) : 0;
        
        console.log('Discount Percent:', discountPercent);
        console.log('Item Discount:', itemDiscount);
        
        // Calculate discounted amount
        const discountedAmount = originalSubtotal - itemDiscount;
        console.log('Discounted Amount:', discountedAmount);
        
        const cgstRate = product.cgst_rate || 0;
        const sgstRate = product.sgst_rate || 0;
        const igstRate = product.igst_rate || 0;
        
        // Calculate total tax rate
        const totalTaxRate = (cgstRate + sgstRate + igstRate) / 100;
        console.log('Total Tax Rate:', totalTaxRate);
        
        // Calculate base price before tax
        // For a discounted amount of 1600 with 20% tax:
        // baseAmount = 1600/1.2 = 1333.33
        const baseAmount = (discountedAmount) / (1 + totalTaxRate);
        console.log('Base Amount:', baseAmount);
        
        // Calculate unit price before tax
        const unitPriceBeforeTax = baseAmount / quantity;
        console.log('Unit Price Before Tax:', unitPriceBeforeTax);
        
        // Calculate individual tax amounts
        const cgstAmount = (baseAmount * cgstRate / 100);
        const sgstAmount = (baseAmount * sgstRate / 100);
        const igstAmount = (baseAmount * igstRate / 100);
        
        console.log('CGST Amount:', cgstAmount);
        console.log('SGST Amount:', sgstAmount);
        console.log('IGST Amount:', igstAmount);
        
        // Verify final calculation
        const totalWithTax = baseAmount + cgstAmount + sgstAmount + igstAmount;
        console.log('Total with Tax (should match discounted amount):', totalWithTax);
        
        // Add to totals
        totalCGST += cgstAmount;
        totalSGST += sgstAmount;
        totalIGST += igstAmount;
        grandTotal += originalSubtotal;
        
        // Format tax display
        let taxDisplay = '';
        if (cgstRate > 0) {
          taxDisplay += `CGST@${cgstRate}%: ${rupeeSymbol}${cgstAmount.toFixed(2)}`;
        }
        if (sgstRate > 0) {
          taxDisplay += taxDisplay ? '\n' : '';
          taxDisplay += `SGST@${sgstRate}%: ${rupeeSymbol}${sgstAmount.toFixed(2)}`;
        }
        if (igstRate > 0) {
          taxDisplay += taxDisplay ? '\n' : '';
          taxDisplay += `IGST@${igstRate}%: ${rupeeSymbol}${igstAmount.toFixed(2)}`;
        }

        // Return values for table display
        return {
          description: product.name || 'N/A',
          qty: quantity,
          unitPrice: `${rupeeSymbol}${(baseAmount/quantity).toFixed(2)}`,  // Using baseAmount directly
          tax: taxDisplay || 'N/A',
          total: `${rupeeSymbol}${originalSubtotal.toFixed(2)}`
        };
      });

      // Update grand total calculation
      const discountedGrandTotal = grandTotal - (orderData.total_discount || 0);
      
      // Calculate total tax amount on discounted total
      const totalTaxAmount = totalCGST + totalSGST + totalIGST;
      const finalAmountWithTax = discountedGrandTotal;  // This is already the final amount with tax

      // Create totals table with accurate tax calculations
      const totalsTable = [];
      
      // Add original subtotal
      totalsTable.push(['SUBTOTAL:', `${rupeeSymbol}${grandTotal.toFixed(2)}`]);
      
      // Add offer discount if present
      if (orderData.offer) {
        totalsTable.push([
          'OFFER APPLIED:',
          `-${rupeeSymbol}${orderData.discount_amount_offer.toFixed(2)}`
        ]);
        totalsTable.push([
          `${orderData.offer.name} (${orderData.offer.get_discount_percent}% OFF)`,
          ''
        ]);
      }

      // Add total discount and discounted subtotal
      if (orderData.total_discount > 0) {
        totalsTable.push([
          'TOTAL SAVINGS:',
          `-${rupeeSymbol}${orderData.total_discount.toFixed(2)}`
        ]);
        totalsTable.push([
          'SUBTOTAL AFTER DISCOUNT:',
          `${rupeeSymbol}${discountedGrandTotal.toFixed(2)}`
        ]);
      }
      
      // Add tax rows calculated on base amount
      if (totalCGST > 0) {
        totalsTable.push(['CGST:', `${rupeeSymbol}${totalCGST.toFixed(2)}`]);
      }
      if (totalSGST > 0) {
        totalsTable.push(['SGST:', `${rupeeSymbol}${totalSGST.toFixed(2)}`]);
      }
      if (totalIGST > 0) {
        totalsTable.push(['IGST:', `${rupeeSymbol}${totalIGST.toFixed(2)}`]);
      }
      
      // Add final amount (which is same as discounted amount since taxes are included)
      totalsTable.push(['FINAL AMOUNT:', `${rupeeSymbol}${finalAmountWithTax.toFixed(2)}`]);
      totalsTable.push(['PAYMENT STATUS:', orderData.payment_status.toUpperCase()]);

      // Define table columns
      const tableColumns = [
        { header: 'Description', dataKey: 'description' },
        { header: 'Qty', dataKey: 'qty' },
        { header: 'Unit Price', dataKey: 'unitPrice' },
        { header: 'Tax', dataKey: 'tax' },
        { header: 'Total', dataKey: 'total' }
      ];

      // Create table with proper styling and alignment
      doc.autoTable({
        startY: tableStartY,
        columns: tableColumns,
        body: tableRows,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
          textColor: [40, 40, 40],
          valign: 'middle',
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [71, 52, 3],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: { top: 5, right: 3, bottom: 5, left: 3 }
        },
        columnStyles: {
          description: { cellWidth: 'auto', halign: 'left' },
          qty: { cellWidth: 15, halign: 'center' },
          unitPrice: { cellWidth: 30, halign: 'right' },
          tax: { cellWidth: 50, halign: 'left' },
          total: { cellWidth: 30, halign: 'right' }
        },
        margin: { left: 20, right: 20 },
        tableWidth: pageWidth - 40,
        didDrawPage: (data) => {
          // Add border to the page on each new page
          doc.setDrawColor(100, 100, 100);
          doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
        }
      });

      // Totals Section with proper alignment and styling
      const finalY = doc.lastAutoTable.finalY + 5;
      
      // Render totals table with fixed widths
      doc.autoTable({
        startY: finalY,
        body: totalsTable,
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: { top: 2, right: 8, bottom: 2, left: 8 },
          valign: 'middle',
          fontStyle: 'normal',
          lineWidth: 0.1,
          minCellWidth: 80
        },
        columnStyles: {
          0: { 
            cellWidth: 160,
            halign: 'right', 
            fontStyle: 'bold'
          },
          1: { 
            cellWidth: 100,
            halign: 'right',
            cellPadding: { right: 20 }
          }
        },
        margin: { left: pageWidth - 280, right: 20 },
        didParseCell: function(data) {
          if (data.column.index === 1) {
            if (data.cell.text[0] && data.cell.text[0].startsWith('-')) {
              data.cell.styles.textColor = [220, 53, 69];
            }
          }
        },
        willDrawCell: function(data) {
          if (data.row.index % 2 === 0) {
            data.cell.styles.fillColor = [250, 250, 250];
          }
        }
      });

      // Add a border around the totals section
      const finalTableY = doc.lastAutoTable.finalY;
      const tableWidth = 260;
      const tableHeight = finalTableY - finalY;
      
      doc.setDrawColor(200, 200, 200);
      doc.rect(
        pageWidth - tableWidth - 20, 
        finalY - 2, 
        tableWidth, 
        tableHeight + 4
      );

      // Footer Section with proper spacing
      const footerY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(9);
      doc.text('Terms & Conditions:', 20, footerY);
      doc.text('1. This is a computer generated invoice', 20, footerY + 5);
      doc.text('2. Goods once sold will not be taken back', 20, footerY + 10);
      doc.text('3. All disputes subject to Mumbai jurisdiction', 20, footerY + 15);

      // Signature with right alignment
      doc.setFontSize(10);
      doc.text('Authorized Signature', pageWidth - 25, footerY + 25, { align: 'right' });
      doc.line(pageWidth - 65, footerY + 30, pageWidth - 25, footerY + 30);

      doc.save(`invoice-kb-${orderData.id || 'N/A'}.pdf`);
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