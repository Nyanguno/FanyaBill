// Global Variables
let invoiceCount = 0;
let invoiceLimit = 10; // Updated from 3 to 10 for free tier
let currentInvoiceNumber = 1;
let inventory = [];
let salesData = [];
let businessInfo = {
    name: "Your Business",
    address: "Business Address",
    city: "City, Country"
};
let currency = "$";

// Initialize App
document.addEventListener("DOMContentLoaded", function() {
    loadData();
    updateUI();
    setupPayPalButton();
    checkProStatus();
});

// Data Management
function loadData() {
    // Load from localStorage
    const savedInvoiceCount = localStorage.getItem("fanyabill_invoice_count");
    const savedInventory = localStorage.getItem("fanyabill_inventory");
    const savedSalesData = localStorage.getItem("fanyabill_sales");
    const savedBusinessInfo = localStorage.getItem("fanyabill_business");
    const savedCurrency = localStorage.getItem("fanyabill_currency");
    const savedInvoiceNumber = localStorage.getItem("fanyabill_invoice_number");

    if (savedInvoiceCount) invoiceCount = parseInt(savedInvoiceCount);
    if (savedInventory) inventory = JSON.parse(savedInventory);
    if (savedSalesData) salesData = JSON.parse(savedSalesData);
    if (savedBusinessInfo) businessInfo = JSON.parse(savedBusinessInfo);
    if (savedCurrency) currency = savedCurrency;
    if (savedInvoiceNumber) currentInvoiceNumber = parseInt(savedInvoiceNumber);
}

function saveData() {
    localStorage.setItem("fanyabill_invoice_count", invoiceCount.toString());
    localStorage.setItem("fanyabill_inventory", JSON.stringify(inventory));
    localStorage.setItem("fanyabill_sales", JSON.stringify(salesData));
    localStorage.setItem("fanyabill_business", JSON.stringify(businessInfo));
    localStorage.setItem("fanyabill_currency", currency);
    localStorage.setItem("fanyabill_invoice_number", currentInvoiceNumber.toString());
}

// UI Management
function updateUI() {
    updateInvoiceStatus();
    updateDashboard();
    updateInventoryTable();
    updateSalesSummary();
    updateBusinessInfo();
}

function updateInvoiceStatus() {
    const invoiceCountEl = document.getElementById("invoiceCount");
    const invoiceLimitEl = document.getElementById("invoiceLimit");
    const dashboardInvoiceCount = document.getElementById("dashboardInvoiceCount");
    
    if (invoiceCountEl) invoiceCountEl.textContent = invoiceCount;
    if (invoiceLimitEl) invoiceLimitEl.textContent = isProUser() ? "∞" : invoiceLimit;
    if (dashboardInvoiceCount) dashboardInvoiceCount.textContent = invoiceCount;
}

function updateDashboard() {
    const dashboardRevenue = document.getElementById("dashboardRevenue");
    const dashboardProducts = document.getElementById("dashboardProducts");
    const dashboardLowStock = document.getElementById("dashboardLowStock");

    if (dashboardRevenue) {
        const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total, 0);
        dashboardRevenue.textContent = `${currency}${totalRevenue.toFixed(2)}`;
    }

    if (dashboardProducts) {
        dashboardProducts.textContent = inventory.length;
    }

    if (dashboardLowStock) {
        const lowStockItems = inventory.filter(item => item.stock <= 3);
        dashboardLowStock.textContent = lowStockItems.length;
    }
}

function updateInventoryTable() {
    const tableBody = document.getElementById("inventoryTableBody");
    if (!tableBody) return;

    if (inventory.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-state">
                <td colspan="5">
                    <div class="empty-message">
                        <i class="fas fa-box-open"></i>
                        <p>No products added yet. Click \"Add Product\" to get started.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = inventory.map((item, index) => {
        let statusClass = "stock-good";
        let statusText = "In Stock";
        
        if (item.stock === 0) {
            statusClass = "stock-out";
            statusText = "Out of Stock";
        } else if (item.stock <= 3) {
            statusClass = "stock-low";
            statusText = "Low Stock";
        }

        return `
            <tr>
                <td>${item.name}</td>
                <td>${currency}${item.price.toFixed(2)}</td>
                <td>${item.stock}</td>
                <td><span class="stock-status ${statusClass}">${statusText}</span></td>
                <td>
                    <button onclick="editProduct(${index})" class="btn-secondary" style="margin-right: 0.5rem;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProduct(${index})" class="btn-secondary">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function updateSalesSummary() {
    const totalSales = document.getElementById("totalSales");
    const totalItemsSold = document.getElementById("totalItemsSold");
    const averageSale = document.getElementById("averageSale");
    const topProductsList = document.getElementById("topProductsList");

    if (totalSales) {
        const total = salesData.reduce((sum, sale) => sum + sale.total, 0);
        totalSales.textContent = `${currency}${total.toFixed(2)}`;
    }

    if (totalItemsSold) {
        const items = salesData.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        totalItemsSold.textContent = items;
    }

    if (averageSale) {
        const average = salesData.length > 0 ? salesData.reduce((sum, sale) => sum + sale.total, 0) / salesData.length : 0;
        averageSale.textContent = `${currency}${average.toFixed(2)}`;
    }

    if (topProductsList) {
        const productSales = {};
        salesData.forEach(sale => {
            sale.items.forEach(item => {
                if (productSales[item.name]) {
                    productSales[item.name] += item.quantity;
                } else {
                    productSales[item.name] = item.quantity;
                }
            });
        });

        const sortedProducts = Object.entries(productSales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        topProductsList.innerHTML = sortedProducts.length > 0 
            ? sortedProducts.map(([name, qty]) => `<li>${name} (${qty} sold)</li>`).join("")
            : "<li>No sales data available</li>";
    }
}

function updateBusinessInfo() {
    const businessNameEl = document.getElementById("businessName");
    const businessAddressEl = document.getElementById("businessAddress");
    const businessCityEl = document.getElementById("businessCity");
    const businessPhoneEl = document.getElementById("businessPhone");
    const businessEmailEl = document.getElementById("businessEmail");
    const currencyEl = document.getElementById("currency");

    if (businessNameEl) businessNameEl.value = businessInfo.name || "";
    if (businessAddressEl) businessAddressEl.value = businessInfo.address || "";
    if (businessCityEl) businessCityEl.value = businessInfo.city || "";
    if (businessPhoneEl) businessPhoneEl.value = businessInfo.phone || "";
    if (businessEmailEl) businessEmailEl.value = businessInfo.email || "";
    if (currencyEl) currencyEl.value = currency || "$";
}

// Navigation
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll(".content-section");
    sections.forEach(section => section.classList.remove("active"));

    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.add("active");

    // Update navigation
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => item.classList.remove("active"));
    
    const activeNavItem = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeNavItem) activeNavItem.classList.add("active");

    // Update content based on section
    if (sectionId === "dashboard") {
        updateDashboard();
    } else if (sectionId === "inventory") {
        updateInventoryTable();
    } else if (sectionId === "sales-history") {
        updateSalesHistory();
    }
}

// Alert System
function showAlert(message, type = "success") {
    const alertBanner = document.createElement("div");
    alertBanner.className = `alert-banner ${type}`;
    alertBanner.innerHTML = `
        <span>${message}</span>
        <button class="close-button" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(alertBanner);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertBanner.parentElement) {
            alertBanner.remove();
        }
    }, 5000);
}

