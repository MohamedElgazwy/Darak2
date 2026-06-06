// app/components/layout/Navbar.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import NotificationBell from "../NotificationBell";
import { useCompanyTheme } from "@/app/context/CompanyThemeContext";

const PUBLIC_LINKS = [
  { label: "الرئيسية", href: "/" },
  { label: "البحث", href: "/search" },
];

const AUTH_USER_LINKS = [
  { label: "إضافة إعلان", href: "/add-announcement" },
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isCompany, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // استدعاء الثيم الخاص بالشركة لتغيير ألوان الـ Navbar
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

  // ─── تخصيص ألوان الـ Navbar بناءً على القالب ───
  let navClasses = "sticky top-0 z-50 border-b backdrop-blur-md text-right transition-all duration-500 ";
  let logoClass = "text-indigo-600";
  let linkClass = "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
  let mobileMenuBg = "bg-white border-slate-100";
  let dropdownBg = "bg-white border-slate-200 text-slate-700";

  switch (templateId) {
    case 1: // Classic
      navClasses += "bg-[#F4EFE6]/95 border-[#E6DFD3] text-[#3B2F2F]";
      logoClass = "text-[#5A4634]";
      linkClass = "text-[#5A4634] hover:bg-[#EADDCD] hover:text-[#3B2F2F]";
      mobileMenuBg = "bg-[#F4EFE6] border-[#E6DFD3]";
      dropdownBg = "bg-[#FFFDF8] border-[#E6DFD3] text-[#5A4634]";
      break;
    case 2: // Dark
      navClasses += "bg-[#111111]/95 border-[#222222] text-slate-200";
      logoClass = "text-[#D4AF37]"; // ذهبي
      linkClass = "text-slate-300 hover:bg-[#222222] hover:text-white";
      mobileMenuBg = "bg-[#111111] border-[#222222]";
      dropdownBg = "bg-[#1A1A1A] border-[#333333] text-slate-300";
      break;
    case 3: // Bright & Default
    default:
      navClasses += "bg-white/90 border-slate-200 text-slate-900";
      break;
  }

  return (
    <header className={navClasses} dir="rtl">
      <div className="container-shell">
        <nav className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className={`text-2xl font-bold shrink-0 transition-colors ${logoClass}`}>
            دارك
          </Link>

          <ul className="hidden md:flex items-center gap-1">
            {allNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive(link.href) ? "font-bold opacity-100" : `opacity-80 ${linkClass}`
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium transition focus:outline-none ${
                      templateId === 2 ? "border-[#333] hover:bg-[#222]" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                      {initials}
                    </span>
                    <span className="hidden sm:block">{user?.firstName}</span>
                    <ChevronIcon className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {dropdownOpen && (
                    <div className={`absolute left-0 top-full z-50 mt-2 w-52 rounded-xl border py-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 ${dropdownBg}`}>
                      <div className={`border-b px-4 py-3 text-right ${templateId === 2 ? "border-[#333]" : "border-slate-100"}`}>
                        <p className={`text-sm font-bold ${templateId === 2 ? "text-white" : "text-slate-900"}`}>
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className={`text-xs truncate mt-0.5 ${templateId === 2 ? "text-slate-400" : "text-slate-500"}`}>
                          {user?.email}
                        </p>
                      </div>

                      <DropdownLink href="/dashboard" label="لوحة التحكم" themeId={templateId} />
                      {!isAdmin && <DropdownLink href="/dashboard/announcements" label="إعلاناتي العقارية" themeId={templateId} />}
                      <DropdownLink href="/dashboard/settings" label="إعدادات الحساب" themeId={templateId} />

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
                      <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-sm text-red-500 transition hover:bg-red-50 hover:text-red-600 text-right font-medium">
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login" className={`rounded-lg px-4 py-2 text-sm font-medium transition ${linkClass}`}>
                  تسجيل الدخول
                </Link>
                <Link href="/auth/register" className={`text-sm py-2 px-4 rounded-xl font-semibold transition ${templateId === 2 ? "bg-[#D4AF37] text-black hover:bg-yellow-500" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
                  إنشاء حساب
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg transition focus:outline-none"
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
                  <Link href={link.href} className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${linkClass}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

function DropdownLink({ href, label, accent = false, themeId }) {
  let defaultText = themeId === 2 ? "text-slate-300 hover:bg-[#222] hover:text-white" : "text-slate-700 hover:bg-slate-50";
  let accentText = themeId === 2 ? "text-[#D4AF37] hover:bg-[#222]" : "text-indigo-600 font-semibold hover:bg-slate-50";
  
  return (
    <Link href={href} className={`block px-4 py-2 text-sm text-right transition ${accent ? accentText : defaultText}`}>
      {label}
    </Link>
  );
}

function MenuIcon() { return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>; }
function CloseIcon() { return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>; }
function ChevronIcon({ className }) { return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>; }