import React, { useState } from 'react';
import {
  Globe,
  Search,
  RotateCw,
  ExternalLink,
  Copy,
  Check,
  Home,
  Bookmark,
  Sparkles,
  ArrowLeft,
  ShieldAlert,
  Compass,
} from 'lucide-react';

interface Shortcut {
  name: string;
  url: string;
  description: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

const DEFAULT_SHORTCUTS: Shortcut[] = [
  {
    name: 'Cookpad Việt Nam',
    url: 'https://cookpad.com/vn',
    description: 'Hàng ngàn công thức nấu ăn gia đình',
    icon: '🍳',
    bgColor: 'bg-amber-50 border-amber-200/80 hover:bg-amber-100/80',
    textColor: 'text-amber-800',
  },
  {
    name: 'Món Ngon Mỗi Ngày',
    url: 'https://monngonmoingay.com',
    description: 'Gợi ý món ngon chuẩn vị Việt',
    icon: '🍲',
    bgColor: 'bg-rose-50 border-rose-200/80 hover:bg-rose-100/80',
    textColor: 'text-rose-800',
  },
  {
    name: 'Google Tìm Kiếm',
    url: 'https://www.google.com',
    description: 'Tra cứu công thức, mẹo vặt bếp núc',
    icon: '🔍',
    bgColor: 'bg-sky-50 border-sky-200/80 hover:bg-sky-100/80',
    textColor: 'text-sky-800',
  },
  {
    name: 'YouTube Nấu Ăn',
    url: 'https://www.youtube.com/results?search_query=công+thức+nấu+ăn',
    description: 'Video hướng dẫn nấu ăn từng bước',
    icon: '📺',
    bgColor: 'bg-red-50 border-red-200/80 hover:bg-red-100/80',
    textColor: 'text-red-800',
  },
  {
    name: 'Bách Hóa Xanh',
    url: 'https://www.bachhoaxanh.com',
    description: 'Tra cứu giá nguyên liệu & chợ online',
    icon: '🛒',
    bgColor: 'bg-emerald-50 border-emerald-200/80 hover:bg-emerald-100/80',
    textColor: 'text-emerald-800',
  },
  {
    name: 'Google Gemini AI',
    url: 'https://gemini.google.com',
    description: 'Trợ lý AI gợi ý công thức sáng tạo',
    icon: '✨',
    bgColor: 'bg-purple-50 border-purple-200/80 hover:bg-purple-100/80',
    textColor: 'text-purple-800',
  },
];

export const BrowserView: React.FC = () => {
  const [inputUrl, setInputUrl] = useState<string>('https://cookpad.com/vn');
  const [currentUrl, setCurrentUrl] = useState<string>('https://cookpad.com/vn');
  const [copied, setCopied] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const normalizeUrl = (raw: string): string => {
    let trimmed = raw.trim();
    if (!trimmed) return 'https://www.google.com';

    // If it looks like a URL without protocol
    if (!/^https?:\/\//i.test(trimmed)) {
      if (trimmed.includes('.') && !trimmed.includes(' ')) {
        trimmed = 'https://' + trimmed;
      } else {
        // Treat as Google search
        trimmed = `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
      }
    }
    return trimmed;
  };

  const handleNavigate = (targetUrl?: string) => {
    const finalUrl = normalizeUrl(targetUrl || inputUrl);
    setCurrentUrl(finalUrl);
    setInputUrl(finalUrl);
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNavigate();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleResetHome = () => {
    const homeUrl = 'https://cookpad.com/vn';
    setInputUrl(homeUrl);
    setCurrentUrl(homeUrl);
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="p-4 space-y-4 pb-24 max-w-5xl mx-auto">
      {/* Header Title */}
      <div className="flex items-center justify-between bg-gradient-to-r from-pink-500 via-rose-500 to-[#FF8FB8] text-white p-4 sm:p-5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xs">
            <Globe className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight leading-snug flex items-center gap-1.5">
              <span>Trang Duyệt Web</span>
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            </h2>
            <p className="text-xs text-pink-100 font-medium">
              Tra cứu công thức, mẹo bếp núc & tìm kiếm ý tưởng món ăn
            </p>
          </div>
        </div>

        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-bold text-white transition-all border border-white/25 shadow-2xs"
          title="Mở tab mới"
        >
          <span>Mở tab mới</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Address & Search Bar */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập địa chỉ web (https://...) hoặc từ khóa tìm kiếm món ăn..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:bg-white transition-all"
            />
            {inputUrl && (
              <button
                type="button"
                onClick={() => setInputUrl('')}
                className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold px-1 py-0.5 rounded-md"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleNavigate()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF8FB8] to-[#FF6B9D] text-white font-bold text-xs sm:text-sm shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <Compass className="w-4 h-4" />
            <span>Truy cập</span>
          </button>
        </div>

        {/* Quick Shortcuts Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
            <Bookmark className="w-3.5 h-3.5 text-pink-500" />
            <span>Trang web gợi ý:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {DEFAULT_SHORTCUTS.map((sc, idx) => (
              <button
                key={idx}
                onClick={() => handleNavigate(sc.url)}
                className={`p-2 rounded-xl border text-left transition-all ${sc.bgColor} group`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base group-hover:scale-110 transition-transform">
                    {sc.icon}
                  </span>
                  <span className={`text-xs font-bold truncate ${sc.textColor}`}>
                    {sc.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Browser Frame Window */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col min-h-[520px]">
        {/* Frame Navigation Toolbar */}
        <div className="bg-slate-100/90 px-3 py-2 border-b border-slate-200/80 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <button
              onClick={handleResetHome}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-pink-600 hover:bg-pink-50 transition-colors shadow-2xs"
              title="Về trang chủ Cookpad"
            >
              <Home className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleRefresh}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-pink-600 hover:bg-pink-50 transition-colors shadow-2xs"
              title="Tải lại trang"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-pink-500' : ''}`} />
            </button>

            <div className="flex items-center gap-1 bg-white border border-slate-200/90 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-600 truncate flex-1 min-w-0">
              <Globe className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">{currentUrl}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Chép link</span>
                </>
              )}
            </button>

            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg bg-[#FF8FB8] hover:bg-[#FF6B9D] text-white font-extrabold text-[11px] flex items-center gap-1 shadow-2xs transition-all"
            >
              <span>Mở tab mới ↗</span>
            </a>
          </div>
        </div>

        {/* Iframe Frame Body */}
        <div className="relative flex-1 w-full h-[540px] bg-slate-50">
          <iframe
            key={iframeKey}
            src={currentUrl}
            title="Web Browser"
            onLoad={() => setIsLoading(false)}
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
          />

          {/* Security Notice Overlay / Fallback Guidance */}
          <div className="bg-amber-50/90 border-t border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Lưu ý:</strong> Một số trang web (Google, YouTube, Facebook, Shopee...) chặn nhúng khung iframe để bảo mật. Nếu màn hình trống, hãy bấm <strong>"Mở tab mới ↗"</strong> ở góc trên.
              </span>
            </div>
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-black underline text-amber-900 hover:text-pink-600 whitespace-nowrap"
            >
              Mở trực tiếp {currentUrl.replace(/^https?:\/\//, '').split('/')[0]} ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