function showLowStockAlert() {
    const lowStockItems = inventory.filter(item => item.stock <= 3 && item.stock > 0);
    const outOfStockItems = inventory.filter(item => item.stock === 0);
    
    if (lowStockItems.length > 0 || outOfStockItems.length > 0) {
        let message = "";
        if (outOfStockItems.length > 0) {
            message += `${outOfStockItems.length} item(s) out of stock. `;
        }
        if (lowStockItems.length > 0) {
            message += `${lowStockItems.length} item(s) running low.`;
        }
        
        const alert = document.getElementById("lowStockAlert");
        const messageEl = document.getElementById("lowStockMessage");
        if (alert && messageEl) {
            messageEl.textContent = message;
            alert.style.display = "flex";
        }
    }
}

function hideLowStockAlert() {
    const alert = document.getElementById("lowStockAlert");
    if (alert) alert.style.display = "none";
}

// Client-side PDF Generation using jsPDF and html2canvas
function generateAndDownloadInvoice() {
    try {
        // Show loading state
        const downloadBtn = document.querySelector('[onclick="generateAndDownloadInvoice()"]');
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        downloadBtn.disabled = true;

        // Get the invoice document element
        const invoiceElement = document.getElementById('invoiceDocument');
        
        if (!invoiceElement) {
            throw new Error('Invoice document not found');
        }

        // Configure html2canvas options for better quality
        const html2canvasOptions = {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: invoiceElement.scrollWidth,
            height: invoiceElement.scrollHeight,
            scrollX: 0,
            scrollY: 0
        };

        // Generate canvas from HTML
        html2canvas(invoiceElement, html2canvasOptions).then(canvas => {
            try {
                // Create jsPDF instance
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                // Calculate dimensions to fit A4
                const imgWidth = 210; // A4 width in mm
                const pageHeight = 297; // A4 height in mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                // Convert canvas to image
                const imgData = canvas.toDataURL('image/png', 1.0);
                
                // Add image to PDF
                if (imgHeight <= pageHeight) {
                    // Single page
                    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                } else {
                    // Multiple pages if content is too long
                    let heightLeft = imgHeight;
                    let position = 0;
                    
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                    
                    while (heightLeft >= 0) {
                        position = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                    }
                }

                // Generate filename
                const invoiceNumber = document.getElementById('previewInvoiceNumber').textContent || 'invoice';
                const customerName = document.getElementById('previewCustomerName').textContent || 'customer';
                const filename = `invoice-${invoiceNumber}-${customerName.replace(/\s+/g, '-').toLowerCase()}.pdf`;

                // Save the PDF
                pdf.save(filename);

                // Show success message
                showAlert('PDF downloaded successfully!', 'success');

                // Record the sale if not already recorded
                recordSale();

            } catch (pdfError) {
                console.error('PDF generation error:', pdfError);
                showAlert('Failed to generate PDF. Please try again.', 'danger');
            } finally {
                // Restore button state
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            }
        }).catch(canvasError => {
            console.error('Canvas generation error:', canvasError);
            showAlert('Failed to capture invoice content. Please try again.', 'danger');
            
            // Restore button state
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        showAlert('Failed to generate PDF: ' + error.message, 'danger');
        
        // Restore button state if button exists
        const downloadBtn = document.querySelector('[onclick="generateAndDownloadInvoice()"]');
        if (downloadBtn) {
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
            downloadBtn.disabled = false;
        }
    }
}

// Record sale when PDF is generated
function recordSale() {
    const invoiceItems = getInvoiceItems();
    if (invoiceItems.length === 0) return;

    const customerName = document.getElementById('customerName').value || 'Walk-in Customer';
    const invoiceDate = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];
    
    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const sale = {
        id: Date.now(),
        invoiceNumber: currentInvoiceNumber,
        date: invoiceDate,
        customer: customerName,
        items: invoiceItems,
        subtotal: subtotal,
        tax: taxAmount,
        total: total
    };

    salesData.push(sale);
    
    // Update inventory
    invoiceItems.forEach(invoiceItem => {
        const inventoryItem = inventory.find(item => item.name === invoiceItem.name);
        if (inventoryItem) {
            inventoryItem.stock = Math.max(0, inventoryItem.stock - invoiceItem.quantity);
        }
    });

    // Increment counters
    invoiceCount++;
    currentInvoiceNumber++;
    
    // Save data
    saveData();
    updateUI();
    
    // Check for low stock
    showLowStockAlert();
}

function clearInvoice() {
    const invoicePreview = document.getElementById("invoicePreview");
    const saleDescription = document.getElementById("saleDescription");
    
    if (invoicePreview) invoicePreview.style.display = "none";
    if (saleDescription) saleDescription.value = "";
}

// Inventory Management
function showAddProductModal() {
    const modal = document.getElementById("addProductModal");
    if (modal) modal.style.display = "flex";
}

function hideAddProductModal() {
    const modal = document.getElementById("addProductModal");
    if (modal) modal.style.display = "none";
}

function addInventoryItem() {
    const name = document.getElementById("productName").value.trim();
    const price = parseFloat(document.getElementById("productPrice").value);
    const stock = parseInt(document.getElementById("productStock").value);
    const category = document.getElementById("itemCategory").value.trim();
    const description = document.getElementById("itemDescription").value.trim();

    if (!name || isNaN(price) || isNaN(stock) || price < 0 || stock < 0) {
        showAlert("Please fill in all required fields with valid values.", "danger");
        return;
    }

    // Check if item already exists
    const existingItem = inventory.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (existingItem) {
        showAlert("An item with this name already exists.", "warning");
        return;
    }

    const newItem = {
        id: Date.now(),
        name: name,
        price: price,
        stock: stock,
        category: category || "General",
        description: description || ""
    };

    inventory.push(newItem);
    saveData();
    updateInventoryTable();
    clearInventoryForm();
    showAlert(`${name} added to inventory successfully!`, "success");
}

function clearInventoryForm() {
    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productStock").value = "";
    document.getElementById("itemCategory").value = "";
    document.getElementById("itemDescription").value = "";
}

function editProduct(index) {
    const item = inventory[index];
    if (!item) return;

    document.getElementById("productName").value = item.name;
    document.getElementById("productPrice").value = item.price;
    document.getElementById("productStock").value = item.stock;
    document.getElementById("itemCategory").value = item.category || "";
    document.getElementById("itemDescription").value = item.description || "";

    // Remove the item temporarily (will be re-added when form is submitted)
    inventory.splice(index, 1);
    saveData();
    updateInventoryTable();
}

function deleteProduct(index) {
    if (confirm("Are you sure you want to delete this product?")) {
        const item = inventory[index];
        inventory.splice(index, 1);
        saveData();
        updateInventoryTable();
        showAlert(`${item.name} removed from inventory.`, "success");
    }
}

// Invoice Management
let invoiceItems = [];

function getInvoiceItems() {
    return invoiceItems;
}

function addInvoiceItem() {
    const name = document.getElementById("itemName").value.trim();
    const quantity = parseInt(document.getElementById("itemQuantity").value);
    const price = parseFloat(document.getElementById("itemPrice").value);

    if (!name || isNaN(quantity) || isNaN(price) || quantity <= 0 || price < 0) {
        showAlert("Please fill in all item fields with valid values.", "danger");
        return;
    }

    const item = {
        name: name,
        quantity: quantity,
        price: price,
        total: quantity * price
    };

    invoiceItems.push(item);
    updateInvoiceItemsTable();
    clearInvoiceItemForm();
    renderInvoicePreview();
}

function clearInvoiceItemForm() {
    document.getElementById("itemName").value = "";
    document.getElementById("itemQuantity").value = "";
    document.getElementById("itemPrice").value = "";
}

function removeInvoiceItem(index) {
    invoiceItems.splice(index, 1);
    updateInvoiceItemsTable();
    renderInvoicePreview();
}

function updateInvoiceItemsTable() {
    const tbody = document.getElementById("invoiceItemsBody");
    if (!tbody) return;

    if (invoiceItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No items added yet</td>
            </tr>
        `;
    } else {
        tbody.innerHTML = invoiceItems.map((item, index) => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${currency}${item.price.toFixed(2)}</td>
                <td>${currency}${item.total.toFixed(2)}</td>
                <td>
                    <button onclick="removeInvoiceItem(${index})" class="btn btn-secondary btn-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join("");
    }

    updateInvoiceTotals();
}

function updateInvoiceTotals() {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = parseFloat(document.getElementById("taxRate").value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount;

    const subtotalEl = document.getElementById("invoiceSubtotal");
    const taxAmountEl = document.getElementById("invoiceTaxAmount");
    const taxRateDisplayEl = document.getElementById("invoiceTaxRateDisplay");
    const grandTotalEl = document.getElementById("invoiceGrandTotal");

    if (subtotalEl) subtotalEl.textContent = `${currency}${subtotal.toFixed(2)}`;
    if (taxAmountEl) taxAmountEl.textContent = `${currency}${taxAmount.toFixed(2)}`;
    if (taxRateDisplayEl) taxRateDisplayEl.textContent = taxRate.toFixed(1);
    if (grandTotalEl) grandTotalEl.textContent = `${currency}${grandTotal.toFixed(2)}`;
}

// Invoice Preview
function prepareInvoiceForPreview() {
    if (invoiceItems.length === 0) {
        showAlert("Please add at least one item to the invoice.", "warning");
        return;
    }

    if (!isProUser() && invoiceCount >= invoiceLimit) {
        showUpgradeModal();
        return;
    }

    renderInvoicePreview();
    showInvoicePreviewModal();
}

function renderInvoicePreview() {
    // Get custom branding settings
    const customLogo = localStorage.getItem("fanyabill_custom_logo");
    const customColor = localStorage.getItem("fanyabill_custom_color") || "#3b82f6";
    
    // Update business information
    document.getElementById("previewBusinessName").textContent = businessInfo.name || "Your Business";
    document.getElementById("previewBusinessAddress").textContent = businessInfo.address || "Business Address";
    document.getElementById("previewBusinessCity").textContent = businessInfo.city || "City, Country";
    document.getElementById("previewBusinessPhone").textContent = businessInfo.phone || "+254 700 123 456";
    document.getElementById("previewBusinessEmail").textContent = businessInfo.email || "info@yourbusiness.com";

    // Update custom logo if available
    const logoElement = document.getElementById("previewBusinessLogo");
    if (logoElement && customLogo && isProUser()) {
        logoElement.src = customLogo;
        logoElement.style.display = "block";
    } else if (logoElement) {
        logoElement.style.display = "none";
    }

    // Apply custom colors if Pro user
    if (isProUser() && customColor) {
        const invoiceDocument = document.getElementById("invoiceDocument");
        if (invoiceDocument) {
            invoiceDocument.style.setProperty('--custom-primary-color', customColor);
        }
    }

    // Update invoice details
    document.getElementById("previewInvoiceNumber").textContent = `INV-${String(currentInvoiceNumber).padStart(4, '0')}`;
    
    const invoiceDate = document.getElementById("invoiceDate").value || new Date().toISOString().split('T')[0];
    const dueDate = document.getElementById("dueDate").value || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];
    
    document.getElementById("previewInvoiceDate").textContent = formatDate(invoiceDate);
    document.getElementById("previewDueDate").textContent = formatDate(dueDate);

    // Update customer information
    const customerName = document.getElementById("customerName").value || "Walk-in Customer";
    const customerAddress = document.getElementById("customerAddress").value || "Customer Address";
    
    document.getElementById("previewCustomerName").textContent = customerName;
    document.getElementById("previewCustomerAddress").textContent = customerAddress;
    document.getElementById("previewCustomerCity").textContent = customerAddress;
    
    // Ship to same as bill to
    document.getElementById("previewShipToName").textContent = customerName;
    document.getElementById("previewShipToAddress").textContent = customerAddress;
    document.getElementById("previewShipToCity").textContent = customerAddress;

    // Update invoice items
    const itemsBody = document.getElementById("invoicePdfItemsBody");
    if (itemsBody) {
        itemsBody.innerHTML = invoiceItems.map(item => `
            <tr>
                <td class="qty-col">${item.quantity}</td>
                <td class="desc-col">${item.name}</td>
                <td class="price-col">${currency}${item.price.toFixed(2)}</td>
                <td class="total-col">${currency}${item.total.toFixed(2)}</td>
            </tr>
        `).join("");
    }

    // Update totals
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = parseFloat(document.getElementById("taxRate").value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount;

    document.getElementById("pdfInvoiceSubtotal").textContent = `${currency}${subtotal.toFixed(2)}`;
    document.getElementById("pdfInvoiceTaxRate").textContent = taxRate.toFixed(1);
    document.getElementById("pdfInvoiceTax").textContent = `${currency}${taxAmount.toFixed(2)}`;
    document.getElementById("pdfInvoiceTotal").textContent = `${currency}${grandTotal.toFixed(2)}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: '2-digit' 
    });
}

