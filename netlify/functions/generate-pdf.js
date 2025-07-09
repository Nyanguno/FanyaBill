const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

exports.handler = async (event, context) => {
    // Set longer timeout
    context.callbackWaitsForEmptyEventLoop = false;
    
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
            },
            body: "Method Not Allowed",
        };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
            },
            body: JSON.stringify({ error: "Invalid JSON in request body" }),
        };
    }

    const { html, baseUrl } = body;

    if (!html) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
            },
            body: JSON.stringify({ error: "HTML content is required." }),
        };
    }

    let browser = null;

    try {
        console.log("Starting PDF generation...");
        
        // Configure chromium with minimal args for better compatibility
        const args = [
            ...chromium.args,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process',
            '--no-zygote',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
        ];

        console.log("Launching browser...");
        browser = await puppeteer.launch({
            args: args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        console.log("Creating new page...");
        const page = await browser.newPage();

        // Set a simple user agent
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36');

        console.log("Setting page content...");
        // Set content directly without navigation
        await page.setContent(html, { 
            waitUntil: 'domcontentloaded',
            timeout: 15000 
        });

        // Wait a bit for any dynamic content
        await page.waitForTimeout(2000);

        console.log("Generating PDF...");
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "10mm",
                right: "10mm",
                bottom: "10mm",
                left: "10mm",
            },
            timeout: 15000,
        });

        console.log("PDF generated successfully");

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=\"invoice.pdf\"",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
            },
            body: pdfBuffer.toString("base64"),
            isBase64Encoded: true,
        };
    } catch (error) {
        console.error("PDF Generation Error:", error);
        console.error("Error stack:", error.stack);
        
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
            },
            body: JSON.stringify({ 
                error: `Failed to generate PDF: ${error.message}`,
                details: error.stack 
            }),
        };
    } finally {
        if (browser !== null) {
            try {
                await browser.close();
                console.log("Browser closed successfully");
            } catch (closeError) {
                console.error("Error closing browser:", closeError);
            }
        }
    }
};

