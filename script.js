// Global Variables
let invoiceData = {
    invoiceNumber: '',
    date: '',
    dueDate: '',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    businessInfo: {},
    customerInfo: {}
};

let currentUser = null;
let isProUser = () => {
    const userType = localStorage.getItem('fanyabill_user_type');
    return userType === 'pro' || userType === 'enterprise';
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('FanyaBill application initializing...');
    
    // Load templates first
    if (typeof loadSelectedTemplate === 'function') {
        loadSelectedTemplate();
    }
    
    // Load custom branding settings
    loadCustomBrandingSettings();
    
    // Initialize UI
    updateUI();
    
    // Load saved business info
    loadBusinessInfo();
    
    // Initialize template selection
    initializeTemplateSelection();
    
    // Initialize custom branding
    initializeCustomBranding();
    
    console.log('FanyaBill application initialized successfully');
});

// Load business information from localStorage
function loadBusinessInfo() {
    const savedBusinessInfo = localStorage.getItem('fanyabill_business_info');
    if (savedBusinessInfo) {
        try {
            const businessInfo = JSON.parse(savedBusinessInfo);
            
            // Update form fields
            const businessNameInput = document.getElementById('businessName');
            const businessAddressInput = document.getElementById('businessAddress');
            const businessCityInput = document.getElementById('businessCity');
            const businessPhoneInput = document.getElementById('businessPhone');
            const businessEmailInput = document.getElementById('businessEmail');
            
            if (businessNameInput) businessNameInput.value = businessInfo.name || '';
            if (businessAddressInput) businessAddressInput.value = businessInfo.address || '';
            if (businessCityInput) businessCityInput.value = businessInfo.city || '';
            if (businessPhoneInput) businessPhoneInput.value = businessInfo.phone || '';
            if (businessEmailInput) businessEmailInput.value = businessInfo.email || '';
            
            // Update invoice data
            invoiceData.businessInfo = businessInfo;
            
            console.log('Business info loaded:', businessInfo);
        } catch (error) {
            console.error('Error loading business info:', error);
        }
    }
}

// Save business information
function saveBusinessInfo() {
    const businessInfo = {
        name: document.getElementById('businessName')?.value || '',
        address: document.getElementById('businessAddress')?.value || '',
        city: document.getElementById('businessCity')?.value || '',
        phone: document.getElementById('businessPhone')?.value || '',
        email: document.getElementById('businessEmail')?.value || ''
    };
    
    // Save to localStorage
    localStorage.setItem('fanyabill_business_info', JSON.stringify(businessInfo));
    
    // Update invoice data
    invoiceData.businessInfo = businessInfo;
    
    console.log('Business info saved:', businessInfo);
    
    // Update invoice preview immediately
    renderInvoicePreview();
    
    // Show success message
    showNotification('Business information saved successfully!', 'success');
}

// Update UI function
function updateUI() {
    console.log('Updating UI...');
    
    // Load and apply business info
    loadBusinessInfo();
    
    // Render invoice preview with updated data
    renderInvoicePreview();
    
    console.log('UI updated successfully');
}

// Load custom branding settings
function loadCustomBrandingSettings() {
    console.log('Loading custom branding settings...');
    
    // Load saved logo
    const savedLogo = localStorage.getItem("fanyabill_custom_logo");
    const logoPreview = document.getElementById("logoPreview");
    if (logoPreview && savedLogo && isProUser()) {
        logoPreview.src = savedLogo;
        logoPreview.style.display = "block";
        console.log('Custom logo loaded');
    }

    // Load saved color
    const savedColor = localStorage.getItem("fanyabill_custom_color");
    const colorInput = document.getElementById("invoiceColor");
    if (colorInput && savedColor) {
        colorInput.value = savedColor;
        // Apply the color immediately
        updateInvoiceColor(savedColor);
        console.log('Custom color loaded:', savedColor);
    }
}

// Initialize template selection
function initializeTemplateSelection() {
    console.log('Initializing template selection...');
    
    const templateOptions = document.querySelectorAll('.template-option');
    templateOptions.forEach(option => {
        option.addEventListener('click', function() {
            const templateId = this.dataset.template;
            console.log('Template selected:', templateId);
            
            // Remove active class from all options
            templateOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to selected option
            this.classList.add('active');
            
            // Apply template
            if (typeof applyTemplate === 'function') {
                applyTemplate(templateId);
                
                // Update invoice preview with new template
                setTimeout(() => {
                    renderInvoicePreview();
                }, 100);
            }
        });
    });
}

