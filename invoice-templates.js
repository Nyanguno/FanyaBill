// Enhanced Invoice Templates Configuration
const invoiceTemplates = {
    classic: {
        id: 'classic',
        name: 'Classic Professional',
        description: 'Traditional business invoice with clean lines and professional appearance',
        preview: 'templates/classic-preview.png',
        styles: {
            primaryColor: '#2563eb',
            secondaryColor: '#64748b',
            fontFamily: 'Poppins',
            headerStyle: 'traditional',
            tableStyle: 'bordered',
            footerStyle: 'signature'
        },
        css: `
            .invoice-template-classic {
                --template-primary: var(--custom-primary-color, #2563eb);
                --template-secondary: #64748b;
                --template-accent: #f1f5f9;
                font-family: 'Poppins', sans-serif;
                background: white;
                color: #1f2937;
            }
            
            .invoice-template-classic .invoice-header {
                border-bottom: 3px solid var(--template-primary);
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                padding: 2rem;
                margin-bottom: 2rem;
            }
            
            .invoice-template-classic .company-logo {
                max-height: 60px;
                max-width: 200px;
                margin-bottom: 15px;
                object-fit: contain;
            }
            
            .invoice-template-classic .company-name {
                color: var(--template-primary);
                font-weight: 700;
                font-size: 28px;
                margin: 0 0 10px 0;
            }
            
            .invoice-template-classic .company-details {
                color: var(--template-secondary);
                font-size: 14px;
                line-height: 1.5;
            }
            
            .invoice-template-classic .company-details p {
                margin: 2px 0;
            }
            
            .invoice-template-classic .invoice-title {
                color: var(--template-primary);
                font-size: 48px;
                font-weight: 800;
                margin: 0;
                text-align: right;
            }
            
            .invoice-template-classic .invoice-details {
                text-align: right;
                color: var(--template-secondary);
                font-size: 14px;
            }
            
            .invoice-template-classic .invoice-details p {
                margin: 5px 0;
            }
            
            .invoice-template-classic .section-title {
                color: var(--template-primary);
                border-bottom: 2px solid var(--template-primary);
                font-weight: 700;
                font-size: 16px;
                padding-bottom: 5px;
                margin-bottom: 15px;
            }
            
            .invoice-template-classic .billing-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                margin-bottom: 2rem;
            }
            
            .invoice-template-classic .customer-details p {
                margin: 3px 0;
                font-size: 14px;
            }
            
            .invoice-template-classic .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 2rem;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .invoice-template-classic .invoice-table th {
                background: var(--template-primary);
                color: white;
                padding: 15px 12px;
                text-align: left;
                font-weight: 600;
                border: none;
            }
            
            .invoice-template-classic .invoice-table td {
                padding: 12px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .invoice-template-classic .invoice-table tbody tr:nth-child(even) {
                background: var(--template-accent);
            }
            
            .invoice-template-classic .invoice-table tbody tr:hover {
                background: #f3f4f6;
            }
            
            .invoice-template-classic .invoice-totals {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 2rem;
            }
            
            .invoice-template-classic .totals-table {
                min-width: 300px;
            }
            
            .invoice-template-classic .total-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 15px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .invoice-template-classic .total-row.grand-total {
                background: var(--template-primary);
                color: white;
                font-weight: 700;
                font-size: 18px;
                border: none;
            }
            
            .invoice-template-classic .thank-you {
                text-align: center;
                color: var(--template-primary);
                font-weight: 600;
                margin-top: 2rem;
            }
            
            .invoice-template-classic .thank-you p {
                margin: 5px 0;
            }
        `
    },
    
    modern: {
        id: 'modern',
        name: 'Modern Gradient',
        description: 'Contemporary design with gradients and modern typography',
        preview: 'templates/modern-preview.png',
        styles: {
            primaryColor: '#7c3aed',
            secondaryColor: '#a855f7',
            fontFamily: 'Poppins',
            headerStyle: 'gradient',
            tableStyle: 'minimal',
            footerStyle: 'modern'
        },
        css: `
            .invoice-template-modern {
                --template-primary: var(--custom-primary-color, #7c3aed);
                --template-secondary: #a855f7;
                --template-accent: #faf5ff;
                --template-gradient: linear-gradient(135deg, var(--custom-primary-color, #7c3aed) 0%, #a855f7 100%);
                font-family: 'Poppins', sans-serif;
                background: white;
                color: #1f2937;
            }
            
            .invoice-template-modern .invoice-header {
                background: var(--template-gradient);
                color: white;
                border-radius: 12px;
                padding: 2rem;
                margin-bottom: 2rem;
                position: relative;
                overflow: hidden;
            }
            
            .invoice-template-modern .invoice-header::before {
                content: '';
                position: absolute;
                top: 0;
                right: 0;
                width: 100px;
                height: 100px;
                background: rgba(255,255,255,0.1);
                border-radius: 50%;
                transform: translate(30px, -30px);
            }
            
            .invoice-template-modern .company-logo {
                max-height: 60px;
                max-width: 200px;
                margin-bottom: 15px;
                object-fit: contain;
                filter: brightness(0) invert(1);
            }
            
            .invoice-template-modern .company-name {
                color: white;
                font-weight: 700;
                font-size: 28px;
                margin: 0 0 10px 0;
            }
            
            .invoice-template-modern .company-details {
                color: rgba(255, 255, 255, 0.9);
                font-size: 14px;
                line-height: 1.5;
            }
            
            .invoice-template-modern .company-details p {
                margin: 2px 0;
            }
            
            .invoice-template-modern .invoice-title {
                color: white;
                font-size: 48px;
                font-weight: 800;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                margin: 0;
                text-align: right;
            }
            
            .invoice-template-modern .invoice-details {
                text-align: right;
                color: rgba(255, 255, 255, 0.9);
                font-size: 14px;
            }
            
            .invoice-template-modern .invoice-details p {
                margin: 5px 0;
            }
            
            .invoice-template-modern .section-title {
                background: var(--template-gradient);
                color: white;
                padding: 10px 16px;
                border-radius: 8px;
                border: none;
                margin-bottom: 15px;
                font-weight: 600;
                font-size: 16px;
            }
            
            .invoice-template-modern .billing-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                margin-bottom: 2rem;
            }
            
            .invoice-template-modern .customer-details p {
                margin: 3px 0;
                font-size: 14px;
            }
            
            .invoice-template-modern .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 2rem;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .invoice-template-modern .invoice-table th {
                background: var(--template-gradient);
                color: white;
                padding: 15px 12px;
                text-align: left;
                font-weight: 600;
                border: none;
            }
            
            .invoice-template-modern .invoice-table td {
                padding: 12px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .invoice-template-modern .invoice-table tbody tr:nth-child(even) {
                background: var(--template-accent);
            }
            
            .invoice-template-modern .invoice-table tbody tr:hover {
                background: #f3f4f6;
                transform: scale(1.01);
                transition: all 0.2s ease;
            }
            
            .invoice-template-modern .invoice-totals {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 2rem;
            }
            
            .invoice-template-modern .totals-table {
                min-width: 300px;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .invoice-template-modern .total-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 15px;
                background: white;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .invoice-template-modern .total-row.grand-total {
                background: var(--template-gradient);
                color: white;
                font-weight: 700;
                font-size: 18px;
                border: none;
            }
            
            .invoice-template-modern .thank-you {
                text-align: center;
                background: var(--template-gradient);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-weight: 700;
                margin-top: 2rem;
            }
            
            .invoice-template-modern .thank-you p {
                margin: 5px 0;
            }
        `
    },
    
    minimal: {
        id: 'minimal',
        name: 'Minimal Clean',
        description: 'Clean and simple design focusing on content and readability',
        preview: 'templates/minimal-preview.png',
        styles: {
            primaryColor: '#059669',
            secondaryColor: '#6b7280',
            fontFamily: 'Poppins',
            headerStyle: 'minimal',
            tableStyle: 'clean',
            footerStyle: 'simple'
        },
        css: `
            .invoice-template-minimal {
                --template-primary: var(--custom-primary-color, #059669);
                --template-secondary: #6b7280;
                --template-accent: #f0fdf4;
                font-family: 'Poppins', sans-serif;
                background: white;
                color: #1f2937;
                line-height: 1.6;
            }
            
            .invoice-template-minimal .invoice-header {
                border-bottom: 2px solid #f3f4f6;
                padding-bottom: 2rem;
                margin-bottom: 2rem;
            }
            
            .invoice-template-minimal .company-logo {
                max-height: 50px;
                max-width: 180px;
                margin-bottom: 15px;
                object-fit: contain;
            }
            
            .invoice-template-minimal .company-name {
                color: var(--template-primary);
                font-weight: 600;
                font-size: 24px;
                margin: 0 0 10px 0;
                letter-spacing: -0.5px;
            }
            
            .invoice-template-minimal .company-details {
                color: var(--template-secondary);
                font-size: 14px;
                line-height: 1.5;
            }
            
            .invoice-template-minimal .company-details p {
                margin: 2px 0;
            }
            
            .invoice-template-minimal .invoice-title {
                color: var(--template-secondary);
                font-size: 36px;
                font-weight: 300;
                letter-spacing: 3px;
                margin: 0;
                text-align: right;
                text-transform: uppercase;
            }
            
            .invoice-template-minimal .invoice-details {
                text-align: right;
                color: var(--template-secondary);
                font-size: 14px;
                margin-top: 10px;
            }
            
            .invoice-template-minimal .invoice-details p {
                margin: 3px 0;
            }
            
            .invoice-template-minimal .section-title {
                color: var(--template-primary);
                border-bottom: 1px solid var(--template-primary);
                font-weight: 600;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                padding-bottom: 5px;
                margin-bottom: 15px;
            }
            
            .invoice-template-minimal .billing-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                margin-bottom: 2rem;
            }
            
            .invoice-template-minimal .customer-details p {
                margin: 3px 0;
                font-size: 14px;
                color: #374151;
            }
            
            .invoice-template-minimal .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 2rem;
                border: none;
            }
            
            .invoice-template-minimal .invoice-table th {
                background: var(--template-accent);
                color: var(--template-primary);
                padding: 15px 12px;
                text-align: left;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 11px;
                letter-spacing: 1px;
                border: none;
            }
            
            .invoice-template-minimal .invoice-table td {
                padding: 16px 12px;
                border-bottom: 1px solid #f3f4f6;
                font-size: 14px;
            }
            
            .invoice-template-minimal .invoice-table tbody tr:hover {
                background: var(--template-accent);
                transition: background-color 0.2s ease;
            }
            
            .invoice-template-minimal .invoice-totals {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 2rem;
            }
            
            .invoice-template-minimal .totals-table {
                min-width: 300px;
            }
            
            .invoice-template-minimal .total-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border: none;
                font-weight: 500;
                font-size: 14px;
            }
            
            .invoice-template-minimal .total-row.grand-total {
                border-top: 2px solid var(--template-primary);
                color: var(--template-primary);
                font-weight: 700;
                font-size: 18px;
                padding-top: 15px;
                margin-top: 10px;
            }
            
            .invoice-template-minimal .thank-you {
                text-align: center;
                color: var(--template-primary);
                font-weight: 400;
                margin-top: 3rem;
                font-size: 14px;
            }
            
            .invoice-template-minimal .thank-you p {
                margin: 5px 0;
            }
        `
    }
};

