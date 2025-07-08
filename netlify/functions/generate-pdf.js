const chromium = require(\'chrome-aws-lambda\');
const puppeteer = require(\'puppeteer-core\');

exports.handler = async (event) => {
    try {
        const { html, baseUrl } = JSON.parse(event.body);

        console.log(\'PDF Function: Received HTML length:\', html ? html.length : \'0\', \'bytes\');
        console.log(\'PDF Function: Received Base URL:\', baseUrl);

        if (!html || typeof html !== \'string\' || html.trim().length === 0) {
            console.error(\'PDF Function: Received empty or invalid HTML content. Status 400.\');
            return {
                statusCode: 400,
                body: JSON.stringify({ error: \'Empty or invalid HTML content provided to PDF function.\' }),
            };
        }

        const browser = await puppeteer.launch({
            executablePath: await chromium.executablePath,
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            headless: chromium.headless,
        });

        const page = await browser.newPage();

        // Set the base URL for the page content
        await page.goto(baseUrl, { waitUntil: \'networkidle0\' }); // Navigate to the base URL first
        await page.setContent(html, { waitUntil: \'networkidle0\' }); // Then set the HTML content

        const pdf = await page.pdf({
            format: \'A4\',
            margin: { top: \'20mm\', right: \'20mm\', bottom: \'20mm\', left: \'20mm\' },
            printBackground: true,
            preferCSSPageSize: true
        });

        await browser.close();

        return {
            statusCode: 200,
            headers: { 
                \'Content-Type\': \'application/pdf\',
            },
            body: pdf.toString(\'base64\'),
            isBase64Encoded: true
        };

    } catch (error) {
        console.error(\'PDF Generation Function Error:\', error); // Log the full error
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: \'Failed to generate PDF.\', 
                details: error.message || \'An unknown error occurred during PDF generation.\',
                stack: process.env.NODE_ENV === \'development\' ? error.stack : undefined 
            }),
        };
    }
};

