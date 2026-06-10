"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { userService } from "@/app/services";
import { useCompanyTheme, THEME_STYLES } from "@/app/context/CompanyThemeContext";
import CompanyNavbar from "@/app/components/company/CompanyNavbar";

export default function CompanyStorefrontLayout({ children }) {
  const { companyId } = useParams();
  const { storeData, setStoreData } = useCompanyTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initStorefront = async () => {
      try {
        // جلب بيانات الشركة
        const profileRes = await userService.getProfile(companyId);
        const profile = profileRes?.data || profileRes?.value || profileRes;

        const companyName = profile?.companyName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'الشركة العقارية';
        const logo = profile?.logo || null;
        
        // 💡 هنا ننتظر الـ templateId من الباك إند، وإلا سيأخذ 1
        const templateId = Number(profile?.templateId || 1);
        
        // 💡 هنا ننتظر الـ avaliablePages. إذا لم تكن موجودة، سنقفلها على 3 صفحات فقط كأمان (Bronze)
        let availablePages = [1, 2, 3]; 
        const pagesRaw = profile?.avaliablePages || profile?.availablePages;
        
        if (pagesRaw) {
          if (typeof pagesRaw === 'string') {
            try { availablePages = JSON.parse(pagesRaw); } catch(e) {}
          } else if (Array.isArray(pagesRaw)) {
            availablePages = pagesRaw;
          }
        }

        // ربط القالب بألواننا الديناميكية
        const themeStyles = THEME_STYLES[templateId] || THEME_STYLES[1];

        setStoreData({ companyName, logo, templateId, availablePages, themeStyles });
      } catch (e) {
        // Fallback
        setStoreData({ companyName: 'الشركة العقارية', logo: null, templateId: 1, availablePages: [1, 2, 3], themeStyles: THEME_STYLES[1] });
      } finally {
        setLoading(false);
      }
    };

    if (companyId && !storeData) {
      initStorefront();
    } else if (storeData) {
      setLoading(false);
    }
  }, [companyId, storeData, setStoreData]);

  if (loading || !storeData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${storeData.themeStyles.bg} ${storeData.themeStyles.text}`} dir="rtl">
      {/* عرض الـ Navbar المخصص للشركة */}
      <CompanyNavbar companyId={companyId} />
      
      <main>
        {children}
      </main>

      {/* تذييل بسيط للشركة */}
      <footer className={`py-8 text-center text-sm mt-20 border-t ${storeData.themeStyles.divider} ${storeData.themeStyles.mutedText}`}>
        جميع الحقوق محفوظة لـ {storeData.companyName} © {new Date().getFullYear()}
        <p className="text-xs mt-2 opacity-50">بواسطة منصة دارك العقارية</p>
      </footer>
    </div>
  );
}