function showInvoicePreviewModal() {
    const modal = document.getElementById("invoicePreviewModal");
    if (modal) modal.style.display = "flex";
}

function hideInvoicePreviewModal() {
    const modal = document.getElementById("invoicePreviewModal");
    if (modal) modal.style.display = "none";
}

// Add Item from Inventory Modal
function openAddItemModal() {
    const modal = document.getElementById("addItemModal");
    const select = document.getElementById("selectInvoiceItem");
    
    if (!modal || !select) return;

    // Populate select with inventory items
    select.innerHTML = '<option value="">Select an item...</option>';
    inventory.forEach((item, index) => {
        if (item.stock > 0) {
            select.innerHTML += `<option value="${index}">${item.name} - ${currency}${item.price.toFixed(2)} (Stock: ${item.stock})</option>`;
        }
    });

    modal.style.display = "flex";
}

function closeAddItemModal() {
    const modal = document.getElementById("addItemModal");
    if (modal) modal.style.display = "none";
}

function populateInvoiceItemDetails() {
    const select = document.getElementById("selectInvoiceItem");
    const quantityInput = document.getElementById("invoiceItemQuantity");
    
    if (select.value === "") {
        quantityInput.value = 1;
        return;
    }

    const item = inventory[parseInt(select.value)];
    if (item) {
        quantityInput.max = item.stock;
        quantityInput.value = Math.min(1, item.stock);
    }
}

