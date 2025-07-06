const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

exports.handler = async (event) => {
    try {
        // 1. Get HTML from request
        const { html } = JSON.parse(event.body);

        // IMPORTANT DEBUGGING STEP: Log the received HTML to Netlify logs
        // This will confirm if the HTML being sent from the client is actually empty.
        console.log('PDF Function: Received HTML length:', html ? html.length : '0', 'bytes');
        // Uncomment below for a snippet of the received HTML in logs (be careful with large HTML)
        // console.log('PDF Function: Received HTML snippet:', html ? html.substring(0, 500) : 'No HTML');

        if (!html || typeof html !== 'string' || html.trim().length === 0) {
            console.error('PDF Function: Received empty or invalid HTML content. Status 400.');
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Empty or invalid HTML content provided to PDF function.' }),
            };
        }

        // 2. Launch browser
        const browser = await puppeteer.launch({
            executablePath: await chromium.executablePath,
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            headless: chromium.headless,
        });

        // 3. Create page and set content
        const page = await browser.newPage();

        // **CRITICAL FIX for PDF content missing (relative paths):**
        // The HTML content sent to page.setContent() MUST have all its CSS, image,
        // and font paths as ABSOLUTE URLs, or the CSS must be INLINED.
        // Puppeteer running in the serverless function cannot resolve relative paths
        // from your client-side website.
        // Example: <link rel="stylesheet" href="https://your-domain.com/style.css">
        //          <img src="https://your-domain.com/assets/images/logo.png">
        // The recommended solution is to make these absolute in your 'app.html'
        // or dynamically transform them in 'script.js' before sending the HTML.
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Optional: Add a small delay for content to fully render if there's any dynamic rendering
        // or external asset loading that isn't caught by networkidle0.
        // await new Promise(resolve => setTimeout(resolve, 500)); // Uncomment if content is still blank

        // 4. Generate PDF with exact dimensions
        const pdf = await page.pdf({
            format: 'A4',
            margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
            printBackground: true,
            preferCSSPageSize: true
        });

        await browser.close();

        // 5. Return PDF
        return {
            statusCode: 200,
            headers: { 
                'Content-Type': 'application/pdf',
                // 'Content-Disposition': 'attachment; filename=invoice.pdf' // Client-side script handles filename, not needed here
            },
            body: pdf.toString('base64'),
            isBase64Encoded: true
        };

    } catch (error) {
        console.error('PDF Generation Function Error:', error); // Log the full error
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to generate PDF.', 
                details: error.message || 'An unknown error occurred during PDF generation.',
                // Only include stack in development for security
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
            }),
        };
    }
};