// Initialize custom branding
function initializeCustomBranding() {
    console.log('Initializing custom branding...');
    
    // Logo upload handler
    const logoUpload = document.getElementById('logoUpload');
    if (logoUpload) {
        logoUpload.addEventListener('change', handleLogoUpload);
    }
    
    // Color picker handler
    const colorInput = document.getElementById('invoiceColor');
    if (colorInput) {
        colorInput.addEventListener('change', function() {
            updateInvoiceColor(this.value);
        });
    }
}

// Handle logo upload
function handleLogoUpload(event) {
    console.log('Handling logo upload...');
    
    if (!isProUser()) {
        showNotification('Logo upload is available for Pro users only. Please upgrade your plan.', 'warning');
        return;
    }
    
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file.', 'error');
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showNotification('Image size should be less than 2MB.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const logoData = e.target.result;
        
        // Save to localStorage
        localStorage.setItem('fanyabill_custom_logo', logoData);
        
        // Update preview
        const logoPreview = document.getElementById('logoPreview');
        if (logoPreview) {
            logoPreview.src = logoData;
            logoPreview.style.display = 'block';
        }
        
        // Update invoice preview
        renderInvoicePreview();
        
        showNotification('Logo uploaded successfully!', 'success');
        console.log('Logo uploaded and saved');
    };
    
    reader.readAsDataURL(file);
}

// Update invoice color
function updateInvoiceColor(color) {
    console.log('Updating invoice color to:', color);
    
    if (!color) return;
    
    // Save color to localStorage
    localStorage.setItem('fanyabill_custom_color', color);
    
    // Apply color to CSS custom property
    document.documentElement.style.setProperty('--custom-primary-color', color);
    
    // Update invoice preview
    renderInvoicePreview();
    
    console.log('Invoice color updated successfully');
}

// Generate invoice number
function generateInvoiceNumber() {
    const prefix = 'INV-';
    const timestamp = Date.now().toString().slice(-6);
    return prefix + timestamp.padStart(4, '0');
}

// Add item to invoice
function addItem() {
    const name = document.getElementById('itemName')?.value.trim();
    const quantity = parseFloat(document.getElementById('itemQuantity')?.value) || 0;
    const unit = document.getElementById('itemUnit')?.value.trim() || '';
    const price = parseFloat(document.getElementById('itemPrice')?.value) || 0;
    
    if (!name || quantity <= 0 || price <= 0) {
        showNotification('Please fill in all item details correctly.', 'error');
        return;
    }
    
    const item = {
        id: Date.now(),
        name: name,
        quantity: quantity,
        unit: unit,
        price: price,
        total: quantity * price
    };
    
    invoiceData.items.push(item);
    
    // Clear form
    document.getElementById('itemName').value = '';
    document.getElementById('itemQuantity').value = '';
    document.getElementById('itemUnit').value = '';
    document.getElementById('itemPrice').value = '';
    
    updateItemsList();
    calculateTotals();
    renderInvoicePreview();
    
    showNotification('Item added successfully!', 'success');
}

