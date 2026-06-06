// app/dashboard/layout.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { subscriptionService } from "../services/subscription.service";
import { ProtectedRoute } from "../lib/guards";

export default function DashboardLayout({ children }) {
  const { user, isAdmin, isCompany, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyCompanySubscription = async () => {
      if (user?.userType !== "Company" && !isCompany) {
        setIsVerifying(false);
        return;
      }
      try {
        await subscriptionService.getMySubscription();
        setIsVerifying(false); 
      } catch (error) {
        console.warn("Subscription status response info:", error.response);
        if (error.response?.status === 404) {
          setIsVerifying(false); 
        } else {
          setIsVerifying(false);
        }
      }
    };

    if (user) {
      verifyCompanySubscription();
    }
  }, [user, router, isCompany]);

  const navLinks = [
    { label: "🎛️ نظرة عامة", href: "/dashboard", exact: true },
    { label: "📑 إعلاناتي العقارية", href: "/dashboard/announcements" },
    { label: "💳 المعاملات والطلبات", href: "/dashboard/transactions" },
    { label: "💎 باقة الاشتراك", href: "/dashboard/subscriptions" },
    { label: "⚙️ إعدادات الحساب", href: "/dashboard/settings" },
  ];

  const adminLinks = [
    { label: "👥 إدارة المستخدمين", href: "/dashboard/admin-users" },
    { label: "🔐 إدارة الصلاحيات والأدوار", href: "/dashboard/admin-roles" },
    { label: "📝 مراجعة وفحص الإعلانات", href: "/dashboard/admin-announcements" },
    { label: "💰 اشتراكات الكاش المعلقة", href: "/dashboard/admin-subscriptions" },
  ];

  const isActive = (href, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && pathname !== "/dashboard";
  };

  if (isVerifying) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              <div className="absolute h-14 w-14 rounded-full border-4 border-indigo-100 animate-pulse -z-10" />
            </div>
            <p className="text-sm font-bold text-slate-500">جاري تفعيل وتهيئة بيئة العمل...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-[calc(100vh-64px)] bg-slate-50/50" dir="rtl">
        
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-all" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar UI Refactored */}
        <aside className={`fixed inset-y-0 right-0 z-50 w-64 transform border-l border-slate-200/80 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex h-full flex-col justify-between overflow-y-auto p-4">
            <div className="space-y-6">
              {/* User Identity Header Card */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-4 shadow-md text-right border border-slate-800 relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                <p className="text-sm font-black text-white truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-400 truncate mt-1">{user?.email}</p>
                <span className="mt-3 inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {isAdmin ? "مدير النظام" : (isCompany || user?.userType === "Company") ? "شركة عقارية" : "مستخدم عادى"}
                </span>
              </div>

              {/* Navigation Router Links */}
              <nav className="space-y-1 text-right">
  {navLinks.map((link) => {
    if (link.href === "/dashboard/transactions" && user?.userType === "Company") return null;
    const active = isActive(link.href, link.exact);
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => setSidebarOpen(false)}
        className={`block rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
          active 
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 border-r-4 border-indigo-800" 
            : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
        }`}
      >
        {link.label}
      </Link>
    );
  })}

  {/* ── هنا تم إصلاح السنتاكس بشكل سليم ── */}
  {isAdmin && (
    <div className="pt-4 space-y-1 animate-in fade-in duration-300">
      <div className="my-3 border-t border-slate-200/60" />
      <p className="mb-2 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">لوحة المراقبة والإدارة</p>
      {adminLinks.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setSidebarOpen(false)}
            className={`block rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
              active 
                ? "bg-slate-950 text-white shadow-md border-r-4 border-[#D4AF37]" 
                : "text-slate-500 hover:bg-slate-100/70 hover:text-slate-900"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  )}
</nav>
            </div>

            {/* Logout Trigger under bottom bounding box */}
            <div className="border-t border-slate-100 pt-4">
              <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 text-sm font-bold transition-all duration-200 transform active:scale-95">
                🚪 تسجيل الخروج من الحساب
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area UI Revamped */}
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md p-4 lg:hidden sticky top-0 z-30">
            <span className="text-base font-black text-slate-900">لوحة التحكم</span>
            <button onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 text-slate-600 bg-slate-50 border hover:bg-slate-100 transition">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl animate-in fade-in duration-300">
            {children}
          </div>
        </main>

      </div>
    </ProtectedRoute>
  );
}