function addSelectedItemToInvoice() {
    const select = document.getElementById("selectInvoiceItem");
    const quantityInput = document.getElementById("invoiceItemQuantity");
    
    if (select.value === "") {
        showAlert("Please select an item.", "warning");
        return;
    }

    const item = inventory[parseInt(select.value)];
    const quantity = parseInt(quantityInput.value);

    if (!item || isNaN(quantity) || quantity <= 0 || quantity > item.stock) {
        showAlert("Invalid quantity selected.", "danger");
        return;
    }

    const invoiceItem = {
        name: item.name,
        quantity: quantity,
        price: item.price,
        total: quantity * item.price
    };

    invoiceItems.push(invoiceItem);
    updateInvoiceItemsTable();
    closeAddItemModal();
    renderInvoicePreview();
    showAlert(`${item.name} added to invoice.`, "success");
}

// AI Item Generation
async function generateItemsFromAI() {
    const description = document.getElementById("aiDescription").value.trim();
    
    if (!description) {
        showAlert("Please enter a description for AI generation.", "warning");
        return;
    }

    const button = document.querySelector('[onclick="generateItemsFromAI()"]');
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
                prompt: `Parse this sale description and extract items with quantities and prices. Return a JSON array of objects with 'name', 'quantity', and 'price' fields. Description: "${description}"`
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
                throw new Error("No valid JSON found in AI response");
            }
        } catch (parseError) {
            throw new Error("Failed to parse AI response");
        }

        // Add items to invoice
        if (Array.isArray(items) && items.length > 0) {
            items.forEach(item => {
                if (item.name && item.quantity && item.price) {
                    invoiceItems.push({
                        name: item.name,
                        quantity: parseInt(item.quantity),
                        price: parseFloat(item.price),
                        total: parseInt(item.quantity) * parseFloat(item.price)
                    });
                }
            });
            
            updateInvoiceItemsTable();
            renderInvoicePreview();
            document.getElementById("aiDescription").value = "";
            showAlert(`${items.length} items generated successfully!`, "success");
        } else {
            throw new Error("No valid items found in AI response");
        }

    } catch (error) {
        console.error('AI Generation Error:', error);
        showAlert(`Failed to generate items using AI: ${error.message}. Please try again or add manually.`, "danger");
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Sales History
function updateSalesHistory() {
    const tbody = document.getElementById("salesHistoryTableBody");
    if (!tbody) return;

    if (salesData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No sales recorded yet</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = salesData.slice().reverse().map(sale => `
        <tr>
            <td>INV-${String(sale.invoiceNumber).padStart(4, '0')}</td>
            <td>${formatDate(sale.date)}</td>
            <td>${sale.customer}</td>
            <td>${currency}${sale.total.toFixed(2)}</td>
            <td>${sale.items.length} item(s)</td>
            <td>
                <button onclick="viewSaleDetails(${sale.id})" class="btn btn-secondary btn-sm">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        </tr>
    `).join("");
}

function viewSaleDetails(saleId) {
    const sale = salesData.find(s => s.id === saleId);
    if (!sale) return;

    const itemsList = sale.items.map(item => 
        `${item.quantity}x ${item.name} @ ${currency}${item.price.toFixed(2)} = ${currency}${item.total.toFixed(2)}`
    ).join('\n');

    showMessage(
        `Invoice #${sale.invoiceNumber} Details`,
        `Customer: ${sale.customer}\nDate: ${formatDate(sale.date)}\n\nItems:\n${itemsList}\n\nSubtotal: ${currency}${sale.subtotal.toFixed(2)}\nTax: ${currency}${sale.tax.toFixed(2)}\nTotal: ${currency}${sale.total.toFixed(2)}`
    );
}

// Settings
function saveSettings() {
    businessInfo.name = document.getElementById("businessName").value.trim() || "Your Business";
    businessInfo.address = document.getElementById("businessAddress").value.trim() || "Business Address";
    businessInfo.city = document.getElementById("businessCity").value.trim() || "City, Country";
    businessInfo.phone = document.getElementById("businessPhone").value.trim() || "+254 700 123 456";
    businessInfo.email = document.getElementById("businessEmail").value.trim() || "info@yourbusiness.com";
    
    currency = document.getElementById("currency").value.trim() || "KES";
    
    const taxRateInput = document.getElementById("taxRate");
    if (taxRateInput) {
        const taxRate = parseFloat(taxRateInput.value) || 0;
        localStorage.setItem("fanyabill_tax_rate", taxRate.toString());
    }

    saveData();
    updateUI();
    showAlert("Settings saved successfully!", "success");
}

// Custom Branding Functions
function uploadLogo() {
    const input = document.getElementById("logoUpload");
    if (!input || !isProUser()) {
        showAlert("Logo upload is available for Pro users only.", "warning");
        return;
    }
    
    input.click();
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showAlert("Please select a valid image file.", "danger");
        return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showAlert("Image file size must be less than 2MB.", "danger");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const logoData = e.target.result;
        localStorage.setItem("fanyabill_custom_logo", logoData);
        
        // Update logo preview
        const logoPreview = document.getElementById("logoPreview");
        if (logoPreview) {
            logoPreview.src = logoData;
            logoPreview.style.display = "block";
        }
        
        showAlert("Logo uploaded successfully!", "success");
    };
    
    reader.readAsDataURL(file);
}

function removeLogo() {
    if (!isProUser()) {
        showAlert("Logo customization is available for Pro users only.", "warning");
        return;
    }
    
    localStorage.removeItem("fanyabill_custom_logo");
    
    const logoPreview = document.getElementById("logoPreview");
    if (logoPreview) {
        logoPreview.style.display = "none";
    }
    
    showAlert("Logo removed successfully!", "success");
}

function updateInvoiceColor() {
    const colorInput = document.getElementById("invoiceColor");
    if (!colorInput || !isProUser()) {
        showAlert("Color customization is available for Pro users only.", "warning");
        return;
    }
    
    const selectedColor = colorInput.value;
    localStorage.setItem("fanyabill_custom_color", selectedColor);
    showAlert("Invoice color updated successfully!", "success");
}

// Data Export/Import Functions
function exportData() {
    const exportData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        invoiceCount: invoiceCount,
        currentInvoiceNumber: currentInvoiceNumber,
        inventory: inventory,
        salesData: salesData,
        businessInfo: businessInfo,
        currency: currency,
        customLogo: localStorage.getItem("fanyabill_custom_logo"),
        customColor: localStorage.getItem("fanyabill_custom_color"),
        proUser: localStorage.getItem("fanyabill_pro_user"),
        taxRate: localStorage.getItem("fanyabill_tax_rate")
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fanyabill-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showAlert("Data exported successfully!", "success");
}

function importData() {
    const input = document.getElementById("dataImport");
    if (!input) return;
    input.click();
}

function handleDataImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!importedData.version || !importedData.timestamp) {
                throw new Error("Invalid backup file format");
            }
            
            // Restore data
            if (importedData.invoiceCount !== undefined) invoiceCount = importedData.invoiceCount;
            if (importedData.currentInvoiceNumber !== undefined) currentInvoiceNumber = importedData.currentInvoiceNumber;
            if (importedData.inventory) inventory = importedData.inventory;
            if (importedData.salesData) salesData = importedData.salesData;
            if (importedData.businessInfo) businessInfo = importedData.businessInfo;
            if (importedData.currency) currency = importedData.currency;
            
            // Restore settings
            if (importedData.customLogo) localStorage.setItem("fanyabill_custom_logo", importedData.customLogo);
            if (importedData.customColor) localStorage.setItem("fanyabill_custom_color", importedData.customColor);
            if (importedData.proUser) localStorage.setItem("fanyabill_pro_user", importedData.proUser);
            if (importedData.taxRate) localStorage.setItem("fanyabill_tax_rate", importedData.taxRate);
            
            // Save and update UI
            saveData();
            updateUI();
            
            showAlert("Data imported successfully!", "success");
            
        } catch (error) {
            console.error("Import error:", error);
            showAlert("Failed to import data. Please check the file format.", "danger");
        }
    };
    
    reader.readAsText(file);
    event.target.value = ""; // Reset file input
}

