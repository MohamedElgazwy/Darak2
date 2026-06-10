"use client";

import { useCompanyTheme } from "@/app/context/CompanyThemeContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGES_MAP = {
  1: { name: "الرئيسية", path: "" },
  2: { name: "عقاراتنا", path: "/announcements" },
  3: { name: "من نحن", path: "/about" },
  4: { name: "خدماتنا", path: "/services" },
  6: { name: "آراء العملاء", path: "/feedback" }, 
  7: { name: "فريق العمل", path: "/team" },
};

export default function CompanyNavbar({ companyId }) {
  const pathname = usePathname();
  const { storeData } = useCompanyTheme();

  if (!storeData) return null;

  const theme = storeData.themeStyles;
  const basePath = `/company/${companyId}`;
  
  // تصفية الروابط لتشمل فقط المتاحة في اشتراك الشركة
  const allowedLinks = Object.entries(PAGES_MAP)
    .filter(([id]) => storeData.availablePages.includes(Number(id)))
    .map(([id, data]) => data);

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-500 ${theme.navBg}`} dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Company Name */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg overflow-hidden shadow-sm ${!storeData.logo ? theme.accentBg : 'bg-transparent border border-current border-opacity-10'}`}>
              {storeData.logo ? (
                <img src={storeData.logo.startsWith("data:") ? storeData.logo : `data:image/jpeg;base64,${storeData.logo}`} alt={storeData.companyName} className="w-full h-full object-cover" />
              ) : (
                storeData.companyName.charAt(0)
              )}
            </div>
            <span className={`font-black text-xl tracking-tight ${theme.text}`}>{storeData.companyName}</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8 space-x-reverse">
            {allowedLinks.map((link, idx) => {
              const fullPath = `${basePath}${link.path}`;
              const isActive = pathname === fullPath;
              return (
                <Link key={idx} href={fullPath} className={`transition-colors px-2 py-2 text-sm font-bold ${isActive ? theme.accentText : theme.mutedText} hover:${theme.accentText}`}>
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Contact Button (If Page 5 is available) */}
          <div className="flex items-center">
            {storeData.availablePages.includes(5) && (
              <Link href={`${basePath}/contact`} className={`hidden md:inline-flex px-6 py-2.5 rounded-full text-sm font-bold shadow-md transition-transform hover:-translate-y-0.5 ${theme.accentBg}`}>
                تواصل معنا
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}