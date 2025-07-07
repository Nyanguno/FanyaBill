const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async (event, context) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
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
                    error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.' 
                })
            };
        }

        const { type, description, inventory, message, settings, salesData } = JSON.parse(event.body);

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        let prompt = '';
        let response = '';

        if (type === 'invoice_items_generator') {
            // Invoice items generation
            prompt = `
You are an AI assistant for FanyaBill, an invoice generation system. Parse the following natural language description into structured invoice items.

Description: "${description}"

Available Inventory:
${inventory.map(item => `- ${item.name}: ${item.price} ${settings?.currency || 'KES'} (Stock: ${item.stock})`).join('\n')}

Instructions:
1. Extract items, quantities, and prices from the description
2. If an item exists in inventory, use the inventory price
3. If an item doesn't exist in inventory, use the price mentioned in the description
4. Return ONLY a JSON array of objects with this exact format:
[
  {
    "name": "Item Name",
    "quantity": 1,
    "price": 100.00
  }
]

Examples:
- "3 sugar at 120" → [{"name": "Sugar", "quantity": 3, "price": 120.00}]
- "2 kg maize flour at 180, 1 cooking oil at 350" → [{"name": "Maize Flour 2kg", "quantity": 1, "price": 180.00}, {"name": "Cooking Oil", "quantity": 1, "price": 350.00}]

Return only the JSON array, no other text.
            `;

            const result = await model.generateContent(prompt);
            response = result.response.text();

            // Clean up the response to ensure it's valid JSON
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
            }
            if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
            }

            // Validate JSON
            try {
                JSON.parse(cleanResponse);
                response = cleanResponse;
            } catch (e) {
                // If JSON parsing fails, return a fallback format
                console.error('JSON parsing failed:', e);
                response = '[]';
            }

        } else if (type === 'chat') {
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
1. Be helpful, friendly, and professional
2. Answer questions about inventory, prices, and availability
3. If asked about items not in inventory, politely say they're not available
4. For pricing questions, provide exact prices from inventory
5. For stock questions, mention current stock levels
6. Keep responses concise but informative
7. Use the business currency (${settings?.currency || 'KES'}) in price responses
8. If asked about business hours, location, or contact info, use the business information provided
9. For general business questions, be helpful but stay within your role as a customer service assistant

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

