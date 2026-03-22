'use client';

import { useState } from 'react';
import { Copy, CheckCheck, Sparkles, Type, Eraser, AlignRight } from 'lucide-react';
import { generateContent } from './aiService';


const TASHKEEL_MODES = [
    {
        id: 'full',
        label: 'تشكيل كامل',
        icon: Type,
        description: 'تشكيل جميع حروف الكلمة',
        prompt: 'قم بتشكيل النص التالي تشكيلاً كاملاً دقيقاً لكل حرف في كل كلمة حسب قواعد النحو والصرف العربي'
    },
    {
        id: 'endings',
        label: 'أواخر الكلمات فقط',
        icon: AlignRight,
        description: 'تشكيل الحرف الأخير من كل كلمة',
        prompt: 'قم بتشكيل أواخر الكلمات فقط (الحركة الإعرابية على الحرف الأخير من كل كلمة) في النص التالي، مع ترك باقي الحروف بدون تشكيل'
    },
    {
        id: 'remove',
        label: 'إزالة التشكيل',
        icon: Eraser,
        description: 'حذف كل علامات التشكيل',
        prompt: 'قم بإزالة جميع علامات التشكيل (الفتحة والضمة والكسرة والسكون والشدة والتنوين وغيرها) من النص التالي'
    },
];

