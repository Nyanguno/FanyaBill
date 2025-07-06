// This script will be loaded because it's now included in app.html
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    loadInventory();
    loadSettings();
    updateDashboard();
    displayInventory();
    updateInvoiceStatus();
    checkProStatus();
    showSection('dashboard'); // Start on the dashboard
    setupPayPalButton(); // Initialize PayPal button on DOMContentLoaded

    // Ensure the add item modal is hidden on load
    closeAddItemModal(); // Call this to explicitly hide it
});

// --- Core App State ---
let inventory = [];
let settings = {
    businessName: 'Your Business',
    businessAddress: '123 Street, City',
    businessCity: 'Yourtown',
    currency: 'KES', // Default to KES as per context
    taxRate: 0 // Default tax rate
};
let invoiceCount = parseInt(localStorage.getItem('fanyabill_invoice_count')) || 0;
const INVOICE_LIMIT = 3;
const LOW_STOCK_THRESHOLD = 3;
// Store sales data with date and customer info for richer summaries
const salesData = JSON.parse(localStorage.getItem('fanyabill_sales_data')) || [];

// --- Navigation ---
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none'; // Explicitly hide non-active sections
    });
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
        activeSection.style.display = 'block'; // Display the active section
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        // Remove transform style if it was set by hover and not active
        item.style.transform = '';
    });

    const activeNavItem = document.querySelector(`.nav-item[href="#${sectionId}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    // Specific actions for sections if needed
    if (sectionId === 'dashboard') {
        updateDashboard();
    } else if (sectionId === 'inventory') {
        displayInventory(); // Ensure inventory table is refreshed
    } else if (sectionId === 'sales-summary') {
        displaySalesBreakdown('monthly'); // Default to monthly breakdown
        displayAllSalesTransactions(); // Display all sales in the table
    }
}

// --- Settings Management ---
function saveSettings() {
    settings.businessName = document.getElementById('businessName').value;
    settings.businessAddress = document.getElementById('businessAddress').value;
    settings.businessCity = document.getElementById('businessCity').value;
    settings.currency = document.getElementById('currency').value;
    settings.taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    localStorage.setItem('fanyabill_settings', JSON.stringify(settings));
    showMessageModal('Settings Saved', 'Your business settings have been updated successfully.');
    // Update invoice preview business info immediately
    renderInvoicePreview();
    updateInvoiceStatus(); // Update currency and pro status display
}

function loadSettings() {
    const savedSettings = localStorage.getItem('fanyabill_settings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        document.getElementById('businessName').value = settings.businessName;
        document.getElementById('businessAddress').value = settings.businessAddress;
        document.getElementById('businessCity').value = settings.businessCity;
        document.getElementById('currency').value = settings.currency;
        document.getElementById('taxRate').value = settings.taxRate;
    }
    // Set default values if not loaded
    if (!settings.businessName) settings.businessName = 'Your Business';
    if (!settings.businessAddress) settings.businessAddress = '123 Street, City';
    if (!settings.businessCity) settings.businessCity = 'Yourtown';
    if (!settings.currency) settings.currency = 'KES';
    if (settings.taxRate === undefined) settings.taxRate = 0;
}


// --- Inventory Management ---
function saveInventory() {
    localStorage.setItem('fanyabill_inventory', JSON.stringify(inventory));
    updateDashboard(); // Update dashboard stats after inventory changes
}

function loadInventory() {
    const savedInventory = localStorage.getItem('fanyabill_inventory');
    if (savedInventory) {
        inventory = JSON.parse(savedInventory);
    }
}

function addInventoryItem() {
    const itemId = document.getElementById('itemId').value.trim();
    const productName = document.getElementById('productName').value.trim();
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productStock = parseInt(document.getElementById('productStock').value);
    const itemCategory = document.getElementById('itemCategory').value.trim();
    const itemDescription = document.getElementById('itemDescription').value.trim();

    if (!productName || isNaN(productPrice) || productPrice <= 0 || isNaN(productStock) || productStock < 0) {
        showMessageModal('Input Error', 'Please fill in all required fields (Item Name, Price, Stock) with valid numbers.', 'warning');
        return;
    }

    const newItem = {
        id: itemId || `ITEM-${Date.now()}`, // Generate ID if not provided
        name: productName,
        price: productPrice,
        stock: productStock,
        category: itemCategory,
        description: itemDescription
    };

    const existingIndex = inventory.findIndex(item => item.id === newItem.id);
    if (existingIndex > -1) {
        // Update existing item
        inventory[existingIndex] = newItem;
        showMessageModal('Inventory Updated', `Item "${newItem.name}" updated successfully.`, 'success');
    } else {
        // Add new item
        inventory.push(newItem);
        showMessageModal('Item Added', `"${newItem.name}" added to inventory.`, 'success');
    }

    saveInventory();
    displayInventory();
    clearInventoryForm();
}

function displayInventory() {
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    inventoryTableBody.innerHTML = ''; // Clear existing rows

    const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.id.toLowerCase().includes(searchTerm)
    );

    if (filteredInventory.length === 0) {
        inventoryTableBody.innerHTML = `<tr><td colspan="6" class="text-center">No items found in inventory.</td></tr>`;
        return;
    }

    filteredInventory.forEach(item => {
        const row = inventoryTableBody.insertRow();
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${settings.currency} ${item.price.toFixed(2)}</td>
            <td>${item.stock}</td>
            <td>${item.category || 'N/A'}</td>
            <td>${item.description || 'N/A'}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-info" onclick="editInventoryItem('${item.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteInventoryItem('${item.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;

        if (item.stock < LOW_STOCK_THRESHOLD && item.stock > 0) {
            row.style.backgroundColor = 'rgba(255, 193, 7, 0.2)'; // Light warning yellow
            showLowStockAlert(item.name, item.stock);
        } else if (item.stock === 0) {
            row.style.backgroundColor = 'rgba(220, 53, 69, 0.2)'; // Light danger red
            showLowStockAlert(item.name, item.stock, true);
        }
    });
}

function editInventoryItem(itemId) {
    const item = inventory.find(i => i.id === itemId);
    if (item) {
        document.getElementById('itemId').value = item.id;
        document.getElementById('productName').value = item.name;
        document.getElementById('productPrice').value = item.price;
        document.getElementById('productStock').value = item.stock;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemDescription').value = item.description;
        showMessageModal('Editing Item', `Now editing "${item.name}". Update details and click "Add Item" to save changes.`, 'info');
    }
}

function deleteInventoryItem(itemId) {
    if (confirm('Are you sure you want to delete this item from inventory?')) {
        inventory = inventory.filter(item => item.id !== itemId);
        saveInventory();
        displayInventory();
        showMessageModal('Item Deleted', 'The item has been removed from inventory.', 'success');
    }
}

function clearInventoryForm() {
    document.getElementById('itemId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productStock').value = '';
    document.getElementById('itemCategory').value = '';
    document.getElementById('itemDescription').value = '';
}

document.getElementById('inventorySearch').addEventListener('keyup', displayInventory);


// --- Invoice Management ---
let invoiceItems = [];
let invoiceNumberCounter = parseInt(localStorage.getItem('fanyabill_invoice_number_counter')) || 1;

function generateInvoiceNumber() {
    const prefix = "INV";
    const paddedNumber = String(invoiceNumberCounter).padStart(4, '0');
    return `${prefix}${paddedNumber}`;
}

function addInvoiceItem() {
    const itemName = document.getElementById('itemName').value.trim();
    const itemQuantity = parseInt(document.getElementById('itemQuantity').value);
    const itemPrice = parseFloat(document.getElementById('itemPrice').value);

    if (!itemName || isNaN(itemQuantity) || itemQuantity <= 0 || isNaN(itemPrice) || itemPrice <= 0) {
        showMessageModal('Input Error', 'Please enter a valid Item Name, Quantity, and Price.', 'warning');
        return;
    }

    const newItem = {
        name: itemName,
        quantity: itemQuantity,
        unitPrice: itemPrice,
        total: itemQuantity * itemPrice
    };
    invoiceItems.push(newItem);
    displayInvoiceItems();
    clearInvoiceItemForm();
    renderInvoicePreview(); // Update preview after adding item
}

function displayInvoiceItems() {
    const invoiceItemsBody = document.getElementById('invoiceItemsBody');
    invoiceItemsBody.innerHTML = '';
    let subtotal = 0;

    if (invoiceItems.length === 0) {
        invoiceItemsBody.innerHTML = `<tr><td colspan="5" class="text-center">No items added to invoice.</td></tr>`;
    } else {
        invoiceItems.forEach((item, index) => {
            const row = invoiceItemsBody.insertRow();
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${settings.currency} ${item.unitPrice.toFixed(2)}</td>
                <td>${settings.currency} ${item.total.toFixed(2)}</td>
                <td><button class="btn btn-sm btn-danger" onclick="removeInvoiceItem(${index})"><i class="fas fa-trash"></i></button></td>
            `;
            subtotal += item.total;
        });
    }

    const taxAmount = subtotal * (settings.taxRate / 100);
    const grandTotal = subtotal + taxAmount;

    document.getElementById('invoiceSubtotal').textContent = `${settings.currency} ${subtotal.toFixed(2)}`;
    document.getElementById('invoiceTaxRateDisplay').textContent = settings.taxRate.toFixed(2);
    document.getElementById('invoiceTaxAmount').textContent = `${settings.currency} ${taxAmount.toFixed(2)}`;
    document.getElementById('invoiceGrandTotal').textContent = `${settings.currency} ${grandTotal.toFixed(2)}`;
}

