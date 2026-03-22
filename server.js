import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-image', async (req, res) => {
  try {
    // Reload latest .env on every request to prevent caching issues if user forgets to restart server
    dotenv.config({ override: true });
    
    const CLOUDFLARE_ACCOUNT_ID = process.env.VITE_CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_API_TOKEN = process.env.VITE_CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;

    const { prompt, translate = true, width, height } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      return res.status(500).json({ error: 'Cloudflare credentials not configured in .env' });
    }

    let englishPrompt = prompt;

    // 1. Translate Arabic to English (if requested)
    if (translate) {
      const translationResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/m2m100-1.2b`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: prompt,
            source_lang: 'arabic',
            target_lang: 'english'
          })
        }
      );

      if (!translationResponse.ok) {
        const err = await translationResponse.text();
        console.error('Translation error:', err);
        throw new Error('Translation failed');
      }

      const translateResult = await translationResponse.json();
      englishPrompt = translateResult.result.translated_text || prompt;
    }

    // 2. Generate Image
    const generatePayload = { prompt: englishPrompt };
    if (width) generatePayload.width = width;
    if (height) generatePayload.height = height;

    const imageResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/bytedance/stable-diffusion-xl-lightning`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(generatePayload)
      }
    );

    if (!imageResponse.ok) {
      const err = await imageResponse.text();
      console.error('Image generation error:', err);
      throw new Error('Image generation failed');
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    
    res.json({ 
        image: `data:image/jpeg;base64,${base64Image}`,
        translatedPrompt: englishPrompt 
    });

  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-imagen', async (req, res) => {
  try {
    dotenv.config({ override: true });
    
    const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    let { prompt } = req.body;
    if (!prompt) {
       return res.status(400).json({ error: 'Prompt is required' });
    }

    // Google AI Studio URL for Imagen 3
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`;
    
    const payload = {
      instances: [
        { prompt: prompt }
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: "9:16",
        outputOptions: {
            mimeType: "image/jpeg"
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Imagen generation error:', err);
      throw new Error('Imagen generation failed: ' + err);
    }

    const data = await response.json();
    if (data.predictions && data.predictions.length > 0) {
       const b64 = data.predictions[0].bytesBase64;
       res.json({ image: `data:image/jpeg;base64,${b64}` });
    } else {
       throw new Error('No predictions returned from Google Imagen');
    }
  } catch(error) {
    console.error('Error in /api/generate-imagen:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});
