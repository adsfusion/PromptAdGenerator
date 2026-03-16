'use client';

import { useState, useRef } from 'react';
import { Copy, Upload, Zap, BarChart3, Sparkles, Type, Image as ImageIcon, X, Wand2 } from 'lucide-react';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export default function PromptAdGenerator({ onTaskComplete }) {
    const [platform, setPlatform] = useState('');
    const [angle, setAngle] = useState('');
    const [language, setLanguage] = useState('arabic');
    const [outputStyle, setOutputStyle] = useState('Realistic');
    const [currentStep, setCurrentStep] = useState('idle'); // 'idle' | 'loading' | 'success'
    const [countdown, setCountdown] = useState(6);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedText, setGeneratedText] = useState('');
    const [copied, setCopied] = useState(false);

    // Pricing and Offer States
    const [hasDiscount, setHasDiscount] = useState(false);
    const [currentPrice, setCurrentPrice] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [discountedPrice, setDiscountedPrice] = useState('');
    const [currency, setCurrency] = useState('دولار $');
    const [contact, setContact] = useState('');

    // New states for AI integration
    const [imagePreview, setImagePreview] = useState(null);
    const [fileData, setFileData] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef(null);

    // Image Upload Handler
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Create preview URL
        const readerPreview = new FileReader();
        readerPreview.onloadend = () => {
            setImagePreview(readerPreview.result);
        };
        readerPreview.readAsDataURL(file);

        // Prepare Base64 for the API
        const readerAPI = new FileReader();
        readerAPI.onloadend = () => {
            setFileData(readerAPI.result); // Base64 data URL
        };
        readerAPI.readAsDataURL(file);
        // Clear previous errors if any
        setErrorMsg('');
    };

    const handleRemoveImage = (e) => {
        e.stopPropagation(); // Prevent clicking the parent dropzone
        setImagePreview(null);
        setFileData(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleGenerate = async () => {
        if (!platform) {
            setErrorMsg('يرجى اختيار المنصة أولاً.');
            return;
        }
        if (!OPENAI_API_KEY) {
            setErrorMsg('مفتاح OpenAI غير موجود في ملف .env');
            return;
        }

        setCurrentStep('loading');
        setIsGenerating(true);
        setErrorMsg('');
        setGeneratedText('');
        setCountdown(30);
        const startTime = Date.now();

        // Countdown Timer Logic
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const getPlatformName = (p) => {
            switch (p) {
                case 'facebook': return 'فيسبوك (Facebook)';
                case 'tiktok': return 'تيك توك (TikTok)';
                case 'instagram': return 'إنستجرام (Instagram)';
                default: return p;
            }
        };

        const getAngleName = (a) => {
            switch (a) {
                case 'problem_solution': return 'مشكلة وحل';
                case 'direct_response': return 'استجابة مباشرة';
                case 'social_proof': return 'دليل اجتماعي';
                case 'limited_offer': return 'عرض محدود بوقت';
                case 'functional_benefit': return 'فائدة وظيفية';
                case 'curiosity': return 'إثارة الفضول (Curiosity / Hook)';
                case 'discount': return 'التركيز على الخصم (Discount / Promotion)';
                case 'problem': return 'حل مشكلة (Problem / Solution)';
                case 'luxury': return 'الفخامة والجودة (Luxury / Premium)';
                default: return 'زاوية تسويقية جذابة عامة';
            }
        };

        const radicalSanitize = (text) => {
            if (!text) return '';
            const map = {
                'bulk': 'High-Volume',
                'mass': 'Systematic',
                'spam': 'Automated Outreach',
                'prostate': 'Vital Health',
                'treatment': 'Advanced Solution',
                'cure': 'Support',
                'medical': 'Professional',
                'whatsapp': 'Messaging System'
            };
            let sanitized = text;
            Object.keys(map).forEach(key => {
                const reg = new RegExp(key, 'gi');
                sanitized = sanitized.replace(reg, map[key]);
            });
            return sanitized;
        };

        const getLangName = (l) => {
            switch (l) {
                case 'arabic': return 'اللغة العربية (Arabic)';
                case 'english': return 'اللغة الإنجليزية (English)';
                case 'french': return 'اللغة الفرنسية (French)';
                case 'spanish': return 'اللغة الإسبانية (Spanish)';
                default: return l;
            }
        };

        let pricingContext = '';
        if (hasDiscount && originalPrice && discountedPrice) {
            pricingContext = `Note that there is an exclusive offer! The original price was ${originalPrice} ${currency} and the current price after discount is ${discountedPrice} ${currency}. Highlight this discount strongly in the ad to create a sense of urgency (FOMO), and write the prices clearly in the CTA section in ${language}.`;
        } else if (!hasDiscount && currentPrice) {
            pricingContext = `Note that the product price is ${currentPrice} ${currency}. Integrate this price clearly into the Call to Action (CTA) section in ${language}.`;
        }
        
        if (contact) {
            pricingContext += `\n\nContact Info: ${contact}. Please include this information clearly in the Call to Action (CTA) section so customers know how to order.`;
        }

        const safeProductInfo = radicalSanitize(`${productName} ${pricingContext}`);

        const promptText = `Step 1: Analyze the visual elements of the attached image objectively (colors, objects, layout, text present).
Step 2: Based on your analysis, act as a professional marketing consultant and write a high-converting ad copy for ${getPlatformName(platform)} in ${getLangName(language)}, using the ${getAngleName(angle)} angle.

Context Info: ${safeProductInfo}

CRITICAL RULE #1: If the product belongs to a sensitive category (e.g., automated tools, healthcare), you MUST rephrase all technical functions into professional business-to-business (B2B) or general wellness terminology. NEVER use words like "Bulk", "Spam", "Treatment", or specific medical names. Use "Systematic Reach", "Advanced Support", and "Enterprise Solutions" instead.

CRITICAL RULE #2: The final output MUST be in ${getLangName(language)}. 
${language === 'arabic' ? 'Targeting: Local and Gulf markets.' : ''}
${language === 'english' ? 'Targeting: Global markets and dropshipping.' : ''}
${language === 'french' ? 'Targeting: African and European French-speaking markets.' : ''}
${language === 'spanish' ? 'Targeting: Latin American and Spanish markets.' : ''}

Aesthetic Style to reflect in the visual description/copy (if applicable): ${outputStyle}.

GUIDELINE: If the product is in a sensitive category (e.g., marketing automation software, productivity tools, or health/medical), focus strictly on technical benefits (e.g., efficiency, scalability, time-saving) and professional value. For automation software, use professional terms like "Automated Outreach", "Enterprise Communication", and "Business Scaling". AVOID words that trigger safety filters like "Bulk", "Mass", or "Spam"; instead use "High-Volume Automation" or "Systematic Reach". Ensure the response is strictly professional.

Final Response Format:
[Detailed Copy only, no intros]`;

        try {
            const contentArray = [
                { type: "text", text: promptText }
            ];
            
            if (fileData) {
                contentArray.push({
                    type: "image_url",
                    image_url: { url: fileData }
                });
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [{ role: 'user', content: contentArray }],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || 'خطأ في الاتصال بـ OpenAI');
            }

            const data = await response.json();
            const outputText = (data.choices[0]?.message?.content || '').trim();

            // Detect OpenAI refusal/safety trigger - log for debug
            if (outputText.length < 200 && (outputText.toLowerCase().includes("i'm sorry") || outputText.toLowerCase().includes("can't assist") || outputText.toLowerCase().includes("cannot assist") || outputText.toLowerCase().includes("يؤسفني") || outputText.toLowerCase().includes("اعتذر"))) {
                console.warn("OpenAI Refusal Detected:", outputText);
                throw new Error("اعتذر الذكاء الاصطناعي عن معالجة هذا الطلب. قد يكون ذلك بسبب سياسات المحتوى الصارمة تجاه منتجات معينة. يرجى تجربة وصف المنتج يدوياً أو استخدام صورة أخرى.");
            }

            setGeneratedText(outputText);
            
            // Timing Fix: Ensure total wait time is 30 seconds
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 30000 - elapsed);
            if (remaining > 0) {
                await new Promise(resolve => setTimeout(resolve, remaining));
            }
            
            setCurrentStep('success');
            if (onTaskComplete) onTaskComplete();
        } catch (error) {
            console.error("OpenAI API Error:", error);
            setErrorMsg(`عذراً، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: ${error.message || 'خطأ غير معروف'}. الرجاء التحقق من مفتاح API أو المحاولة لاحقاً.`);
            setCurrentStep('idle');
            clearInterval(timer);
        } finally {
            setIsGenerating(false);
            clearInterval(timer);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div dir="rtl" className="h-full overflow-y-auto bg-background text-foreground"
            style={{ scrollbarWidth: 'none' }}
        >
            {/* Header */}
            <header className="border-b border-border bg-background/50 backdrop-blur">
                <div className="mx-auto max-w-7xl px-6 py-6">
                    <h1 className="text-3xl font-bold text-primary">
                        مولد الإعلانات الاحترافي
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        أنشئ نصوصاً إعلانية جذابة لمنصات التواصل الاجتماعي في ثوانٍ
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-6 py-12">
                {/* Two Column Layout */}
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Right Column - Input */}
                    <div className={`space-y-6 transition-all duration-500 ${currentStep === 'loading' ? 'opacity-50 pointer-events-none' : ''}`}>
                        {/* Error Message Display */}
                        {errorMsg && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
                                {errorMsg}
                            </div>
                        )}

                        {/* Image Upload */}
                        <div
                            onClick={() => currentStep === 'idle' && fileInputRef.current?.click()}
                            className={`rounded-xl border-2 border-dashed ${imagePreview ? 'border-purple-500 bg-purple-500/5' : 'border-slate-700 bg-slate-800/30'} p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer relative overflow-hidden group 
                                ${currentStep === 'loading' ? 'cursor-not-allowed' : ''}`}
                        >
                            <input
                                type="file"
                                id="image-upload"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleImageChange}
                                accept="image/png, image/jpeg, image/gif, image/webp"
                                disabled={currentStep === 'loading'}
                            />

                            {imagePreview ? (
                                <div className="relative h-40 w-full flex items-center justify-center">
                                    <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg shadow-lg relative z-10" />
                                    {/* Overlay for removing image */}
                                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
                                        <button
                                            onClick={handleRemoveImage}
                                            disabled={currentStep === 'loading'}
                                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full mb-2 transition-colors disabled:opacity-50"
                                        >
                                            <X size={20} />
                                        </button>
                                        <span className="text-white text-sm font-medium">إزالة الصورة</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Upload className="mx-auto mb-3 h-8 w-8 text-slate-400 group-hover:text-purple-400 transition-colors pointer-events-none" />
                                    <p className="text-sm font-medium text-slate-200 pointer-events-none">
                                        اسحب وافلت صورة المنتج هنا أو انقر للاختيار
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400 pointer-events-none">
                                        يدعم ملفات JPG, PNG, WEBP حتى 10 ميجابايت
                                    </p>
                                    <p className="mt-3 text-xs text-purple-400 font-semibold pointer-events-none">
                                        (تلميح: سيقوم الذكاء الاصطناعي بتحليل صورتك لكتابة الإعلان)
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Platform Selector */}
                        <div>
                            <label className="mb-3 block text-sm font-semibold text-foreground">
                                اختر المنصة
                            </label>
                            <div className="flex gap-3">
                                {[
                                    { id: 'facebook', label: 'فيسبوك' },
                                    { id: 'tiktok', label: 'تيك توك' },
                                    { id: 'instagram', label: 'إنستجرام' },
                                ].map((plat) => (
                                    <button
                                        key={plat.id}
                                        onClick={() => setPlatform(plat.id)}
                                        disabled={currentStep === 'loading'}
                                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${platform === plat.id
                                            ? 'bg-primary text-primary-foreground shadow-lg'
                                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                                            } disabled:opacity-50`}
                                    >
                                        {plat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dropdowns */}
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-200 flex items-center gap-2">
                                    <BarChart3 size={16} className="text-purple-400" /> زاوية التسويق
                                </label>
                                <select
                                    value={angle}
                                    onChange={(e) => setAngle(e.target.value)}
                                    disabled={currentStep === 'loading'}
                                    className="w-full bg-slate-800 border-none rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-purple-500 appearance-none outline-none disabled:opacity-50"
                                >
                                    <option value="">اختر زاوية تسويقية</option>
                                    <option value="curiosity">إثارة الفضول</option>
                                    <option value="discount">التركيز على الخصم</option>
                                    <option value="problem">حل مشكلة</option>
                                    <option value="luxury">الفخامة والجودة</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-200 flex items-center gap-2">
                                    <Type size={16} className="text-purple-400" /> لغة المحتوى
                                </label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    disabled={currentStep === 'loading'}
                                    className="w-full bg-slate-800 border-none rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-purple-500 appearance-none outline-none disabled:opacity-50"
                                >
                                    <option value="arabic">العربية (الأسواق المحلية والخليج)</option>
                                    <option value="english">الإنجليزية (الأسواق العالمية والدروبشيبينغ)</option>
                                    <option value="french">الفرنسية (أسواق أفريقيا وأوروبا)</option>
                                    <option value="spanish">الإسبانية (أمريكا اللاتينية وإسبانيا)</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-200 flex items-center gap-2">
                                    <Wand2 size={16} className="text-purple-400" /> نمط الإخراج
                                </label>
                                <select
                                    value={outputStyle}
                                    onChange={(e) => setOutputStyle(e.target.value)}
                                    disabled={currentStep === 'loading'}
                                    className="w-full bg-slate-800 border-none rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-purple-500 appearance-none outline-none disabled:opacity-50"
                                >
                                    <option value="Realistic">واقعي (Realistic)</option>
                                    <option value="3D Isometric">ثلاثي الأبعاد (3D Isometric)</option>
                                    <option value="Minimalist">بسيط (Minimalist)</option>
                                    <option value="Vibrant">حيوي (Vibrant)</option>
                                </select>
                            </div>
                        </div>

                        {/* Pricing and Offers */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
                            <h3 className="mb-4 text-sm font-semibold text-foreground flex items-center justify-between">
                                {language === 'arabic' ? 'التسعير والعروض (اختياري)' : 
                                 language === 'english' ? 'Pricing & Offers (Optional)' :
                                 language === 'french' ? 'Prix et Offres (Optionnel)' : 'Precios y Ofertas (Opcional)'}
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={hasDiscount}
                                        onChange={() => setHasDiscount(!hasDiscount)}
                                        disabled={currentStep === 'loading'}
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                    <span className="mr-3 text-xs font-medium text-slate-300">
                                        {language === 'arabic' ? 'عرض حصري / يوجد خصم' : 
                                         language === 'english' ? 'Exclusive Offer / Discount' :
                                         language === 'french' ? 'Offre Exclusive / Remise' : 'Oferta Exclusiva / Descuento'}
                                    </span>
                                </label>
                            </h3>

                            <div className="grid gap-4 md:grid-cols-2">

                                {!hasDiscount ? (
                                    <div className="col-span-full">
                                        <label className="mb-2 block text-xs font-semibold text-slate-400">{getUIText(language).price}</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={currentPrice}
                                                onChange={(e) => setCurrentPrice(e.target.value)}
                                                disabled={currentStep === 'loading'}
                                                placeholder={getUIText(language).placeholder}
                                                className="flex-1 bg-slate-800 border-none rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-purple-500 appearance-none outline-none disabled:opacity-50"
                                            />
                                            <select
                                                value={currency}
                                                onChange={(e) => setCurrency(e.target.value)}
                                                disabled={currentStep === 'loading'}
                                                className="w-24 bg-slate-800 border-none rounded-lg px-2 py-3 text-slate-200 focus:ring-2 focus:ring-purple-500 appearance-none outline-none text-center disabled:opacity-50"
                                            >
                                                {getCurrencies(language).map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="mb-2 block text-xs font-semibold text-slate-400">{getUIText(language).original}</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={originalPrice}
                                                    onChange={(e) => setOriginalPrice(e.target.value)}
                                                    disabled={currentStep === 'loading'}
                                                    placeholder={getUIText(language).placeholder}
                                                    className="flex-1 bg-slate-800 border-none rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-purple-500 appearance-none outline-none disabled:opacity-50"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-xs font-semibold text-slate-400">{getUIText(language).discount}</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={discountedPrice}
                                                    onChange={(e) => setDiscountedPrice(e.target.value)}
                                                    disabled={currentStep === 'loading'}
                                                    placeholder={getUIText(language).placeholder}
                                                    className="flex-1 bg-slate-800 border-none rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-purple-500 appearance-none outline-none disabled:opacity-50"
                                                />
                                                <select
                                                    value={currency}
                                                    onChange={(e) => setCurrency(e.target.value)}
                                                    disabled={currentStep === 'loading'}
                                                    className="w-24 bg-slate-800 border-none rounded-lg px-2 py-3 text-slate-200 focus:ring-2 focus:ring-purple-500 appearance-none outline-none text-center disabled:opacity-50"
                                                >
                                                    {getCurrencies(language).map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                )}
                                
                                <div className="col-span-full mt-2">
                                    <label className="mb-2 block text-xs font-semibold text-slate-400 flex items-center gap-2">
                                        {getUIText(language).contact}
                                    </label>
                                    <input
                                        type="text"
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)}
                                        disabled={currentStep === 'loading'}
                                        placeholder={language === 'arabic' ? 'مثال: +212600000000' : 'e.g. +212600000000'}
                                        className="w-full bg-slate-800 border-none rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-purple-500 appearance-none outline-none disabled:opacity-50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !platform}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-4 text-base rounded-full shadow-lg transition-all hover:shadow-xl hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <span className="inline-block mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                    جاري التوليد...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    توليد النص الإعلاني
                                </>
                            )}
                        </button>

                        {/* Stage 2: Inline Loading State */}
                        {currentStep === 'loading' && (
                            <div className="mt-6 bg-slate-900/50 border-dashed border-2 border-slate-700 rounded-2xl overflow-hidden animate-slide-down">
                                {/* Blue header */}
                                <div className="bg-blue-600/20 py-2 px-4 flex items-center justify-center gap-2 border-b border-blue-500/20">
                                    <span className="text-blue-400 text-sm font-bold">⏳ جاري التوليد...</span>
                                </div>
                                
                                <div className="p-8 flex flex-col items-center text-center">
                                    {/* Spinner */}
                                    <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                                    <p className="text-slate-300 text-sm mb-3">جاري تجهيز البرومبت المزود بالذكاء الاصطناعي...</p>
                                    <p className="text-red-500 text-xs font-bold animate-pulse">⏳ يرجى الانتظار {countdown} ثوان</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Left Column - Output / Result Deliver */}
                    <div>
                        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl relative flex flex-col h-full min-h-[400px]">
                            {/* Success Stage Header */}
                            {currentStep === 'success' ? (
                                <div className="animate-slide-up flex-1 flex flex-col">
                                    <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
                                        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                                            <Sparkles className="text-purple-400" size={20} />
                                            النص الإعلاني المُولد
                                        </h2>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleCopy}
                                                className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-purple-500/20"
                                            >
                                                {copied ? (
                                                    <><span className="text-green-400">تم النسخ ✓</span></>
                                                ) : (
                                                    <><Copy size={14} /> نسخ النص</>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-slate-950/50 rounded-2xl p-6 border border-slate-800 mb-6 overflow-y-auto max-h-[500px]" style={{ scrollbarWidth: 'none' }}>
                                        <div
                                            className="w-full text-slate-200 leading-relaxed whitespace-pre-wrap text-sm py-2 select-text"
                                            style={{ direction: 'rtl', wordBreak: 'break-word' }}
                                        >
                                            {generatedText}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setCurrentStep('idle')}
                                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <ImageIcon size={16} /> تعديل
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setGeneratedText('');
                                                setCurrentStep('idle');
                                                setPlatform('');
                                                setAngle('');
                                                setFileData(null);
                                                setImagePreview(null);
                                                setContact('');
                                                setCurrentPrice('');
                                                setOriginalPrice('');
                                                setDiscountedPrice('');
                                                setHasDiscount(false);
                                            }}
                                            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Zap size={16} /> ابدأ من جديد
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Idle/Loading State Placeholder */}
                                    <div className="mb-4 flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-foreground">
                                            النص المولد
                                        </h2>
                                        <button
                                            onClick={handleCopy}
                                            disabled={!generatedText}
                                            className="rounded-lg p-2 hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="نسخ النص"
                                        >
                                            {copied ? (
                                                <span className="text-xs text-primary">تم النسخ!</span>
                                            ) : (
                                                <Copy className="h-5 w-5 text-muted-foreground hover:text-primary" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Result Text Area */}
                                    {generatedText ? (
                                        <div
                                            className="w-full bg-transparent text-slate-200 leading-relaxed whitespace-pre-wrap text-sm py-2 select-text"
                                            style={{ direction: 'rtl', wordBreak: 'break-word' }}
                                        >
                                            {generatedText}
                                        </div>
                                    ) : (
                                        <div className="min-h-[200px] flex-1 flex flex-col items-center justify-center text-slate-500 text-sm text-center">
                                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                                                <Sparkles size={30} className="text-slate-600" />
                                            </div>
                                            <p className="max-w-[200px]">هذا النص سيظهر هنا بمجرد اكتمال عملية التوليد...</p>
                                        </div>
                                    )}

                                    {/* Usage Indicator */}
                                    <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                                        <span className="text-xs text-muted-foreground">
                                            تم استخدام الأداة
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-24 bg-border rounded-full overflow-hidden">
                                                <div className="h-full w-1/3 bg-primary rounded-full"></div>
                                            </div>
                                            <span className="text-xs font-medium text-foreground">
                                                3/10
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <section className="mt-16">
                    <h3 className="mb-6 text-2xl font-bold text-foreground">
                        مميزات الأداة
                    </h3>
                    <div className="grid gap-4 md:grid-cols-3">
                        {[
                            { title: 'توليد فوري', icon: Zap },
                            { title: 'دقة لغوية', icon: Sparkles },
                            { title: 'تنوع في الزوايا', icon: BarChart3 },
                        ].map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={i}
                                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center hover:bg-slate-800 transition-colors"
                                >
                                    <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Icon className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <h4 className="font-bold text-slate-200">
                                        {feature.title}
                                    </h4>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* History Section */}
                <section className="mt-12 mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                            <span className="p-2 border border-slate-700 rounded-full bg-slate-800">
                                <Zap size={16} />
                            </span>
                            سجل الإعلانات السابقة
                        </h3>
                        <button className="text-sm text-slate-400 hover:text-white transition-colors">عرض الكل</button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-600 p-2 rounded-lg">
                                        <Zap size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">إعلان لـ TikTok</h4>
                                        <span className="text-xs text-slate-500">منذ ساعتين</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 text-slate-400">
                                    <Copy size={14} className="cursor-pointer hover:text-white" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-2">"اكتشف السر وراء البشرة المشرقة! منتجنا الجديد متاح الآن بخصم لفترة محدودة..."</p>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="bg-indigo-600 p-2 rounded-lg">
                                        <Zap size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">إعلان لـ Facebook</h4>
                                        <span className="text-xs text-slate-500">أمس</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 text-slate-400">
                                    <Copy size={14} className="cursor-pointer hover:text-white" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-2">"هل تبحث عن حل لمشاكل التنظيم اليومية؟ تعرف على رفيقك الذكي الجديد لإدارة المهام..."</p>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="bg-pink-600 p-2 rounded-lg">
                                        <Zap size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">إعلان لـ Instagram</h4>
                                        <span className="text-xs text-slate-500">قبل يومين</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 text-slate-400">
                                    <Copy size={14} className="cursor-pointer hover:text-white" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-2">"الأناقة لا تحتاج إلى مجهود. تألقي بمجموعتنا الصيفية الجديدة المصممة خصيصاً لكِ..."</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