function removeInvoiceItem(index) {
    invoiceItems.splice(index, 1);
    displayInvoiceItems();
    renderInvoicePreview(); // Update preview after removing item
}

function clearInvoiceItemForm() {
    document.getElementById('itemName').value = '';
    document.getElementById('itemQuantity').value = '';
    document.getElementById('itemPrice').value = '';
}

function clearInvoiceForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('invoiceDate').value = '';
    document.getElementById('dueDate').value = '';
    document.getElementById('invoiceNotes').value = '';
    document.getElementById('aiDescription').value = ''; // Clear AI description field
    invoiceItems = [];
    displayInvoiceItems();
    renderInvoicePreview(); // Clear preview as well
}

// Function to populate "Add Item to Invoice" modal's select dropdown
function openAddItemModal() {
    const selectInvoiceItem = document.getElementById('selectInvoiceItem');
    selectInvoiceItem.innerHTML = ''; // Clear previous options

    if (inventory.length === 0) {
        selectInvoiceItem.innerHTML = '<option value="">No items in inventory</option>';
        selectInvoiceItem.disabled = true;
    } else {
        selectInvoiceItem.disabled = false;
        selectInvoiceItem.innerHTML = '<option value="">-- Select an item --</option>';
        inventory.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name} (${settings.currency} ${item.price.toFixed(2)} - Stock: ${item.stock})`;
            selectInvoiceItem.appendChild(option);
        });
    }
    // Reset quantity to 1
    document.getElementById('invoiceItemQuantity').value = 1;

    document.getElementById('addItemModal').style.display = 'flex'; // Show the modal
}

function closeAddItemModal() {
    document.getElementById('addItemModal').style.display = 'none'; // Hide the modal
}

function populateInvoiceItemDetails() {
    const selectedItemId = document.getElementById('selectInvoiceItem').value;
    const item = inventory.find(i => i.id === selectedItemId);
    if (item) {
        // You could update item name, quantity placeholder, or price if you want
        // For now, we'll just rely on the selection and add it from the modal
    }
}

function addSelectedItemToInvoice() {
    const selectedItemId = document.getElementById('selectInvoiceItem').value;
    const quantity = parseInt(document.getElementById('invoiceItemQuantity').value);

    if (!selectedItemId || isNaN(quantity) || quantity <= 0) {
        showMessageModal('Error', 'Please select an item and enter a valid quantity.', 'warning');
        return;
    }

    const itemInInventory = inventory.find(item => item.id === selectedItemId);

    if (itemInInventory) {
        if (itemInInventory.stock < quantity) {
            showMessageModal('Out of Stock', `Not enough ${itemInInventory.name} in stock. Only ${itemInInventory.stock} available.`, 'danger');
            return;
        }

        const newItem = {
            name: itemInInventory.name,
            quantity: quantity,
            unitPrice: itemInInventory.price,
            total: quantity * itemInInventory.price
        };

        invoiceItems.push(newItem);
        itemInInventory.stock -= quantity; // Deduct from stock
        saveInventory(); // Save updated inventory
        displayInvoiceItems(); // Update invoice items table
        displayInventory(); // Update inventory table
        showMessageModal('Item Added', `Added ${quantity} x ${itemInInventory.name} to invoice.`, 'success');
        closeAddItemModal(); // Close modal after adding
        renderInvoicePreview(); // Update preview
    } else {
        showMessageModal('Error', 'Selected item not found in inventory.', 'danger');
    }
}

function prepareInvoiceForPreview() {
    if (invoiceItems.length === 0) {
        showMessageModal('No Items', 'Please add items to the invoice before previewing.', 'warning');
        return;
    }

    if (invoiceCount >= INVOICE_LIMIT && settings.proStatus !== 'pro') {
        showUpgradeModal();
        return;
    }

    // Populate the preview modal with current invoice data
    renderInvoicePreview();
    document.getElementById('invoicePreviewModal').style.display = 'flex';
}

function hideInvoicePreviewModal() {
    document.getElementById('invoicePreviewModal').style.display = 'none';
}

function renderInvoicePreview() {
    // Business Info
    document.getElementById('previewBusinessName').textContent = settings.businessName || 'Your Business Name';
    document.getElementById('previewBusinessAddress').textContent = settings.businessAddress || 'Your Business Address';
    document.getElementById('previewBusinessCity').textContent = settings.businessCity || 'Yourtown, Country';

    // Customer Info
    document.getElementById('previewCustomerName').textContent = document.getElementById('customerName').value || 'Customer Name';
    document.getElementById('previewCustomerAddress').textContent = document.getElementById('customerAddress').value || 'Customer Address';
    document.getElementById('previewCustomerCity').textContent = settings.businessCity || 'City, State, Zip';
    
    // Ship To (defaults to same as billing)
    document.getElementById('previewShipToName').textContent = document.getElementById('customerName').value || 'Same as Billing';
    document.getElementById('previewShipToAddress').textContent = document.getElementById('customerAddress').value || 'Same as Billing';
    document.getElementById('previewShipToCity').textContent = settings.businessCity || 'Same as Billing';

    // Invoice Meta
    document.getElementById('previewInvoiceNumber').textContent = generateInvoiceNumber();
    const invoiceDate = document.getElementById('invoiceDate').value || new Date().toISOString().slice(0, 10);
    document.getElementById('previewInvoiceDate').textContent = formatDate(invoiceDate);
    const dueDate = document.getElementById('dueDate').value || '';
    document.getElementById('previewDueDate').textContent = dueDate ? formatDate(dueDate) : 'On Receipt';

    // Invoice Items
    const pdfInvoiceItemsBody = document.getElementById('invoicePdfItemsBody');
    pdfInvoiceItemsBody.innerHTML = '';
    let subtotal = 0;

    invoiceItems.forEach(item => {
        const row = pdfInvoiceItemsBody.insertRow();
        row.innerHTML = `
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${settings.currency} ${item.unitPrice.toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${settings.currency} ${item.total.toFixed(2)}</td>
        `;
        subtotal += item.total;
    });

    // Calculate totals
    const taxAmount = subtotal * (settings.taxRate / 100);
    const grandTotal = subtotal + taxAmount;

    document.getElementById('pdfInvoiceSubtotal').textContent = `${settings.currency} ${subtotal.toFixed(2)}`;
    document.getElementById('pdfInvoiceTaxRate').textContent = settings.taxRate.toFixed(2);
    document.getElementById('pdfInvoiceTax').textContent = `${settings.currency} ${taxAmount.toFixed(2)}`;
    document.getElementById('pdfInvoiceTotal').textContent = `${settings.currency} ${grandTotal.toFixed(2)}`;
    document.getElementById('pdfInvoiceNotes').textContent = document.getElementById('invoiceNotes').value || 'Payment due upon receipt. Thank you for your business!';
}

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
}


async function generateAndDownloadInvoice() {
    try {
        // 1. Show loading message
        showMessageModal("Please wait", "Generating your invoice...", "info");
        
        // 2. Get the HTML
        const invoiceElement = document.getElementById('invoiceDocument');
        invoiceElement.style.display = 'block';
        const htmlContent = invoiceElement.outerHTML;
        invoiceElement.style.display = 'none';
        
        // 3. Send to server for PDF generation
        const response = await fetch('/.netlify/functions/generate-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: htmlContent })
        });
        
        if (!response.ok) throw new Error("Server error");
        
        // 4. Create and download PDF
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice_${document.getElementById('previewInvoiceNumber').textContent}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // 5. Update app state
        if (settings.proStatus !== 'pro') {
            invoiceCount++;
            localStorage.setItem('fanyabill_invoice_count', invoiceCount);
            updateInvoiceStatus();
        }
        
        // 6. Show success
        showMessageModal('Success', 'Invoice downloaded!', 'success');
        
    } catch (error) {
        console.error(error);
        showMessageModal('Error', 'Failed to generate PDF', 'danger');
    }
}

// --- Sales History & Summary ---
function recordSale(invoiceId, date, customerName, totalAmount, items) {
    salesData.push({
        invoiceId: invoiceId,
        date: date,
        customerName: customerName,
        totalAmount: totalAmount,
        items: items // Store detailed items for product breakdown
    });
    localStorage.setItem('fanyabill_sales_data', JSON.stringify(salesData));
}

function displaySalesBreakdown(type) {
    // Hide all breakdown content sections first
    document.getElementById('monthlyBreakdownContent').style.display = 'none';
    document.getElementById('yearlyBreakdownContent').style.display = 'none';
    document.getElementById('productBreakdownContent').style.display = 'none';

    // Remove 'active' class from all breakdown buttons
    document.querySelectorAll('.breakdown-options .btn-secondary').forEach(btn => {
        btn.classList.remove('active');
    });

    let data = {};
    let labels = [];
    let salesTotals = [];
    let salesCounts = [];
    let chartId, tableBodyId, chartTitle;

    switch (type) {
        case 'monthly':
            document.getElementById('monthlyBreakdownContent').style.display = 'block';
            document.getElementById('monthlyBreakdownBtn').classList.add('active');
            chartId = 'monthlySalesChart';
            tableBodyId = 'monthlySalesTableBody';
            chartTitle = 'Monthly Sales Data';

            const monthlySales = salesData.reduce((acc, sale) => {
                const monthYear = new Date(sale.date).toLocaleString('default', { month: 'short', year: 'numeric' });
                if (!acc[monthYear]) {
                    acc[monthYear] = { total: 0, count: 0 };
                }
                acc[monthYear].total += sale.totalAmount;
                acc[monthYear].count++;
                return acc;
            }, {});

            labels = Object.keys(monthlySales).sort((a, b) => {
                // Sort by year then month (e.g., "Jan 2023" before "Feb 2023")
                const [monthA, yearA] = a.split(' ');
                const [monthB, yearB] = b.split(' ');
                if (yearA !== yearB) return yearA - yearB;
                const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
            });
            salesTotals = labels.map(key => monthlySales[key].total);
            salesCounts = labels.map(key => monthlySales[key].count);

            const monthlyTableBody = document.getElementById(tableBodyId);
            monthlyTableBody.innerHTML = '';
            if (labels.length === 0) {
                monthlyTableBody.innerHTML = `<tr><td colspan="3" class="text-center">No monthly sales data available.</td></tr>`;
            } else {
                labels.forEach((label, index) => {
                    const row = monthlyTableBody.insertRow();
                    row.innerHTML = `
                        <td>${label}</td>
                        <td>${settings.currency} ${salesTotals[index].toFixed(2)}</td>
                        <td>${salesCounts[index]}</td>
                    `;
                });
            }
            break;

        case 'yearly':
            document.getElementById('yearlyBreakdownContent').style.display = 'block';
            document.getElementById('yearlyBreakdownBtn').classList.add('active');
            chartId = 'yearlySalesChart';
            tableBodyId = 'yearlySalesTableBody';
            chartTitle = 'Yearly Sales Data';

            const yearlySales = salesData.reduce((acc, sale) => {
                const year = new Date(sale.date).getFullYear();
                if (!acc[year]) {
                    acc[year] = { total: 0, count: 0 };
                }
                acc[year].total += sale.totalAmount;
                acc[year].count++;
                return acc;
            }, {});

            labels = Object.keys(yearlySales).sort();
            salesTotals = labels.map(key => yearlySales[key].total);
            salesCounts = labels.map(key => yearlySales[key].count);

            const yearlyTableBody = document.getElementById(tableBodyId);
            yearlyTableBody.innerHTML = '';
            if (labels.length === 0) {
                yearlyTableBody.innerHTML = `<tr><td colspan="3" class="text-center">No yearly sales data available.</td></tr>`;
            } else {
                labels.forEach((label, index) => {
                    const row = yearlyTableBody.insertRow();
                    row.innerHTML = `
                        <td>${label}</td>
                        <td>${settings.currency} ${salesTotals[index].toFixed(2)}</td>
                        <td>${salesCounts[index]}</td>
                    `;
                });
            }
            break;

        case 'product':
            document.getElementById('productBreakdownContent').style.display = 'block';
            document.getElementById('productBreakdownBtn').classList.add('active');
            chartId = 'productSalesChart';
            tableBodyId = 'productSalesTableBody';
            chartTitle = 'Product Sales Data';

            const productSales = salesData.reduce((acc, sale) => {
                sale.items.forEach(item => {
                    if (!acc[item.name]) {
                        acc[item.name] = { quantity: 0, revenue: 0 };
                    }
                    acc[item.name].quantity += item.quantity;
                    acc[item.name].revenue += item.total;
                });
                return acc;
            }, {});

            // Sort products by total revenue (descending)
            labels = Object.keys(productSales).sort((a, b) => productSales[b].revenue - productSales[a].revenue);
            const quantities = labels.map(key => productSales[key].quantity);
            const revenues = labels.map(key => productSales[key].revenue);

            const productTableBody = document.getElementById(tableBodyId);
            productTableBody.innerHTML = '';
            if (labels.length === 0) {
                productTableBody.innerHTML = `<tr><td colspan="3" class="text-center">No product sales data available.</td></tr>`;
            } else {
                labels.forEach((label, index) => {
                    const row = productTableBody.insertRow();
                    row.innerHTML = `
                        <td>${label}</td>
                        <td>${quantities[index]}</td>
                        <td>${settings.currency} ${revenues[index].toFixed(2)}</td>
                    `;
                });
            }
            break;
    }

    // Render Chart
    const ctx = document.getElementById(chartId).getContext('2d');
    if (window[chartId + 'Chart']) {
        window[chartId + 'Chart'].destroy(); // Destroy old chart instance
    }
    window[chartId + 'Chart'] = new Chart(ctx, {
        type: 'bar', // Can be 'line', 'bar', 'pie'
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Sales',
                data: salesTotals.length > 0 ? salesTotals : revenues, // Use revenues for product breakdown
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: chartTitle
                },
                legend: {
                    display: false // Hide legend if only one dataset
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: type === 'monthly' ? 'Month' : (type === 'yearly' ? 'Year' : 'Product')
                    }
                }
            }
        }
    });
}


function displayAllSalesTransactions() {
    const salesHistoryTableBody = document.getElementById('salesHistoryTableBody');
    salesHistoryTableBody.innerHTML = ''; // Clear existing rows

    const searchTerm = document.getElementById('salesSearch').value.toLowerCase();
    const filteredSales = salesData.filter(sale =>
        sale.invoiceId.toLowerCase().includes(searchTerm) ||
        sale.customerName.toLowerCase().includes(searchTerm) ||
        sale.items.some(item => item.name.toLowerCase().includes(searchTerm))
    );

    if (filteredSales.length === 0) {
        salesHistoryTableBody.innerHTML = `<tr><td colspan="6" class="text-center">No sales transactions recorded.</td></tr>`;
        return;
    }

    filteredSales.forEach((sale, index) => {
        const row = salesHistoryTableBody.insertRow();
        const itemNames = sale.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
        row.innerHTML = `
            <td>${sale.invoiceId}</td>
            <td>${sale.date}</td>
            <td>${sale.customerName}</td>
            <td>${settings.currency} ${sale.totalAmount.toFixed(2)}</td>
            <td>${itemNames}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-danger" onclick="deleteSale(${index})"><i class="fas fa-trash"></i></button>
            </td>
        `;
    });
}

function deleteSale(index) {
    if (confirm('Are you sure you want to delete this sales record? This cannot be undone.')) {
        salesData.splice(index, 1);
        localStorage.setItem('fanyabill_sales_data', JSON.stringify(salesData));
        displayAllSalesTransactions();
        updateDashboard(); // Update dashboard after deleting a sale
    }
}

document.getElementById('salesSearch').addEventListener('keyup', displayAllSalesTransactions);


// --- Dashboard ---
function updateDashboard() {
    let totalSales = 0;
    salesData.forEach(sale => {
        totalSales += sale.totalAmount;
    });

    document.getElementById('totalSales').textContent = `${settings.currency} ${totalSales.toFixed(2)}`;
    document.getElementById('totalItems').textContent = inventory.length;
    document.getElementById('totalInvoices').textContent = salesData.length; // Total invoices recorded

    // Update recent sales table
    const recentSalesBody = document.getElementById('recentSalesBody');
    recentSalesBody.innerHTML = '';
    if (salesData.length === 0) {
        recentSalesBody.innerHTML = `<tr><td colspan="4" class="text-center">No recent sales. Generate an invoice to see data here.</td></tr>`;
    } else {
        // Display last 5 sales
        const recentFiveSales = salesData.slice(-5).reverse(); // Get last 5 and reverse to show most recent first
        recentFiveSales.forEach(sale => {
            const row = recentSalesBody.insertRow();
            const itemDetails = sale.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
            row.innerHTML = `
                <td>${sale.date}</td>
                <td>${sale.customerName}</td>
                <td>${settings.currency} ${sale.totalAmount.toFixed(2)}</td>
                <td>${itemDetails}</td>
            `;
        });
    }

    // Update Revenue Trends Chart
    updateRevenueChart();
}

let revenueChartInstance = null; // Store chart instance to destroy it later

function updateRevenueChart() {
    const monthlySales = salesData.reduce((acc, sale) => {
        const monthYear = new Date(sale.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!acc[monthYear]) {
            acc[monthYear] = 0;
        }
        acc[monthYear] += sale.totalAmount;
        return acc;
    }, {});

    const labels = Object.keys(monthlySales).sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        if (yearA !== yearB) return yearA - yearB;
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
    });
    const data = labels.map(key => monthlySales[key]);

    const ctx = document.getElementById('revenueChart').getContext('2d');

    if (revenueChartInstance) {
        revenueChartInstance.destroy(); // Destroy previous chart instance
    }

    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue',
                data: data,
                backgroundColor: 'rgba(99, 102, 241, 0.4)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // No need for legend with single dataset
                },
                title: {
                    display: true,
                    text: 'Monthly Revenue Trend'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount (' + settings.currency + ')'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                }
            }
        }
    });
}

document.getElementById('dashboardSearch').addEventListener('keyup', () => {
    // For dashboard search, you'd typically filter recent sales or other dashboard components.
    // For simplicity, we'll re-render recent sales here.
    updateDashboard();
});


// --- FanyaBot AI Assistant ---
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    if (message === '') return;

    appendMessage('user', message);
    chatInput.value = ''; // Clear input

    try {
        // Show typing indicator
        appendMessage('ai', '...', true); // true for isTypingIndicator

        const inventoryDataForAI = inventory.map(item => ({
            name: item.name,
            stock: item.stock,
            price: item.price
        }));

        const response = await fetch('/.netlify/functions/gemini-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'chat',
                message: message,
                inventory: inventoryDataForAI, // Pass inventory to the AI
                settings: settings // Pass settings (e.g., currency)
            })
        });

        const data = await response.json();
        const aiResponse = data.response;

        // Remove typing indicator before appending actual response
        removeTypingIndicator();
        appendMessage('ai', aiResponse);

    } catch (error) {
        console.error('Error communicating with AI:', error);
        removeTypingIndicator();
        appendMessage('ai', 'Sorry, I am having trouble connecting to the AI. Please try again later.');
    }
}

async function generateItemsFromAI() {
    const aiDescription = document.getElementById('aiDescription').value.trim();
    if (!aiDescription) {
        showMessageModal('Input Required', 'Please enter a description for the AI to generate items.', 'warning');
        return;
    }

    if (invoiceCount >= INVOICE_LIMIT && settings.proStatus !== 'pro') {
        showUpgradeModal();
        return;
    }

    // Show a loading indicator in the items table
    const invoiceItemsBody = document.getElementById('invoiceItemsBody');
    invoiceItemsBody.innerHTML = `<tr><td colspan="5" class="text-center"><i class="fas fa-spinner fa-spin"></i> Generating items...</td></tr>`;

    try {
        const response = await fetch('/.netlify/functions/gemini-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'invoice_items_generator',
                description: aiDescription,
                inventory: inventory // Provide inventory for AI to reference
            })
        });

        const data = await response.json();
        const generatedItemsString = data.response; // This will be a string like "item1,qty1,price1;item2,qty2,price2"

        // Attempt to parse the AI's response into structured items
        const parsedItems = parseGeneratedItems(generatedItemsString);

        if (parsedItems.length > 0) {
            invoiceItems = invoiceItems.concat(parsedItems); // Add to existing items
            displayInvoiceItems();
            renderInvoicePreview();
            showMessageModal('Items Generated', 'Items successfully generated from description!', 'success');
        } else {
            showMessageModal('No Items Generated', 'AI could not generate items from your description. Please try rephrasing.', 'warning');
        }

    } catch (error) {
        console.error('Error generating items with AI:', error);
        showMessageModal('AI Error', 'Failed to generate items using AI. Please try again or add manually.', 'danger');
    } finally {
        // Always refresh display even if error, to remove loading indicator
        displayInvoiceItems();
    }
}

function parseGeneratedItems(aiResponseString) {
    const items = [];
    // Example format: "item1,qty1,price1;item2,qty2,price2"
    // Split by semicolon for each item entry
    const itemEntries = aiResponseString.split(';');

    itemEntries.forEach(entry => {
        const parts = entry.split(',');
        if (parts.length === 3) {
            const name = parts[0].trim();
            const quantity = parseInt(parts[1].trim());
            const price = parseFloat(parts[2].trim());

            if (name && !isNaN(quantity) && quantity > 0 && !isNaN(price) && price >= 0) {
                items.push({
                    name: name,
                    quantity: quantity,
                    unitPrice: price,
                    total: quantity * price
                });
            }
        }
    });
    return items;
}


function appendMessage(sender, text, isTypingIndicator = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender);

    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar');
    avatarDiv.textContent = sender === 'user' ? 'You' : 'AI';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.classList.add('chat-bubble');
    bubbleDiv.innerHTML = isTypingIndicator ? '<i class="fas fa-ellipsis-h"></i>' : formatMessage(text); // Use innerHTML for icons/formatting

    if (isTypingIndicator) {
        bubbleDiv.id = 'typingIndicator';
    }

    if (sender === 'user') {
        messageDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(avatarDiv);
    } else {
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(bubbleDiv);
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to bottom
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.parentElement.remove(); // Remove the entire message div
    }
}

function formatMessage(text) {
    // Convert newlines to <br> for proper display in HTML
    let formattedText = text.replace(/\n/g, '<br>');

    // Basic Markdown support (bold, italics, links)
    // Bold
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italics
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Basic links (matches [text](url))
    formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

    return formattedText;
}

function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="chat-message ai">
            <div class="avatar">AI</div>
            <div class="chat-bubble">Hello! I am your FanyaBill AI Assistant. How can I help you manage your business today?</div>
        </div>
    `;
    document.getElementById('chatInput').value = '';
}

document.getElementById('chatInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});


// --- Modals and Alerts ---
function showMessageModal(title, message, type = 'info') {
    const messageModal = document.getElementById('messageModal');
    if (messageModal) {
        const messageTitle = document.getElementById('messageTitle');
        const messageText = document.getElementById('messageText');

        messageTitle.textContent = title;
        messageText.textContent = message;

        // You might add classes here for styling based on type (success, warning, danger)
        // messageModal.classList.add(type); // Example

        messageModal.style.display = 'flex';
    }
}

function hideMessageModal() {
    const messageModal = document.getElementById('messageModal');
    if (messageModal) {
        messageModal.style.display = 'none';
        // messageModal.classList.remove('success', 'warning', 'danger'); // Remove type classes
    }
}

let lowStockAlertTimeout;

function showLowStockAlert(itemName, stock, isOutOfStock = false) {
    const lowStockAlert = document.getElementById('lowStockAlert');
    if (lowStockAlert) {
        clearTimeout(lowStockAlertTimeout); // Clear any existing timeout
        lowStockAlert.classList.remove('success', 'warning', 'danger'); // Reset classes
        lowStockAlert.style.display = 'flex';
        lowStockAlert.querySelector('#lowStockMessage').innerHTML = `<i class=\"fas ${isOutOfStock ? 'fa-times-circle' : 'fa-exclamation-triangle'}\"></i> <strong>${itemName}</strong> is ${isOutOfStock ? 'out of stock!' : `low on stock (${stock} left)!`}`;
        lowStockAlert.classList.add(isOutOfStock ? 'danger' : 'warning');

        lowStockAlertTimeout = setTimeout(() => {
            hideLowStockAlert();
        }, 8000); // Alert disappears after 8 seconds
    }
}


function hideLowStockAlert() {
    const lowStockAlert = document.getElementById('lowStockAlert');
    if (lowStockAlert) {
        lowStockAlert.style.display = 'none';
    }
}

// Function to handle showing/hiding breakdown content based on active button
document.querySelectorAll('.breakdown-options .btn-secondary').forEach(button => {
    button.addEventListener('click', function() {
        const type = this.id.replace('BreakdownBtn', '');
        displaySalesBreakdown(type);
    });
});


// --- Pro Status & Monetization ---
function checkProStatus() {
    // This function runs on app load.
    // Check localStorage first
    const savedProStatus = localStorage.getItem('fanyabill_pro_status');
    if (savedProStatus === 'pro') {
        settings.proStatus = 'pro';
    } else {
        settings.proStatus = 'free'; // Default to free if not explicitly 'pro'
    }
    updateInvoiceStatus(); // Update UI immediately
}

function updateInvoiceStatus() {
    const proStatusElement = document.getElementById('proStatus');
    const invoiceCountBadge = document.getElementById('invoiceCountBadge');
    const invoiceStatusSection = document.getElementById('invoiceStatusSection');

    if (settings.proStatus === 'pro') {
        proStatusElement.textContent = 'Pro Unlocked';
        proStatusElement.style.backgroundColor = 'var(--success-color)'; // Green for Pro
        proStatusElement.style.color = 'var(--white)';
        invoiceCountBadge.style.display = 'none'; // Hide badge for Pro users
        invoiceStatusSection.innerHTML = `
            <p class="text-center mt-3" style="color: var(--gray-300);">
                <i class="fas fa-infinity" style="color: var(--success-color);"></i> Unlimited Invoices
            </p>
        `;
    } else {
        proStatusElement.textContent = 'Free Tier';
        proStatusElement.style.backgroundColor = 'var(--secondary-color)'; // Orange for Free
        proStatusElement.style.color = 'var(--gray-900)';
        invoiceCountBadge.style.display = 'flex'; // Show badge for Free users
        invoiceCountBadge.textContent = invoiceCount;

        const remaining = INVOICE_LIMIT - invoiceCount;
        if (remaining <= 0) {
            invoiceStatusSection.innerHTML = `
                <p class="text-center mt-3" style="color: var(--danger-color); font-weight: 600;">
                    <i class="fas fa-exclamation-circle"></i> Invoice limit reached!
                </p>
                <button class="btn btn-primary btn-block mt-2" onclick="showUpgradeModal()">Upgrade Now</button>
            `;
            // If limit reached and not pro, redirect or prompt upgrade
            if (!localStorage.getItem('hasSeenUpgradePrompt')) { // Only prompt once per session until user acts
                showUpgradeModal();
                localStorage.setItem('hasSeenUpgradePrompt', 'true');
            }
        } else {
            invoiceStatusSection.innerHTML = `
                <p class="text-center mt-3" style="color: var(--gray-300);">
                    <i class="fas fa-file-invoice"></i> ${remaining} free invoices left
                </p>
            `;
        }
    }
}


function showUpgradeModal() {
    const upgradeModal = document.getElementById('upgradeModal');
    if (upgradeModal) {
        upgradeModal.style.display = 'flex';
    }
}

function hideUpgradeModal() {
    const upgradeModal = document.getElementById('upgradeModal');
    if (upgradeModal) {
        upgradeModal.style.display = 'none';
        localStorage.removeItem('hasSeenUpgradePrompt'); // Reset prompt if modal closed manually
    }
}


// PayPal Integration
function setupPayPalButton() {
    paypal.Buttons({
        createOrder: function(data, actions) {
            // Set up the transaction
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: '7.99', // Monthly price for Pro
                        currency_code: 'USD'
                    },
                    description: 'FanyaBill Pro Monthly Subscription'
                }]
            });
        },
        onApprove: function(data, actions) {
            // Capture the funds from the transaction
            return actions.order.capture().then(function(details) {
                // Show a success message to the buyer
                showMessageModal('Payment Successful!', 'Thank you for upgrading to FanyaBill Pro! Your account has been updated.', 'success');
                localStorage.setItem('fanyabill_pro_status', 'pro');
                settings.proStatus = 'pro'; // Update in-memory settings
                updateInvoiceStatus(); // Refresh UI to show Pro status
                hideUpgradeModal();
            });
        },
        onError: function(err) {
            console.error('PayPal button error:', err);
            showMessageModal('Payment Error', 'There was an issue processing your PayPal payment. Please try again or contact support.', 'danger');
        }
    }).render('#paypal-button-container'); // Display the button in the container
}