// Global Variables
let invoiceItems = [];
let inventory = [];
let salesHistory = [];
let invoiceCounter = 1;
let businessSettings = {
    name: 'Njemwe',
    address: '00232 Ruiru',
    city: 'Ruiru',
    phone: '+254 700 123 456',
    email: 'info@njemweoj.com',
    currency: 'KES',
    taxRate: 16
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateDashboard();
    updateInventoryDisplay();
    updateSalesHistory();
    setDefaultDates();
    loadBusinessSettings();
    renderInvoicePreview();
    
    // Set up event listeners for real-time invoice preview
    const invoiceInputs = ['customerName', 'customerEmail', 'customerAddress', 'invoiceDate', 'dueDate', 'invoiceNotes'];
    invoiceInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', renderInvoicePreview);
        }
    });
});

// Navigation Functions
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update specific sections
    if (sectionId === 'sales-history') {
        updateSalesHistory();
        displaySalesBreakdown('monthly');
    }
    if (sectionId === 'dashboard') {
        updateDashboard();
    }
}

// Data Management Functions
function saveData() {
    localStorage.setItem('fanyabill_inventory', JSON.stringify(inventory));
    localStorage.setItem('fanyabill_sales', JSON.stringify(salesHistory));
    localStorage.setItem('fanyabill_counter', invoiceCounter.toString());
    localStorage.setItem('fanyabill_settings', JSON.stringify(businessSettings));
}

function loadData() {
    const savedInventory = localStorage.getItem('fanyabill_inventory');
    const savedSales = localStorage.getItem('fanyabill_sales');
    const savedCounter = localStorage.getItem('fanyabill_counter');
    const savedSettings = localStorage.getItem('fanyabill_settings');
    
    if (savedInventory) {
        inventory = JSON.parse(savedInventory);
    }
    if (savedSales) {
        salesHistory = JSON.parse(savedSales);
    }
    if (savedCounter) {
        invoiceCounter = parseInt(savedCounter);
    }
    if (savedSettings) {
        businessSettings = { ...businessSettings, ...JSON.parse(savedSettings) };
    }
}

// Inventory Management Functions
function addInventoryItem() {
    const itemId = document.getElementById('itemId').value.trim();
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const category = document.getElementById('itemCategory').value.trim();
    const description = document.getElementById('itemDescription').value.trim();
    
    if (!name || isNaN(price) || isNaN(stock)) {
        showMessage('Error', 'Please fill in all required fields with valid values.');
        return;
    }
    
    const newItem = {
        id: itemId || generateItemId(),
        name,
        price,
        stock,
        category: category || 'General',
        description: description || '',
        dateAdded: new Date().toISOString()
    };
    
    // Check if item already exists
    const existingIndex = inventory.findIndex(item => item.name.toLowerCase() === name.toLowerCase());
    if (existingIndex !== -1) {
        inventory[existingIndex] = newItem;
        showMessage('Success', 'Item updated successfully!');
    } else {
        inventory.push(newItem);
        showMessage('Success', 'Item added to inventory successfully!');
    }
    
    saveData();
    updateInventoryDisplay();
    updateDashboard();
    clearInventoryForm();
}

function generateItemId() {
    return 'ITEM' + Date.now().toString().slice(-6);
}

function clearInventoryForm() {
    document.getElementById('itemId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productStock').value = '';
    document.getElementById('itemCategory').value = '';
    document.getElementById('itemDescription').value = '';
}