// Enhanced template management functions
function getAvailableTemplates() {
    return Object.values(invoiceTemplates);
}

function getTemplate(templateId) {
    return invoiceTemplates[templateId] || invoiceTemplates.classic;
}

function applyTemplate(templateId) {
    console.log(`Applying template: ${templateId}`);
    
    const template = getTemplate(templateId);
    
    // Remove existing template classes and styles
    const invoiceDoc = document.getElementById('invoiceDocument');
    if (invoiceDoc) {
        // Remove all template classes
        invoiceDoc.className = invoiceDoc.className.replace(/invoice-template-\w+/g, '');
        // Add new template class
        invoiceDoc.classList.add('invoice-document', `invoice-template-${template.id}`);
        console.log(`Applied template class: invoice-template-${template.id}`);
    }
    
    // Remove existing template styles
    const existingStyle = document.getElementById('current-template-styles');
    if (existingStyle) {
        existingStyle.remove();
        console.log('Removed existing template styles');
    }
    
    // Inject template CSS
    const styleElement = document.createElement('style');
    styleElement.id = 'current-template-styles';
    styleElement.textContent = template.css;
    document.head.appendChild(styleElement);
    console.log('Injected new template styles');
    
    // Update CSS custom properties for colors
    const customColor = localStorage.getItem('fanyabill_custom_color');
    if (customColor) {
        document.documentElement.style.setProperty('--custom-primary-color', customColor);
        console.log(`Applied custom color: ${customColor}`);
    } else if (template.styles.primaryColor) {
        document.documentElement.style.setProperty('--custom-primary-color', template.styles.primaryColor);
        console.log(`Applied template default color: ${template.styles.primaryColor}`);
    }
    
    if (template.styles.secondaryColor) {
        document.documentElement.style.setProperty('--custom-secondary-color', template.styles.secondaryColor);
    }
    
    // Store selected template
    localStorage.setItem('selectedInvoiceTemplate', templateId);
    console.log(`Template ${template.name} (${templateId}) applied successfully`);
    
    return template;
}

