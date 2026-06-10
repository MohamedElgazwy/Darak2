"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import NotificationBell from "../NotificationBell";
import { useCompanyTheme } from "@/app/context/CompanyThemeContext";

const PUBLIC_LINKS = [
  { label: "الرئيسية", href: "/" },
  { label: "البحث والتصفح", href: "/search" },
];

const AUTH_USER_LINKS = [
  { label: "إضافة إعلان", href: "/add-announcement" },
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isCompany, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const { templateId, companyName } = useCompanyTheme() || {};

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push("/");
  };

  const isActive = (href) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "";

  const allNavLinks = [
    ...PUBLIC_LINKS,
    ...(isAuthenticated && user?.userType !== "Company" && !isCompany ? AUTH_USER_LINKS : []),
  ];

  // ─── تخصيص الألوان والظلال والـ Blur بلمسة Premium ───
  let navClasses = "sticky top-0 z-50 border-b backdrop-blur-2xl text-right transition-all duration-500 ";
  let logoClass = "bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent";
  let linkClass = "text-slate-600 hover:bg-slate-100/80 hover:text-indigo-600";
  let activeLinkClass = "bg-indigo-50 text-indigo-700 font-black shadow-sm border border-indigo-100/50";
  let mobileMenuBg = "bg-white/95 border-slate-100 backdrop-blur-3xl";
  let dropdownBg = "bg-white/95 backdrop-blur-xl border-slate-200/80 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] text-slate-700";
  
  // ألوان زر المساعد الذكي
  let aiButtonBg = "bg-indigo-50/50 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-300 text-indigo-700 hover:shadow-md hover:shadow-indigo-600/10";

  switch (templateId) {
    case 2: // Classic Theme
      navClasses += "bg-[#F4EFE6]/80 border-[#E6DFD3] text-[#3B2F2F] shadow-[0_4px_20px_rgba(90,70,52,0.05)]";
      logoClass = "text-[#5A4634] font-black";
      linkClass = "text-[#5A4634] hover:bg-[#EADDCD]/70 hover:text-[#3B2F2F]";
      activeLinkClass = "bg-[#EADDCD] text-[#3B2F2F] font-black border border-[#D5C6B5] shadow-sm";
      mobileMenuBg = "bg-[#F4EFE6]/95 border-[#E6DFD3] backdrop-blur-3xl";
      dropdownBg = "bg-[#FFFDF8]/95 backdrop-blur-xl border-[#E6DFD3] shadow-2xl text-[#5A4634]";
      aiButtonBg = "bg-[#EADDCD]/50 border-[#D5C6B5] hover:bg-[#EADDCD] text-[#5A4634] hover:shadow-md";
      break;
    case 3: // Dark Theme (Luxury)
      navClasses += "bg-[#0a0a0a]/80 border-[#222222] text-slate-200 shadow-[0_4px_30px_rgba(0,0,0,0.5)]";
      logoClass = "text-[#D4AF37] font-black tracking-widest"; 
      linkClass = "text-slate-400 hover:bg-[#1a1a1a] hover:text-[#D4AF37]";
      activeLinkClass = "bg-[#1a1a1a] text-[#D4AF37] font-black border border-[#333333] shadow-inner";
      mobileMenuBg = "bg-[#0a0a0a]/95 border-[#222222] backdrop-blur-3xl";
      dropdownBg = "bg-[#111111]/95 backdrop-blur-xl border-[#333333] shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-slate-300";
      aiButtonBg = "bg-[#1a1a1a] border-[#D4AF37]/30 hover:bg-[#222] text-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.15)]";
      break;
    default: // Bright Default (Modern)
      navClasses += "bg-white/70 border-slate-200/60 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)]";
      break;
  }

  // إخفاء الشريط في صفحات الشركات الفرعية
  if (pathname?.startsWith('/company/')) return null;

  return (
    <header className={navClasses} dir="rtl">
      <div className="container-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex h-20 items-center justify-between gap-4">
          
          <Link href="/" className="shrink-0 transition-transform hover:scale-105 active:scale-95 flex items-center group">
            <Image
              src="/images/logo.jpg"
              alt="دارك"
              width={110}
              height={80}
              loading="eager"
              style={{ width: 'auto', height: 'auto' }}
              className="inline-block mr-2 rounded-xl group-hover:shadow-md transition-shadow"
            />
          </Link>

          {pathname?.startsWith('/company/') && companyName && (
            <Link href={pathname.split('/').slice(0,3).join('/')} className="hidden lg:flex items-center gap-3 mr-4 animate-in fade-in slide-in-from-right-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-700 font-black shadow-inner">{companyName.charAt(0)}</div>
              <span className="font-black text-xl text-slate-900 truncate max-w-[220px]">{companyName}</span>
            </Link>
          )}

          {/* Links Grid */}
          <ul className="hidden md:flex items-center gap-1.5">
            {allNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition-all duration-300 inline-block ${
                    isActive(link.href) ? activeLinkClass : linkClass
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Left Control Bar */}
          <div className="flex items-center gap-4">
            
            {/* ── زر المساعد الذكي AI بتأثيرات النيون ── */}
            <Link 
              href="/ai-assistant" 
              className={`relative group flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-300 transform active:scale-95 ${aiButtonBg}`}
            >
              <span className="text-lg group-hover:animate-bounce">✨</span>
              <span className="text-xs font-black hidden sm:block">المساعد العقاري الذكي</span>
              <span className="absolute -top-2.5 -right-2.5 bg-gradient-to-tr from-amber-400 to-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg shadow-sm border border-white/20 animate-pulse">AI</span>
            </Link>

            {isAuthenticated ? (
              <>
                <NotificationBell />
                <div className="relative" ref={dropdownRef}>
                    <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className={`flex items-center gap-2.5 rounded-2xl border px-3 py-1.5 text-sm font-bold transition-all duration-300 focus:outline-none shadow-sm hover:shadow-md ${
                      templateId === 3 ? "border-[#333] bg-[#1a1a1a] text-slate-200 hover:bg-[#222]" : "border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-[11px] font-black text-white shadow-inner shadow-white/20">
                      {initials}
                    </span>
                    <span className="hidden sm:block truncate max-w-[100px]">{user?.firstName}</span>
                    <ChevronIcon className={`transition-transform duration-300 text-slate-400 ${dropdownOpen ? "rotate-180 text-indigo-500" : ""}`} />
                  </button>

                  {dropdownOpen && (
                    <div className={`absolute left-0 top-full z-50 mt-3 w-64 rounded-[2rem] border p-2 animate-in fade-in slide-in-from-top-4 duration-300 ${dropdownBg}`}>
                      <div className={`border-b px-5 py-4 text-right ${templateId === 3 ? "border-[#333]" : "border-slate-100"}`}>
                        <p className={`text-base font-black truncate ${templateId === 3 ? "text-white" : "text-slate-900"}`}>
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs truncate mt-1 text-slate-400 font-medium">
                          {user?.email}
                        </p>
                      </div>

                      <div className="p-2 space-y-1">
                        <DropdownLink href="/dashboard" label="🎛️ لوحة تحكم الحساب" themeId={templateId} />
                        {!isAdmin && <DropdownLink href="/dashboard/announcements" label="📑 إعلاناتي والمحفظة" themeId={templateId} />}
                        <DropdownLink href="/dashboard/settings" label="⚙️ إعدادات الحساب" themeId={templateId} />

                        {isAdmin && (
                          <>
                            <div className={`my-2 border-t ${templateId === 3 ? "border-[#333]" : "border-slate-100"}`} />
                            <DropdownLink href="/dashboard/admin-users" label="إدارة المستخدمين 👥" accent themeId={templateId} />
                            <DropdownLink href="/dashboard/admin-roles" label="إدارة الصلاحيات 🔐" accent themeId={templateId} />
                            <DropdownLink href="/dashboard/admin-announcements" label="مراجعة الإعلانات 📝" accent themeId={templateId} />
                            <DropdownLink href="/dashboard/admin-subscriptions" label="اشتراكات الكاش 💰" accent themeId={templateId} />
                          </>
                        )}

                        <div className={`my-2 border-t ${templateId === 3 ? "border-[#333]" : "border-slate-100"}`} />
                        <button onClick={handleLogout} className="flex w-full items-center justify-between px-4 py-3 text-xs text-red-500 font-black rounded-xl transition-colors hover:bg-red-50 hover:text-red-600 text-right group">
                          تسجيل الخروج
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">🚪</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/auth/login" className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition-all duration-300 ${linkClass}`}>
                  تسجيل الدخول
                </Link>
                <Link href="/auth/register" className={`text-sm py-2.5 px-6 rounded-2xl font-bold transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 active:scale-95 ${templateId === 3 ? "bg-gradient-to-r from-[#D4AF37] to-[#b5952f] text-black shadow-yellow-600/20" : "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-600/20"}`}>
                  إنشاء حساب مجاني
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className={`flex md:hidden h-10 w-10 items-center justify-center rounded-2xl transition-all focus:outline-none border shadow-sm ${templateId === 3 ? "border-[#333] bg-[#1a1a1a] text-slate-300" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"}`}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div className={`border-t pb-6 pt-4 md:hidden animate-in fade-in slide-in-from-top-4 duration-300 ${mobileMenuBg}`}>
            <ul className="flex flex-col gap-2 px-2">
              {allNavLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={`block rounded-2xl px-5 py-3.5 text-sm font-bold transition-colors ${linkClass}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                 <Link href="/ai-assistant" className={`block rounded-2xl px-5 py-3.5 text-sm font-bold transition-colors ${linkClass}`}>
                   ✨ المساعد الذكي (AI)
                 </Link>
              </li>
              {!isAuthenticated && (
                <li className="flex flex-col gap-3 pt-4 border-t border-slate-200/50 mt-2">
                  <Link href="/auth/login" className="text-center bg-slate-100 text-slate-700 rounded-2xl py-3 text-sm font-bold">تسجيل الدخول</Link>
                  <Link href="/auth/register" className="text-center bg-indigo-600 text-white rounded-2xl py-3 text-sm font-bold shadow-md">إنشاء حساب جديد</Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

function DropdownLink({ href, label, accent = false, themeId }) {
  let defaultText = themeId === 3 ? "text-slate-300 hover:bg-[#222] hover:text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900";
  let accentText = themeId === 3 ? "text-[#D4AF37] hover:bg-[#222]" : "text-indigo-600 font-black hover:bg-indigo-50/60";
  
  return (
    <Link href={href} className={`flex items-center justify-between px-4 py-3 text-xs text-right font-bold rounded-xl transition-all duration-200 group ${accent ? accentText : defaultText}`}>
      {label}
      <span className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 text-[10px]">←</span>
    </Link>
  );
}

function MenuIcon() { return <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>; }
function CloseIcon() { return <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>; }
function ChevronIcon({ className }) { return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>; }