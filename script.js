// Global Variables
let invoiceCount = 0;
let currentInvoiceItems = [];
let inventoryItems = [];
let salesHistory = [];
let currentTemplate = 'classic';

// Utility Functions
function showMessageModal(title, message) {
    document.getElementById('messageTitle').innerText = title;
    document.getElementById('messageText').innerText = message;
    document.getElementById('messageModal').style.display = 'flex';
}

function hideMessageModal() {
    document.getElementById('messageModal').style.display = 'none';
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    document.querySelector(`.nav-item[onclick="showSection(\'${sectionId}\')"]`).classList.add('active');

    // Update header title
    const headerTitle = document.querySelector(`#${sectionId} .content-header h1`);
    if (headerTitle) {
        document.querySelector('.main-content .content-header h1').innerText = headerTitle.innerText;
    }

    // Adjust main content margin for sidebar collapse
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    if (sidebar.classList.contains('collapsed')) {
        mainContent.classList.add('sidebar-collapsed');
    } else {
        mainContent.classList.remove('sidebar-collapsed');
    }

    // Specific actions for sections
    if (sectionId === 'dashboard') {
        renderDashboard();
    } else if (sectionId === 'inventory') {
        renderInventoryTable();
    } else if (sectionId === 'sales-history') {
        displaySalesBreakdown('monthly'); // Default to monthly breakdown
        renderSalesHistoryTable();
    } else if (sectionId === 'settings') {
        loadSettings();
    }
}

// Sidebar Toggle
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const navItems = document.querySelectorAll('.nav-item');

    // Initial state based on screen size
    if (window.innerWidth < 768) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('sidebar-collapsed');
    }

    // Toggle on click (example, you might have a dedicated button)
    // For now, let's assume it's always open on desktop and collapsed on mobile
    // You can add a button to toggle this if needed

    // Event listeners for navigation
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Load initial data and render dashboard
    loadData();
    renderDashboard();
    showSection('dashboard'); // Show dashboard by default

    // Set current date for invoice
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    document.getElementById('dueDate').value = today;

    // Initialize invoice preview
    renderInvoicePreview();
});

// Data Management (Local Storage)
function saveData() {
    localStorage.setItem('invoiceCount', invoiceCount);
    localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
    localStorage.setItem('businessSettings', JSON.stringify(businessSettings));
}

function loadData() {
    invoiceCount = parseInt(localStorage.getItem('invoiceCount')) || 0;
    inventoryItems = JSON.parse(localStorage.getItem('inventoryItems')) || [];
    salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    businessSettings = JSON.parse(localStorage.getItem('businessSettings')) || {};
    updateInvoiceCountBadge();
    loadSettings();
}

// Dashboard Functions
function renderDashboard() {
    let totalRevenue = 0;
    let totalProducts = inventoryItems.length;
    let lowStockItems = 0;

    salesHistory.forEach(sale => {
        totalRevenue += sale.totalAmount;
    });

    inventoryItems.forEach(item => {
        if (item.stock < 10) { // Example threshold for low stock
            lowStockItems++;
        }
    });

    document.getElementById('dashboardRevenue').innerText = formatCurrency(totalRevenue);
    document.getElementById('dashboardProducts').innerText = totalProducts;
    document.getElementById('dashboardInvoiceCount').innerText = invoiceCount;
    document.getElementById('dashboardLowStock').innerText = lowStockItems;

    renderRecentSales();
}

function renderRecentSales() {
    const recentSalesBody = document.getElementById('recentSalesBody');
    recentSalesBody.innerHTML = '';

    if (salesHistory.length === 0) {
        recentSalesBody.innerHTML = `<tr><td colspan="4" class="text-center">No recent sales. Generate an invoice to see data here.</td></tr>`;
        return;
    }

    // Display last 5 sales
    salesHistory.slice(-5).reverse().forEach(sale => {
        const row = recentSalesBody.insertRow();
        row.innerHTML = `
            <td>${sale.date}</td>
            <td>${sale.customerName}</td>
            <td>${formatCurrency(sale.totalAmount)}</td>
            <td><button class="btn btn-sm btn-primary" onclick="viewSaleDetails('${sale.invoiceId}')">View</button></td>
        `;
    });
}

