import { GoogleGenerativeAI } from "@google/generative-ai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
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

export async function generateContent({ model, systemPrompt, userPrompt, imageBase64 }) {
    if (model === 'gemini') {
        return callGemini(systemPrompt, userPrompt, imageBase64);
    } else {
        return callOpenAI(systemPrompt, userPrompt, imageBase64);
    }
}

async function callOpenAI(systemPrompt, userPrompt, imageBase64) {
    if (!OPENAI_API_KEY) throw new Error("OpenAI API Key is missing");

    const content = [{ type: "text", text: userPrompt }];
    if (imageBase64) {
        content.push({
            type: "image_url",
            image_url: { url: imageBase64 }
        });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: content }
            ],
            temperature: 0.7,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Error communicating with OpenAI');
    }

    const data = await response.json();
    return (data.choices[0]?.message?.content || '').trim();
}

async function callGemini(systemPrompt, userPrompt, imageBase64) {
    if (!genAI) throw new Error("Gemini API Key is missing");

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
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
