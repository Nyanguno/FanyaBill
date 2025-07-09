// Global Variables
let invoiceCount = 0;
let invoiceLimit = 3;
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
        const avg = salesData.length > 0 ? salesData.reduce((sum, sale) => sum + sale.total, 0) / salesData.length : 0;
        averageSale.textContent = `${currency}${avg.toFixed(2)}`;
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

        if (sortedProducts.length === 0) {
            topProductsList.innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-chart-line"></i>
                    <p>No sales data yet. Generate some invoices to see your top products!</p>
                </div>
            `;
        } else {
            topProductsList.innerHTML = sortedProducts.map(([name, quantity]) => `
                <div class="product-item">
                    <div>
                        <div class="product-name">${name}</div>
                        <div class="product-sales">${quantity} sold</div>
                    </div>
                </div>
            `).join("");
        }
    }
}

function updateBusinessInfo() {
    const businessNameEl = document.getElementById("businessName");
    const businessAddressEl = document.getElementById("businessAddress");
    const businessCityEl = document.getElementById("businessCity");

    if (businessNameEl) businessNameEl.textContent = businessInfo.name;
    if (businessAddressEl) businessAddressEl.textContent = businessInfo.address;
    if (businessCityEl) businessCityEl.textContent = businessInfo.city;

    // Update form inputs
    const businessNameInput = document.getElementById("businessNameInput");
    const businessAddressInput = document.getElementById("businessAddressInput");
    const businessCityInput = document.getElementById("businessCityInput");
    const currencySelect = document.getElementById("currencySelect");

    if (businessNameInput) businessNameInput.value = businessInfo.name;
    if (businessAddressInput) businessAddressInput.value = businessInfo.address;
    if (businessCityInput) businessCityInput.value = businessInfo.city;
    if (currencySelect) currencySelect.value = currency;
}

// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll(".content-section").forEach(section => {
        section.classList.remove("active");
    });

    // Remove active class from all nav items
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) section.classList.add("active");

    // Add active class to clicked nav item
    const navItem = document.querySelector(`[onclick=\"showSection(\\\`${sectionId}\\\`)\"]`);
    if (navItem) navItem.classList.add("active");
}

// AI Invoice Generation
async function generateInvoice() {
    if (!isProUser() && invoiceCount >= invoiceLimit) {
        showUpgradeModal();
        await showMessage("Limit Reached", "🚫 You\"ve reached the free invoice limit. Please upgrade to Pro to continue.");
        return;
    }

    const saleDescription = document.getElementById("saleDescription").value.trim();
    if (!saleDescription) {
        await showMessage("Input Required", "Please describe your sale to generate an invoice.");
        return;
    }

    const generateBtn = document.getElementById("generateBtn");
    generateBtn.disabled = true;
    generateBtn.innerHTML = "; Generating...";

    try {
        // Parse the sale description using AI (simulated for demo)
        const parsedItems = await parseInvoiceItems(saleDescription);
        
        if (parsedItems.length === 0) {
            await showMessage("Parse Error", "Could not understand the sale description. Please try a different format like \"2kg rice at 150, 3 sugar at 120\".");
            return;
        }

        // Create invoice
        const invoice = {
            number: currentInvoiceNumber,
            date: new Date().toLocaleDateString(),
            items: parsedItems,
            total: parsedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
        };

        // Display invoice
        displayInvoice(invoice);

        // Update inventory
        updateInventoryFromSale(parsedItems);

        // Save sale data
        salesData.push({
            date: new Date().toISOString(),
            items: parsedItems,
            total: invoice.total
        });

        // Update counters
        invoiceCount++;
        currentInvoiceNumber++;

        // Check for low stock
        checkLowStock(parsedItems);

        // Save data and update UI
        saveData();
        updateUI();

        await showMessage("Invoice Generated", "🎉 Your invoice has been generated successfully!");

    } catch (error) {
        console.error("Error generating invoice:", error);
        await showMessage("Generation Error", "There was an error generating your invoice. Please try again.");
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = "; Generate Invoice";
    }
}

async function parseInvoiceItems(description) {
    try {
        // Use API service for AI-powered parsing
        if (window.apiService) {
            const prompt = window.apiService.generateInvoicePrompt(description);
            const response = await window.apiService.callGeminiAPI(prompt);
            
            try {
                // Try to parse as JSON first
                const parsedItems = JSON.parse(response);
                if (Array.isArray(parsedItems)) {
                    return parsedItems.filter(item => 
                        item.name && item.quantity > 0 && item.price > 0
                    );
                }
            } catch (jsonError) {
                console.log("Response not JSON, falling back to regex parsing");
            }
        }
        
        // Fallback to regex-based parsing
        const items = [];
        const patterns = [
            /(\d+(?:\.\d+)?)\s*(?:kg|g|l|ml|pcs?|pieces?)?\s*([^,\d]+?)\s*(?:at|@|for)\s*(\d+(?:\.\d+)?)/gi,
            /(\d+(?:\.\d+)?)\s*([^,\d]+?)\s*(?:at|@|for)\s*(\d+(?:\.\d+)?)/gi
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(description)) !== null) {
                const quantity = parseFloat(match[1]);
                const name = match[2].trim();
                const price = parseFloat(match[3]);

                if (quantity > 0 && name && price > 0) {
                    items.push({
                        name: name,
                        quantity: quantity,
                        price: price
                    });
                }
            }
        }

        return items;
    } catch (error) {
        console.error("Error parsing items:", error);
        return [];
    }
}

