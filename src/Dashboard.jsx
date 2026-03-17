import {
    Megaphone, Share2, FileText, Type, ImageMinus,
    Zap, Activity, Sparkles, ArrowUpRight, Star, Target
} from 'lucide-react';

export default function Dashboard({ setActiveTab, tasksUsed }) {
    // ── Shared Classes ──
    const card = 'bg-slate-900/70 border border-white/10 rounded-3xl p-6 backdrop-blur-sm transition-all';

    // ── Tools Data ──
    const tools = [
        {
            id: 'social-prompt',
            title: 'برومبت السوشيال ميديا',
            desc: 'توليد برومبت هندسي دقيق لإعلانات السوشيال ميديا بواسطة محرك GPT-4o.',
            icon: Share2,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'hover:border-purple-500/50'
        },
        {
            id: 'landing-prompt',
            title: 'برومبت صفحة الهبوط',
            desc: 'توليد برومبت لإنفوجرافيك عمودي طويل (9:32) بواسطة محرك GPT-4o.',
            icon: FileText,
            color: 'text-fuchsia-400',
            bg: 'bg-fuchsia-500/10',
            border: 'hover:border-fuchsia-500/50'
        },
        {
            id: 'prompt-generator',
            title: 'مولد الإعلانات',
            desc: 'كتابة نصوص إعلانية (Copywriting) احترافية بخوارزميات التسويق.',
            icon: Megaphone,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'hover:border-blue-500/50'
        },
        {
            id: 'marketing-hook',
            title: 'مولد الخطافات',
            desc: 'ابتكار عناوين وخطافات تسويقية (Hooks) تخطف الأنظار وتزيد التفاعل.',
            icon: Zap,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
            border: 'hover:border-yellow-500/50'
        },
        {
            id: 'tashkeel',
            title: 'المُشكل العربي',
            desc: 'تشكيل النصوص العربية تلقائياً بدقة عالية مع الحفاظ على المعنى.',
            icon: Type,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'hover:border-emerald-500/50'
        },
        {
            id: 'image-compressor',
            title: 'ضاغط الصور',
            desc: 'ضغط وتحسين حجم الصور لرفع سرعة موقعك بدون فقدان الجودة.',
            icon: ImageMinus,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            border: 'hover:border-orange-500/50'
        }
    ];

    return (
        <div className="h-full overflow-y-auto text-slate-100" dir="rtl" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-10">

                {/* ── Header Section ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black mb-2">
                            مرحباً بك في <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">منصة الأدوات</span> 👋
                        </h1>
                        <p className="text-white/50 text-sm">مساحة عملك الذكية لإنشاء محتوى إعلاني وتصاميم احترافية بضغطة زر.</p>
                    </div>
                    <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
                        <Sparkles size={16} className="text-purple-400" />
                        ترقية إلى البريميوم
                    </button>
                </div>

                {/* ── Tools Grid ── */}
                <div>
                    <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                        <Target size={22} className="text-purple-400" /> الوصول السريع للأدوات
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tools.map((tool) => (
                            <div
                                key={tool.id}
                                onClick={() => setActiveTab(tool.id)}
                                className={`${card} ${tool.border} cursor-pointer group flex flex-col h-full hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 border-white/5 bg-slate-900/40`}
                            >
                                <div className="flex justify-between items-start mb-5">
                                    <div className={`w-14 h-14 rounded-2xl ${tool.bg} flex items-center justify-center ${tool.color} group-hover:scale-110 transition-transform shadow-lg`}>
                                        <tool.icon size={26} />
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <ArrowUpRight size={18} className="text-white/60" />
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-white/90 group-hover:text-white transition-colors">{tool.title}</h3>
                                <p className="text-white/40 text-sm leading-relaxed flex-grow">{tool.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Stats Overview ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <div className={`${card} flex items-center gap-6 bg-slate-900/30 border-white/5 hover:border-blue-500/30 transition-colors`}>
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/5">
                            <Zap size={28} />
                        </div>
                        <div>
                            <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider mb-1">الكلمات المولدة</p>
                            <h3 className="text-3xl font-black text-white/90">12,450</h3>
                        </div>
                    </div>
                    <div className={`${card} flex items-center gap-6 bg-slate-900/30 border-white/5 hover:border-purple-500/30 transition-colors`}>
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/5">
                            <Activity size={28} />
                        </div>
                        <div>
                            <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider mb-1">البرومبتات المستخرجة</p>
                            <h3 className="text-3xl font-black text-white/90">{84 + tasksUsed}</h3>
                        </div>
                    </div>
                    <div className={`${card} flex items-center gap-6 relative overflow-hidden bg-slate-900/30 border-white/5 hover:border-fuchsia-500/30 transition-colors`}>
                        <div className="absolute left-0 top-0 w-32 h-32 bg-fuchsia-500/10 blur-3xl -ml-12 -mt-12" />
                        <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400 relative z-10 shadow-lg shadow-fuchsia-500/5">
                            <Star size={28} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider mb-1">الباقة الحالية</p>
                            <h3 className="text-3xl font-black text-white/90">المجانية</h3>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