// Pro User Management
function isProUser() {
    return localStorage.getItem("fanyabill_pro_user") === "true";
}

function setProUser(isPro) {
    localStorage.setItem("fanyabill_pro_user", isPro.toString());
    updateUI();
    checkProStatus();
}

function checkProStatus() {
    const proStatus = document.getElementById("proStatus");
    const invoiceCountBadge = document.getElementById("invoiceCountBadge");
    
    if (isProUser()) {
        if (proStatus) proStatus.textContent = "Pro User";
        if (invoiceCountBadge) invoiceCountBadge.textContent = "∞";
    } else {
        if (proStatus) proStatus.textContent = "Free Tier";
        if (invoiceCountBadge) invoiceCountBadge.textContent = invoiceCount;
    }
}

function showUpgradeModal() {
    const modal = document.getElementById("upgradeModal");
    if (modal) modal.style.display = "flex";
}

function hideUpgradeModal() {
    const modal = document.getElementById("upgradeModal");
    if (modal) modal.style.display = "none";
}

// PayPal Integration
function setupPayPalButton() {
    if (typeof paypal !== 'undefined') {
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: '7.99'
                        }
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    setProUser(true);
                    hideUpgradeModal();
                    showAlert("Welcome to FanyaBill Pro! You now have unlimited access.", "success");
                    
                    // Redirect to success page
                    window.location.href = 'pro-success.html';
                });
            },
            onError: function(err) {
                console.error('PayPal Error:', err);
                showAlert("Payment failed. Please try again.", "danger");
            }
        }).render('#paypal-button-container');
    }
}