function viewSaleDetails(invoiceId) {
    const sale = salesHistory.find(s => s.invoiceId === invoiceId);
    if (sale) {
        let detailsHtml = `
            <p><strong>Invoice ID:</strong> ${sale.invoiceId}</p>
            <p><strong>Date:</strong> ${sale.date}</p>
            <p><strong>Customer:</strong> ${sale.customerName}</p>
            <p><strong>Total Amount:</strong> ${formatCurrency(sale.totalAmount)}</p>
            <h4>Items:</h4>
            <ul>
        `;
        sale.items.forEach(item => {
            detailsHtml += `<li>${item.name} (Qty: ${item.quantity} ${item.unit || ''}) - ${formatCurrency(item.price)} each</li>`;
        });
        detailsHtml += `</ul>`;
        showMessageModal('Sale Details', detailsHtml);
    }
}

// Inventory Functions
function addInventoryItem() {
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const category = document.getElementById('itemCategory').value;
    const description = document.getElementById('itemDescription').value;

    if (!name || isNaN(price) || isNaN(stock) || price <= 0 || stock < 0) {
        showMessageModal('Error', 'Please fill in all required fields with valid numbers for price and stock.');
        return;
    }

    const newItem = {
        id: Date.now().toString(),
        name,
        price,
        stock,
        category,
        description
    };

    inventoryItems.push(newItem);
    saveData();
    renderInventoryTable();
    clearInventoryForm();
    showMessageModal('Success', 'Item added to inventory!');
}

function renderInventoryTable() {
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    inventoryTableBody.innerHTML = '';

    if (inventoryItems.length === 0) {
        inventoryTableBody.innerHTML = `<tr><td colspan="5" class="text-center">No items in inventory.</td></tr>`;
        return;
    }

    inventoryItems.forEach(item => {
        const row = inventoryTableBody.insertRow();
        const status = item.stock < 10 ? '<span style="color: orange; font-weight: bold;">Low Stock</span>' : '<span style="color: green;">In Stock</span>';
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${formatCurrency(item.price)}</td>
            <td>${item.stock}</td>
            <td>${status}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editInventoryItem('${item.id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteInventoryItem('${item.id}')">Delete</button>
            </td>
        `;
    });
}

function clearInventoryForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productStock').value = '';
    document.getElementById('itemCategory').value = '';
    document.getElementById('itemDescription').value = '';
}

function editInventoryItem(id) {
    const item = inventoryItems.find(item => item.id === id);
    if (item) {
        document.getElementById('productName').value = item.name;
        document.getElementById('productPrice').value = item.price;
        document.getElementById('productStock').value = item.stock;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemDescription').value = item.description;

        // Remove old item and add updated one (simple approach, consider a dedicated update function)
        deleteInventoryItem(id, false); // Delete without re-rendering
        showMessageModal('Info', 'Edit fields populated. Update and Add Item to save changes.');
    }
}

function deleteInventoryItem(id, reRender = true) {
    inventoryItems = inventoryItems.filter(item => item.id !== id);
    saveData();
    if (reRender) {
        renderInventoryTable();
        showMessageModal('Success', 'Item deleted from inventory.');
    }
}

// Invoice Functions
function addInvoiceItem() {
    const name = document.getElementById('itemName').value;
    const quantityInput = document.getElementById('itemQuantity').value;
    const price = parseFloat(document.getElementById('itemPrice').value);

    if (!name || !quantityInput || isNaN(price) || price <= 0) {
        showMessageModal('Error', 'Please fill in all invoice item fields with valid data.');
        return;
    }

    let quantity = 1;
    let unit = '';

    // Parse quantity and unit from input (e.g., 
