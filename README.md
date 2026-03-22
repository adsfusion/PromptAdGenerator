# منصة الأدوات — AI Marketing Suite

<div align="center">
  <strong>A professional, AI-powered suite of 7 tools for Arabic and multilingual marketing content generation.</strong>
</div>

---

## 🚀 Features

| Tool | Description |
|------|-------------|
| 🎯 **مولد الإعلانات** (Ad Copy Generator) | AI-powered direct-response copywriting for Facebook, TikTok & Instagram in 4 languages |
| ⚡ **مولد الخطافات** (Marketing Hook Generator) | Generate scroll-stopping hooks and headlines using proven marketing frameworks |
| 📱 **برومبت السوشيال ميديا** (Social Media Prompt) | Two-step AI prompt engine for social ad design briefs |
| 🖥️ **برومبت صفحة الهبوط** (Landing Page Prompt) | Generate vertical infographic (9:32) design prompts for landing pages |
| 🏷️ **برومبت ملصقات المنتجات** (Product Label Prompt) | Image-analysis-based prompt generator for professional product packaging & label design |
| 🖼️ **ضاغط الصور** (Image Compressor) | Client-side image compression with live before/after drag slider |
| ✍️ **المُشكِّل العربي** (Arabic Tashkeel) | AI-powered Arabic diacritization with three modes (full / endings only / remove) |

---

## 🛠 Tech Stack

- **Frontend:** React 18 + Vite 5
- **Styling:** Tailwind CSS v3
- **Primary AI:** Google Gemini API (`gemini-flash-lite-latest`)
- **Fallback AI:** OpenRouter API (`qwen/qwen-vl-plus:free`) — auto-activates on quota limits
- **Image Processing:** `browser-image-compression`
- **Icons:** Lucide React

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/PromptAdGenerator.git
cd PromptAdGenerator
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
copy .env.example .env
```
Open `.env` and fill in your API keys:
```env
VITE_GEMINI_API_KEY="your_gemini_api_key_here"
VITE_OPENROUTER_API_KEY="your_openrouter_api_key_here"
```

### 4. Run the Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## 🌐 Deployment (Vercel)

This project is pre-configured for Vercel:
- **`vercel.json`** handles SPA routing (no 404 on page refresh) and enables clean URLs.
- Push to GitHub → connect the repo to Vercel → add Environment Variables → Deploy.

### Required Environment Variables in Vercel Dashboard:
| Variable | Description |
|----------|-------------|
| `VITE_GEMINI_API_KEY` | Google Gemini API Key |
| `VITE_OPENROUTER_API_KEY` | OpenRouter API Key (for fallback) |

---

## 📄 License
MIT
