import React, { useState } from 'react';
import {
    Sparkles, Copy, Check, Info, Star, Zap,
    Target, Megaphone, Lightbulb, MessageSquare
} from 'lucide-react';
import { generateContent } from './aiService';


export default function MarketingHookTool({ onTaskComplete }) {
    const [productName, setProductName] = useState('');
    const [audience, setAudience] = useState('');
    const [benefit, setBenefit] = useState('');
    const [tone, setTone] = useState('حماسي');
    const [currentStep, setCurrentStep] = useState('idle'); // 'idle' | 'loading' | 'success'
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!productName.trim()) { setError('يرجى إدخال اسم المنتج.'); return; }

        setError('');
        setResult('');
        setCurrentStep('loading');
        setIsGenerating(true);

        const internalPrompt = `You are a World-Class Direct Response Copywriter specialized in E-commerce and Dropshipping. Your task is to generate 5 high-converting marketing hooks/headlines for the following product.

PRODUCT: ${productName}
AUDIENCE: ${audience || 'General'}
CORE BENEFIT: ${benefit || 'High Quality'}
TONE: ${tone}

STRICT COPYWRITING RULES:
1. STRUCTURE: Use the PAS (Problem, Agitation, Solution) framework. Start by identifying the customer's pain point, escalate it, then present the product as the ultimate solution.
2. TRANSFORMATION: Sell the outcome and the emotional shift in the customer's life, not just technical features.
3. LANGUAGE RULES:
   - If Arabic: Use "Simplified White Fusha" (الفصحى البيضاء المبسطة). It must be professional, elegant, and universally understood in the Gulf and Arab world. AVOID local dialects and corporate clichés (e.g., "carefully selected").
   - If English: Use a punchy, persuasive style. Focus on benefits over features.
   - If French/Spanish: Follow the specific cultural tones (Direct/Attractive for French, Emotional/Direct for Spanish).
4. FORMATTING: Use professional emojis sparingly. Use line breaks for mobile readability.
5. URGENCY: Include elements of scarcity or urgency where appropriate.

OUTPUT REQUIREMENTS:
- Generate exactly 5 hooks.
- Each hook must be a complete mini-copy following the rules above.
- Output ONLY the 5 hooks in a numbered list. No greetings or meta-talk.

Example Output Structure:
1. [Hook 1 with Emojis and PAS flow]
2. [Hook 2 with Emojis and PAS flow]
...`;

        try {
            const finalOutput = await generateContent({
                systemPrompt: 'You are an expert World-Class Direct Response Copywriter.',
                userPrompt: internalPrompt
            });

            setResult(finalOutput);
            setCurrentStep('success');
            if (onTaskComplete) onTaskComplete();
            setTimeout(() => document.getElementById('hook-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
            setError(`خطأ: ${err.message}`);
            setCurrentStep('idle');
        } finally {
            setIsGenerating(false);
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
                        <Zap size={13} /> أداة سريعة وموفرة للتوكنز
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight">
                        مولد الخطافات التسويقية
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 text-2xl md:text-3xl mt-2">
                            Hooks & Headlines AI
                        </span>
                    </h1>
                    <p className="text-white/40 text-sm max-w-lg mx-auto leading-relaxed">
                        اصنع عناوين تخطف الأنظار لإعلاناتك ومنشوراتك في ثوانٍ معدودة.
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

                            {/* Fields */}
                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <p className={lbl}><Megaphone size={13} className="text-purple-400" />اسم المنتج أو الخدمة</p>
                                    <input type="text" value={productName} onChange={e => setProductName(e.target.value)} disabled={currentStep === 'loading'} placeholder="مثال: دورة احتراف التصوير بالموبايل" className={inp + ' disabled:opacity-50'} />
                                </div>
                                <div>
                                    <p className={lbl}><Target size={13} className="text-purple-400" />الجمهور المستهدف</p>
                                    <input type="text" value={audience} onChange={e => setAudience(e.target.value)} disabled={currentStep === 'loading'} placeholder="مثال: أصحاب المشاريع الصغيرة" className={inp + ' disabled:opacity-50'} />
                                </div>
                                <div>
                                    <p className={lbl}><Zap size={13} className="text-purple-400" />النبرة (Tone)</p>
                                    <select value={tone} onChange={e => setTone(e.target.value)} disabled={currentStep === 'loading'} className={sel + ' disabled:opacity-50'}>
                                        <option>حماسي</option>
                                        <option>رسمي</option>
                                        <option>فكاهي</option>
                                        <option>عاجل (Urgent)</option>
                                        <option>درامي</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <p className={lbl}><Lightbulb size={13} className="text-purple-400" />الميزة الأساسية أو العرض <span className="text-white/30 font-normal">(اختياري)</span></p>
                                    <textarea value={benefit} onChange={e => setBenefit(e.target.value)} disabled={currentStep === 'loading'} rows={3} placeholder="مثال: تعلم في 3 أيام فقط، ضمان استرجاع أموال..." className={inp + ' resize-none disabled:opacity-50'} />
                                </div>
                            </div>

                            {/* Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full py-4 bg-gradient-to-l from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-2xl font-extrabold text-white flex items-center justify-center gap-3 text-sm transition-all shadow-[0_4px_20px_rgba(168,85,247,0.3)]"
                            >
                                {isGenerating
                                    ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري التوليد...</>
                                    : <><Sparkles size={18} />توليد 5 خطافات إبداعية</>}
                            </button>

                            {/* Stage 2: Inline Loading State */}
                            {currentStep === 'loading' && (
                                <div className="mt-6 bg-slate-900/50 border-dashed border-2 border-slate-700 rounded-2xl overflow-hidden animate-slide-down">
                                    <div className="p-8 flex flex-col items-center text-center">
                                        <div className="w-12 h-12 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                                        <p className="text-slate-300 text-sm">جاري ابتكار عناوين لا تُقاوم...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Result Delivery Area ── */}
                        {currentStep === 'success' && (
                            <div id="hook-result" className={card + ' space-y-6 animate-slide-up border-purple-500/30'}>
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <h3 className="font-bold flex items-center gap-2 text-base">
                                        <Check size={18} className="text-green-400" /> الخطافات جاهزة للاستخدام
                                    </h3>
                                    <div className="flex gap-2">
                                        <button onClick={handleCopy} className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-all">
                                            {copied ? <><Check size={12} className="text-green-400" /> تم النسخ</> : <><Copy size={12} /> نسخ الكل</>}
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-black/50 rounded-2xl p-6 text-sm text-white/85 leading-relaxed border border-white/5 whitespace-pre-wrap max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                                    {result}
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button 
                                        onClick={() => {
                                            setResult('');
                                            setCurrentStep('idle');
                                            setProductName('');
                                            setAudience('');
                                            setBenefit('');
                                        }}
                                        className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Zap size={16} /> تجربة منتج آخر
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="lg:col-span-4 space-y-5">
                        <div className={card + ' space-y-4'}>
                            <div className="flex items-center gap-2 text-purple-400">
                                <Info size={15} /><h3 className="font-bold text-sm">لماذا الخطافات (Hooks)؟</h3>
                            </div>
                            {[
                                'تجذب انتباه العميل في أول ثانيتين.',
                                'تزيد من نسبة النقر على إعلاناتك (CTR).',
                                'تخلق فضولاً يدفع القارئ لإكمال المحتوى.',
                                'تميز منتجك عن المنافسين بعبارات قوية.'
                            ].map((t, i) => (
                                <div key={i} className="flex gap-3 text-xs text-white/60 bg-black/20 p-3 rounded-xl border border-white/5">
                                    <span className="flex-shrink-0 w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center text-[10px] font-bold text-purple-400">{i + 1}</span>
                                    <p className="leading-relaxed">{t}</p>
                                </div>
                            ))}
                        </div>

                        <div className={card + ' space-y-4'}>
                            <div className="flex items-center gap-2 text-purple-400">
                                <MessageSquare size={15} /><h3 className="font-bold text-sm">نصيحة للمحترفين</h3>
                            </div>
                            <p className="text-xs text-white/50 leading-relaxed bg-white/5 p-4 rounded-xl">
                                جرب استخدام نبرات (Tones) مختلفة لنفس المنتج لترى أيها يتفاعل معه جمهورك بشكل أكبر. الخطافات العاطفية غالباً ما تحقق نتائج مذهلة!
                            </p>
                        </div>

                        <div className={card + ' relative overflow-hidden'}>
                            <div className="absolute top-0 left-0 w-28 h-28 bg-purple-500/10 blur-3xl -ml-8 -mt-8" />
                            <div className="relative space-y-3">
                                <div className="w-9 h-9 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                    <Star size={16} className="text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm mb-1">دقة عالية واستهلاك أقل</h3>
                                    <p className="text-white/40 text-xs">مصمم خصيصاً ليعطيك أفضل النتائج بأقل تكلفة توكنز ممكنة.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
