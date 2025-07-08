const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event, context) => {
    // Handle CORS
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Content-Type": "application/json"
    };

    // Handle preflight requests
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers,
            body: ""
        };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: "Method not allowed" })
        };
    }

    try {
        // Get the API key from environment variables
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: "Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables." 
                })
            };
        }

        const { type, description, inventory, message, settings, salesData } = JSON.parse(event.body);

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        let prompt = "";
        let response = "";

        if (type === "invoice_items_generator") {
            // Invoice items generation
            prompt = `
You are an AI assistant for FanyaBill, an invoice generation system. Your task is to parse a natural language description of a sale into a structured JSON array of invoice items.

Here is the user's description: "${description}"

Here is the current inventory data (use this for pricing if an item matches):
${inventory.map(item => `- ${item.name}: ${item.price} ${settings?.currency || 'KES'} (Stock: ${item.stock})`).join('\n')}

Instructions:
1. Identify each item, its quantity, and its unit price from the description.
2. If an item mentioned in the description exists in the provided inventory, use its price from the inventory. If the quantity is not specified, assume 1.
3. If an item is not found in the inventory but a price is mentioned in the description, use that price. If the quantity is not specified, assume 1.
4. If an item is not found in inventory and no price is mentioned, assume a price of 0. If the quantity is not specified, assume 1.
5. Your output MUST be a JSON array of objects. Each object MUST have the keys "name" (string), "quantity" (number), and "unitPrice" (number).
6. Ensure the quantity is an integer and unitPrice is a float.
7. Do NOT include any other text, explanations, or markdown formatting (like 
```json
) outside the JSON array.

Example Output Format:
[
  {
    "name": "Sugar",
    "quantity": 3,
    "unitPrice": 120.00
  },
  {
    "name": "Maize Flour 2kg",
    "quantity": 2,
    "unitPrice": 180.00
  }
]

Begin your response with the JSON array directly.
            `;

            const result = await model.generateContent(prompt);
            response = result.response.text();

            // Attempt to clean and parse the response to ensure it's valid JSON
            let cleanResponse = response.trim();
            // Remove common markdown code block wrappers if present
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.substring(7, cleanResponse.lastIndexOf('```')).trim();
            } else if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.substring(3, cleanResponse.lastIndexOf('```')).trim();
            }

            try {
                // Validate and re-serialize to ensure strict JSON format
                const parsed = JSON.parse(cleanResponse);
                response = JSON.stringify(parsed); // Ensure it's a compact JSON string
            } catch (e) {
                console.error('Failed to parse AI response as JSON:', e);
                // Fallback to an empty array or a specific error structure if parsing fails
                response = '[]'; 
            }

        } else if (type === "chat") {
            // FanyaBot chat assistant
            const inventoryList = inventory.map(item => 
                `- ${item.name}: ${settings?.currency || 'KES'} ${item.price} (Stock: ${item.stock}, Category: ${item.category || 'N/A'})`
            ).join('\n');

            const recentSales = salesData?.slice(-5).map(sale => 
                `- ${sale.date}: ${sale.customerName} - ${settings?.currency || 'KES'} ${sale.totalAmount.toFixed(2)}`
            ).join('\n') || 'No recent sales';

            prompt = `
You are FanyaBot, an AI customer service assistant for ${settings?.businessName || 'a business'} using FanyaBill. 
You help customers with inventory inquiries, pricing, and general business questions.

Business Information:
- Name: ${settings?.businessName || 'Business'}
- Address: ${settings?.businessAddress || 'Not specified'}
- City: ${settings?.businessCity || 'Not specified'}
- Phone: ${settings?.businessPhone || 'Not specified'}
- Email: ${settings?.businessEmail || 'Not specified'}
- Industry: ${settings?.industryTemplate || 'general'}

Current Inventory:
${inventoryList || 'No items in inventory'}

Recent Sales:
${recentSales}

Customer Question: "${message}"

Instructions:
1. Be helpful, friendly, and professional.
2. Answer questions about inventory, prices, and availability based on the provided inventory list.
3. If asked about items not in inventory, politely state that they are not currently available.
4. For pricing questions, provide exact prices from inventory, using the business currency (${settings?.currency || 'KES'}).
5. For stock questions, mention current stock levels.
6. Keep responses concise but informative.
7. If asked about business hours, location, or contact info, use the business information provided.
8. For general business questions, be helpful but stay within your role as a customer service assistant.
9. Do not generate or assume any information not explicitly provided in the inventory or business settings.

Respond naturally and conversationally.
            `;

            const result = await model.generateContent(prompt);
            response = result.response.text();
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ response })
        };

    } catch (error) {
        console.error('Gemini API Error:', error);
        
        let errorMessage = 'Failed to process request with Gemini AI.';
        if (error.message?.includes('API_KEY')) {
            errorMessage = 'Invalid Gemini API key. Please check your configuration.';
        } else if (error.message?.includes('quota')) {
            errorMessage = 'Gemini API quota exceeded. Please try again later.';
        } else if (error.message?.includes('safety')) {
            errorMessage = 'Request blocked by safety filters. Please rephrase your request.';
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: errorMessage,
                details: error.message 
            })
        };
    }
};