function displayInvoice(invoice) {
    const invoicePreview = document.getElementById("invoicePreview");
    const invoiceNumber = document.getElementById("invoiceNumber");
    const invoiceDate = document.getElementById("invoiceDate");
    const invoiceItemsTable = document.getElementById("invoiceItemsTable");
    const invoiceTotal = document.getElementById("invoiceTotal");

    if (invoiceNumber) invoiceNumber.textContent = invoice.number.toString().padStart(3, "0");
    if (invoiceDate) invoiceDate.textContent = invoice.date;
    if (invoiceTotal) invoiceTotal.textContent = `${currency}${invoice.total.toFixed(2)}`;

    if (invoiceItemsTable) {
        invoiceItemsTable.innerHTML = invoice.items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${currency}${item.price.toFixed(2)}</td>
                <td>${currency}${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
        `).join("");
    }

    if (invoicePreview) {
        invoicePreview.style.display = "block";
        invoicePreview.scrollIntoView({ behavior: "smooth" });
    }
}

function updateInventoryFromSale(items) {
    items.forEach(saleItem => {
        const inventoryItem = inventory.find(item => 
            item.name.toLowerCase().includes(saleItem.name.toLowerCase()) ||
            saleItem.name.toLowerCase().includes(item.name.toLowerCase())
        );
        
        if (inventoryItem && inventoryItem.stock >= saleItem.quantity) {
            inventoryItem.stock -= saleItem.quantity;
        }
    });
}

function checkLowStock(items) {
    items.forEach(saleItem => {
        const inventoryItem = inventory.find(item => 
            item.name.toLowerCase().includes(saleItem.name.toLowerCase()) ||
            saleItem.name.toLowerCase().includes(item.name.toLowerCase())
        );
        
        if (inventoryItem && inventoryItem.stock <= 3 && inventoryItem.stock > 0) {
            showLowStockAlert(inventoryItem.name, inventoryItem.stock);
        }
    });
}

function showLowStockAlert(productName, stock) {
    const alert = document.getElementById("lowStockAlert");
    const message = document.getElementById("lowStockMessage");
    
    if (alert && message) {
        message.textContent = `⚠️ ${productName} is running low (${stock} remaining).`;
        alert.style.display = "block";
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            alert.style.display = "none";
        }, 5000);
    }
}

function hideLowStockAlert() {
    const alert = document.getElementById("lowStockAlert");
    if (alert) alert.style.display = "none";
}

// PDF Generation
function downloadInvoicePDF() {
    const invoiceContent = document.getElementById("invoicePreview");
    const opt = {
        margin: 0.5,
        filename: `invoice-${currentInvoiceNumber - 1}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
    };

    html2pdf().set(opt).from(invoiceContent).save();
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
    
    // Clear form
    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productStock").value = "";
}

function addProduct() {
    const name = document.getElementById("productName").value.trim();
    const price = parseFloat(document.getElementById("productPrice").value);
    const stock = parseInt(document.getElementById("productStock").value);

    if (!name || isNaN(price) || isNaN(stock) || price < 0 || stock < 0) {
        showMessage("Invalid Input", "Please fill in all fields with valid values.");
        return;
    }

    inventory.push({ name, price, stock });
    saveData();
    updateUI();
    hideAddProductModal();
    showMessage("Product Added", `${name} has been added to your inventory.`);
}

function editProduct(index) {
    const product = inventory[index];
    if (!product) return;

    const newName = prompt("Product Name:", product.name);
    const newPrice = prompt("Price:", product.price);
    const newStock = prompt("Stock:", product.stock);

    if (newName && !isNaN(newPrice) && !isNaN(newStock)) {
        inventory[index] = {
            name: newName.trim(),
            price: parseFloat(newPrice),
            stock: parseInt(newStock)
        };
        saveData();
        updateUI();
        showMessage("Product Updated", "Product has been updated successfully.");
    }
}

function deleteProduct(index) {
    const product = inventory[index];
    if (!product) return;

    if (confirm(`Are you sure you want to delete \"${product.name}\"?`)) {
        inventory.splice(index, 1);
        saveData();
        updateUI();
        showMessage("Product Deleted", "Product has been removed from inventory.");
    }
}

function exportInventory() {
    if (inventory.length === 0) {
        showMessage("No Data", "No inventory data to export.");
        return;
    }

    const csvContent = "data:text/csv;charset=utf-8," 
        + "Name,Price,Stock\n"
        + inventory.map(item => `\"${item.name}\",${item.price},${item.stock}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fanyabill-inventory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importInventory() {
    const file = document.getElementById("importFile").files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split("\n");
            const newInventory = [];

            // Skip header row
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const [name, price, stock] = line.split(",").map(item => item.replace(/\"/g, "").trim());
                
                if (name && !isNaN(price) && !isNaN(stock)) {
                    newInventory.push({
                        name: name,
                        price: parseFloat(price),
                        stock: parseInt(stock)
                    });
                }
            }

            if (newInventory.length > 0) {
                inventory = newInventory;
                saveData();
                updateUI();
                showMessage("Import Successful", `Imported ${newInventory.length} products.`);
            } else {
                showMessage("Import Failed", "No valid products found in the CSV file.");
            }
        } catch (error) {
            console.error("Import error:", error);
            showMessage("Import Error", "There was an error importing the CSV file.");
        }
    };
    reader.readAsText(file);
}

// FanyaBot Chat
function handleChatKeyPress(event) {
    if (event.key === "Enter") {
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById("chatInput");
    const message = input.value.trim();
    
    if (!message) return;

    // Add user message
    addChatMessage(message, "user");
    input.value = "";

    // Generate bot response
    const response = await generateBotResponse(message);
    addChatMessage(response, "bot");
}

function addChatMessage(message, sender) {
    const chatMessages = document.getElementById("chatMessages");
    if (!chatMessages) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = `${sender}-message`;
    
    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.innerHTML = sender === "bot" ? "<i class=\"fas fa-robot\"></i>" : "<i class=\"fas fa-user\"></i>";
    
    const content = document.createElement("div");
    content.className = "message-content";
    content.innerHTML = `<p>${message}</p>`;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function generateBotResponse(message) {
    try {
        // Use API service for AI-powered responses
        if (window.apiService) {
            const response = await window.apiService.generateCustomerServiceResponse(message, inventory);
            return response;
        }
        
        // Fallback to simple rule-based responses
        return generateSimpleBotResponse(message);
    } catch (error) {
        console.error("Error generating bot response:", error);
        return generateSimpleBotResponse(message);
    }
}

function generateSimpleBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for product availability
    for (const item of inventory) {
        if (lowerMessage.includes(item.name.toLowerCase())) {
            if (item.stock > 0) {
                return `Yes, we have ${item.name} available! Price: ${currency}${item.price.toFixed(2)}, Stock: ${item.stock} units.`;
            } else {
                return `Sorry, ${item.name} is currently out of stock.`;
            }
        }
    }
    
    // General responses
    if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("how much")) {
        return "I can help you check prices for specific products. Just ask about a product by name!";
    }
    
    if (lowerMessage.includes("stock") || lowerMessage.includes("available") || lowerMessage.includes("have")) {
        return "I can check our current inventory. What product are you looking for?";
    }
    
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
        return "Hello! I\"m FanyaBot, your inventory assistant. I can help you check product availability and prices. What would you like to know?";
    }
    
    return "I can help you check product availability and prices from our inventory. Try asking about a specific product!";
}

// Settings
function saveSettings() {
    const businessName = document.getElementById("businessNameInput").value.trim();
    const businessAddress = document.getElementById("businessAddressInput").value.trim();
    const businessCity = document.getElementById("businessCityInput").value.trim();
    const selectedCurrency = document.getElementById("currencySelect").value;

    if (businessName) businessInfo.name = businessName;
    if (businessAddress) businessInfo.address = businessAddress;
    if (businessCity) businessInfo.city = businessCity;
    currency = selectedCurrency;

    saveData();
    updateUI();
    showMessage("Settings Saved", "Your business information has been updated.");
}

// PayPal Integration
function setupPayPalButton() {
    if (!isProUser() && window.paypal) {
        const paypalButtonContainer = document.getElementById("paypal-button-container");
        if (paypalButtonContainer && paypalButtonContainer.innerHTML === "") {
            paypal.Buttons({
                createOrder: function(data, actions) {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: "7.99"
                            }
                        }]
                    });
                },
                onApprove: function(data, actions) {
                    return actions.order.capture().then(function(details) {
                        unlockProAccess();
                        console.log("Payment completed:", details);
                    });
                },
                onError: async function(err) {
                    console.error("Payment error:", err);
                    await showMessage("Payment Error", "There was an error processing your payment. Please try again.");
                }
            }).render("#paypal-button-container");
        }
    }
}

function showUpgradeModal() {
    const modal = document.getElementById("upgradeModal");
    if (modal) {
        modal.style.display = "flex";
        setupPayPalButton();
    }
}

function hideUpgradeModal() {
    const modal = document.getElementById("upgradeModal");
    if (modal) modal.style.display = "none";
}

async function unlockProAccess() {
    localStorage.setItem("fanyabill_pro", "true");
    showProBanner();
    hideUpgradeButton();
    hideUpgradeModal();
    invoiceLimit = Infinity;
    updateInvoiceStatus();
    await showMessage("Upgrade Successful", "🎉 Thank you for upgrading to FanyaBill Pro! You now have unlimited access.");
}

function checkProStatus() {
    if (isProUser()) {
        showProBanner();
        hideUpgradeButton();
        invoiceLimit = Infinity;
    } else if (invoiceCount >= invoiceLimit) {
        showUpgradeButton();
    }
}

function isProUser() {
    return localStorage.getItem("fanyabill_pro") === "true";
}

function showProBanner() {
    const proBanner = document.getElementById("proBanner");
    if (proBanner) proBanner.style.display = "flex";
}

function showUpgradeButton() {
    const upgradeBtn = document.getElementById("upgradeBtn");
    if (upgradeBtn) upgradeBtn.style.display = "flex";
}

function hideUpgradeButton() {
    const upgradeBtn = document.getElementById("upgradeBtn");
    if (upgradeBtn) upgradeBtn.style.display = "none";
}

// Modal Management
async function showMessage(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById("messageModal");
        const titleEl = document.getElementById("messageTitle");
        const textEl = document.getElementById("messageText");
        
        if (modal && titleEl && textEl) {
            titleEl.textContent = title;
            textEl.textContent = message;
            modal.style.display = "flex";
            
            // Auto-close after 3 seconds for success messages
            if (title.includes("Success") || title.includes("Generated") || title.includes("Added") || title.includes("Updated") || title.includes("Deleted") || title.includes("Saved")) {
                setTimeout(() => {
                    hideMessageModal();
                    resolve();
                }, 3000);
            } else {
                resolve();
            }
        } else {
            resolve();
        }
    });
}

function hideMessageModal() {
    const modal = document.getElementById("messageModal");
    if (modal) modal.style.display = "none";
}

// Utility Functions
function formatCurrency(amount) {
    return `${currency}${amount.toFixed(2)}`;
}

function generateInvoiceNumber() {
    return currentInvoiceNumber.toString().padStart(3, "0");
}

// Initialize on page load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
        loadData();
        updateUI();
        setupPayPalButton();
        checkProStatus();
    });
} else {
    loadData();
    updateUI();
    setupPayPalButton();
    checkProStatus();
}