function loadSelectedTemplate() {
    const savedTemplate = localStorage.getItem('selectedInvoiceTemplate') || 'classic';
    console.log(`Loading saved template: ${savedTemplate}`);
    
    // Apply the template
    const template = applyTemplate(savedTemplate);
    
    // Update template selector UI if it exists
    setTimeout(() => {
        const templateOptions = document.querySelectorAll('.template-option');
        templateOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.template === savedTemplate) {
                option.classList.add('active');
                console.log(`Activated template option: ${savedTemplate}`);
            }
        });
    }, 100);
    
    return template;
}

// Initialize template selection functionality
function initializeTemplateSelection() {
    console.log('Initializing template selection...');
    
    const templateOptions = document.querySelectorAll('.template-option');
    
    if (templateOptions.length === 0) {
        console.warn('No template options found in DOM');
        return;
    }
    
    templateOptions.forEach(option => {
        // Remove existing event listeners
        option.removeEventListener('click', handleTemplateSelection);
        // Add new event listener
        option.addEventListener('click', handleTemplateSelection);
    });
    
    console.log(`Template selection initialized for ${templateOptions.length} options`);
}

function handleTemplateSelection(event) {
    const option = event.currentTarget;
    const templateId = option.dataset.template;
    
    if (!templateId) {
        console.error('Template ID not found on option element');
        return;
    }
    
    console.log(`Template option clicked: ${templateId}`);
    
    // Remove active class from all options
    const templateOptions = document.querySelectorAll('.template-option');
    templateOptions.forEach(opt => opt.classList.remove('active'));
    
    // Add active class to selected option
    option.classList.add('active');
    
    // Apply template
    const template = applyTemplate(templateId);
    
    // Update invoice preview with new template
    setTimeout(() => {
        if (typeof renderInvoicePreview === 'function') {
            renderInvoicePreview();
            console.log('Invoice preview updated with new template');
        } else {
            console.warn('renderInvoicePreview function not found');
        }
    }, 100);
    
    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification(`Template changed to ${template.name}`, 'success');
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        invoiceTemplates, 
        getAvailableTemplates, 
        getTemplate, 
        applyTemplate, 
        loadSelectedTemplate,
        initializeTemplateSelection 
    };
}

console.log('Enhanced invoice templates loaded successfully');

