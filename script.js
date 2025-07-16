// Global Variables
let invoiceCount = 0;
let currentInvoiceItems = []; // Use this for items currently being added to the invoice
let inventoryItems = [];
let salesHistory = [];
let businessSettings = {}; // Initialize businessSettings

// Load settings and invoice count on startup
document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
    loadInvoiceCount();
    showSection("dashboard"); // Default to dashboard view
    updateProStatus();
    renderInvoicePreview(); // Initial render of invoice preview

    // Set current date for invoiceDate and dueDate if not already set
    const today = new Date().toISOString().split("T")[0];
    if (!document.getElementById("invoiceDate").value) {
        document.getElementById("invoiceDate").value = today;
    }
    if (!document.getElementById("dueDate").value) {
        document.getElementById("dueDate").value = today;
    }

    // Load existing invoice items if any (from previous session or draft)
    currentInvoiceItems = JSON.parse(localStorage.getItem("currentInvoiceItems")) || [];
    renderInvoiceItemsTable();
});

// Helper function to show alerts
function showAlert(message, type) {
    const alertBanner = document.getElementById("lowStockAlert");
    const lowStockMessage = document.getElementById("lowStockMessage");
    lowStockMessage.textContent = message;
    alertBanner.className = `alert-banner ${type}`;
    alertBanner.style.display = "flex";
    setTimeout(() => {
        alertBanner.style.display = "none";
    }, 5000);
}

function hideLowStockAlert() {
    document.getElementById("lowStockAlert").style.display = "none";
}

// Section navigation
function showSection(sectionId) {
    const sections = document.querySelectorAll(".content-section");
    sections.forEach(section => {
        section.classList.remove("active");
    });
    document.getElementById(sectionId).classList.add("active");

    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.classList.remove("active");
        // Check if the onclick attribute contains the sectionId
        if (item.getAttribute("onclick") && item.getAttribute("onclick").includes(`showSection(\'${sectionId}\')`)) {
            item.classList.add("active");
        }
    });

    // Adjust main content margin based on sidebar state
    const mainContent = document.getElementById("mainContent");
    const sidebar = document.getElementById("sidebar");
    if (sidebar.classList.contains("collapsed")) {
        mainContent.classList.add("sidebar-collapsed");
    } else {
        mainContent.classList.remove("sidebar-collapsed");
    }

    // Specific actions for sections
    if (sectionId === "dashboard") {
        renderDashboard();
    } else if (sectionId === "inventory") {
        renderInventoryTable();
    } else if (sectionId === "sales-history") {
        displaySalesBreakdown("monthly"); // Default to monthly breakdown
        renderSalesHistoryTable();
    } else if (sectionId === "settings") {
        loadSettings();
    }
}

// Settings Management
function saveSettings() {
    const businessName = document.getElementById("businessName").value;
    const businessAddress = document.getElementById("businessAddress").value;
    const businessCity = document.getElementById("businessCity").value;
    const businessPhone = document.getElementById("businessPhone").value;
    const businessEmail = document.getElementById("businessEmail").value;
    const currency = document.getElementById("currency").value;
    const taxRate = document.getElementById("taxRate").value;
    const googleSheetsUrl = document.getElementById("googleSheetsUrl").value;
    const logoData = localStorage.getItem("businessLogo");
    const invoiceColor = document.getElementById("invoiceColor").value;

    businessSettings = {
        businessName,
        businessAddress,
        businessCity,
        businessPhone,
        businessEmail,
        currency,
        taxRate,
        googleSheetsUrl,
        logoData,
        invoiceColor
    };
    localStorage.setItem("fanyabillSettings", JSON.stringify(businessSettings));
    showAlert("Settings saved successfully!", "success");
    renderInvoicePreview(); // Re-render preview with new settings
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem("fanyabillSettings"));
    if (settings) {
        businessSettings = settings; // Update global settings object
        document.getElementById("businessName").value = settings.businessName || "";
        document.getElementById("businessAddress").value = settings.businessAddress || "";
        document.getElementById("businessCity").value = settings.businessCity || "";
        document.getElementById("businessPhone").value = settings.businessPhone || "";
        document.getElementById("businessEmail").value = settings.businessEmail || "";
        document.getElementById("currency").value = settings.currency || "KSh"; // Default to KSh
        document.getElementById("taxRate").value = settings.taxRate || 0;
        document.getElementById("googleSheetsUrl").value = settings.googleSheetsUrl || "";
        document.getElementById("invoiceColor").value = settings.invoiceColor || "#3b82f6";

        // Load logo
        if (settings.logoData) {
            const logoPreview = document.getElementById("logoPreview");
            const logoPlaceholder = document.querySelector(".logo-placeholder");
            logoPreview.src = settings.logoData;
            logoPreview.style.display = "block";
            logoPlaceholder.style.display = "none";
        }
        updateInvoiceColor(); // Apply saved color to preview
    }
}

