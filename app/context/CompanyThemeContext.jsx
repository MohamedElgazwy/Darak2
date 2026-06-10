"use client";

import { createContext, useContext, useState } from "react";

export const THEME_STYLES = {
  1: { // Bright Theme (مشرق وعصري)
    bg: "bg-[#F8FAFC]",
    text: "text-slate-900",
    mutedText: "text-slate-500",
    navBg: "bg-white/90 border-slate-200",
    card: "bg-white border-slate-200 shadow-sm hover:shadow-md",
    accentBg: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20",
    accentText: "text-blue-600",
    iconBox: "bg-blue-50 text-blue-600 border-blue-100",
    divider: "border-slate-200"
  },
  2: { // Classic Theme (كلاسيكي ورسمي)
    bg: "bg-[#F4EFE6]",
    text: "text-[#3B2F2F]",
    mutedText: "text-[#8C7A6B]",
    navBg: "bg-[#EADDCD]/95 border-[#D5C6B5]",
    card: "bg-[#FFFDF8] border-[#E6DFD3] shadow-sm hover:border-[#D5C6B5]",
    accentBg: "bg-[#5A4634] hover:bg-[#3B2F2F] text-[#F4EFE6] shadow-black/10",
    accentText: "text-[#5A4634]",
    iconBox: "bg-[#EADDCD] text-[#5A4634] border-[#D5C6B5]",
    divider: "border-[#E6DFD3]"
  },
  3: { // Dark Theme (فاخر وليلي)
    bg: "bg-[#111111]",
    text: "text-slate-200",
    mutedText: "text-slate-400",
    navBg: "bg-[#1A1A1A]/95 border-[#222]",
    card: "bg-[#1A1A1A] border-[#222] hover:border-[#333]",
    accentBg: "bg-[#D4AF37] hover:bg-[#b5952f] text-[#111] shadow-black/40",
    accentText: "text-[#D4AF37]",
    iconBox: "bg-[#222] text-[#D4AF37] border-[#333]",
    divider: "border-[#222]"
  }
};

const CompanyThemeContext = createContext();

export function CompanyThemeProvider({ children }) {
  const [storeData, setStoreData] = useState(null); // سيحفظ بيانات الشركة والقالب والألوان

  return (
    <CompanyThemeContext.Provider value={{ storeData, setStoreData }}>
      {children}
    </CompanyThemeContext.Provider>
  );
}

export const useCompanyTheme = () => useContext(CompanyThemeContext);