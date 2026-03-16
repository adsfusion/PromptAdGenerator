import React, { useState, useRef } from 'react';
import {
    Upload, Sparkles, Copy, Check, Info, Star, Zap,
    Target, Wrench, Wand2, Image as ImageIcon, FileText
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────

export default function LandingPagePromptTool() {
    const [images, setImages] = useState([]);
    const [productName, setProductName] = useState('');
    const [offerDescription, setOfferDescription] = useState('');
    const [price, setPrice] = useState('');
    const [contact, setContact] = useState('');
    const [marketingAngle, setMarketingAngle] = useState('مشكلة وحل');
    const [language, setLanguage] = useState('Arabic');
    const [outputStyle, setOutputStyle] = useState('Realistic');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef(null);

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

    // ── generation ───────────────────────────────────────────
    const handleGenerate = async () => {
        if (!images.length) { setError('يرجى رفع صورة المنتج أولاً.'); return; }
        setError('');
        setResult('');
        setIsGenerating(true);

        const pName = productName.trim() !== '' ? productName : 'استنتج اسم المنتج من الصورة، أو استخدم كلمة "هذا المنتج"';

        const internalPrompt = `Step 1: Objectively describe the visual attributes of the product in the image (packaging shape, colors, and the text written on the label).
Step 2: Based on the visual evidence, act as a world-class AI Prompt Engineer and Arabic Direct Response Copywriter. Analyze the inputs (Product: ${pName}, Offer: ${offerDescription}, Angle: ${marketingAngle}, Price: ${price}, Contact: ${contact}, Target Language: ${language}, Aesthetic Style: ${outputStyle}).

YOUR ONLY TASK IS TO OUTPUT A SINGLE, READY-TO-COPY DESIGN PROMPT FOR THE IMAGE GENERATOR SOFTWARE "NANO BANANA PRO". 

CRITICAL RULE: The final output MUST be in ${language === 'Arabic' ? 'Arabic' : language}. All copywriting, headings, and descriptions inside the design prompt must be in ${language}.

${language === 'Arabic' ? 'Targeting: Local and Gulf markets.' : ''}
${language === 'English' ? 'Targeting: Global markets and dropshipping.' : ''}
${language === 'French' ? 'Targeting: African and European French-speaking markets.' : ''}
${language === 'Spanish' ? 'Targeting: Latin American and Spanish markets.' : ''}

Aesthetic Style to apply: ${outputStyle}.

CRITICAL RULE: "Nano Banana Pro" is the name of the software, NOT the product being sold. NEVER use the words "Nano Banana Pro" inside the Arabic copywriting. DO NOT OUTPUT ANY CONVERSATIONAL TEXT OR SEPARATE COPYWRITING. OUTPUT ONLY THE CODE BLOCK.

Use this EXACT comprehensive template, filling in the bracketed placeholders with highly persuasive Arabic text (massive, bold, 20px+ equivalent) based on the product. Remove all structural labels from the final output. Place Arabic text ONLY inside the quotation marks:

"Act as a world-class Mobile E-commerce Designer. Generate an ultra-long vertical infographic landing page IMAGE (aspect ratio 9:32) for the product in the uploaded image. DO NOT write any HTML, CSS, UI code, or text-based code. Generate a purely visual, single continuous graphical IMAGE. Create one continuous journey with smooth color gradients matching the product vibe and subtle kinetic lines. No hard dividing lines. Feature the product repeatedly.

* Dynamic background with particle effects. Product is prominent. Small Yellow Text: '[اكتب: الأكثر مبيعاً أو جديد]'
* HUGE WHITE BOLD TEXT: '[عنوان رئيسي جذاب وقوي جداً بالعربية يوافق الزاوية]'
* Large Text: '[جملة تشرح الفائدة الكبرى للمنتج بالعربية]'

* Smooth transition to a muted area. Negative color shift and problem icons. Large Bold Red Text: '[سؤال يلمس مشكلة العميل بالعربية]'
* Medium Black Text: '[اشرح المشكلة باختصار بالعربية]'

* Burst of bright light transitioning to a clean background. Product appears triumphantly. HUGE BOLD COLORED TEXT: '[عنوان يقدم المنتج كحل نهائي بالعربية]'
* Large Black Text: '[جملة تؤكد قوة الحل بالعربية]'

* Side-by-side layout with visual contrast. Left side is dark/dull showing the problem. Right side is bright/vibrant showing the happy state. LARGE BOLD COLORED TEXT: '[عنوان جذاب للفرق قبل وبعد بالعربية]'
* Medium Red Text: '❌ قبل: [وصف قصير لمعاناة بالعربية]'
* Medium Green Text: '✅ بعد: [وصف قصير للراحة بالعربية]'

* Extreme close-up on a key feature. Use glowing effects. LARGE BOLD COLORED TEXT: '[عنوان الميزة الأولى بالعربية]'
* Large Black Text: '[شرح قوي للميزة بالعربية]'

* 2-Column Split Layout. Left Column is glowing OUR PRODUCT. Right Column is dull Gray generic competitor. LARGE BOLD COLORED TEXT: '[عنوان يقارن ويثبت التفوق بالعربية]'
* Medium Green Text: '✔️ [ميزة 1 بالعربية]\\n✔️ [ميزة 2 بالعربية]'
* Medium Red Text: '❌ [عيب 1 بالعربية]\\n❌ [عيب 2 بالعربية]'

* Lifestyle visual of the product in use. LARGE BOLD COLORED TEXT: '[عنوان عن فائدة المنتج يومياً بالعربية]'
* Large Black Text: '[كيف يحسن المنتج حياة الزبون بالعربية]'

* 5 large glowing stars ★★★★★ centered. Customer icons. LARGE BOLD BLACK TEXT: 'ثقة عملائنا'
* Medium Black Text: '[مراجعة إيجابية قصيرة بلسان زبون بالعربية]'

* Solid, high-contrast footer. Product prominent next to CTA button.
${price ? `* High Visibility Price Tag: '${price}'` : ''}
${contact ? `* Contact Info / WhatsApp: '${contact}'` : ''}
* Large White Bold Text: '⚠️ الكمية المتاحة محدودة جداً، اطلب الآن!'
* HUGE BLACK TEXT on YELLOW Button: 'اطلب الآن - الدفع عند الاستلام'"`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: internalPrompt },
                                ...images.map(imgData => ({
                                    type: "image_url",
                                    image_url: { url: imgData }
                                }))
                            ]
                        }
                    ],
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || 'خطأ في الاتصال بـ OpenAI');
            }

            const data = await response.json();
            let finalOutput = data.choices[0]?.message?.content || '';
            
            // Refusal detection - log full text to console
            if (finalOutput.length < 200 && (finalOutput.toLowerCase().includes("i'm sorry") || finalOutput.toLowerCase().includes("can't help") || finalOutput.toLowerCase().includes("cannot assist"))) {
                console.warn("OpenAI Refusal Detected:", finalOutput);
                throw new Error("اعتذر الذكاء الاصطناعي عن معالجة هذا الطلب بسبب سياسات المحتوى (غالبًا بسبب كلمات مثل 'Treatment' أو 'Prostate'). يرجى تجربة وصف المنتج بكلمات عامة.");
            }

            // Clean up code blocks if present
            finalOutput = finalOutput.replace(/```[a-zA-Z]*\n?/g, '').replace(/```$/g, '').trim();

            setResult(finalOutput);
            setTimeout(() => document.getElementById('lp-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
            setError(`خطأ: ${err.message || 'تعذّر الاتصال بـ AI.'}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReset = () => {
        setImages([]);
        setProductName('');
        setOfferDescription('');
        setPrice('');
        setContact('');
        setMarketingAngle('مشكلة وحل');
        setLanguage('Arabic');
        setOutputStyle('Realistic');
        setResult('');
        setError('');
        if (fileRef.current) fileRef.current.value = '';
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
                        <FileText size={13} /> Nano Banana Pro
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight">
                        برومبت صفحة الهبوط
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 text-2xl md:text-3xl mt-2">
                            9:32 — إنفوجرافيك عمودي طويل
                        </span>
                    </h1>
                    <p className="text-white/40 text-sm max-w-lg mx-auto leading-relaxed">
                        أدخل بيانات منتجك واحصل على برومبت هندسي جاهز للنسخ في Nano Banana Pro
                    </p>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-3 rounded-2xl text-sm">⚠️ {error}</div>
                )}

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* ── Form col ── */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className={card + ' space-y-7'}>
                            {/* Upload */}
                            <div>
                                <p className={lbl}><ImageIcon size={13} className="text-purple-400" />صورة المنتج (مطلوبة)</p>
                                <div
                                    onClick={() => images.length < 4 && fileRef.current?.click()}
                                    className={`border-2 border-dashed rounded-2xl p-5 cursor-pointer transition-all flex flex-col items-center justify-center min-h-[180px]
                                        ${images.length ? 'border-purple-500/40 bg-purple-500/5' : 'border-white/10 hover:border-purple-500/40 bg-white/5'}
                                        ${images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <input type="file" ref={fileRef} onChange={handleFiles} accept="image/*" multiple className="hidden" />
                                    {images.length ? (
                                        <div className="w-full">
                                            <div className="grid grid-cols-4 gap-3">
                                                {images.map((img, i) => (
                                                    <div key={i} className="relative aspect-square">
                                                        <img src={img} className="w-full h-full object-cover rounded-xl border border-white/10" alt="" />
                                                        <button onClick={e => { e.stopPropagation(); removeImg(i); }} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center z-10">✕</button>                                                    </div>
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

                            {/* Fields */}
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <p className={lbl}><Wrench size={13} className="text-purple-400" />اسم المنتج <span className="text-white/30 font-normal">(اختياري)</span></p>
                                    <input type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="مثال: فرشاة تصفيف الشعر" className={inp} />
                                </div>
                                <div>
                                    <p className={lbl}><Zap size={13} className="text-purple-400" />الزاوية التسويقية</p>
                                    <select value={marketingAngle} onChange={e => setMarketingAngle(e.target.value)} className={sel}>
                                        <option>مشكلة وحل</option>
                                        <option>استجابة مباشرة</option>
                                        <option>دليل اجتماعي</option>
                                        <option>عرض محدود بوقت</option>
                                        <option>فائدة وظيفية</option>
                                    </select>
                                </div>
                                <div>
                                    <p className={lbl}><FileText size={13} className="text-purple-400" />لغة المحتوى</p>
                                    <select value={language} onChange={e => setLanguage(e.target.value)} className={sel}>
                                        <option value="Arabic">العربية (الأسواق المحلية والخليج)</option>
                                        <option value="English">الإنجليزية (الأسواق العالمية والدروبشيبينغ)</option>
                                        <option value="French">الفرنسية (أسواق أفريقيا وأوروبا)</option>
                                        <option value="Spanish">الإسبانية (أمريكا اللاتينية وإسبانيا)</option>
                                    </select>
                                </div>
                                <div>
                                    <p className={lbl}><Wand2 size={13} className="text-purple-400" />نمط الإخراج</p>
                                    <select value={outputStyle} onChange={e => setOutputStyle(e.target.value)} className={sel}>
                                        <option value="Realistic">واقعي (Realistic)</option>
                                        <option value="3D Isometric">ثلاثي الأبعاد (3D Isometric)</option>
                                        <option value="Minimalist">بسيط (Minimalist)</option>
                                        <option value="Vibrant">حيوي (Vibrant)</option>
                                    </select>
                                </div>
                                <div>
                                    <p className={lbl}><Sparkles size={13} className="text-purple-400" />السعر <span className="text-white/30 font-normal">(اختياري)</span></p>
                                    <input type="text" value={price} onChange={e => setPrice(e.target.value)} placeholder="مثال: 299 ريال" className={inp} />
                                </div>
                                <div>
                                    <p className={lbl}><Target size={13} className="text-purple-400" />رقم التواصل <span className="text-white/30 font-normal">(اختياري)</span></p>
                                    <input type="text" value={contact} onChange={e => setContact(e.target.value)} placeholder="مثال: 05XXXXXXXX" className={inp} />
                                </div>
                                <div className="md:col-span-2">
                                    <p className={lbl}><Wand2 size={13} className="text-purple-400" />وصف العرض / المميزات <span className="text-white/30 font-normal">(اختياري)</span></p>
                                    <textarea value={offerDescription} onChange={e => setOfferDescription(e.target.value)} rows={3} placeholder="مثال: يحل مشكلة التجعد، بمكونات طبيعية 100%..." className={inp + ' resize-none'} />
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
                                    : <><Sparkles size={18} />توليد برومبت Nano Banana Pro</>}
                            </button>

                            <button
                                onClick={handleReset}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-white/70 flex items-center justify-center gap-2 text-xs transition-all"
                            >
                                <Zap size={14} /> تجربة منتج آخر
                            </button>
                        </div>

                        {/* ── Result ── */}
                        {result && (
                            <div id="lp-result" className={card + ' space-y-4 animate-in fade-in duration-500'}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold flex items-center gap-2 text-sm">
                                        <Check size={16} className="text-green-400" />البرومبت جاهز للنسخ
                                    </h3>
                                    <button onClick={handleCopy} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all">
                                        {copied ? <><Check size={12} className="text-green-400" />تم النسخ</> : <><Copy size={12} />نسخ</>}
                                    </button>
                                </div>
                                <div className="bg-black/50 rounded-2xl p-5 text-xs text-white/85 leading-relaxed border border-white/5 whitespace-pre-wrap font-mono" dir="ltr">
                                    {result}
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
                                'ارفع صورة المنتج بخلفية بيضاء أو تصوير احترافي.',
                                "أدخل اسم المنتج والزاوية التسويقية المناسبة.",
                                'انسخ البرومبت الناتج وألصقه في Nano Banana Pro.',
                                'اضغط Generate وانتظر صفحة هبوط إنفوجرافيك مذهلة!'
                            ].map((t, i) => (
                                <div key={i} className="flex gap-3 text-xs text-white/60 bg-black/20 p-3 rounded-xl border border-white/5">
                                    <span className="flex-shrink-0 w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center text-[10px] font-bold text-purple-400">{i + 1}</span>
                                    <p className="leading-relaxed">{t}</p>
                                </div>
                            ))}
                        </div>

                        <div className={card + ' space-y-4 border border-purple-500/20 bg-purple-500/5'}>
                            <div className="flex items-center gap-2 text-purple-400">
                                <Target size={15} /><h3 className="font-bold text-sm">نصائح للنتائج الاحترافية</h3>
                            </div>
                            <ul className="space-y-3">
                                {[
                                    'استخدم زاوية "مشكلة وحل" للمنتجات العلاجية.',
                                    '"عرض محدود بوقت" يرفع معدل التحويل بشكل كبير.',
                                    'كلما زادت تفاصيل العرض كلما دقّ البرومبت أكثر.',
                                ].map((t, i) => (
                                    <li key={i} className="flex gap-2 text-xs text-white/50 leading-relaxed">
                                        <span className="flex-shrink-0 w-4 h-4 bg-purple-500/15 rounded-full flex items-center justify-center text-[9px] font-bold text-purple-400 mt-0.5">{i + 1}</span>
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={card + ' relative overflow-hidden'}>
                            <div className="absolute top-0 left-0 w-28 h-28 bg-purple-500/10 blur-3xl -ml-8 -mt-8" />
                            <div className="relative space-y-3">
                                <div className="w-9 h-9 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                    <Star size={16} className="text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm mb-1">خطة البريميوم</h3>
                                    <p className="text-white/40 text-xs">توليدات غير محدودة بدون قيود.</p>
                                </div>
                                <button className="w-full py-2.5 rounded-xl border border-purple-500 text-purple-400 text-xs font-bold hover:bg-purple-500 hover:text-white transition-all">
                                    عرض الأسعار
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}