function updateInvoiceColor() {
    const color = document.getElementById("invoiceColor").value;
    document.getElementById("colorPreview").style.backgroundColor = color;
    // Update the CSS variable for the invoice preview
    document.documentElement.style.setProperty("--custom-primary-color", color);
    renderInvoicePreview(); // Re-render preview with new color
}

// Logo Upload
function uploadLogo() {
    document.getElementById("logoUpload").click();
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const logoData = e.target.result;
            localStorage.setItem("businessLogo", logoData);
            const logoPreview = document.getElementById("logoPreview");
            const logoPlaceholder = document.querySelector(".logo-placeholder");
            logoPreview.src = logoData;
            logoPreview.style.display = "block";
            logoPlaceholder.style.display = "none";
            showAlert("Logo uploaded successfully!", "success");
            renderInvoicePreview();
        };
        reader.readAsDataURL(file);
    }
}

function removeLogo() {
    localStorage.removeItem("businessLogo");
    const logoPreview = document.getElementById("logoPreview");
    const logoPlaceholder = document.querySelector(".logo-placeholder");
    logoPreview.src = "";
    logoPreview.style.display = "none";
    logoPlaceholder.style.display = "flex";
    showAlert("Logo removed!", "success");
    renderInvoicePreview();
}

// Inventory Management
inventoryItems = JSON.parse(localStorage.getItem("inventoryItems")) || [];

function saveInventory() {
    localStorage.setItem("inventoryItems", JSON.stringify(inventoryItems));
    renderInventoryTable();
    updateDashboardStats();
}

function addInventoryItem() {
    const productName = document.getElementById("productName").value;
    const productPrice = parseFloat(document.getElementById("productPrice").value);
    const productStock = parseInt(document.getElementById("productStock").value);
    const itemCategory = document.getElementById("itemCategory").value;
    const itemDescription = document.getElementById("itemDescription").value;

    if (productName && !isNaN(productPrice) && !isNaN(productStock)) {
        inventoryItems.push({
            id: Date.now(),
            name: productName,
            price: productPrice,
            stock: productStock,
            category: itemCategory,
            description: itemDescription
        });
        saveInventory();
        clearInventoryForm();
        showAlert("Item added to inventory!", "success");
    } else {
        showAlert("Please fill all inventory fields correctly.", "danger");
    }
}

function clearInventoryForm() {
    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productStock").value = "";
    document.getElementById("itemCategory").value = "";
    document.getElementById("itemDescription").value = "";
}

