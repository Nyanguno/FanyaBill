// netlify/functions/gemini-proxy.js
// This function acts as a secure proxy for your Google Gemini API calls.
// Your GEMINI_API_KEY is stored as an environment variable in Netlify,
// preventing it from being exposed on the client-side.

const fetch = require('node-fetch'); // Required for Netlify Functions to use fetch

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    try {
        // Parse the request body sent from your frontend
        const { type, message, description, inventory } = JSON.parse(event.body);

        // Retrieve the API key from Netlify environment variables
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
        if (!GEMINI_API_KEY) {
            console.error('Gemini Proxy Error: GEMINI_API_KEY not configured.');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Google Gemini API Key not configured in Netlify environment variables.' }),
            };
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
        const headers = {
            'Content-Type': 'application/json',
        };

        let payload;
        let aiResponseContent;

        switch (type) {
            case 'generateItems':
                // Construct a detailed prompt for generating invoice items
                const itemGenerationPrompt = `Generate a list of invoice items in JSON format based on the following description and existing inventory.
                Each item should have 'name', 'quantity', 'unitPrice' (number), and 'description'.
                Ensure quantities are reasonable. If a unitPrice is not specified, estimate a reasonable value.
                Do NOT include tax, just the base unit price.
                If description is empty, suggest common items.
                Existing inventory (for reference, do not necessarily use if not relevant to description): ${JSON.stringify(inventory)}
                Description: "${description}".
                
                Example JSON output:
                [
                    { "name": "Web Design Service", "quantity": 1, "unitPrice": 1200, "description": "Complete website redesign" },
                    { "name": "Hosting Fee", "quantity": 1, "unitPrice": 50, "description": "Monthly hosting" }
                ]
                
                If the description is empty or vague, provide a few common business items.
                For example, if description is "office supplies", output:
                [
                    { "name": "Pens", "quantity": 10, "unitPrice": 1.50, "description": "Blue ballpoint pens" },
                    { "name": "Notebooks", "quantity": 5, "unitPrice": 5.00, "description": "A4 ruled notebooks" }
                ]
                `;

                payload = {
                    contents: [{ parts: [{ text: itemGenerationPrompt }] }],
                    // Optionally add generation config for more structured output if needed
                    // generationConfig: { responseMimeType: "application/json" } // Not supported by all models or versions
                };

                const itemApiRes = await fetch(apiUrl, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(payload),
                });
                const itemData = await itemApiRes.json();
                
                // Detailed logging for debugging
                console.log('Gemini API Item Generation Response:', JSON.stringify(itemData, null, 2));

                if (itemData.candidates && itemData.candidates.length > 0 && 
                    itemData.candidates[0].content && itemData.candidates[0].content.parts && 
                    itemData.candidates[0].content.parts.length > 0) {
                    aiResponseContent = itemData.candidates[0].content.parts[0].text;
                } else {
                    console.error('Gemini Proxy Error: Invalid response structure for item generation.', JSON.stringify(itemData));
                    throw new Error('Invalid response structure from Gemini API for item generation.');
                }
                break;

            case 'chat':
                const chatPrompt = `You are a helpful business assistant. User message: ${message}`;
                payload = {
                    contents: [{ parts: [{ text: chatPrompt }] }],
                };

                const chatApiRes = await fetch(apiUrl, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(payload),
                });
                const chatData = await chatApiRes.json();

                // Detailed logging for debugging
                console.log('Gemini API Chat Response:', JSON.stringify(chatData, null, 2));
                
                if (chatData.candidates && chatData.candidates.length > 0 && 
                    chatData.candidates[0].content && chatData.candidates[0].content.parts && 
                    chatData.candidates[0].content.parts.length > 0) {
                    aiResponseContent = chatData.candidates[0].content.parts[0].text;
                } else {
                    console.error('Gemini Proxy Error: Invalid response structure for chat.', JSON.stringify(chatData));
                    throw new Error('Invalid response structure from Gemini API for chat.');
                }
                break;

            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Invalid AI request type.' }),
                };
        }

        // Attempt to parse the AI response content as JSON if it's for generateItems
        if (type === 'generateItems') {
            try {
                // Gemini sometimes includes markdown, so strip it before parsing
                const jsonString = aiResponseContent.replace(/```json\n|\n```/g, '').trim();
                aiResponseContent = JSON.parse(jsonString);
            } catch (jsonError) {
                console.error('Gemini Proxy Error: Failed to parse AI response as JSON.', jsonError);
                // If parsing fails, send the raw text, the frontend can handle the error
                // or you might want to throw an error here depending on strictness.
                throw new Error('AI response was not valid JSON: ' + aiResponseContent);
            }
        }


        return {
            statusCode: 200,
            body: JSON.stringify({ response: aiResponseContent }),
        };

    } catch (error) {
        console.error('Gemini Proxy Function Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to process AI request.', 
                details: error.message,
                // Only include stack in development for security
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
            }),
        };
    }
};