function updateInventoryDisplay() {
    const tbody = document.getElementById('inventoryTableBody');
    tbody.innerHTML = '';
    
    inventory.forEach((item, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${businessSettings.currency} ${item.price.toFixed(2)}</td>
            <td>${item.stock}</td>
            <td>${item.category}</td>
            <td>${item.description}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editInventoryItem(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteInventoryItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    });
    
    // Update total items count
    document.getElementById('totalItems').textContent = inventory.length;
}

function editInventoryItem(index) {
    const item = inventory[index];
    document.getElementById('itemId').value = item.id;
    document.getElementById('productName').value = item.name;
    document.getElementById('productPrice').value = item.price;
    document.getElementById('productStock').value = item.stock;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemDescription').value = item.description;
}

function deleteInventoryItem(index) {
    if (confirm('Are you sure you want to delete this item?')) {
        inventory.splice(index, 1);
        saveData();
        updateInventoryDisplay();
        updateDashboard();
        showMessage('Success', 'Item deleted successfully!');
    }
}

// Enhanced Invoice Management Functions with Unit Support
function addInvoiceItem() {
    const name = document.getElementById('itemName').value.trim();
    const quantity = parseInt(document.getElementById('itemQuantity').value);
    const unit = document.getElementById('itemUnit').value.trim();
    const price = parseFloat(document.getElementById('itemPrice').value);
    
    if (!name || isNaN(quantity) || quantity <= 0 || isNaN(price) || price < 0) {
        showMessage('Error', 'Please fill in all required fields with valid values.');
        return;
    }
    
    const newItem = {
        name,
        quantity,
        unit: unit || '', // Optional unit field
        price,
        total: quantity * price
    };
    
    invoiceItems.push(newItem);
    updateInvoiceItemsDisplay();
    clearInvoiceItemForm();
    renderInvoicePreview();
}

function clearInvoiceItemForm() {
    document.getElementById('itemName').value = '';
    document.getElementById('itemQuantity').value = '1';
    document.getElementById('itemUnit').value = '';
    document.getElementById('itemPrice').value = '';
}

function updateInvoiceItemsDisplay() {
    const tbody = document.getElementById('invoiceItemsBody');
    tbody.innerHTML = '';
    
    let subtotal = 0;
    
    invoiceItems.forEach((item, index) => {
        const row = tbody.insertRow();
        const quantityWithUnit = item.unit ? `${item.quantity} ${item.unit}` : item.quantity.toString();
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${quantityWithUnit}</td>
            <td>${businessSettings.currency} ${item.price.toFixed(2)}</td>
            <td>${businessSettings.currency} ${item.total.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="removeInvoiceItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        subtotal += item.total;
    });
    
    // Update totals
    const taxRate = businessSettings.taxRate || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const grandTotal = subtotal + taxAmount;
    
    document.getElementById('invoiceSubtotal').textContent = `${businessSettings.currency} ${subtotal.toFixed(2)}`;
    document.getElementById('invoiceTaxRateDisplay').textContent = taxRate.toFixed(1);
    document.getElementById('invoiceTaxAmount').textContent = `${businessSettings.currency} ${taxAmount.toFixed(2)}`;
    document.getElementById('invoiceGrandTotal').textContent = `${businessSettings.currency} ${grandTotal.toFixed(2)}`;
}

function removeInvoiceItem(index) {
    invoiceItems.splice(index, 1);
    updateInvoiceItemsDisplay();
    renderInvoicePreview();
}

// AI Item Generation Function
async function generateItemsFromAI() {
    const description = document.getElementById('aiDescription').value.trim();
    
    if (!description) {
        showMessage('Error', 'Please enter a description for AI generation.');
        return;
    }
    
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    button.disabled = true;
    
    try {
        const response = await fetch('/.netlify/functions/gemini-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: `Parse this sales description into structured invoice items. Return ONLY a JSON array with objects containing: name, quantity, unit (optional), price. Description: "${description}"`
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Parse the AI response
        let items;
        try {
            // Try to extract JSON from the response
            const jsonMatch = data.response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                items = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No valid JSON found in response');
            }
        } catch (parseError) {
            throw new Error('Failed to parse AI response');
        }
        
        // Add items to invoice
        if (Array.isArray(items) && items.length > 0) {
            items.forEach(item => {
                if (item.name && item.quantity && item.price) {
                    invoiceItems.push({
                        name: item.name,
                        quantity: parseInt(item.quantity) || 1,
                        unit: item.unit || '',
                        price: parseFloat(item.price) || 0,
                        total: (parseInt(item.quantity) || 1) * (parseFloat(item.price) || 0)
                    });
                }
            });
            
            updateInvoiceItemsDisplay();
            renderInvoicePreview();
            document.getElementById('aiDescription').value = '';
            showMessage('Success', `Generated ${items.length} items from AI!`);
        } else {
            throw new Error('No valid items generated');
        }
        
    } catch (error) {
        console.error('AI Generation Error:', error);
        showMessage('AI Error', `Failed to generate items using AI: ${error.message}. Please try again or add manually.`);
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Invoice Preview and PDF Generation
function prepareInvoiceForPreview() {
    if (invoiceItems.length === 0) {
        showMessage('Error', 'Please add at least one item to the invoice.');
        return;
    }
    
    renderInvoicePreview();
    showInvoicePreviewModal();
}

function renderInvoicePreview() {
    // Update business information
    document.getElementById('previewBusinessName').textContent = businessSettings.name;
    document.getElementById('previewBusinessAddress').textContent = businessSettings.address;
    document.getElementById('previewBusinessCity').textContent = businessSettings.city;
    document.getElementById('previewBusinessPhone').textContent = businessSettings.phone;
    document.getElementById('previewBusinessEmail').textContent = businessSettings.email;
    
    // Update invoice details
    document.getElementById('previewInvoiceNumber').textContent = `INV-${invoiceCounter.toString().padStart(4, '0')}`;
    document.getElementById('previewInvoiceDate').textContent = document.getElementById('invoiceDate').value || new Date().toLocaleDateString();
    document.getElementById('previewDueDate').textContent = document.getElementById('dueDate').value || new Date().toLocaleDateString();
    
    // Update customer information
    document.getElementById('previewCustomerName').textContent = document.getElementById('customerName').value || 'Customer Name';
    document.getElementById('previewCustomerAddress').textContent = document.getElementById('customerAddress').value || 'Customer Address';
    document.getElementById('previewCustomerCity').textContent = document.getElementById('customerAddress').value || 'Customer City';
    
    // Update ship to (same as bill to for now)
    document.getElementById('previewShipToName').textContent = document.getElementById('customerName').value || 'Customer Name';
    document.getElementById('previewShipToAddress').textContent = document.getElementById('customerAddress').value || 'Customer Address';
    document.getElementById('previewShipToCity').textContent = document.getElementById('customerAddress').value || 'Customer City';
    
    // Update invoice items
    const tbody = document.getElementById('invoicePdfItemsBody');
    tbody.innerHTML = '';
    
    let subtotal = 0;
    
    invoiceItems.forEach(item => {
        const row = tbody.insertRow();
        const quantityWithUnit = item.unit ? `${item.quantity} ${item.unit}` : item.quantity.toString();
        
        row.innerHTML = `
            <td class="qty-col">${quantityWithUnit}</td>
            <td class="desc-col">${item.name}</td>
            <td class="price-col">${businessSettings.currency} ${item.price.toFixed(2)}</td>
            <td class="total-col">${businessSettings.currency} ${item.total.toFixed(2)}</td>
        `;
        subtotal += item.total;
    });
    
    // Update totals
    const taxRate = businessSettings.taxRate || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const grandTotal = subtotal + taxAmount;
    
    document.getElementById('pdfInvoiceSubtotal').textContent = `${businessSettings.currency} ${subtotal.toFixed(2)}`;
    document.getElementById('pdfInvoiceTaxRate').textContent = taxRate.toFixed(1);
    document.getElementById('pdfInvoiceTax').textContent = `${businessSettings.currency} ${taxAmount.toFixed(2)}`;
    document.getElementById('pdfInvoiceTotal').textContent = `${businessSettings.currency} ${grandTotal.toFixed(2)}`;
}

// Client-side PDF Generation Function
async function generateAndDownloadInvoice() {
    if (invoiceItems.length === 0) {
        showMessage('Error', 'Please add at least one item to the invoice.');
        return;
    }

    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    button.disabled = true;

    try {
        // Get the invoice document element
        const invoiceElement = document.getElementById('invoiceDocument');
        
        // Configure html2canvas options for better quality
        const canvas = await html2canvas(invoiceElement, {
            scale: 2, // Higher resolution
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: invoiceElement.scrollWidth,
            height: invoiceElement.scrollHeight
        });

        // Create PDF using jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Calculate dimensions to fit A4
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add the canvas as an image to the PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        // Generate filename
        const customerName = document.getElementById('customerName').value || 'customer';
        const invoiceNumber = `INV-${invoiceCounter.toString().padStart(4, '0')}`;
        const filename = `invoice-${invoiceNumber}-${customerName.toLowerCase().replace(/\s+/g, '-')}.pdf`;

        // Download the PDF
        pdf.save(filename);

        // Record the sale
        recordSale();
        
        // Increment invoice counter
        invoiceCounter++;
        saveData();
        
        // Update dashboard
        updateDashboard();
        
        // Clear invoice items for next invoice
        invoiceItems = [];
        updateInvoiceItemsDisplay();
        
        // Hide modal
        hideInvoicePreviewModal();
        
        showMessage('Success', 'Invoice PDF generated and downloaded successfully!');

    } catch (error) {
        console.error('PDF Generation Error:', error);
        showMessage('Error', `Failed to generate PDF: ${error.message}. Please try again.`);
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Sales Recording Function
function recordSale() {
    const customerName = document.getElementById('customerName').value || 'Walk-in Customer';
    const invoiceDate = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];
    
    let subtotal = 0;
    invoiceItems.forEach(item => {
        subtotal += item.total;
    });
    
    const taxAmount = (subtotal * (businessSettings.taxRate || 0)) / 100;
    const total = subtotal + taxAmount;
    
    const sale = {
        id: `INV-${invoiceCounter.toString().padStart(4, '0')}`,
        date: invoiceDate,
        customer: customerName,
        items: [...invoiceItems],
        subtotal: subtotal,
        tax: taxAmount,
        total: total,
        timestamp: new Date().toISOString()
    };
    
    salesHistory.push(sale);
    saveData();
}

// Modal Functions
function showInvoicePreviewModal() {
    document.getElementById('invoicePreviewModal').style.display = 'flex';
}

function hideInvoicePreviewModal() {
    document.getElementById('invoicePreviewModal').style.display = 'none';
}

function showMessage(title, message) {
    document.getElementById('messageTitle').textContent = title;
    document.getElementById('messageText').textContent = message;
    document.getElementById('messageModal').style.display = 'flex';
}

function hideMessageModal() {
    document.getElementById('messageModal').style.display = 'none';
}

// Add Item from Inventory Modal Functions
function openAddItemModal() {
    const select = document.getElementById('selectInvoiceItem');
    select.innerHTML = '<option value="">Select an item...</option>';
    
    inventory.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${item.name} - ${businessSettings.currency} ${item.price.toFixed(2)}`;
        select.appendChild(option);
    });
    
    document.getElementById('addItemModal').style.display = 'flex';
}

function closeAddItemModal() {
    document.getElementById('addItemModal').style.display = 'none';
}

function populateInvoiceItemDetails() {
    const select = document.getElementById('selectInvoiceItem');
    const selectedIndex = select.value;
    
    if (selectedIndex !== '') {
        const item = inventory[selectedIndex];
        // Price is automatically set from inventory, quantity can be adjusted
        document.getElementById('invoiceItemQuantity').value = 1;
        document.getElementById('invoiceItemUnit').value = '';
    }
}

function addSelectedItemToInvoice() {
    const select = document.getElementById('selectInvoiceItem');
    const selectedIndex = select.value;
    const quantity = parseInt(document.getElementById('invoiceItemQuantity').value);
    const unit = document.getElementById('invoiceItemUnit').value.trim();
    
    if (selectedIndex === '' || isNaN(quantity) || quantity <= 0) {
        showMessage('Error', 'Please select an item and enter a valid quantity.');
        return;
    }
    
    const item = inventory[selectedIndex];
    const newInvoiceItem = {
        name: item.name,
        quantity: quantity,
        unit: unit || '',
        price: item.price,
        total: quantity * item.price
    };
    
    invoiceItems.push(newInvoiceItem);
    updateInvoiceItemsDisplay();
    renderInvoicePreview();
    closeAddItemModal();
    showMessage('Success', 'Item added to invoice!');
}

// Dashboard Functions
function updateDashboard() {
    // Calculate total sales
    let totalSales = 0;
    salesHistory.forEach(sale => {
        totalSales += sale.total;
    });
    
    document.getElementById('totalSales').textContent = `${businessSettings.currency} ${totalSales.toFixed(2)}`;
    document.getElementById('totalItems').textContent = inventory.length;
    document.getElementById('totalInvoices').textContent = salesHistory.length;
    
    // Update recent sales
    updateRecentSales();
    
    // Update invoice counter badge
    document.getElementById('invoiceCountBadge').textContent = salesHistory.length;
}

function updateRecentSales() {
    const tbody = document.getElementById('recentSalesBody');
    tbody.innerHTML = '';
    
    const recentSales = salesHistory.slice(-5).reverse();
    
    if (recentSales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No recent sales. Generate an invoice to see data here.</td></tr>';
        return;
    }
    
    recentSales.forEach(sale => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td>${sale.customer}</td>
            <td>${businessSettings.currency} ${sale.total.toFixed(2)}</td>
            <td>${sale.items.length} items</td>
        `;
    });
}

// Sales History Functions
function updateSalesHistory() {
    const tbody = document.getElementById('salesHistoryTableBody');
    tbody.innerHTML = '';
    
    if (salesHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No sales recorded yet. Generate an invoice to see data here.</td></tr>';
        return;
    }
    
    salesHistory.slice().reverse().forEach(sale => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${sale.id}</td>
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td>${sale.customer}</td>
            <td>${businessSettings.currency} ${sale.total.toFixed(2)}</td>
            <td>${sale.items.length} items</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="viewSaleDetails('${sale.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;
    });
}

function viewSaleDetails(saleId) {
    const sale = salesHistory.find(s => s.id === saleId);
    if (sale) {
        let itemsList = sale.items.map(item => {
            const quantityWithUnit = item.unit ? `${item.quantity} ${item.unit}` : item.quantity;
            return `${quantityWithUnit} x ${item.name} @ ${businessSettings.currency} ${item.price.toFixed(2)}`;
        }).join('\n');
        
        showMessage('Sale Details', `Invoice: ${sale.id}\nCustomer: ${sale.customer}\nDate: ${new Date(sale.date).toLocaleDateString()}\nTotal: ${businessSettings.currency} ${sale.total.toFixed(2)}\n\nItems:\n${itemsList}`);
    }
}

// Sales Breakdown Functions
function displaySalesBreakdown(type) {
    // Update button states
    document.querySelectorAll('.breakdown-options button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${type}BreakdownBtn`).classList.add('active');
    
    // Hide all breakdown contents
    document.querySelectorAll('.breakdown-content').forEach(content => content.style.display = 'none');
    
    // Show selected breakdown
    document.getElementById(`${type}BreakdownContent`).style.display = 'block';
    
    // Generate data based on type
    switch(type) {
        case 'monthly':
            generateMonthlyBreakdown();
            break;
        case 'yearly':
            generateYearlyBreakdown();
            break;
        case 'product':
            generateProductBreakdown();
            break;
    }
}

function generateMonthlyBreakdown() {
    const monthlyData = {};
    
    salesHistory.forEach(sale => {
        const date = new Date(sale.date);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { total: 0, count: 0 };
        }
        
        monthlyData[monthKey].total += sale.total;
        monthlyData[monthKey].count += 1;
    });
    
    // Update table
    const tbody = document.getElementById('monthlySalesTableBody');
    tbody.innerHTML = '';
    
    Object.keys(monthlyData).sort().reverse().forEach(month => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${month}</td>
            <td>${businessSettings.currency} ${monthlyData[month].total.toFixed(2)}</td>
            <td>${monthlyData[month].count}</td>
        `;
    });
}

function generateYearlyBreakdown() {
    const yearlyData = {};
    
    salesHistory.forEach(sale => {
        const year = new Date(sale.date).getFullYear().toString();
        
        if (!yearlyData[year]) {
            yearlyData[year] = { total: 0, count: 0 };
        }
        
        yearlyData[year].total += sale.total;
        yearlyData[year].count += 1;
    });
    
    // Update table
    const tbody = document.getElementById('yearlySalesTableBody');
    tbody.innerHTML = '';
    
    Object.keys(yearlyData).sort().reverse().forEach(year => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${year}</td>
            <td>${businessSettings.currency} ${yearlyData[year].total.toFixed(2)}</td>
            <td>${yearlyData[year].count}</td>
        `;
    });
}

function generateProductBreakdown() {
    const productData = {};
    
    salesHistory.forEach(sale => {
        sale.items.forEach(item => {
            if (!productData[item.name]) {
                productData[item.name] = { quantity: 0, revenue: 0 };
            }
            
            productData[item.name].quantity += item.quantity;
            productData[item.name].revenue += item.total;
        });
    });
    
    // Update table
    const tbody = document.getElementById('productSalesTableBody');
    tbody.innerHTML = '';
    
    Object.keys(productData).forEach(productName => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${productName}</td>
            <td>${productData[productName].quantity}</td>
            <td>${businessSettings.currency} ${productData[productName].revenue.toFixed(2)}</td>
        `;
    });
}

// AI Chat Functions
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    input.value = '';
    
    // Generate AI response
    generateAIResponse(message);
}

function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    messageDiv.innerHTML = `
        <div class="avatar">${sender === 'ai' ? 'AI' : 'U'}</div>
        <div class="chat-bubble">${message}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateAIResponse(userMessage) {
    // Simple AI responses based on inventory and business data
    let response = '';
    
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('inventory') || lowerMessage.includes('stock')) {
        response = `We currently have ${inventory.length} items in stock. Our top categories include: ${getTopCategories()}.`;
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        const item = findItemInMessage(lowerMessage);
        if (item) {
            response = `${item.name} costs ${businessSettings.currency} ${item.price.toFixed(2)}.`;
        } else {
            response = 'Could you specify which item you\'re asking about? I can check our current prices.';
        }
    } else if (lowerMessage.includes('available') || lowerMessage.includes('have')) {
        const item = findItemInMessage(lowerMessage);
        if (item) {
            response = `Yes, we have ${item.name} in stock. Current quantity: ${item.stock} units at ${businessSettings.currency} ${item.price.toFixed(2)} each.`;
        } else {
            response = 'What specific item are you looking for? I can check our inventory.';
        }
    } else if (lowerMessage.includes('sales') || lowerMessage.includes('revenue')) {
        const totalSales = salesHistory.reduce((sum, sale) => sum + sale.total, 0);
        response = `Our total sales so far: ${businessSettings.currency} ${totalSales.toFixed(2)} from ${salesHistory.length} transactions.`;
    } else {
        response = 'I can help you with inventory questions, pricing, stock availability, and sales information. What would you like to know?';
    }
    
    // Add AI response with a slight delay
    setTimeout(() => {
        addChatMessage(response, 'ai');
    }, 500);
}

function findItemInMessage(message) {
    return inventory.find(item => 
        message.includes(item.name.toLowerCase()) || 
        item.name.toLowerCase().includes(message.replace(/[^a-z\s]/g, ''))
    );
}

function getTopCategories() {
    const categories = {};
    inventory.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + 1;
    });
    
    return Object.keys(categories)
        .sort((a, b) => categories[b] - categories[a])
        .slice(0, 3)
        .join(', ');
}

