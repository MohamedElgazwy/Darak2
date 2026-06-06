// app/components/layout/Navbar.jsx
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

  const { templateId } = useCompanyTheme() || {};

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

  // ─── تخصيص الألوان والظلال والـ Blur بناءً على القوالب المتغيرة ───
  let navClasses = "sticky top-0 z-50 border-b backdrop-blur-xl text-right transition-all duration-500 shadow-sm ";
  let logoClass = "bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent";
  let linkClass = "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900";
  let activeLinkClass = "bg-indigo-50 text-indigo-600 font-bold";
  let mobileMenuBg = "bg-white/95 border-slate-100";
  let dropdownBg = "bg-white border-slate-200/80 shadow-xl text-slate-700";
  
  // ألوان زر المساعد الذكي
  let aiButtonBg = "bg-indigo-50/50 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 text-indigo-700";

  switch (templateId) {
    case 1: // Classic Theme
      navClasses += "bg-[#F4EFE6]/90 border-[#E6DFD3] text-[#3B2F2F]";
      logoClass = "text-[#5A4634] font-black";
      linkClass = "text-[#5A4634] hover:bg-[#EADDCD]/70 hover:text-[#3B2F2F]";
      activeLinkClass = "bg-[#EADDCD] text-[#3B2F2F] font-bold border border-[#D5C6B5]";
      mobileMenuBg = "bg-[#F4EFE6]/95 border-[#E6DFD3]";
      dropdownBg = "bg-[#FFFDF8] border-[#E6DFD3] shadow-lg text-[#5A4634]";
      aiButtonBg = "bg-[#EADDCD]/50 border-[#D5C6B5] hover:bg-[#EADDCD] text-[#5A4634]";
      break;
    case 2: // Dark Theme
      navClasses += "bg-[#111111]/90 border-[#222222] text-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.4)]";
      logoClass = "text-[#D4AF37] font-black tracking-widest"; 
      linkClass = "text-slate-400 hover:bg-[#222222] hover:text-white";
      activeLinkClass = "bg-[#222222] text-[#D4AF37] font-bold border border-[#333333]";
      mobileMenuBg = "bg-[#111111]/95 border-[#222222]";
      dropdownBg = "bg-[#1A1A1A] border-[#333333] shadow-2xl text-slate-300";
      aiButtonBg = "bg-[#1A1A1A] border-[#D4AF37]/40 hover:bg-[#222] text-[#D4AF37]";
      break;
    case 3: 
    default: // Bright Default
      navClasses += "bg-white/80 border-slate-200/60 text-slate-900";
      break;
  }

  return (
    <header className={navClasses} dir="rtl">
      <div className="container-shell">
        <nav className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="shrink-0 transition-transform active:scale-95 flex items-center">
            <Image src="/images/logo.jpg" alt="دارك" width={100} height={74} className="inline-block mr-2" />
          </Link>

          {/* Links Grid */}
          <ul className="hidden md:flex items-center gap-1">
            {allNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 ${
                    isActive(link.href) ? activeLinkClass : linkClass
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Left Control Bar */}
          <div className="flex items-center gap-3">
            
            {/* ── زر المساعد الذكي AI ── */}
            <Link 
              href="/ai-assistant" 
              className={`relative group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-300 shadow-sm ${aiButtonBg}`}
            >
              <span className="text-base group-hover:animate-pulse">✨</span>
              <span className="text-xs font-black hidden sm:block">المساعد الذكي</span>
              
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-white/50">
                AI
              </span>
            </Link>

            {isAuthenticated ? (
              <>
                <NotificationBell />
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-bold transition-all duration-300 focus:outline-none shadow-sm ${
                      templateId === 2 ? "border-[#333] bg-[#1A1A1A] text-slate-200 hover:bg-[#222]" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-[11px] font-bold text-white shadow-sm">
                      {initials}
                    </span>
                    <span className="hidden sm:block">{user?.firstName}</span>
                    <ChevronIcon className={`transition-transform duration-300 text-slate-400 ${dropdownOpen ? "rotate-180 text-indigo-500" : ""}`} />
                  </button>

                  {dropdownOpen && (
                    <div className={`absolute left-0 top-full z-50 mt-2.5 w-56 rounded-2xl border p-1.5 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200 ${dropdownBg}`}>
                      <div className={`border-b px-4 py-3 text-right ${templateId === 2 ? "border-[#333]" : "border-slate-100"}`}>
                        <p className={`text-sm font-black truncate ${templateId === 2 ? "text-white" : "text-slate-900"}`}>
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs truncate mt-1 text-slate-400">
                          {user?.email}
                        </p>
                      </div>

                      <div className="p-1 space-y-0.5">
                        <DropdownLink href="/dashboard" label="🎛️ لوحة التحكم" themeId={templateId} />
                        {!isAdmin && <DropdownLink href="/dashboard/announcements" label="📑 إعلاناتي العقارية" themeId={templateId} />}
                        <DropdownLink href="/dashboard/settings" label="⚙️ إعدادات الحساب" themeId={templateId} />

                        {isAdmin && (
                          <>
                            <div className={`my-1 border-t ${templateId === 2 ? "border-[#333]" : "border-slate-100"}`} />
                            <DropdownLink href="/dashboard/admin-users" label="إدارة المستخدمين 👥" accent themeId={templateId} />
                            <DropdownLink href="/dashboard/admin-roles" label="إدارة الصلاحيات 🔐" accent themeId={templateId} />
                            <DropdownLink href="/dashboard/admin-announcements" label="مراجعة الإعلانات 📝" accent themeId={templateId} />
                            <DropdownLink href="/dashboard/admin-subscriptions" label="اشتراكات الكاش 💰" accent themeId={templateId} />
                          </>
                        )}

                        <div className={`my-1 border-t ${templateId === 2 ? "border-[#333]" : "border-slate-100"}`} />
                        <button onClick={handleLogout} className="flex w-full items-center px-4 py-2.5 text-sm text-red-500 font-bold rounded-xl transition-colors hover:bg-red-50 hover:text-red-600 text-right">
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login" className={`rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 ${linkClass}`}>
                  تسجيل الدخول
                </Link>
                <Link href="/auth/register" className={`text-sm py-2 px-4 rounded-xl font-bold transition-all duration-300 shadow-md ${templateId === 2 ? "bg-[#D4AF37] text-black hover:bg-yellow-500 shadow-yellow-500/10" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/10"}`}>
                  إنشاء حساب
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl transition-all hover:bg-slate-100/80 focus:outline-none"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div className={`border-t pb-4 pt-2 md:hidden animate-in fade-in duration-200 ${mobileMenuBg}`}>
            <ul className="flex flex-col gap-1 px-2">
              {allNavLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={`block rounded-xl px-4 py-3 text-sm font-bold transition-colors ${linkClass}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                 <Link href="/ai-assistant" className={`block rounded-xl px-4 py-3 text-sm font-bold transition-colors ${linkClass}`}>
                    ✨ المساعد الذكي (AI)
                 </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

function DropdownLink({ href, label, accent = false, themeId }) {
  let defaultText = themeId === 2 ? "text-slate-300 hover:bg-[#222] hover:text-white" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900";
  let accentText = themeId === 2 ? "text-[#D4AF37] hover:bg-[#222]" : "text-indigo-600 font-bold hover:bg-indigo-50/60";
  
  return (
    <Link href={href} className={`block px-4 py-2.5 text-sm text-right font-semibold rounded-xl transition-all duration-200 ${accent ? accentText : defaultText}`}>
      {label}
    </Link>
  );
}

function MenuIcon() { return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>; }
function CloseIcon() { return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>; }
function ChevronIcon({ className }) { return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>; }