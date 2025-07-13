// Invoice Templates Configuration
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
            }
            
            .invoice-template-classic .invoice-header {
                border-bottom: 3px solid var(--template-primary);
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                padding: 2rem;
            }
            
            .invoice-template-classic .company-name {
                color: var(--template-primary);
                font-weight: 700;
                font-size: 28px;
            }
            
            .invoice-template-classic .invoice-title {
                color: var(--template-primary);
                font-size: 48px;
                font-weight: 800;
            }
            
            .invoice-template-classic .section-title {
                color: var(--template-primary);
                border-bottom: 2px solid var(--template-primary);
                font-weight: 700;
            }
            
            .invoice-template-classic .invoice-table th {
                background: var(--template-primary);
                color: white;
            }
            
            .invoice-template-classic .invoice-table tbody tr:nth-child(even) {
                background: var(--template-accent);
            }
            
            .invoice-template-classic .total-row.grand-total {
                background: var(--template-primary);
                color: white;
            }
            
            .invoice-template-classic .thank-you {
                color: var(--template-primary);
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
            }
            
            .invoice-template-modern .invoice-header {
                background: var(--template-gradient);
                color: white;
                border-radius: 12px 12px 0 0;
                padding: 2rem;
                margin: -20mm -20mm 30px -20mm;
            }
            
            .invoice-template-modern .company-name {
                color: white;
                font-weight: 700;
                font-size: 28px;
            }
            
            .invoice-template-modern .company-details {
                color: rgba(255, 255, 255, 0.9);
            }
            
            .invoice-template-modern .invoice-title {
                color: white;
                font-size: 48px;
                font-weight: 800;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .invoice-template-modern .section-title {
                background: var(--template-gradient);
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                border: none;
                margin-bottom: 10px;
            }
            
            .invoice-template-modern .invoice-table {
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .invoice-template-modern .invoice-table th {
                background: var(--template-gradient);
                color: white;
                border: none;
            }
            
            .invoice-template-modern .invoice-table td {
                border-bottom: 1px solid #e5e7eb;
            }
            
            .invoice-template-modern .total-row.grand-total {
                background: var(--template-gradient);
                color: white;
                border-radius: 6px;
            }
            
            .invoice-template-modern .thank-you {
                background: var(--template-gradient);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
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
            }
            
            .invoice-template-minimal .invoice-header {
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 2rem;
                margin-bottom: 2rem;
            }
            
            .invoice-template-minimal .company-name {
                color: var(--template-primary);
                font-weight: 600;
                font-size: 24px;
            }
            
            .invoice-template-minimal .invoice-title {
                color: var(--template-secondary);
                font-size: 36px;
                font-weight: 300;
                letter-spacing: 2px;
            }
            
            .invoice-template-minimal .section-title {
                color: var(--template-primary);
                border-bottom: 1px solid var(--template-primary);
                font-weight: 600;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .invoice-template-minimal .invoice-table {
                border: none;
            }
            
            .invoice-template-minimal .invoice-table th {
                background: var(--template-accent);
                color: var(--template-primary);
                border: none;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 1px;
            }
            
            .invoice-template-minimal .invoice-table td {
                border-bottom: 1px solid #f3f4f6;
                padding: 16px 12px;
            }
            
            .invoice-template-minimal .invoice-table tbody tr:hover {
                background: var(--template-accent);
            }
            
            .invoice-template-minimal .total-row {
                border: none;
                font-weight: 500;
            }
            
            .invoice-template-minimal .total-row.grand-total {
                border-top: 2px solid var(--template-primary);
                color: var(--template-primary);
                font-weight: 700;
            }
            
            .invoice-template-minimal .thank-you {
                color: var(--template-primary);
                font-weight: 300;
            }
        `
    }
};

// Template management functions
function getAvailableTemplates() {
    return Object.values(invoiceTemplates);
}

function getTemplate(templateId) {
    return invoiceTemplates[templateId] || invoiceTemplates.classic;
}

function applyTemplate(templateId) {
    const template = getTemplate(templateId);
    
    // Remove existing template classes and styles
    const invoiceDoc = document.getElementById('invoiceDocument');
    if (invoiceDoc) {
        invoiceDoc.className = invoiceDoc.className.replace(/invoice-template-\w+/g, '');
        invoiceDoc.classList.add('invoice-document', `invoice-template-${template.id}`);
    }
    
    // Remove existing template styles
    const existingStyle = document.getElementById('current-template-styles');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    // Inject template CSS
    const styleElement = document.createElement('style');
    styleElement.id = 'current-template-styles';
    styleElement.textContent = template.css;
    document.head.appendChild(styleElement);
    
    // Update CSS custom properties
    if (template.styles.primaryColor) {
        document.documentElement.style.setProperty('--custom-primary-color', template.styles.primaryColor);
    }
    if (template.styles.secondaryColor) {
        document.documentElement.style.setProperty('--custom-secondary-color', template.styles.secondaryColor);
    }
    
    // Store selected template
    localStorage.setItem('selectedInvoiceTemplate', templateId);
    
    console.log(`Applied template: ${template.name} (${templateId})`);
    
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
            }
        });
    }, 100);
    
    return template;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { invoiceTemplates, getAvailableTemplates, getTemplate, applyTemplate, loadSelectedTemplate };
}