function renderInventoryTable() {
    const inventoryTableBody = document.getElementById("inventoryTableBody");
    inventoryTableBody.innerHTML = "";

    if (inventoryItems.length === 0) {
        inventoryTableBody.innerHTML = `<tr><td colspan="5" class="text-center">No items in inventory.</td></tr>`;
        return;
    }

    inventoryItems.forEach(item => {
        const row = inventoryTableBody.insertRow();
        const statusClass = item.stock < 10 ? "text-danger" : "";
        const statusText = item.stock < 10 ? "Low Stock" : "In Stock";

        row.innerHTML = `
            <td>${item.name}</td>
            <td>${getCurrencySymbol()}${item.price.toFixed(2)}</td>
            <td>${item.stock}</td>
            <td class="${statusClass}">${statusText}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editInventoryItem(${item.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteInventoryItem(${item.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
    });
}

function editInventoryItem(id) {
    const item = inventoryItems.find(i => i.id === id);
    if (item) {
        document.getElementById("productName").value = item.name;
        document.getElementById("productPrice").value = item.price;
        document.getElementById("productStock").value = item.stock;
        document.getElementById("itemCategory").value = item.category;
        document.getElementById("itemDescription").value = item.description;

        // Remove item from array to re-add with updated values
        inventoryItems = inventoryItems.filter(i => i.id !== id);
        saveInventory();
    }
}

function deleteInventoryItem(id) {
    inventoryItems = inventoryItems.filter(item => item.id !== id);
    saveInventory();
    showAlert("Item deleted from inventory!", "success");
}

// CSV Import/Export
function exportInventoryCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Price,Stock,Category,Description\n";
    inventoryItems.forEach(item => {
        csvContent += `${item.name},${item.price},${item.stock},${item.category},${item.description}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert("Inventory exported to CSV!", "success");
}

function importInventoryCSV(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split("\n").filter(line => line.trim() !== "");
            if (lines.length > 1) {
                const newItems = [];
                for (let i = 1; i < lines.length; i++) {
                    const [name, price, stock, category, description] = lines[i].split(",");
                    if (name && price && stock) {
                        newItems.push({
                            id: Date.now() + i,
                            name: name.trim(),
                            price: parseFloat(price),
                            stock: parseInt(stock),
                            category: category ? category.trim() : "",
                            description: description ? description.trim() : ""
                        });
                    }
                }
                inventoryItems = [...inventoryItems, ...newItems];
                saveInventory();
                showAlert("Inventory imported from CSV!", "success");
            } else {
                showAlert("CSV file is empty or malformed.", "danger");
            }
        };
        reader.readAsText(file);
    }
}

// Invoice Generation
salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];

function getCurrencySymbol() {
    return businessSettings && businessSettings.currency ? businessSettings.currency : "$";
}

function addInvoiceItem() {
    const name = document.getElementById("itemName").value;
    const quantityInput = document.getElementById("itemQuantity").value; // This now includes unit
    const price = parseFloat(document.getElementById("itemPrice").value);

    if (!name || !quantityInput || isNaN(price) || price <= 0) {
        showAlert("Please fill in all invoice item fields with valid data.", "danger");
        return;
    }

    let quantity = 1;
    let unit = "";

    // Attempt to parse quantity and unit from the single input string
    const quantityMatch = quantityInput.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
    if (quantityMatch) {
        quantity = parseFloat(quantityMatch[1]);
        unit = quantityMatch[2].trim();
    } else {
        // If no unit is provided, assume the whole input is quantity
        quantity = parseFloat(quantityInput);
        if (isNaN(quantity)) {
            showAlert("Invalid quantity format. Please use numbers, e.g., \"5\" or \"2.5 kg\".", "danger");
            return;
        }
    }

    currentInvoiceItems.push({
        name: name,
        quantity: quantity,
        unit: unit, // Save unit
        price: price
    });
    localStorage.setItem("currentInvoiceItems", JSON.stringify(currentInvoiceItems));
    renderInvoiceItemsTable();
    clearInvoiceItemForm();
    showAlert("Item added to invoice!", "success");
}

function clearInvoiceItemForm() {
    document.getElementById("itemName").value = "";
    document.getElementById("itemQuantity").value = "";
    document.getElementById("itemPrice").value = "";
}

