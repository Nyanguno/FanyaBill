const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: "Method Not Allowed",
        };
    }

    const { html, baseUrl } = JSON.parse(event.body);

    if (!html) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "HTML content is required." }),
        };
    }

    let browser = null;

    try {
        // Configure chromium for Netlify
        await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');

        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();

        // Set the base URL for the page to correctly resolve relative paths (e.g., for images, CSS)
        if (baseUrl) {
            await page.goto(baseUrl, { waitUntil: 'networkidle0' });
        }

        // Set the content of the page after setting the base URL
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Add a small delay to ensure all content and styles are rendered
        await new Promise(resolve => setTimeout(resolve, 1000));

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "10mm",
                right: "10mm",
                bottom: "10mm",
                left: "10mm",
            },
        });

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=\"invoice.pdf\"",
            },
            body: pdfBuffer.toString("base64"),
            isBase64Encoded: true,
        };
    } catch (error) {
        console.error("PDF Generation Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Failed to generate PDF: ${error.message}` }),
        };
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
};

