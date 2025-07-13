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