// Message Modal
function showMessage(title, message) {
    const modal = document.getElementById("messageModal");
    const titleEl = document.getElementById("messageTitle");
    const textEl = document.getElementById("messageText");
    
    if (modal && titleEl && textEl) {
        titleEl.textContent = title;
        textEl.textContent = message;
        modal.style.display = "flex";
    }
}

function hideMessageModal() {
    const modal = document.getElementById("messageModal");
    if (modal) modal.style.display = "none";
}

// CSV Import/Export
function exportInventoryCSV() {
    if (inventory.length === 0) {
        showAlert("No inventory data to export.", "warning");
        return;
    }

    const headers = ["Name", "Price", "Stock", "Category", "Description"];
    const csvContent = [
        headers.join(","),
        ...inventory.map(item => [
            `"${item.name}"`,
            item.price,
            item.stock,
            `"${item.category || ""}"`,
            `"${item.description || ""}"`
        ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fanyabill-inventory.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    
    showAlert("Inventory exported successfully!", "success");
}

function importInventoryCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split("\n");
            const headers = lines[0].split(",");
            
            let importedCount = 0;
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const values = line.split(",");
                if (values.length >= 3) {
                    const name = values[0].replace(/"/g, "").trim();
                    const price = parseFloat(values[1]);
                    const stock = parseInt(values[2]);
                    const category = values[3] ? values[3].replace(/"/g, "").trim() : "General";
                    const description = values[4] ? values[4].replace(/"/g, "").trim() : "";
                    
                    if (name && !isNaN(price) && !isNaN(stock)) {
                        // Check if item already exists
                        const existingIndex = inventory.findIndex(item => 
                            item.name.toLowerCase() === name.toLowerCase()
                        );
                        
                        if (existingIndex >= 0) {
                            // Update existing item
                            inventory[existingIndex] = {
                                ...inventory[existingIndex],
                                price: price,
                                stock: stock,
                                category: category,
                                description: description
                            };
                        } else {
                            // Add new item
                            inventory.push({
                                id: Date.now() + i,
                                name: name,
                                price: price,
                                stock: stock,
                                category: category,
                                description: description
                            });
                        }
                        importedCount++;
                    }
                }
            }
            
            saveData();
            updateInventoryTable();
            showAlert(`Successfully imported ${importedCount} items!`, "success");
            
        } catch (error) {
            console.error("CSV Import Error:", error);
            showAlert("Failed to import CSV. Please check the file format.", "danger");
        }
    };
    
    reader.readAsText(file);
    event.target.value = ""; // Reset file input
}

// Sales Breakdown
function displaySalesBreakdown(type) {
    // Update button states
    document.querySelectorAll('.breakdown-options button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${type}BreakdownBtn`).classList.add('active');

    // Hide all breakdown content
    document.querySelectorAll('.breakdown-content').forEach(content => {
        content.style.display = 'none';
    });

    // Show selected breakdown
    document.getElementById(`${type}BreakdownContent`).style.display = 'block';

    // Generate data based on type
    if (type === 'monthly') {
        generateMonthlySalesData();
    } else if (type === 'yearly') {
        generateYearlySalesData();
    } else if (type === 'product') {
        generateProductSalesData();
    }
}

function generateMonthlySalesData() {
    // Implementation for monthly sales data
    const monthlyData = {};
    salesData.forEach(sale => {
        const month = new Date(sale.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        if (!monthlyData[month]) {
            monthlyData[month] = { total: 0, count: 0 };
        }
        monthlyData[month].total += sale.total;
        monthlyData[month].count += 1;
    });

    const tbody = document.getElementById('monthlySalesTableBody');
    if (tbody) {
        tbody.innerHTML = Object.entries(monthlyData).map(([month, data]) => `
            <tr>
                <td>${month}</td>
                <td>${currency}${data.total.toFixed(2)}</td>
                <td>${data.count}</td>
            </tr>
        `).join('') || '<tr><td colspan="3" class="text-center">No sales data available</td></tr>';
    }
}

function generateYearlySalesData() {
    // Implementation for yearly sales data
    const yearlyData = {};
    salesData.forEach(sale => {
        const year = new Date(sale.date).getFullYear().toString();
        if (!yearlyData[year]) {
            yearlyData[year] = { total: 0, count: 0 };
        }
        yearlyData[year].total += sale.total;
        yearlyData[year].count += 1;
    });

    const tbody = document.getElementById('yearlySalesTableBody');
    if (tbody) {
        tbody.innerHTML = Object.entries(yearlyData).map(([year, data]) => `
            <tr>
                <td>${year}</td>
                <td>${currency}${data.total.toFixed(2)}</td>
                <td>${data.count}</td>
            </tr>
        `).join('') || '<tr><td colspan="3" class="text-center">No sales data available</td></tr>';
    }
}

function generateProductSalesData() {
    // Implementation for product sales data
    const productData = {};
    salesData.forEach(sale => {
        sale.items.forEach(item => {
            if (!productData[item.name]) {
                productData[item.name] = { quantity: 0, revenue: 0 };
            }
            productData[item.name].quantity += item.quantity;
            productData[item.name].revenue += item.total;
        });
    });

    const tbody = document.getElementById('productSalesTableBody');
    if (tbody) {
        tbody.innerHTML = Object.entries(productData).map(([product, data]) => `
            <tr>
                <td>${product}</td>
                <td>${data.quantity}</td>
                <td>${currency}${data.revenue.toFixed(2)}</td>
            </tr>
        `).join('') || '<tr><td colspan="3" class="text-center">No sales data available</td></tr>';
    }
}

// AI Chat Assistant
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;

    // Add user message to chat
    addMessageToChat(message, 'user');
    input.value = '';

    // Generate AI response
    try {
        const response = await generateAIResponse(message);
        addMessageToChat(response, 'ai');
    } catch (error) {
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'ai');
    }
}

function addMessageToChat(message, sender) {
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

async function generateAIResponse(userMessage) {
    // Create context about inventory for AI
    const inventoryContext = inventory.map(item => 
        `${item.name}: ${currency}${item.price.toFixed(2)} (Stock: ${item.stock})`
    ).join(', ');

    const prompt = `You are a helpful customer service assistant for a business. Here is the current inventory: ${inventoryContext}. 
    Customer question: "${userMessage}"
    Please provide a helpful response about product availability, prices, or general business information.`;

    try {
        const response = await fetch('/.netlify/functions/gemini-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error('Failed to get AI response');
        }

        const data = await response.json();
        return data.response || 'I apologize, but I cannot provide a response at the moment.';
    } catch (error) {
        console.error('AI Chat Error:', error);
        return 'I apologize, but I cannot connect to the AI service right now. Please try again later.';
    }
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

// Initialize date inputs
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];
    
    const invoiceDateInput = document.getElementById('invoiceDate');
    const dueDateInput = document.getElementById('dueDate');
    const taxRateInput = document.getElementById('taxRate');
    
    if (invoiceDateInput) invoiceDateInput.value = today;
    if (dueDateInput) dueDateInput.value = dueDate;
    if (taxRateInput) {
        const savedTaxRate = localStorage.getItem("fanyabill_tax_rate");
        taxRateInput.value = savedTaxRate || "16";
    }

    // Initialize custom branding UI
    initializeCustomBranding();
});

// Initialize custom branding UI
function initializeCustomBranding() {
    // Load saved logo
    const savedLogo = localStorage.getItem("fanyabill_custom_logo");
    const logoPreview = document.getElementById("logoPreview");
    if (logoPreview && savedLogo && isProUser()) {
        logoPreview.src = savedLogo;
        logoPreview.style.display = "block";
    }

    // Load saved color
    const savedColor = localStorage.getItem("fanyabill_custom_color");
    const colorInput = document.getElementById("invoiceColor");
    if (colorInput && savedColor) {
        colorInput.value = savedColor;
    }
}

// Handle Enter key in chat
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});