function renderInvoiceItemsTable() {
    const invoiceItemsBody = document.getElementById("invoiceItemsBody");
    invoiceItemsBody.innerHTML = "";
    let subtotal = 0;

    if (currentInvoiceItems.length === 0) {
        invoiceItemsBody.innerHTML = `<tr><td colspan="5" class="text-center">No items added to invoice.</td></tr>`;
    }

    currentInvoiceItems.forEach((item, index) => {
        const total = item.quantity * item.price;
        subtotal += total;
        const row = invoiceItemsBody.insertRow();
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity} ${item.unit}</td> <!-- Display quantity and unit -->
            <td>${getCurrencySymbol()}${item.price.toFixed(2)}</td>
            <td>${getCurrencySymbol()}${total.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteInvoiceItem(${index})"><i class="fas fa-trash"></i></button>
            </td>
        `;
    });

    const taxRate = parseFloat(businessSettings.taxRate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount;

    document.getElementById("invoiceSubtotal").textContent = `${getCurrencySymbol()}${subtotal.toFixed(2)}`;
    document.getElementById("invoiceTaxRateDisplay").textContent = taxRate.toFixed(2);
    document.getElementById("invoiceTaxAmount").textContent = `${getCurrencySymbol()}${taxAmount.toFixed(2)}`;
    document.getElementById("invoiceGrandTotal").textContent = `${getCurrencySymbol()}${grandTotal.toFixed(2)}`;

    renderInvoicePreview(); // Update preview whenever items change
}

function deleteInvoiceItem(index) {
    currentInvoiceItems.splice(index, 1);
    localStorage.setItem("currentInvoiceItems", JSON.stringify(currentInvoiceItems));
    renderInvoiceItemsTable();
    showAlert("Invoice item deleted!", "success");
}

function prepareInvoiceForPreview() {
    if (currentInvoiceItems.length === 0) {
        showAlert("Please add items to the invoice before previewing.", "danger");
        return;
    }
    document.getElementById("invoicePreviewModal").style.display = "flex";
    renderInvoicePreview();
}

function hideInvoicePreviewModal() {
    document.getElementById("invoicePreviewModal").style.display = "none";
}

// ==================================================================
// == THIS IS THE CORRECTED FUNCTION FOR YOUR INVOICE PREVIEW ==
// ==================================================================
function renderInvoicePreview() {
    const currencySymbol = getCurrencySymbol();

    // --- Business Info ---
    document.getElementById("previewBusinessName").textContent = businessSettings.businessName || "Your Business Name";
    document.getElementById("previewBusinessAddress").textContent = businessSettings.businessAddress || "Your Business Address";
    document.getElementById("previewBusinessCity").textContent = businessSettings.businessCity || "City, State, ZIP";
    document.getElementById("previewBusinessPhone").textContent = businessSettings.businessPhone || "Phone Number";
    document.getElementById("previewBusinessEmail").textContent = businessSettings.businessEmail || "email@business.com";

    // --- Logo ---
    const previewBusinessLogo = document.getElementById("previewBusinessLogo");
    if (businessSettings.logoData) {
        previewBusinessLogo.src = businessSettings.logoData;
        previewBusinessLogo.style.display = "block";
    } else {
        previewBusinessLogo.style.display = "none";
    }

    // --- Customer Info (Corrected Logic) ---
    const customerName = document.getElementById("customerName").value || "Customer Name";
    const customerAddress = document.getElementById("customerAddress").value || "Customer Address";
    const customerEmail = document.getElementById("customerEmail").value || "customer@email.com";

    // Populate "BILL TO" section
    document.getElementById("previewCustomerName").textContent = customerName;
    document.getElementById("previewCustomerAddress").textContent = customerAddress;
    // You might want to add an element for email in the "BILL TO" section if needed

    // Populate "SHIP TO" section with the same customer info
    // This assumes you want BILL TO and SHIP TO to be the same.
    // If they can be different, you'll need separate input fields.
    const shipToName = document.getElementById("previewShipToName");
    const shipToAddress = document.getElementById("previewShipToAddress");
    const shipToCity = document.getElementById("previewShipToCity");

    if (shipToName) shipToName.textContent = customerName;
    if (shipToAddress) shipToAddress.textContent = customerAddress;
    if (shipToCity) shipToCity.textContent = ""; // Clear the placeholder city if not used

    // --- Invoice Dates ---
    document.getElementById("previewInvoiceDate").textContent = document.getElementById("invoiceDate").value || "N/A";
    document.getElementById("previewDueDate").textContent = document.getElementById("dueDate").value || "N/A";

    // --- Notes/Terms ---
    const notesElement = document.getElementById("pdfInvoiceNotes");
    if (notesElement) {
        notesElement.textContent = document.getElementById("invoiceNotes").value || "No specific notes or terms.";
    }

    // --- Invoice Items Table ---
    const invoicePdfItemsBody = document.getElementById("invoicePdfItemsBody");
    invoicePdfItemsBody.innerHTML = ""; // Clear previous items
    let subtotal = 0;

    if (currentInvoiceItems.length === 0) {
        const row = invoicePdfItemsBody.insertRow();
        row.innerHTML = `<td colspan="4" style="text-align:center; padding: 20px;">No items have been added to the invoice.</td>`;
    } else {
        currentInvoiceItems.forEach(item => {
            const total = item.quantity * item.price;
            subtotal += total;
            const row = invoicePdfItemsBody.insertRow();
            row.innerHTML = `
                <td class="qty-col">${item.quantity} ${item.unit || ''}</td>
                <td class="desc-col">${item.name}</td>
                <td class="price-col">${currencySymbol}${item.price.toFixed(2)}</td>
                <td class="total-col">${currencySymbol}${total.toFixed(2)}</td>
            `;
        });
    }

    // --- Totals ---
    const taxRate = parseFloat(businessSettings.taxRate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount;

    document.getElementById("pdfInvoiceSubtotal").textContent = `${currencySymbol}${subtotal.toFixed(2)}`;
    document.getElementById("pdfInvoiceTaxRate").textContent = taxRate.toFixed(2);
    document.getElementById("pdfInvoiceTax").textContent = `${currencySymbol}${taxAmount.toFixed(2)}`;
    document.getElementById("pdfInvoiceTotal").textContent = `${currencySymbol}${grandTotal.toFixed(2)}`;

    // --- Apply Template Color and Class ---
    const invoiceDocument = document.getElementById("invoiceDocument");
    const customPrimaryColor = businessSettings.invoiceColor || "#3b82f6";
    invoiceDocument.style.setProperty("--custom-primary-color", customPrimaryColor);
    invoiceDocument.className = `invoice-document ${businessSettings.currentTemplate || 'classic'}-template`;
}


// PDF Generation
async function generateAndDownloadInvoice() {
    const invoiceDocument = document.getElementById("invoiceDocument");
    const invoiceNumber = document.getElementById("previewInvoiceNumber").textContent;
    const customerName = document.getElementById("previewCustomerName").textContent;

    // Temporarily hide elements that should not be in the PDF
    const elementsToHide = document.querySelectorAll(".modal-footer, .close-button");
    elementsToHide.forEach(el => el.style.display = "none");

    // Use html2canvas to capture the invoice document
    const canvas = await html2canvas(invoiceDocument, {
        scale: 2, // Increase scale for better resolution
        useCORS: true, // Enable CORS if you have external images (like logo)
        logging: true, // Enable logging for debugging
    });

    // Restore hidden elements
    elementsToHide.forEach(el => el.style.display = "");

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jspdf.jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    // Generate a more descriptive filename
    const filename = `invoice-${invoiceNumber}-${customerName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
    pdf.save(filename);

    showAlert("Invoice downloaded successfully!", "success");
    hideInvoicePreviewModal();
    incrementInvoiceCount();
    saveSalesTransaction(invoiceNumber, customerName, parseFloat(document.getElementById("invoiceGrandTotal").textContent.replace(getCurrencySymbol(), "")));
}

// Invoice Count
function loadInvoiceCount() {
    invoiceCount = parseInt(localStorage.getItem("invoiceCount")) || 0;
    updateInvoiceCountBadge();
    updateProStatus();
}

function updateInvoiceCountBadge() {
    document.getElementById("invoiceCountBadge").textContent = invoiceCount;
}

function incrementInvoiceCount() {
    invoiceCount++;
    localStorage.setItem("invoiceCount", invoiceCount);
    updateInvoiceCountBadge();
    updateProStatus();
}

function updateProStatus() {
    const proStatusElement = document.getElementById("proStatus");
    const brandingUpgradeOverlay = document.getElementById("brandingUpgradeOverlay");
    const invoiceStatusSection = document.getElementById("invoiceStatusSection");

    if (invoiceCount >= 10) { // Example: Free tier limit is 10 invoices
        proStatusElement.textContent = "Free Tier (Limit Reached)";
        proStatusElement.classList.remove("pro-active");
        proStatusElement.classList.add("free-limit");
        brandingUpgradeOverlay.style.display = "flex";
        invoiceStatusSection.innerHTML = `
            <p class="text-danger"><i class="fas fa-exclamation-triangle"></i> Free tier limit (10 invoices) reached.</p>
            <a href="payment-pro.html" class="btn btn-primary btn-block"><i class="fas fa-crown"></i> Upgrade to Pro</a>
        `;
        // Show upgrade modal if on invoice section and limit reached
        if (document.getElementById("invoice").classList.contains("active")) {
            document.getElementById("upgradeModal").style.display = "flex";
        }
    } else {
        proStatusElement.textContent = "Free Tier";
        proStatusElement.classList.remove("pro-active", "free-limit");
        brandingUpgradeOverlay.style.display = "none";
        invoiceStatusSection.innerHTML = `
            <p class="text-muted">Invoices Generated: ${invoiceCount}/10</p>
            <a href="payment-pro.html" class="btn btn-primary btn-block"><i class="fas fa-crown"></i> Upgrade to Pro</a>
        `;
    }
}

function hideUpgradeModal() {
    document.getElementById("upgradeModal").style.display = "none";
}

// Sales History
function saveSalesTransaction(invoiceId, customerName, totalAmount) {
    const transaction = {
        id: Date.now(),
        invoiceId: invoiceId,
        date: new Date().toLocaleDateString(),
        customer: customerName,
        total: totalAmount,
        items: currentInvoiceItems.map(item => ({ ...item })) // Deep copy
    };
    salesHistory.push(transaction);
    localStorage.setItem("salesHistory", JSON.stringify(salesHistory));
    updateDashboardStats();
    displaySalesBreakdown("monthly"); // Refresh sales history view
}

function updateDashboardStats() {
    let totalRevenue = 0;
    salesHistory.forEach(sale => {
        totalRevenue += sale.total;
    });
    document.getElementById("dashboardRevenue").textContent = `${getCurrencySymbol()}${totalRevenue.toFixed(2)}`;
    document.getElementById("dashboardProducts").textContent = inventoryItems.length;
    document.getElementById("dashboardInvoiceCount").textContent = salesHistory.length;

    const lowStockItems = inventoryItems.filter(item => item.stock < 10);
    document.getElementById("dashboardLowStock").textContent = lowStockItems.length;

    renderRecentSales();
}

function renderRecentSales() {
    const recentSalesBody = document.getElementById("recentSalesBody");
    recentSalesBody.innerHTML = "";

    if (salesHistory.length === 0) {
        recentSalesBody.innerHTML = `<tr><td colspan="4" class="text-center">No recent sales. Generate an invoice to see data here.</td></tr>`;
        return;
    }

    // Display last 5 sales
    const recent = salesHistory.slice(-5).reverse();
    recent.forEach(sale => {
        const row = recentSalesBody.insertRow();
        row.innerHTML = `
            <td>${sale.date}</td>
            <td>${sale.customer}</td>
            <td>${getCurrencySymbol()}${sale.total.toFixed(2)}</td>
            <td><button class="btn btn-sm btn-secondary" onclick="viewSaleDetails(${sale.id})">View</button></td>
        `;
    });
}

function viewSaleDetails(id) {
    const sale = salesHistory.find(s => s.id === id);
    if (sale) {
        let details = `Invoice ID: ${sale.invoiceId}\nDate: ${sale.date}\nCustomer: ${sale.customer}\nTotal: ${getCurrencySymbol()}${sale.total.toFixed(2)}\n\nItems:\n`;
        sale.items.forEach(item => {
            details += `- ${item.name} (${item.quantity} ${item.unit} @ ${getCurrencySymbol()}${item.price.toFixed(2)})\n`;
        });
        showMessageModal("Sale Details", details);
    }
}

function showMessageModal(title, message) {
    document.getElementById("messageTitle").textContent = title;
    document.getElementById("messageText").textContent = message;
    document.getElementById("messageModal").style.display = "flex";
}

function hideMessageModal() {
    document.getElementById("messageModal").style.display = "none";
}

function displaySalesBreakdown(type) {
    const monthlyContent = document.getElementById("monthlyBreakdownContent");
    const yearlyContent = document.getElementById("yearlyBreakdownContent");
    const productContent = document.getElementById("productBreakdownContent");

    // Hide all and remove active class from buttons
    monthlyContent.style.display = "none";
    yearlyContent.style.display = "none";
    productContent.style.display = "none";
    document.getElementById("monthlyBreakdownBtn").classList.remove("active");
    document.getElementById("yearlyBreakdownBtn").classList.remove("active");
    document.getElementById("productBreakdownBtn").classList.remove("active");

    if (type === "monthly") {
        monthlyContent.style.display = "block";
        document.getElementById("monthlyBreakdownBtn").classList.add("active");
        renderMonthlySales();
    } else if (type === "yearly") {
        yearlyContent.style.display = "block";
        document.getElementById("yearlyBreakdownBtn").classList.add("active");
        renderYearlySales();
    } else if (type === "product") {
        productContent.style.display = "block";
        document.getElementById("productBreakdownBtn").classList.add("active");
        renderProductSales();
    }
}

function renderMonthlySales() {
    const monthlySalesBody = document.getElementById("monthlySalesTableBody");
    monthlySalesBody.innerHTML = "";

    const monthlyData = {};
    salesHistory.forEach(sale => {
        const date = new Date(sale.date);
        const monthYear = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { total: 0, count: 0 };
        }
        monthlyData[monthYear].total += sale.total;
        monthlyData[monthYear].count++;
    });

    for (const monthYear in monthlyData) {
        const row = monthlySalesBody.insertRow();
        row.innerHTML = `
            <td>${monthYear}</td>
            <td>${getCurrencySymbol()}${monthlyData[monthYear].total.toFixed(2)}</td>
            <td>${monthlyData[monthYear].count}</td>
        `;
    }
}

function renderYearlySales() {
    const yearlySalesBody = document.getElementById("yearlySalesTableBody");
    yearlySalesBody.innerHTML = "";

    const yearlyData = {};
    salesHistory.forEach(sale => {
        const date = new Date(sale.date);
        const year = date.getFullYear();
        if (!yearlyData[year]) {
            yearlyData[year] = { total: 0, count: 0 };
        }
        yearlyData[year].total += sale.total;
        yearlyData[year].count++;
    });

    for (const year in yearlyData) {
        const row = yearlySalesBody.insertRow();
        row.innerHTML = `
            <td>${year}</td>
            <td>${getCurrencySymbol()}${yearlyData[year].total.toFixed(2)}</td>
            <td>${yearlyData[year].count}</td>
        `;
    }
}

function renderProductSales() {
    const productSalesBody = document.getElementById("productSalesTableBody");
    productSalesBody.innerHTML = "";

    const productData = {};
    salesHistory.forEach(sale => {
        sale.items.forEach(item => {
            if (!productData[item.name]) {
                productData[item.name] = { quantity: 0, revenue: 0 };
            }
            productData[item.name].quantity += item.quantity;
            productData[item.name].revenue += (item.quantity * item.price);
        });
    });

    for (const productName in productData) {
        const row = productSalesBody.insertRow();
        row.innerHTML = `
            <td>${productName}</td>
            <td>${productData[productName].quantity}</td>
            <td>${getCurrencySymbol()}${productData[productName].revenue.toFixed(2)}</td>
        `;
    }
}

// AI Assistant (FanyaBot)
async function sendMessage() {
    const chatInput = document.getElementById("chatInput");
    const chatMessages = document.getElementById("chatMessages");
    const userMessage = chatInput.value.trim();

    if (userMessage === "") return;

    // Display user message
    const userBubble = document.createElement("div");
    userBubble.classList.add("chat-message", "user");
    userBubble.innerHTML = `<div class="avatar">You</div>
