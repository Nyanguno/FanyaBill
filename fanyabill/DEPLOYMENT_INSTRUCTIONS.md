# FanyaBill Website Deployment Instructions

## Files Included
Your FanyaBill website contains the following files:

- `index.html` - Landing page
- `app.html` - Main application
- `payment.html` - PayPal payment page
- `pro-success.html` - Payment success page
- `style.css` - All styling
- `script.js` - Main application logic
- `api-config.js` - API configuration and integrations

## Deployment Options

### Option 1: Use Your Own Web Hosting
1. Upload all files to your web hosting provider's public folder (usually `public_html`, `www`, or `htdocs`)
2. Make sure `index.html` is in the root directory
3. Your website will be accessible at your domain name

### Option 2: Use Free Hosting Services
**Netlify (Recommended):**
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the entire `fanyabill` folder
3. Connect your custom domain in Netlify settings


**GitHub Pages:**
1. Create a GitHub repository
2. Upload all files
3. Enable GitHub Pages in repository settings

### Option 3: Platform Deployment
Use the built-in deployment service for instant hosting, then set up domain forwarding.

## Environment Setup

### Google Gemini API Key
1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Users can enter their API key in the application, or you can modify `api-config.js` to include it

### PayPal Configuration
The PayPal integration is already configured with the provided client ID. For production:
1. Replace the sandbox client ID with your live PayPal client ID in `app.html`
2. Update the hosted button ID if needed

### Google Sheets Integration
The email collection is already configured to work with the provided Google Apps Script URL.

## Custom Domain Setup
1. **DNS Configuration**: Point your domain to your hosting provider
2. **SSL Certificate**: Most hosting providers offer free SSL certificates
3. **Domain Forwarding**: If using platform deployment, set up forwarding from your domain

## Testing Checklist
- [ ] Landing page loads correctly
- [ ] Navigation between pages works
- [ ] Invoice generation functions
- [ ] Inventory management works
- [ ] FanyaBot responds to queries
- [ ] PayPal payment flow works
- [ ] PDF downloads work
- [ ] Mobile responsiveness

## Support
If you need help with deployment or have questions about the code, feel free to ask!

## File Structure
```
fanyabill/
├── index.html          # Landing page
├── app.html            # Main application
├── payment.html        # Payment page
├── pro-success.html    # Success page
├── style.css           # Styles
├── script.js           # Main logic
├── api-config.js       # API integrations
└── assets/             # Assets folder (for future use)
    ├── images/
    └── templates/
```

