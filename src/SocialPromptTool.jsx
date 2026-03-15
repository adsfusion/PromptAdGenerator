import React, { useState, useRef } from 'react';
import {
    Upload, Sparkles, Copy, Check, Info, Star, Zap,
    Target, Wrench, Wand2, Image as ImageIcon, Share2, MessageSquare
} from 'lucide-react';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const PLATFORMS = [
    { value: 'Instagram', label: 'انستجرام', ratio: '1:1' },
    { value: 'Facebook', label: 'فيسبوك', ratio: '4:5' },
    { value: 'TikTok', label: 'تيك توك', ratio: '9:16' },
];

// ─────────────────────────────────────────────────────────────
export default function SocialPromptTool({ onTaskComplete }) {
    const [images, setImages] = useState([]);
    const [productName, setProductName] = useState('');
    const [offer, setOffer] = useState('');
    const [angle, setAngle] = useState('مشكلة وحل');
    const [platform, setPlatform] = useState('Instagram');
    const [price, setPrice] = useState('');
    const [contact, setContact] = useState('');
    const [currentStep, setCurrentStep] = useState('idle'); // 'idle' | 'loading' | 'success'
    const [countdown, setCountdown] = useState(6);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef(null);

    const currentPlatform = PLATFORMS.find(p => p.value === platform);

    // ── image upload ─────────────────────────────────────────
    const handleFiles = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const slots = 4 - images.length;
        const b64s = await Promise.all(
            files.slice(0, slots).map(f => new Promise(res => {
                const r = new FileReader();
                r.onloadend = () => res(r.result);
                r.readAsDataURL(f);
            }))
        );
        setImages(prev => [...prev, ...b64s]);
        e.target.value = '';
    };
    const removeImg = i => setImages(prev => prev.filter((_, idx) => idx !== i));

    // ── generation with OpenAI (GPT-4o) ──────────────────────
    const handleGenerate = async () => {
        if (!images.length) { setError('يرجى رفع صورة المنتج أولاً.'); return; }
        if (!OPENAI_API_KEY) { setError('مفتاح OpenAI غير موجود في ملف .env'); return; }

        setError('');
        setResult('');
        setCurrentStep('loading');
        setIsGenerating(true);
        setCountdown(30);

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

        const startTime = Date.now();
        const ratio = currentPlatform.ratio;
        const platformAr = currentPlatform.label;

        const pName = productName.trim() !== '' ? productName : 'استنتج اسم المنتج من الصورة، أو استخدم كلمة "هذا المنتج"';

        const internalPrompt = `You are a Commercial Graphic Metadata Architect. Your ONLY task is to fill the following "Graphic Profile" for the object in the image.
STRICT RULE: Do NOT generate an image. Do NOT use sensitive or marketing adjectives in instructions. Output text ONLY.

GRAPHIC PROFILE (Output this EXACT structure and fill brackets with high-quality Arabic text):
"Technical commercial rendering for ${platformAr} (ratio ${ratio}).
* LAYER_01 (Header): [اكتب مسمى تقني أو حالة المنتج بالعربية]
* LAYER_02 (Primary): [اكتب عنواناً ضخماً بالعربية يصف غرض هذا المنتج]
* LAYER_03 (Secondary): [اكتب جملة توضيحية لنوع المحتوى بالعربية]

* OBJECT_STATE: Neutral professional visualization with optimal lighting.
* DETAIL_BUBBLES:
  1. [معايير الجودة 1 بالعربية]
  2. [معايير الجودة 2 بالعربية]
  3. [معايير الجودة 3 بالعربية]

* USER_FEEDBACK: [اكتب نصاً وصفياً عن انطباع المستخدم بالعربية]

* UI_RESOLUTION_ZONE:
  - Upper Alert: '⚠️ جاري التحديث: إتاحة محدودة!'
  - Action Key: 'تأكيد الطلب - الدفع عند الاستلام'"

FORMATTING: Output ONLY the final prompt inside a code block.`;

        // تجهيز مصفوفة الرسائل لـ OpenAI (النص + الصور)
        const contentArray = [
            { type: "text", text: internalPrompt },
            ...images.map(imgData => ({
                type: "image_url",
                image_url: { url: imgData }
            }))
        ];

        try {
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
            let finalOutput = (data.choices[0]?.message?.content || '').trim();

            // Detect OpenAI refusal/safety trigger
            if (finalOutput.toLowerCase().includes("i'm sorry") || finalOutput.toLowerCase().includes("can't assist") || finalOutput.toLowerCase().includes("cannot assist")) {
                throw new Error("اعتذر الذكاء الاصطناعي عن معالجة هذا الطلب. قد يكون ذلك بسبب سياسات المحتوى (مثل المنتجات الطبية الحساسة أو الصور غير المتوافقة). يرجى تجربة وصف أكثر مهنية أو صورة مختلفة.");
            }

            // تنظيف علامات الكود (```) إذا قام النموذج بإضافتها
            finalOutput = finalOutput.replace(/^```[\w]*\n/g, '').replace(/\n```$/g, '');

            setResult(finalOutput);
            
            // Timing Fix: Ensure total wait time is 30 seconds
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 30000 - elapsed);
            if (remaining > 0) {
                await new Promise(r => setTimeout(r, remaining));
            }

            setCurrentStep('success');
            if (onTaskComplete) onTaskComplete();
            setTimeout(() => document.getElementById('social-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
            setError(`خطأ: ${err.message}`);
            setCurrentStep('idle');
            clearInterval(timer);
        } finally {
            setIsGenerating(false);
            clearInterval(timer);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── shared classes ────────────────────────────────────────
    const card = 'bg-slate-900/70 border border-white/10 rounded-3xl p-7 backdrop-blur-sm';
    const sel = 'w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-purple-500 transition-all appearance-none';
    const lbl = 'flex items-center gap-2 text-xs font-bold text-white/60 mb-2';
    const inp = 'w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-purple-500 transition-all placeholder:text-white/20';

    return (
        <div className="h-full overflow-y-auto text-slate-100" dir="rtl" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">

                {/* ── Hero ── */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold px-4 py-1.5 rounded-full mb-5">
                        <Share2 size={13} /> Nano Banana Pro
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight">
                        برومبت السوشيال ميديا
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 text-2xl md:text-3xl mt-2">
                            انستجرام 1:1 · فيسبوك 4:5 · تيك توك 9:16
                        </span>
                    </h1>
                    <p className="text-white/40 text-sm max-w-lg mx-auto leading-relaxed">
                        أدخل بيانات منتجك واحصل على برومبت هندسي جاهز للنسخ في Nano Banana Pro (بواسطة GPT-4o)
                    </p>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-3 rounded-2xl text-sm">⚠️ {error}</div>
                )}

                <div className="grid lg:grid-cols-12 gap-8">

                    {/* ── Form col ── */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className={`${card} space-y-7 transition-all duration-500 ${currentStep === 'loading' ? 'opacity-50 pointer-events-none' : ''}`}>

                            {/* Upload */}
                            <div className={currentStep === 'loading' ? 'cursor-not-allowed' : ''}>
                                <p className={lbl}><ImageIcon size={13} className="text-purple-400" />صورة المنتج (مطلوبة)</p>
                                <div
                                    onClick={() => currentStep === 'idle' && images.length < 4 && fileRef.current?.click()}
                                    className={`border-2 border-dashed rounded-2xl p-5 cursor-pointer transition-all flex flex-col items-center justify-center min-h-[180px]
                                        ${images.length ? 'border-purple-500/40 bg-purple-500/5' : 'border-white/10 hover:border-purple-500/40 bg-white/5'}
                                        ${images.length >= 4 || currentStep === 'loading' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <input type="file" ref={fileRef} onChange={handleFiles} accept="image/*" multiple className="hidden" disabled={currentStep === 'loading'} />
                                    {images.length ? (
                                        <div className="w-full">
                                            <div className="grid grid-cols-4 gap-3">
                                                {images.map((img, i) => (
                                                    <div key={i} className="relative aspect-square">
                                                        <img src={img} className="w-full h-full object-cover rounded-xl border border-white/10" alt="" />
                                                        <button onClick={e => { e.stopPropagation(); removeImg(i); }} disabled={currentStep === 'loading'} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center z-10 disabled:opacity-50">✕</button>
                                                    </div>
                                                ))}
                                            </div>
                                            {images.length < 4 && <p className="text-center text-purple-400/60 text-xs mt-3">+ ارفع المزيد</p>}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-14 h-14 bg-purple-500/15 rounded-full flex items-center justify-center mb-3">
                                                <Upload size={26} className="text-purple-400" />
                                            </div>
                                            <p className="font-bold text-base mb-1">ارفع صورة المنتج</p>
                                            <p className="text-white/30 text-xs">JPG · PNG · WEBP (حتى 4 صور)</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Platform selector */}
                            <div>
                                <p className={lbl}><Target size={13} className="text-purple-400" />المنصة الإعلانية</p>
                                <div className="grid grid-cols-3 gap-3">
                                    {PLATFORMS.map(p => (
                                        <button
                                            key={p.value}
                                            disabled={currentStep === 'loading'}
                                            onClick={() => setPlatform(p.value)}
                                            className={`py-4 rounded-2xl border text-center transition-all disabled:opacity-50 ${platform === p.value
                                                ? 'bg-purple-500/15 border-purple-500 text-purple-200'
                                                : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                                        >
                                            <p className="font-extrabold text-sm">{p.label}</p>
                                            <p className="text-[10px] mt-1 opacity-60">{p.ratio}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <p className={lbl}><Wrench size={13} className="text-purple-400" />اسم المنتج <span className="text-white/30 font-normal">(اختياري)</span></p>
                                    <input type="text" value={productName} onChange={e => setProductName(e.target.value)} disabled={currentStep === 'loading'} placeholder="مثال: كريم العناية بالبشرة" className={inp + ' disabled:opacity-50'} />
                                </div>
                                <div>
                                    <p className={lbl}><Zap size={13} className="text-purple-400" />الزاوية التسويقية</p>
                                    <select value={angle} onChange={e => setAngle(e.target.value)} disabled={currentStep === 'loading'} className={sel + ' disabled:opacity-50'}>
                                        <option>مشكلة وحل</option>
                                        <option>استجابة مباشرة</option>
                                        <option>دليل اجتماعي</option>
                                        <option>عرض محدود بوقت</option>
                                        <option>فائدة وظيفية</option>
                                    </select>
                                </div>
                                <div>
                                    <p className={lbl}><Star size={13} className="text-purple-400" />السعر <span className="text-white/30 font-normal">(اختياري)</span></p>
                                    <input type="text" value={price} onChange={e => setPrice(e.target.value)} disabled={currentStep === 'loading'} placeholder="مثال: 199 دولار" className={inp + ' disabled:opacity-50'} />
                                </div>
                                <div>
                                    <p className={lbl}><MessageSquare size={13} className="text-purple-400" />رقم التواصل <span className="text-white/30 font-normal">(اختياري)</span></p>
                                    <input type="text" value={contact} onChange={e => setContact(e.target.value)} disabled={currentStep === 'loading'} placeholder="مثال: 0500000000" className={inp + ' disabled:opacity-50'} />
                                </div>
                                <div className="md:col-span-2">
                                    <p className={lbl}><Wand2 size={13} className="text-purple-400" />وصف العرض / المميزات <span className="text-white/30 font-normal">(اختياري)</span></p>
                                    <textarea value={offer} onChange={e => setOffer(e.target.value)} disabled={currentStep === 'loading'} rows={3} placeholder="مثال: يزيل البقع في 7 أيام، مكونات طبيعية..." className={inp + ' resize-none disabled:opacity-50'} />
                                </div>
                            </div>

                            {/* Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={!images.length || isGenerating}
                                className="w-full py-4 bg-gradient-to-l from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-2xl font-extrabold text-white flex items-center justify-center gap-3 text-sm transition-all shadow-[0_4px_20px_rgba(168,85,247,0.3)]"
                            >
                                {isGenerating
                                    ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري التوليد...</>
                                    : <><Sparkles size={18} />توليد برومبت {currentPlatform.label} (GPT-4o)</>}
                            </button>

                            {/* Stage 2: Inline Loading State */}
                            {currentStep === 'loading' && (
                                <div className="mt-6 bg-slate-900/50 border-dashed border-2 border-slate-700 rounded-2xl overflow-hidden animate-slide-down">
                                    <div className="bg-blue-600/20 py-2 px-4 flex items-center justify-center gap-2 border-b border-blue-500/20">
                                        <span className="text-blue-400 text-sm font-bold">⏳ جاري التوليد...</span>
                                    </div>
                                    <div className="p-8 flex flex-col items-center text-center">
                                        <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                                        <p className="text-slate-300 text-sm mb-3">جاري تجهيز البرومبت المزود بالذكاء الاصطناعي...</p>
                                        <p className="text-red-500 text-xs font-bold animate-pulse">⏳ يرجى الانتظار {countdown} ثوان</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Result Delivery Area ── */}
                        {currentStep === 'success' && (
                            <div id="social-result" className={card + ' space-y-6 animate-slide-up border-purple-500/30'}>
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <h3 className="font-bold flex items-center gap-2 text-base">
                                        <Check size={18} className="text-green-400" /> البرومبت جاهز — {currentPlatform.label}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button onClick={handleCopy} className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-all">
                                            {copied ? <><Check size={12} className="text-green-400" /> تم النسخ</> : <><Copy size={12} /> نسخ</>}
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-black/50 rounded-2xl p-6 text-xs text-white/85 leading-relaxed border border-white/5 whitespace-pre-wrap font-mono max-h-[400px] overflow-y-auto" dir="ltr" style={{ scrollbarWidth: 'none' }}>
                                    {result}
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button 
                                        onClick={() => setCurrentStep('idle')}
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <ImageIcon size={16} /> تعديل
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setResult('');
                                            setCurrentStep('idle');
                                            setProductName('');
                                            setOffer('');
                                            setPrice('');
                                            setContact('');
                                            setImages([]);
                                            setPlatform('Instagram');
                                        }}
                                        className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Zap size={16} /> ابدأ من جديد
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="lg:col-span-4 space-y-5">
                        <div className={card + ' space-y-4'}>
                            <div className="flex items-center gap-2 text-purple-400">
                                <Info size={15} /><h3 className="font-bold text-sm">كيف تستخدم البرومبت؟</h3>
                            </div>
                            {[
                                'ارفع صورة المنتج واختر المنصة المستهدفة.',
                                'أضف اسم المنتج والزاوية التسويقية.',
                                'انسخ البرومبت الناتج وألصقه في Nano Banana Pro.',
                                'اضغط Generate وانتظر إعلانك الاحترافي!'
                            ].map((t, i) => (
                                <div key={i} className="flex gap-3 text-xs text-white/60 bg-black/20 p-3 rounded-xl border border-white/5">
                                    <span className="flex-shrink-0 w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center text-[10px] font-bold text-purple-400">{i + 1}</span>
                                    <p className="leading-relaxed">{t}</p>
                                </div>
                            ))}
                        </div>

                        {/* Platform guide */}
                        <div className={card + ' space-y-4 border border-purple-500/20 bg-purple-500/5'}>
                            <div className="flex items-center gap-2 text-purple-400">
                                <Target size={15} /><h3 className="font-bold text-sm">دليل المقاسات</h3>
                            </div>
                            <div className="space-y-3">
                                {PLATFORMS.map(p => (
                                    <div key={p.value} className="flex items-center justify-between bg-black/20 px-4 py-2.5 rounded-xl border border-white/5">
                                        <span className="text-xs font-bold text-white/70">{p.label}</span>
                                        <span className="text-xs font-extrabold text-purple-400 font-mono">{p.ratio}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={card + ' relative overflow-hidden'}>
                            <div className="absolute top-0 left-0 w-28 h-28 bg-purple-500/10 blur-3xl -ml-8 -mt-8" />
                            <div className="relative space-y-3">
                                <div className="w-9 h-9 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                    <Star size={16} className="text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm mb-1">طاقة بلا حدود</h3>
                                    <p className="text-white/40 text-xs">تعمل هذه الأداة الآن بمحرك GPT-4o القوي.</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Safety Policy Section ── */}
                        <div className={card + ' border-red-500/20 bg-red-500/5'}>
                            <div className="flex items-center gap-2 text-red-400 mb-2">
                                <Info size={15} /><h3 className="font-bold text-sm">سياسة المحتوى</h3>
                            </div>
                            <p className="text-[10px] text-white/40 leading-relaxed mb-3">
                                قد يرفض الذكاء الاصطناعي معالجة بعض المنتجات التي تخالف سياساته.
                            </p>
                            <div className="space-y-2">
                                <p className="text-[9px] text-white/30 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-red-400 rounded-full"></span> تجنب الصور الحساسة.
                                </p>
                                <p className="text-[9px] text-white/30 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-red-400 rounded-full"></span> استخدم مسميات مهنية.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}