// Template Selection Functions
function selectTemplate(templateId) {
    // Remove active class from all template options
    document.querySelectorAll('.template-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Add active class to selected template
    const selectedOption = document.querySelector(`[data-template="${templateId}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    // Apply template styles
    if (typeof applyTemplate === 'function') {
        applyTemplate(templateId);
    }
    
    // Update invoice preview if it exists
    if (typeof renderInvoicePreview === 'function') {
        renderInvoicePreview();
    }
    
    showMessage('Template Updated', `Invoice template changed to ${templateId.charAt(0).toUpperCase() + templateId.slice(1)}`);
}

// Initialize templates on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load saved template or default to classic
    if (typeof loadSelectedTemplate === 'function') {
        const template = loadSelectedTemplate();
        
        // Update UI to reflect loaded template
        const templateOption = document.querySelector(`[data-template="${template.id}"]`);
        if (templateOption) {
            document.querySelectorAll('.template-option').forEach(option => {
                option.classList.remove('active');
            });
            templateOption.classList.add('active');
        }
    }
});

// Enhanced invoice preview rendering with template support
function renderInvoicePreview() {
    // Get current template
    const selectedTemplate = localStorage.getItem('selectedInvoiceTemplate') || 'classic';
    
    // Apply template styles to preview
    const invoiceDoc = document.getElementById('invoiceDocument');
    if (invoiceDoc) {
        // Remove existing template classes
        invoiceDoc.className = invoiceDoc.className.replace(/invoice-template-\w+/g, '');
        invoiceDoc.classList.add('invoice-document', `invoice-template-${selectedTemplate}`);
    }
    
    // Update business information
    const businessName = localStorage.getItem("fanyabill_business_name") || "Your Business Name";
    const businessAddress = localStorage.getItem("fanyabill_business_address") || "Your Business Address";
    const businessCity = localStorage.getItem("fanyabill_business_city") || "City, State, ZIP";
    const businessPhone = localStorage.getItem("fanyabill_business_phone") || "Phone Number";
    const businessEmail = localStorage.getItem("fanyabill_business_email") || "email@business.com";
    const currency = localStorage.getItem("fanyabill_currency") || "$";
    
    // Update preview elements
    const elements = {
        'previewBusinessName': businessName,
        'previewBusinessAddress': businessAddress,
        'previewBusinessCity': businessCity,
        'previewBusinessPhone': businessPhone,
        'previewBusinessEmail': businessEmail,
        'previewCustomerName': document.getElementById('customerName')?.value || 'Customer Name',
        'previewCustomerAddress': document.getElementById('customerAddress')?.value || 'Customer Address',
        'previewCustomerCity': document.getElementById('customerAddress')?.value || 'Customer City',
        'previewShipToName': document.getElementById('customerName')?.value || 'Customer Name',
        'previewShipToAddress': document.getElementById('customerAddress')?.value || 'Customer Address',
        'previewShipToCity': document.getElementById('customerAddress')?.value || 'Customer City',
        'previewInvoiceDate': document.getElementById('invoiceDate')?.value || new Date().toLocaleDateString(),
        'previewDueDate': document.getElementById('dueDate')?.value || new Date().toLocaleDateString(),
        'previewInvoiceNumber': `INV-${String(invoiceCount + 1).padStart(4, '0')}`
    };
    
    // Update all preview elements
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
    
    // Update logo if available and user is Pro
    const savedLogo = localStorage.getItem("fanyabill_custom_logo");
    const logoElement = document.getElementById("previewBusinessLogo");
    if (logoElement && savedLogo && isProUser()) {
        logoElement.src = savedLogo;
        logoElement.style.display = "block";
    } else if (logoElement) {
        logoElement.style.display = "none";
    }
    
    // Update custom color
    const savedColor = localStorage.getItem("fanyabill_custom_color");
    if (savedColor) {
        document.documentElement.style.setProperty('--custom-primary-color', savedColor);
    }
    
    // Update invoice items
    updateInvoicePreviewItems();
}

// Update invoice preview items
function updateInvoicePreviewItems() {
    const itemsBody = document.getElementById('invoicePdfItemsBody');
    const currency = localStorage.getItem("fanyabill_currency") || "$";
    
    if (itemsBody) {
        itemsBody.innerHTML = '';
        
        if (invoiceItems.length === 0) {
            itemsBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #666; font-style: italic;">
                        No items added yet. Add items to see them in the preview.
                    </td>
                </tr>
            `;
        } else {
            invoiceItems.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="qty-col">${item.quantity}</td>
                    <td class="desc-col">${item.name}</td>
                    <td class="price-col">${currency} ${parseFloat(item.price).toFixed(2)}</td>
                    <td class="total-col">${currency} ${(item.quantity * item.price).toFixed(2)}</td>
                `;
                itemsBody.appendChild(row);
            });
        }
    }
    
    // Update totals
    updateInvoicePreviewTotals();
}

// Update invoice preview totals
function updateInvoicePreviewTotals() {
    const currency = localStorage.getItem("fanyabill_currency") || "$";
    const taxRate = parseFloat(localStorage.getItem("fanyabill_tax_rate") || "0");
    
    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    // Update preview totals
    const elements = {
        'pdfInvoiceSubtotal': `${currency} ${subtotal.toFixed(2)}`,
        'pdfInvoiceTax': `${currency} ${taxAmount.toFixed(2)}`,
        'pdfInvoiceTotal': `${currency} ${total.toFixed(2)}`,
        'pdfInvoiceTaxRate': taxRate.toFixed(2)
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Enhanced prepare invoice for preview with template support
function prepareInvoiceForPreview() {
    // Ensure we have the latest template applied
    renderInvoicePreview();
    
    // Show the modal
    const modal = document.getElementById('invoicePreviewModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