// Update items list display
function updateItemsList() {
    const itemsList = document.getElementById('itemsList');
    if (!itemsList) return;
    
    if (invoiceData.items.length === 0) {
        itemsList.innerHTML = '<p class="no-items">No items added yet.</p>';
        return;
    }
    
    itemsList.innerHTML = invoiceData.items.map(item => `
        <div class="item-row" data-id="${item.id}">
            <div class="item-details">
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">${item.quantity}${item.unit ? ' ' + item.unit : ''} × $${item.price.toFixed(2)}</span>
            </div>
            <div class="item-total">$${item.total.toFixed(2)}</div>
            <button class="remove-item" onclick="removeItem(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Remove item from invoice
function removeItem(itemId) {
    invoiceData.items = invoiceData.items.filter(item => item.id !== itemId);
    updateItemsList();
    calculateTotals();
    renderInvoicePreview();
    showNotification('Item removed successfully!', 'success');
}

// Calculate totals
function calculateTotals() {
    invoiceData.subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    invoiceData.tax = invoiceData.subtotal * 0.1; // 10% tax
    invoiceData.total = invoiceData.subtotal + invoiceData.tax;
    
    // Update display
    const subtotalElement = document.getElementById('subtotalAmount');
    const taxElement = document.getElementById('taxAmount');
    const totalElement = document.getElementById('totalAmount');
    
    if (subtotalElement) subtotalElement.textContent = `$${invoiceData.subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${invoiceData.tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${invoiceData.total.toFixed(2)}`;
}

// Generate invoice preview
function generateInvoice() {
    console.log('Generating invoice preview...');
    
    if (invoiceData.items.length === 0) {
        showNotification('Please add at least one item to generate an invoice.', 'error');
        return;
    }
    
    // Generate invoice number and dates
    invoiceData.invoiceNumber = generateInvoiceNumber();
    invoiceData.date = new Date().toLocaleDateString();
    invoiceData.dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
    
    // Get customer info
    const customerName = document.getElementById('customerName')?.value || 'Customer Name';
    const customerAddress = document.getElementById('customerAddress')?.value || 'Customer Address';
    const customerCity = document.getElementById('customerCity')?.value || 'Customer City';
    
    invoiceData.customerInfo = {
        name: customerName,
        address: customerAddress,
        city: customerCity
    };
    
    // Calculate totals
    calculateTotals();
    
    // Render invoice preview
    renderInvoicePreview();
    
    // Show invoice modal
    const modal = document.getElementById('invoiceModal');
    if (modal) {
        modal.style.display = 'block';
    }
    
    console.log('Invoice preview generated successfully');
}

// Render invoice preview
function renderInvoicePreview() {
    console.log('Rendering invoice preview...');
    
    const invoiceDocument = document.getElementById('invoiceDocument');
    if (!invoiceDocument) {
        console.error('Invoice document element not found');
        return;
    }
    
    // Get business info
    const businessInfo = invoiceData.businessInfo || {};
    
    // Get custom logo
    const customLogo = localStorage.getItem('fanyabill_custom_logo');
    
    // Generate invoice HTML
    const invoiceHTML = `
        <div class="invoice-header">
            <div class="company-info">
                ${customLogo && isProUser() ? `<img src="${customLogo}" alt="Company Logo" class="company-logo" style="max-height: 60px; max-width: 200px; margin-bottom: 10px;">` : ''}
                <h1 class="company-name">${businessInfo.name || 'Your Business Name'}</h1>
                <div class="company-details">
                    ${businessInfo.address ? `<p>${businessInfo.address}</p>` : ''}
                    ${businessInfo.city ? `<p>${businessInfo.city}</p>` : ''}
                    ${businessInfo.phone ? `<p>Phone: ${businessInfo.phone}</p>` : ''}
                    ${businessInfo.email ? `<p>Email: ${businessInfo.email}</p>` : ''}
                </div>
            </div>
            <div class="invoice-info">
                <h2 class="invoice-title">INVOICE</h2>
                <div class="invoice-details">
                    <p><strong>Invoice #:</strong> ${invoiceData.invoiceNumber || 'INV-0001'}</p>
                    <p><strong>Date:</strong> ${invoiceData.date || new Date().toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> ${invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
        
        <div class="billing-info">
            <div class="bill-to">
                <h3 class="section-title">BILL TO</h3>
                <div class="customer-details">
                    <p><strong>${invoiceData.customerInfo?.name || 'Customer Name'}</strong></p>
                    <p>${invoiceData.customerInfo?.address || 'Customer Address'}</p>
                    <p>${invoiceData.customerInfo?.city || 'Customer City'}</p>
                </div>
            </div>
            <div class="ship-to">
                <h3 class="section-title">SHIP TO</h3>
                <div class="customer-details">
                    <p><strong>${invoiceData.customerInfo?.name || 'Customer Name'}</strong></p>
                    <p>${invoiceData.customerInfo?.address || 'Customer Address'}</p>
                    <p>${invoiceData.customerInfo?.city || 'Customer City'}</p>
                </div>
            </div>
        </div>
        
        <div class="invoice-items">
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoiceData.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}${item.unit ? ' ' + item.unit : ''}</td>
                            <td>$${item.price.toFixed(2)}</td>
                            <td>$${item.total.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="invoice-totals">
            <div class="totals-table">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>$${invoiceData.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div class="total-row">
                    <span>Tax (10%):</span>
                    <span>$${invoiceData.tax?.toFixed(2) || '0.00'}</span>
                </div>
                <div class="total-row grand-total">
                    <span><strong>Total:</strong></span>
                    <span><strong>$${invoiceData.total?.toFixed(2) || '0.00'}</strong></span>
                </div>
            </div>
        </div>
        
        <div class="invoice-footer">
            <div class="thank-you">
                <p><strong>Thank you for your business!</strong></p>
                <p>Powered by FanyaBill</p>
            </div>
        </div>
    `;
    
    invoiceDocument.innerHTML = invoiceHTML;
    
    console.log('Invoice preview rendered successfully');
}

// Generate and download PDF
async function generateAndDownloadInvoice() {
    console.log('Starting PDF generation...');
    
    try {
        // Show loading state
        const downloadBtn = document.querySelector('.download-btn');
        if (downloadBtn) {
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
            downloadBtn.disabled = true;
        }
        
        // Get the invoice document
        const invoiceElement = document.getElementById('invoiceDocument');
        if (!invoiceElement) {
            throw new Error('Invoice document not found');
        }
        
        // Ensure the element is visible for html2canvas
        const originalDisplay = invoiceElement.style.display;
        invoiceElement.style.display = 'block';
        
        // Generate canvas from HTML
        const canvas = await html2canvas(invoiceElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: invoiceElement.scrollWidth,
            height: invoiceElement.scrollHeight
        });
        
        // Restore original display
        invoiceElement.style.display = originalDisplay;
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Calculate dimensions
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add image to PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Generate filename
        const customerName = invoiceData.customerInfo?.name || 'customer';
        const invoiceNumber = invoiceData.invoiceNumber || 'INV-0001';
        const filename = `invoice-${invoiceNumber}-${customerName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
        
        // Download PDF
        pdf.save(filename);
        
        // Record sale
        recordSale();
        
        showNotification('Invoice PDF generated successfully!', 'success');
        console.log('PDF generated and downloaded successfully');
        
    } catch (error) {
        console.error('PDF Generation Error:', error);
        showNotification('Failed to generate PDF. Please try again.', 'error');
    } finally {
        // Reset button state
        const downloadBtn = document.querySelector('.download-btn');
        if (downloadBtn) {
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
            downloadBtn.disabled = false;
        }
    }
}

// Record sale for analytics
function recordSale() {
    const sale = {
        id: Date.now(),
        invoiceNumber: invoiceData.invoiceNumber,
        date: new Date().toISOString(),
        customer: invoiceData.customerInfo?.name || 'Unknown Customer',
        items: invoiceData.items.length,
        total: invoiceData.total || 0
    };
    
    // Get existing sales
    const existingSales = JSON.parse(localStorage.getItem('fanyabill_sales') || '[]');
    
    // Add new sale
    existingSales.push(sale);
    
    // Save back to localStorage
    localStorage.setItem('fanyabill_sales', JSON.stringify(existingSales));
    
    console.log('Sale recorded:', sale);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('invoiceModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// AI Item Generation (placeholder)
async function generateItemsWithAI() {
    const description = document.getElementById('aiDescription')?.value.trim();
    
    if (!description) {
        showNotification('Please enter a description of your sale.', 'error');
        return;
    }
    
    if (!isProUser()) {
        showNotification('AI item generation is available for Pro users only. Please upgrade your plan.', 'warning');
        return;
    }
    
    try {
        // Show loading state
        const generateBtn = document.querySelector('.generate-ai-btn');
        if (generateBtn) {
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            generateBtn.disabled = true;
        }
        
        // Call AI service (placeholder)
        const response = await fetch('/.netlify/functions/gemini-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: description
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.items && Array.isArray(data.items)) {
            // Add generated items
            data.items.forEach(item => {
                invoiceData.items.push({
                    id: Date.now() + Math.random(),
                    name: item.name,
                    quantity: item.quantity || 1,
                    unit: item.unit || '',
                    price: item.price || 0,
                    total: (item.quantity || 1) * (item.price || 0)
                });
            });
            
            updateItemsList();
            calculateTotals();
            renderInvoicePreview();
            
            // Clear description
            document.getElementById('aiDescription').value = '';
            
            showNotification(`Generated ${data.items.length} items successfully!`, 'success');
        } else {
            throw new Error('Invalid response format');
        }
        
    } catch (error) {
        console.error('AI Generation Error:', error);
        showNotification('Failed to generate items using AI. Please try again or add manually.', 'error');
    } finally {
        // Reset button state
        const generateBtn = document.querySelector('.generate-ai-btn');
        if (generateBtn) {
            generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Items';
            generateBtn.disabled = false;
        }
    }
}

// Event listeners for modal
document.addEventListener('click', function(e) {
    const modal = document.getElementById('invoiceModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Handle Enter key in forms
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const target = e.target;
        
        // Add item form
        if (target.closest('.add-item-form')) {
            e.preventDefault();
            addItem();
        }
        
        // AI description
        if (target.id === 'aiDescription') {
            e.preventDefault();
            generateItemsWithAI();
        }
    }
});

console.log('FanyaBill script loaded successfully');