export default function ArabicTashkeel({ onTaskComplete }) {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [selectedMode, setSelectedMode] = useState('full');
    const [isProcessing, setIsProcessing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [charCount, setCharCount] = useState(0);

    const handleInputChange = (e) => {
        setInputText(e.target.value);
        setCharCount(e.target.value.length);
    };

    const handleTashkeel = async () => {
        if (!inputText.trim()) {
            setErrorMsg('الرجاء إدخال نص عربي أولاً.');
            return;
        }


        setErrorMsg('');
        setIsProcessing(true);
        setOutputText('');

        const mode = TASHKEEL_MODES.find(m => m.id === selectedMode);

        const systemPrompt = `أنت خبير في النحو والصرف العربي ومتخصص في علم التشكيل.
قم بتنفيذ الأمر التالي على النص المُدخل: ${mode.prompt}.

قواعد صارمة للإخراج:
- أخرج النص النهائي فقط دون أي مقدمات أو شروحات أو تعليقات.
- حافظ على تنسيق النص الأصلي (الفقرات، الأسطر، علامات الترقيم).
- لا تُغيّر أي كلمة أو تُضيف أو تحذف، فقط طبّق التشكيل المطلوب.

النص المُدخل:
${inputText}`;

        try {
            const finalContent = await generateContent({
                systemPrompt: 'أنت خبير في اللغة العربية والتشكيل. لا تضف أي نص توضيحي، فقط النص المشكّل.',
                userPrompt: systemPrompt
            });
            setOutputText(finalContent);
            if (onTaskComplete) onTaskComplete();
        } catch (error) {
            setErrorMsg(`خطأ في الاتصال: ${error.message || 'حاول مرة أخرى لاحقاً.'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCopy = () => {
        if (!outputText) return;
        navigator.clipboard.writeText(outputText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleClear = () => {
        setInputText('');
        setOutputText('');
        setErrorMsg('');
        setCharCount(0);
    };

    return (
        <div
            className="h-full overflow-y-auto text-slate-100"
            dir="rtl"
            style={{ scrollbarWidth: 'none' }}
        >
            <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 space-y-10">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="text-right">
                        <div className="inline-flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold px-4 py-2 rounded-full mb-4">
                            <Sparkles size={14} />
                            مدعوم بالذكاء الاصطناعي
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
                            المُشكِّل العربي
                        </h1>
                        <p className="text-slate-400 font-medium text-base max-w-md">
                            تشكيل النصوص العربية بدقة باستخدام الذكاء الاصطناعي وقواعد النحو والصرف
                        </p>
                    </div>

                    <button
                        onClick={handleClear}
                        className="text-sm text-slate-500 hover:text-slate-300 border border-slate-700/50 hover:border-slate-600 px-5 py-2.5 rounded-xl transition-all font-medium"
                    >
                        مسح الكل
                    </button>
                </div>

                {/* ── Mode Selector ── */}
                <div className="bg-[#121826] border border-slate-800/80 rounded-[2rem] p-6 shadow-2xl shadow-black/30">
                    <p className="text-xs font-bold text-slate-500 mb-5 tracking-widest uppercase">
                        اختر نوع التشكيل
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {TASHKEEL_MODES.map(mode => {
                            const Icon = mode.icon;
                            const isActive = selectedMode === mode.id;
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => setSelectedMode(mode.id)}
                                    className={`relative p-5 rounded-2xl border text-right transition-all duration-200 group ${
                                        isActive
                                            ? 'bg-purple-600/15 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                                            : 'bg-slate-900/40 border-slate-700/40 hover:border-slate-600 hover:bg-slate-800/30'
                                    }`}
                                >
                                    {isActive && (
                                        <div className="absolute top-4 left-4 w-2.5 h-2.5 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                                    )}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all ${
                                        isActive ? 'bg-purple-500/20' : 'bg-slate-800/60 group-hover:bg-slate-700/40'
                                    }`}>
                                        <Icon size={22} className={isActive ? 'text-purple-300' : 'text-slate-400'} />
                                    </div>
                                    <h3 className={`font-extrabold text-sm mb-1 ${isActive ? 'text-purple-200' : 'text-slate-200'}`}>
                                        {mode.label}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {mode.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Error Message ── */}
                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-5 py-3.5 rounded-2xl text-sm font-medium">
                        ⚠️ {errorMsg}
                    </div>
                )}

                {/* ── Dual Text Areas ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Input */}
                    <div className="bg-[#121826] border border-slate-800/80 rounded-[2rem] p-6 shadow-xl flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-mono bg-slate-900/50 px-3 py-1 rounded-xl border border-slate-800">
                                {charCount} حرف
                            </span>
                            <h2 className="text-sm font-bold text-slate-300">النص الأصلي</h2>
                        </div>

                        <textarea
                            value={inputText}
                            onChange={handleInputChange}
                            placeholder="اكتب أو انسخ النص العربي هنا..."
                            className="w-full min-h-[280px] bg-transparent text-slate-200 placeholder:text-slate-600 text-base leading-[2.2] resize-none outline-none border-none font-medium focus:ring-0"
                            style={{ direction: 'rtl', fontFamily: 'inherit' }}
                        />

                        {/* Action Button */}
                        <button
                            onClick={handleTashkeel}
                            disabled={isProcessing || !inputText.trim()}
                            className="w-full py-4 bg-gradient-to-l from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-2xl font-extrabold text-white flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_4px_24px_rgba(168,85,247,0.25)] hover:shadow-[0_6px_32px_rgba(168,85,247,0.35)] disabled:shadow-none text-sm tracking-wide"
                        >
                            {isProcessing ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    جاري التشكيل...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    بدء التشكيل
                                </>
                            )}
                        </button>
                    </div>

                    {/* Output */}
                    <div className="bg-[#121826] border border-slate-800/80 rounded-[2rem] p-6 shadow-xl flex flex-col gap-4 relative">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleCopy}
                                disabled={!outputText}
                                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                    copied
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                        : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                                }`}
                            >
                                {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
                                {copied ? 'تم النسخ!' : 'نسخ'}
                            </button>
                            <h2 className="text-sm font-bold text-slate-300">النص المُشكَّل</h2>
                        </div>

                        {/* Output Content */}
                        <div className="flex-1 min-h-[280px]">
                            {isProcessing ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4">
                                    <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
                                    <p className="text-slate-500 text-sm font-medium">يقوم الذكاء الاصطناعي بتشكيل النص...</p>
                                </div>
                            ) : outputText ? (
                                <div
                                    className="text-slate-200 text-base leading-[2.8] whitespace-pre-wrap select-text font-medium"
                                    style={{ direction: 'rtl', wordBreak: 'break-word' }}
                                >
                                    {outputText}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-center mb-2">
                                        <Type size={28} className="text-slate-600" />
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">
                                        النص المُشكَّل سيظهر هنا...
                                    </p>
                                    <p className="text-slate-600 text-xs">
                                        أدخل النص واضغط 'بدء التشكيل'
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Subtle glow when output ready */}
                        {outputText && (
                            <div className="absolute inset-0 rounded-[2rem] pointer-events-none border border-purple-500/10 shadow-[inset_0_0_40px_rgba(168,85,247,0.04)]" />
                        )}
                    </div>
                </div>

                {/* ── Tips Section ── */}
                <div className="bg-[#121826] border border-slate-800/80 rounded-[2rem] p-6 shadow-xl">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 text-right">💡 نصائح للحصول على أفضل نتائج</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
                        {[
                            { tip: 'للتشكيل الأدقّ، استخدم نصوصاً فصحى واضحة بعيداً عن العامية.' },
                            { tip: 'يمكنك تشكيل نصوص طويلة كاملة مثل المقالات والخطب.' },
                            { tip: 'خيار "إزالة التشكيل" مفيد عند نسخ النصوص للاستخدام في برامج أخرى.' },
                        ].map((item, i) => (
                            <div key={i} className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                                <p className="text-slate-400 text-xs leading-relaxed font-medium">{item.tip}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
