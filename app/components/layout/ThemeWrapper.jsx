"use client";

import { useCompanyTheme } from "@/app/context/CompanyThemeContext";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ThemeWrapper({ children }) {
  const { templateId } = useCompanyTheme() || {};

  // Default classes
  let wrapperClass = "bg-white text-slate-900 min-h-screen transition-colors duration-300";

  if (templateId === 2) {
    // Dark theme
    wrapperClass = "bg-[#050505] text-slate-200 min-h-screen transition-colors duration-300";
  } else if (templateId === 1) {
    // Classic
    wrapperClass = "bg-[#F9F6F0] text-[#2C3E50] min-h-screen transition-colors duration-300";
  } else if (templateId === 3) {
    wrapperClass = "bg-slate-50 text-slate-900 min-h-screen transition-colors duration-300";
  }

  return (
    <div className={wrapperClass} dir="rtl">
      <Navbar />
      <main className="min-h-[calc(100vh-300px)]">{children}</main>
      <Footer />
    </div>
  );
}
