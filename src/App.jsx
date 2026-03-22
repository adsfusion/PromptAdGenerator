import React, { useState } from 'react';
import PromptAdGenerator from './PromptAdGenerator';
import ImageCompressor from './ImageCompressor';
import ArabicTashkeel from './ArabicTashkeel';
import SocialPromptTool from './SocialPromptTool';
import LandingPagePromptTool from './LandingPagePromptTool';
import ProductLabelPromptTool from './ProductLabelPromptTool';
import MarketingHookTool from './MarketingHookTool';
import Dashboard from './Dashboard';
import { LayoutDashboard, Megaphone, Image as ImageIcon, Type, Share2, FileText, Zap, Tag } from 'lucide-react';

export default function App() {
    // حالة (State) لتحديد أي صفحة نعرضها الآن
    const [activePage, setActivePage] = useState('dashboard');
    const [tasksUsed, setTasksUsed] = useState(0);

    const handleTaskComplete = () => {
        setTasksUsed(prev => prev + 1);
    };

    return (
        <div dir="rtl" className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">

            {/* الشريط الجانبي (Sidebar) */}
            <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col transition-all">
                {/* ترويسة الشريط الجانبي */}
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xl">
                        AI
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">منصة الأدوات</h2>
                        <p className="text-xs text-slate-400">الإصدار الاحترافي</p>
                    </div>
                </div>

                {/* روابط التنقل */}
                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActivePage('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === 'dashboard' ? 'bg-purple-600/20 text-purple-400' : 'hover:bg-slate-800 text-slate-300'}`}
                    >
                        <LayoutDashboard size={20} />
                        <span className="font-medium">لوحة التحكم</span>
                    </button>

                    <button
                        onClick={() => setActivePage('prompt-generator')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === 'prompt-generator' ? 'bg-purple-600/20 text-purple-400' : 'hover:bg-slate-800 text-slate-300'}`}
                    >
                        <Megaphone size={20} />
                        <span className="font-medium">مولد الإعلانات</span>
                    </button>

                    <button
                        onClick={() => setActivePage('marketing-hook')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === 'marketing-hook' ? 'bg-purple-600/20 text-purple-400' : 'hover:bg-slate-800 text-slate-300'}`}
                    >
                        <Zap size={20} />
                        <span className="font-medium">مولد الخطافات</span>
                    </button>

                    <button
                        onClick={() => setActivePage('image-compressor')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === 'image-compressor' ? 'bg-purple-600/20 text-purple-400' : 'hover:bg-slate-800 text-slate-300'}`}
                    >
                        <ImageIcon size={20} />
                        <span className="font-medium">ضاغط الصور</span>
                    </button>

                    <button
                        onClick={() => setActivePage('tashkeel')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === 'tashkeel' ? 'bg-purple-600/20 text-purple-400' : 'hover:bg-slate-800 text-slate-300'}`}
                    >
                        <Type size={20} />
                        <span className="font-medium">المُشكل العربي</span>
                    </button>

                    <div className="pt-2 pb-1">
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2">برومبت الذكاء الاصطناعي</p>
                    </div>

                    <button
                        onClick={() => setActivePage('social-prompt')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === 'social-prompt' ? 'bg-purple-600/20 text-purple-400' : 'hover:bg-slate-800 text-slate-300'}`}
                    >
                        <Share2 size={20} />
                        <span className="font-medium">برومبت السوشيال ميديا</span>
                    </button>

                    <button
                        onClick={() => setActivePage('landing-prompt')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === 'landing-prompt' ? 'bg-purple-600/20 text-purple-400' : 'hover:bg-slate-800 text-slate-300'}`}
                    >
                        <FileText size={20} />
                        <span className="font-medium">برومبت صفحة الهبوط</span>
                    </button>

                    <button
                        onClick={() => setActivePage('label-prompt')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === 'label-prompt' ? 'bg-purple-600/20 text-purple-400' : 'hover:bg-slate-800 text-slate-300'}`}
                    >
                        <Tag size={20} />
                        <span className="font-medium">برومبت ملصقات المنتجات</span>
                    </button>
                </nav>

                {/* القسم السفلي في الشريط الجانبي */}
                <div className="p-4 border-t border-slate-800">
                    <div className="bg-slate-800 rounded-xl p-4 text-center">
                        <p className="text-sm text-slate-300 mb-3">استخدمت ({tasksUsed}) مهام من رصيدك المجاني</p>
                        <button className="w-full bg-slate-700 hover:bg-slate-600 py-2 rounded-lg text-sm font-medium transition-colors">
                            ترقية الخطة
                        </button>
                    </div>
                </div>
            </aside>

            {/* منطقة المحتوى الرئيسية (Main Content Area) */}
            <main className="flex-1 overflow-hidden flex flex-col relative">
                {/* هنا يتم عرض الأداة بناءً على اختيار المستخدم من الشريط الجانبي */}
                {activePage === 'dashboard' && <Dashboard setActiveTab={setActivePage} tasksUsed={tasksUsed} />}
                {activePage === 'prompt-generator' && <PromptAdGenerator onTaskComplete={handleTaskComplete} />}
                {activePage === 'image-compressor' && <ImageCompressor onTaskComplete={handleTaskComplete} />}
                {activePage === 'tashkeel' && <ArabicTashkeel onTaskComplete={handleTaskComplete} />}
                {activePage === 'social-prompt' && <SocialPromptTool onTaskComplete={handleTaskComplete} />}
                {activePage === 'landing-prompt' && <LandingPagePromptTool onTaskComplete={handleTaskComplete} />}
                {activePage === 'label-prompt' && <ProductLabelPromptTool onTaskComplete={handleTaskComplete} />}
                {activePage === 'marketing-hook' && <MarketingHookTool onTaskComplete={handleTaskComplete} />}
            </main>

        </div>
    );
}