function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="chat-message ai">
            <div class="avatar">AI</div>
            <div class="chat-bubble">Hello! I'm FanyaBot, your AI assistant. I can help customers check your inventory, prices, and availability. Ask me anything like "Do you have BlueBand?" or "How much is 1kg rice?"</div>
        </div>
    `;
}

// Settings Functions
function loadBusinessSettings() {
    document.getElementById('businessName').value = businessSettings.name;
    document.getElementById('businessAddress').value = businessSettings.address;
    document.getElementById('businessCity').value = businessSettings.city;
    document.getElementById('businessPhone').value = businessSettings.phone;
    document.getElementById('businessEmail').value = businessSettings.email;
    document.getElementById('currency').value = businessSettings.currency;
    document.getElementById('taxRate').value = businessSettings.taxRate;
}

function saveSettings() {
    businessSettings.name = document.getElementById('businessName').value || 'Your Business';
    businessSettings.address = document.getElementById('businessAddress').value || 'Your Address';
    businessSettings.city = document.getElementById('businessCity').value || 'Your City';
    businessSettings.phone = document.getElementById('businessPhone').value || 'Your Phone';
    businessSettings.email = document.getElementById('businessEmail').value || 'your@email.com';
    businessSettings.currency = document.getElementById('currency').value || 'KES';
    businessSettings.taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    
    saveData();
    updateDashboard();
    showMessage('Success', 'Settings saved successfully!');
}

// CSV Import/Export Functions
function exportInventoryCSV() {
    if (inventory.length === 0) {
        showMessage('Error', 'No inventory data to export.');
        return;
    }
    
    const headers = ['ID', 'Name', 'Price', 'Stock', 'Category', 'Description'];
    const csvContent = [
        headers.join(','),
        ...inventory.map(item => [
            item.id,
            `"${item.name}"`,
            item.price,
            item.stock,
            `"${item.category}"`,
            `"${item.description}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    showMessage('Success', 'Inventory exported successfully!');
}

function importInventoryCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n');
            const headers = lines[0].split(',');
            
            let importedCount = 0;
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const values = line.split(',');
                if (values.length >= 4) {
                    const item = {
                        id: values[0] || generateItemId(),
                        name: values[1].replace(/"/g, ''),
                        price: parseFloat(values[2]) || 0,
                        stock: parseInt(values[3]) || 0,
                        category: values[4] ? values[4].replace(/"/g, '') : 'General',
                        description: values[5] ? values[5].replace(/"/g, '') : '',
                        dateAdded: new Date().toISOString()
                    };
                    
                    inventory.push(item);
                    importedCount++;
                }
            }
            
            saveData();
            updateInventoryDisplay();
            updateDashboard();
            showMessage('Success', `Imported ${importedCount} items successfully!`);
            
        } catch (error) {
            showMessage('Error', 'Failed to import CSV. Please check the file format.');
        }
    };
    
    reader.readAsText(file);
}

// Utility Functions
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const dueDate = nextMonth.toISOString().split('T')[0];
    
    document.getElementById('invoiceDate').value = today;
    document.getElementById('dueDate').value = dueDate;
}

// Event Listeners
document.getElementById('chatInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initialize charts (placeholder for Chart.js integration)
function initializeCharts() {
    // This would initialize Chart.js charts for revenue trends
    // Implementation depends on Chart.js library
}

// Call initialization
initializeCharts();

