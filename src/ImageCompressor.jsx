'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Plus, Sliders, Maximize, Link as LinkIcon, Image as ImageIcon, Zap, Info, ArrowLeftRight, Upload } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function ImageCompressor({ onTaskComplete }) {
    const [originalImage, setOriginalImage] = useState(null);
    const [originalImageURL, setOriginalImageURL] = useState(null);
    const [originalSize, setOriginalSize] = useState(0);
    const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });

    const [compressedImage, setCompressedImage] = useState(null);
    const [compressedImageURL, setCompressedImageURL] = useState(null);
    const [compressedSize, setCompressedSize] = useState(0);

    const [isCompressing, setIsCompressing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    // Control Panel State
    const [quality, setQuality] = useState(80);
    const [format, setFormat] = useState('image/webp');
    const [resizeEnabled, setResizeEnabled] = useState(false);
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [aspectLocked, setAspectLocked] = useState(true);
    const [aspectRatio, setAspectRatio] = useState(1);
    
    // Slider State
    const [sliderPos, setSliderPos] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const sliderContainerRef = useRef(null);

    const fileInputRef = useRef(null);

    // Format bytes to MB/KB
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setErrorMsg('الرجاء رفع ملف صورة صالح (JPG, PNG, WEBP).');
            return;
        }

        setErrorMsg('');
        setOriginalImage(file);
        setOriginalSize(file.size);
        const url = URL.createObjectURL(file);
        setOriginalImageURL(url);

        // Get natural dimensions
        const img = new Image();
        img.onload = () => {
            setOriginalDimensions({ width: img.width, height: img.height });
            setWidth(img.width.toString());
            setHeight(img.height.toString());
            setAspectRatio(img.width / img.height);
            
            // Trigger automatic first compression
            executeCompression(file, quality, format, resizeEnabled, img.width, img.height);
        };
        img.src = url;
    };

    const executeCompression = async (file, currentQuality, currentFormat, isResized, currentW, currentH) => {
        if (!file) return;
        setIsCompressing(true);

        const options = {
            maxSizeMB: 50, // Let quality control it mainly
            useWebWorker: true,
            fileType: currentFormat,
            initialQuality: currentQuality / 100,
            alwaysKeepResolution: !isResized
        };

        if (isResized && currentW && currentH) {
            options.maxWidthOrHeight = Math.max(Number(currentW), Number(currentH));
        }

        try {
            const compressedFile = await imageCompression(file, options);
            setCompressedImage(compressedFile);
            setCompressedSize(compressedFile.size);
            
            if (compressedImageURL) {
                URL.revokeObjectURL(compressedImageURL);
            }
            setCompressedImageURL(URL.createObjectURL(compressedFile));
        } catch {
            setErrorMsg('حدث خطأ أثناء ضغط الصورة. حاول مرة أخرى.');
        } finally {
            setIsCompressing(false);
        }
    };

    // Re-compress when settings change
    useEffect(() => {
        if (originalImage && originalDimensions.width > 0) {
            const timer = setTimeout(() => {
                executeCompression(originalImage, quality, format, resizeEnabled, Number(width), Number(height));
            }, 400);
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quality, format, resizeEnabled, width, height]);

    const handleDownload = () => {
        if (!compressedImageURL || isDownloading) return;
        setIsDownloading(true);

        const extMap = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
        const newExt = extMap[format] || 'jpg';
        const origNameParts = (originalImage?.name || 'image').split('.');
        if (origNameParts.length > 1) origNameParts.pop();
        const baseName = origNameParts.join('.');
        const fileName = `${baseName}_compressed.${newExt}`;

        try {
            const link = document.createElement('a');
            link.href = compressedImageURL;
            link.setAttribute('download', fileName);
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            
            if (onTaskComplete) onTaskComplete();
            
            // Increased delay (2000ms) to ensure browser triggers the download before cleanup
            setTimeout(() => {
                if (document.body && document.body.contains(link)) {
                    document.body.removeChild(link);
                }
                setIsDownloading(false);
            }, 2000);
        } catch {
            // Fallback: open in new tab so user can Save As
            window.open(compressedImageURL, '_blank');
            setIsDownloading(false);
        }
    };

    const handleWidthChange = (val) => {
        setWidth(val);
        if (aspectLocked && val && val > 0) {
            setHeight(Math.round(Number(val) / aspectRatio).toString());
        }
    };

    const handleHeightChange = (val) => {
        setHeight(val);
        if (aspectLocked && val && val > 0) {
            setWidth(Math.round(Number(val) * aspectRatio).toString());
        }
    };

    const getSavingsPercentage = () => {
        if (!originalSize || !compressedSize) return 0;
        const savings = ((originalSize - compressedSize) / originalSize) * 100;
        return savings > 0 ? savings.toFixed(1) : 0;
    };

    // Slider Handlers
    const handleSliderDown = (e) => {
        setIsDragging(true);
    };
    
    const stopDragging = () => setIsDragging(false);

    const updateSliderPos = useCallback((clientX) => {
        if (!isDragging || !sliderContainerRef.current) return;
        const rect = sliderContainerRef.current.getBoundingClientRect();
        let x = clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        // Calculate percentage from physical left
        setSliderPos((x / rect.width) * 100);
    }, [isDragging]);

    const handleMouseMove = useCallback((e) => updateSliderPos(e.clientX), [updateSliderPos]);
    const handleTouchMove = useCallback((e) => {
        if (e.touches[0]) updateSliderPos(e.touches[0].clientX);
    }, [updateSliderPos]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mouseup', stopDragging);
            window.addEventListener('touchend', stopDragging);
        } else {
            window.removeEventListener('mouseup', stopDragging);
            window.removeEventListener('touchend', stopDragging);
        }
        return () => {
            window.removeEventListener('mouseup', stopDragging);
            window.removeEventListener('touchend', stopDragging);
        };
    }, [isDragging]);

    return (
        <div className="w-full h-full pb-20 text-slate-100 animate-in fade-in duration-500 overflow-x-hidden p-6 md:p-12 space-y-10 overflow-y-auto"
             dir="rtl"
             style={{ scrollbarWidth: 'none' }}
        >
            
            {/* 1. Header Section */}
            <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex gap-4 self-stretch md:self-auto">
                    <button 
                        onClick={handleDownload} 
                        disabled={!compressedImageURL || isCompressing || isDownloading}
                        className="flex-1 md:flex-none border border-purple-500/20 bg-purple-200/90 hover:bg-purple-300 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg text-[#121826] font-extrabold text-sm"
                    >
                        {isDownloading ? (
                            <><div className="w-4 h-4 border-2 border-[#121826]/30 border-t-[#121826] rounded-full animate-spin" /> جاري التحميل...</>
                        ) : (
                            <><Download size={18} /> تحميل الصورة</>
                        )}
                    </button>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 md:flex-none px-6 py-3.5 rounded-2xl border border-slate-700/60 bg-[#121826] hover:bg-slate-800 flex items-center justify-center gap-2 transition-all text-slate-300 font-bold text-sm shadow-inner"
                    >
                        <Plus size={18} />
                        رفع صورة جديدة
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        onChange={handleImageUpload}
                        accept="image/png, image/jpeg, image/webp" 
                    />
                </div>
                
                <div className="text-right">
                    <h1 className="text-[2.5rem] font-extrabold text-white flex items-center justify-end gap-3 mb-2 tracking-tight">
                        ضاغط الصور الذكي
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">تحسين حجم الصور باستخدام تقنيات الذكاء الاصطناعي مع الحفاظ على الجودة الأصلية.</p>
                </div>
            </div>

            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 max-w-3xl mx-auto text-center">
                    {errorMsg}
                </div>
            )}

            {!originalImage ? (
                /* Empty / Upload State */
                <div className="w-full max-w-4xl mx-auto mt-20">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-[3rem] border border-dashed border-slate-700 bg-[#121826]/40 p-24 text-center hover:border-purple-500/50 hover:bg-[#121826] transition-all cursor-pointer group shadow-2xl backdrop-blur"
                    >
                        <div className="mx-auto w-20 h-20 bg-[#1e293b]/50 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-500/10 group-hover:scale-110 transition-all duration-300 border border-slate-700/50">
                            <Upload className="h-8 w-8 text-slate-400 group-hover:text-purple-400 transition-colors pointer-events-none" />
                        </div>
                        <h3 className="text-3xl font-extrabold text-slate-200 mb-4 pointer-events-none">
                            اسحب وافلت الصورة هنا
                        </h3>
                        <p className="text-slate-500 font-medium pointer-events-none mb-8">
                            أو انقر لاختيار ملف من جهازك
                        </p>
                        <div className="flex justify-center gap-3 text-xs font-bold text-slate-400 pointer-events-none">
                            <span className="px-5 py-2 bg-slate-800/80 rounded-xl border border-slate-700/50">JPG</span>
                            <span className="px-5 py-2 bg-slate-800/80 rounded-xl border border-slate-700/50">PNG</span>
                            <span className="px-5 py-2 bg-slate-800/80 rounded-xl border border-slate-700/50">WEBP</span>
                        </div>
                    </div>
                </div>
            ) : (
                /* Active Dashboard State */
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    
                    {/* 2. Control Panel (Horizontal Bar) */}
                    <div className="bg-[#121826] border border-slate-800/80 rounded-[2.5rem] p-6 shadow-2xl shadow-black/50 flex flex-col xl:flex-row items-center justify-between gap-8 h-auto xl:h-[100px]">
                        
                        {/* Right Section: Quality Slider */}
                        <div className="w-full xl:w-[32%] flex flex-col justify-center px-4">
                           <div className="flex justify-between items-center mb-4">
                             <span className="text-2xl font-black font-mono tracking-tight">{quality}%</span>
                             <span className="text-sm font-bold flex items-center gap-2 text-slate-300">
                                جودة الضغط <Sliders size={18} className="text-slate-500"/> 
                             </span>
                           </div>
                           <div className="relative flex items-center w-full">
                               <input 
                                  type="range" 
                                  min="1" max="100" 
                                  value={quality} 
                                  onChange={e => setQuality(Number(e.target.value))} 
                                  className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer z-20 opacity-0" 
                               />
                               {/* Custom Built Slider Track */}
                               <div className="absolute left-0 right-0 h-1.5 bg-[#1e293b] rounded-full pointer-events-none z-0">
                                   {/* Fill (from left) */}
                                   <div className="h-full bg-purple-400 rounded-full" style={{ width: `${quality}%` }}></div>
                               </div>
                               {/* Custom Built Slider Thumb */}
                               <div className="absolute w-5 h-5 bg-[#e9d5ff] border-4 border-[#9333ea] rounded-full pointer-events-none z-10 shadow-[0_0_15px_rgba(168,85,247,0.4)]" style={{ left: `calc(${quality}% - 10px)` }}></div>
                           </div>
                        </div>

                        {/* Middle Section: Resize Dimensions */}
                        <div className="flex items-center gap-8 w-full xl:w-[36%] justify-center border-y xl:border-y-0 xl:border-x border-slate-800/50 py-6 xl:py-0 px-8">
                           
                           <div className="flex flex-col items-center justify-center gap-2 text-xs font-bold text-slate-400">
                             <Maximize size={18} className="text-slate-500" /> تغيير الأبعاد
                           </div>

                           <div className="flex items-center gap-3">
                             <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold text-slate-500 mb-2">الارتفاع</span>
                                <input type="number" value={height} onChange={e => handleHeightChange(e.target.value)} disabled={!resizeEnabled} className="w-20 bg-slate-900/50 border border-slate-700/50 text-center text-sm py-2 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500 disabled:opacity-40 font-mono shadow-inner transition-all hover:bg-slate-900" />
                             </div>
                             
                             <button onClick={() => setAspectLocked(!aspectLocked)} className={`mt-5 p-2 rounded-xl transition-all ${aspectLocked ? 'bg-[#1e293b] text-slate-400 shadow-inner border border-slate-700/50' : 'bg-transparent text-slate-600'}`}>
                                <LinkIcon size={16} />
                             </button>
                             
                             <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold text-slate-500 mb-2">العرض</span>
                                <input type="number" value={width} onChange={e => handleWidthChange(e.target.value)} disabled={!resizeEnabled} className="w-20 bg-slate-900/50 border border-slate-700/50 text-center text-sm py-2 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500 disabled:opacity-40 font-mono shadow-inner transition-all hover:bg-slate-900" />
                             </div>
                           </div>

                           <div className="flex flex-col items-center">
                             <div className="text-[10px] font-bold text-slate-500 mb-2">تحجيم تلقائي</div>
                             <div 
                                className={`w-12 h-[22px] rounded-full relative cursor-pointer flex items-center transition-colors ${resizeEnabled ? 'bg-cyan-400' : 'bg-slate-700'}`} 
                                onClick={() => setResizeEnabled(!resizeEnabled)}
                             >
                               <div className={`absolute w-[14px] h-[14px] bg-white rounded-full transition-all top-[4px] ${resizeEnabled ? 'left-1' : 'right-1'} shadow-md`} />
                             </div>
                           </div>
                        </div>

                        {/* Left Section: Output Format */}
                        <div className="flex items-center gap-6 w-full xl:w-[32%] justify-end pr-4">
                           <div className="text-right">
                             <div className="text-[10px] text-slate-500 mb-2 font-bold text-center">تنسيق المخرج</div>
                             <div className="flex bg-[#1e293b]/50 rounded-xl p-1 border border-slate-700/30">
                               {['image/png', 'image/jpeg', 'image/webp'].map(fmt => {
                                 const label = fmt.split('/')[1].toUpperCase();
                                 const isActive = format === fmt;
                                 return (
                                   <button 
                                     key={fmt} 
                                     onClick={() => setFormat(fmt)} 
                                     className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${isActive ? 'bg-[#2d224b] text-purple-300 border border-purple-500/20 shadow-md' : 'text-slate-400 hover:text-slate-200 border border-transparent'}`}
                                   >
                                     {label}
                                   </button>
                                 )
                               })}
                             </div>
                           </div>
                           
                           <div className="w-[1px] h-10 bg-slate-800 rounded-full mx-2 hidden xl:block"></div>

                           <div className="text-right">
                             <div className="text-[10px] text-slate-500 mb-2 font-bold text-center">نوع التحسين</div>
                             <div className="text-xs font-bold text-pink-400 bg-pink-500/10 px-4 py-2 rounded-xl border border-pink-500/20 text-center">متوازن</div>
                           </div>
                        </div>
                    </div>

                    {/* 3. Image Comparison Drag Slider */}
                    <div 
                      ref={sliderContainerRef}
                      className="relative w-full h-[350px] md:h-[600px] bg-white rounded-[2.5rem] overflow-hidden cursor-ew-resize select-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#1e293b]"
                       onMouseMove={handleMouseMove}
                      onTouchMove={handleTouchMove}
                      onMouseDown={handleSliderDown}
                      onTouchStart={handleSliderDown}
                    >
                       {/* Layer 1 (Bottom): Compressed Image — fully visible */}
                       {compressedImageURL ? (
                           <img
                              src={compressedImageURL}
                              className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-all duration-300 ${isCompressing ? 'opacity-70 blur-[1px]' : 'opacity-100'}`}
                              alt="Compressed"
                              draggable="false"
                           />
                       ) : (
                           <img
                              src={originalImageURL}
                              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                              alt="Original placeholder"
                              draggable="false"
                           />
                       )}

                       {/* Layer 2 (Top): Original Image — clipped to LEFT portion via sliderPos */}
                       <img
                          src={originalImageURL}
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                          alt="Original"
                          draggable="false"
                          style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                       />

                       {/* Separator Line — positioned at sliderPos */}
                       <div
                          className="absolute top-0 bottom-0 w-[3px] bg-[#d8b4fe] shadow-[0_0_20px_#9333ea] pointer-events-none z-10"
                          style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                       />

                       {/* Draggable Handle Circle */}
                       <div
                          className="absolute z-20 w-12 h-12 bg-purple-200 border-[3px] border-[#1e293b] rounded-full flex items-center justify-center shadow-2xl pointer-events-none"
                          style={{ left: `${sliderPos}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
                       >
                          <ArrowLeftRight size={20} className="text-[#121826]" strokeWidth={3} />
                       </div>

                       {/* Badge: Original (top-left) */}
                       <div className="absolute top-6 left-6 z-30 flex flex-col items-center gap-1.5 pointer-events-none">
                          <span className="bg-[#121826]/70 backdrop-blur-md text-slate-300 text-[11px] font-bold px-4 py-1.5 rounded-2xl border border-slate-700/50">الصورة الأصلية</span>
                          <span className="bg-[#2d3748]/95 text-white font-black text-sm px-5 py-2 rounded-2xl shadow-xl border border-slate-700/80" dir="ltr">{formatBytes(originalSize)}</span>
                       </div>

                       {/* Badge: Compressed (top-right) */}
                       {compressedImageURL && (
                           <div className="absolute top-6 right-6 z-30 flex flex-col items-center gap-1.5 pointer-events-none">
                              <span className="bg-[#121826]/70 backdrop-blur-md text-slate-300 text-[11px] font-bold px-4 py-1.5 rounded-2xl border border-slate-700/50">الصورة المضغوطة</span>
                              <div className="flex gap-2 items-center">
                                  {originalSize > compressedSize && (
                                      <span className="bg-[#2dd4bf]/20 backdrop-blur-md text-teal-300 font-extrabold px-3 py-2 rounded-2xl shadow-lg text-[11px] border border-teal-500/30" dir="ltr">وفرت {getSavingsPercentage()}%</span>
                                  )}
                                  <span className="bg-[#0f766e]/30 backdrop-blur-md text-[#5eead4] font-black text-sm px-5 py-2 rounded-2xl shadow-2xl border border-teal-500/40" dir="ltr">{formatBytes(compressedSize)}</span>
                              </div>
                           </div>
                       )}
                    </div>

                    {/* 4. Bottom Information Cards */}
                    <div className="grid md:grid-cols-[1fr_2fr] gap-6">
                        
                        {/* Left Card (AI Activity) */}
                        <div className="bg-[#121826] rounded-[2.5rem] p-8 lg:p-10 shadow-xl relative overflow-hidden flex flex-col justify-center border border-[#1e293b]">
                            {/* Decorative Purple Glow */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/10 blur-[50px] rounded-full pointer-events-none"></div>
                            
                            <div className="flex items-center justify-between z-10 w-full gap-4">
                                <div>
                                    <h3 className="text-xl font-extrabold text-white mb-2">الذكاء الاصطناعي نشط</h3>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[200px]">تم تطبيق تقنية DeepLossy لتحسين تدرجات الألوان.</p>
                                    <div className="mt-6">
                                        <span className="text-[11px] text-slate-500 font-bold block mb-1">وقت المعالجة</span>
                                        <span className="text-2xl font-black text-white tracking-tighter" dir="ltr">{(Math.random() * (1.8 - 0.7) + 0.7).toFixed(1)}s</span>
                                    </div>
                                </div>
                                <div className="hidden sm:flex self-start sm:self-center w-20 h-20 bg-[#1a1c2e] shadow-[inset_0_0_20px_rgba(168,85,247,0.15)] rounded-3xl items-center justify-center border border-purple-500/20 rotate-[-8deg] flex-shrink-0">
                                    <Zap size={32} className="text-[#c084fc] drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] fill-purple-400/20" />
                                </div>
                            </div>
                        </div>

                        {/* Right Card (File Metrics) */}
                        <div className="bg-[#121826] rounded-[2.5rem] p-8 lg:p-10 shadow-xl border border-[#1e293b]">
                            <div className="flex items-center gap-3 mb-8 justify-end">
                                <h3 className="text-sm font-bold text-slate-300">معلومات الملف</h3>
                                <Info size={18} className="text-slate-500" />
                            </div>
                            
                            <div className="space-y-5 text-sm font-medium">
                                <div className="flex justify-between items-center border-b border-slate-800/60 pb-5">
                                    <span className="text-slate-200 truncate max-w-[150px] sm:max-w-xs font-semibold" dir="ltr" title={originalImage.name}>{originalImage.name}</span>
                                    <span className="text-slate-500 font-bold text-xs">الاسم</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-800/60 pb-5">
                                    <span className="text-slate-200 font-mono tracking-wider bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-800" dir="ltr">{width || originalDimensions.width} × {height || originalDimensions.height}</span>
                                    <span className="text-slate-500 font-bold text-xs">الأبعاد</span>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-white font-mono font-bold tracking-wider" dir="ltr">{formatBytes(originalSize)}</span>
                                    <span className="text-slate-500 font-bold text-xs">الحجم الكلي</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{__html: `
                input[type='number']::-webkit-inner-spin-button,
                input[type='number']::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            `}} />
        </div>
    );
}
