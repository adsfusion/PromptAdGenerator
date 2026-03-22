import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export const radicalSanitize = (text) => {
    if (!text) return '';
    const map = {
        'bulk': 'Enterprise-Scale',
        'mass': 'Systematic',
        'spam': 'Automated Outreach',
        'prostate': 'Vital Health',
        'treatment': 'Advanced Solution',
        'cure': 'Support',
        'medical': 'Professional',
        'whatsapp': 'Messaging System',
        'sender': 'Distributor',
        'extractor': 'Data Organizer',
        'scraper': 'Digital Researcher',
        'wa sender': 'Global Messaging Tool'
    };
    let sanitized = text;
    Object.keys(map).forEach(key => {
        const reg = new RegExp(key, 'gi');
        sanitized = sanitized.replace(reg, map[key]);
    });
    return sanitized;
};

export async function generateContent({ systemPrompt, userPrompt, imageBase64 }) {
    try {
        const response = await callGemini(systemPrompt, userPrompt, imageBase64);
        return response;
    } catch (error) {
        const isQuotaExceeded = error.status === 429 || (error.message && error.message.includes('429'));
        
        if (isQuotaExceeded) {
            try {
                const fallbackResponse = await callFallbackProvider(systemPrompt, userPrompt, imageBase64);
                return fallbackResponse;
            } catch (fallbackError) {
                throw new Error("Temporary service disruption. Please try again in a few moments.");
            }
        }
        
        throw error;
    }
}

async function callGemini(systemPrompt, userPrompt, imageBase64) {
    if (!genAI) throw new Error("Gemini API Key is missing");

    const model = genAI.getGenerativeModel({
        model: "gemini-flash-lite-latest",
        systemInstruction: systemPrompt
    });

    const promptParts = [userPrompt];

    if (imageBase64) {
        // Extract base64 part and mime type
        const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
            promptParts.push({
                inlineData: {
                    mimeType: matches[1],
                    data: matches[2]
                }
            });
        }
    }

    const result = await model.generateContent(promptParts);
    const response = await result.response;
    return response.text().trim();
}

async function callFallbackProvider(systemPrompt, userPrompt, imageBase64) {
    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY; 
    if (!OPENROUTER_API_KEY) throw new Error("Fallback API Key is missing");

    const messages = [
        { role: "system", content: systemPrompt }
    ];

    if (imageBase64) {
        messages.push({
            role: "user",
            content: [
                { type: "text", text: userPrompt },
                { type: "image_url", image_url: { url: imageBase64 } }
            ]
        });
    } else {
        messages.push({ role: "user", content: userPrompt });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin || "http://localhost:5173",
        },
        body: JSON.stringify({
            model: "qwen/qwen-vl-plus:free",
            messages: messages
        })
    });

    if (!response.ok) {
        throw new Error(`Fallback Provider Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}
