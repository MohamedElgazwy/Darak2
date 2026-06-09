"use client";

import { useEffect, useState } from "react";
import { useCompanyTheme } from "@/app/context/CompanyThemeContext";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

// 1. خريطة الصفحات وأرقامها ومساراتها
const PAGES_CONFIG = [
  { id: 1, name: "الرئيسية", path: "" },
  { id: 2, name: "الإعلانات", path: "/announcements" },
  { id: 3, name: "عن الشركة", path: "/about" },
  { id: 4, name: "الخدمات", path: "/services" },
  { id: 6, name: "آراء العملاء", path: "/feedback" }, 
  { id: 7, name: "فريق العمل", path: "/team" },
  { id: 5, name: "تواصل معنا", path: "/contact" },
];

// 2. خريطة الألوان (Themes) بناءً على تصميماتك
const THEMES = {
  Bright: {
    bg: "bg-white",
    text: "text-slate-900",
    navBg: "bg-white/90",
    navBorder: "border-slate-200",
    linkHover: "hover:text-blue-600",
    activeLink: "text-blue-600 font-bold",
    accent: "bg-blue-600 text-white hover:bg-blue-700"
  },
  Dark: {
    bg: "bg-[#111827]",
    text: "text-slate-100",
    navBg: "bg-[#1f2937]/95",
    navBorder: "border-slate-800",
    linkHover: "hover:text-amber-400",
    activeLink: "text-amber-400 font-bold",
    accent: "bg-amber-500 text-slate-900 hover:bg-amber-400"
  },
  Classic: {
    bg: "bg-[#f8f5f0]",
    text: "text-[#3b2b1c]",
    navBg: "bg-[#f4ece1]/95",
    navBorder: "border-[#d8cbb8]",
    linkHover: "hover:text-[#8c6b4a]",
    activeLink: "text-[#8c6b4a] font-bold border-b-2 border-[#8c6b4a]",
    accent: "bg-[#5c4326] text-white hover:bg-[#3b2b1c]"
  }
};

export default function CompanyStorefrontLayout({ children }) {
  const params = useParams();
  const pathname = usePathname();
  const companyId = params?.companyId;

  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState(null);
  const { setTemplateId, setCompanyName } = useCompanyTheme();

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const { userService } = await import("@/app/services");
        const profile = await userService.getProfile(companyId);

        const companyName = profile?.companyName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'شركة دارك العقارية';
        
        // 💡 استخراج اللوجو من الـ Profile
        const logo = profile?.logo || null;

        const tpl = Number(profile?.templateId || 1);
        const theme = tpl === 2 ? 'Classic' : tpl === 3 ? 'Dark' : 'Bright';

        const availablePages = profile?.availablePages || profile?.avaliablePages || [1,2,3,4,5,6,7];

        // 💡 إضافة اللوجو إلى الـ State
        setStoreData({ companyName, theme, availablePages, logo });
        
        if (typeof setTemplateId === 'function') setTemplateId(Number(profile?.templateId || 1));
        if (typeof setCompanyName === 'function') setCompanyName(companyName);
        setLoading(false);
      } catch (e) {
        setStoreData({ companyName: 'شركة دارك العقارية', theme: 'Bright', availablePages: [1,2,3,4,5,6,7], logo: null });
        if (typeof setTemplateId === 'function') setTemplateId(1);
        if (typeof setCompanyName === 'function') setCompanyName('شركة دارك العقارية');
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!storeData) return <div className="text-center p-20">عفواً، الشركة غير موجودة أو غير مفعلة.</div>;

  const activeTheme = THEMES[storeData.theme] || THEMES.Bright;
  const allowedNavLinks = PAGES_CONFIG.filter(page => storeData.availablePages.includes(page.id));
  const basePath = `/company/${companyId}`;

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${activeTheme.bg} ${activeTheme.text}`} dir="rtl">
      
      <header className={`sticky top-0 z-50 backdrop-blur-sm border-b transition-colors duration-500 ${activeTheme.navBg} ${activeTheme.navBorder}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* ── لوجو / اسم الشركة ── */}
            <div className="flex-shrink-0 flex items-center gap-3">
              {/* 💡 التعديل هنا: عرض الصورة إذا كانت موجودة، وإلا عرض الحرف الأول */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg overflow-hidden shadow-sm ${!storeData.logo ? activeTheme.accent : 'bg-transparent border border-current border-opacity-10'}`}>
                {storeData.logo ? (
                  <img
                    src={
                      storeData.logo.startsWith("data:")
                        ? storeData.logo
                        : `data:image/jpeg;base64,${storeData.logo}`
                    }
                    alt={storeData.companyName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  storeData.companyName.charAt(0)
                )}
              </div>
              <span className="font-black text-xl tracking-tight">{storeData.companyName}</span>
            </div>

            <nav className="hidden md:flex space-x-8 space-x-reverse">
              {allowedNavLinks.map((link) => {
                const fullPath = `${basePath}${link.path}`;
                const isActive = pathname === fullPath;

                return (
                  <Link 
                    key={link.id} 
                    href={fullPath}
                    className={`transition-colors px-3 py-2 text-sm font-medium ${
                      isActive ? activeTheme.activeLink : `opacity-80 ${activeTheme.linkHover}`
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center">
              {storeData.availablePages.includes(5) && (
                <Link 
                  href={`${basePath}/contact`} 
                  className={`hidden md:inline-flex px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-transform hover:-translate-y-0.5 ${activeTheme.accent}`}
                >
                  احجز استشارة
                </Link>
              )}
            </div>
            
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>

    </div>
  );
}