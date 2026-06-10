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
        setIsVerifying(false);
      }
    };

    if (user) {
      verifyCompanySubscription();
    }
  }, [user, router, isCompany]);

  const navLinks = [
    { label: "🎛️ نظرة عامة", href: "/dashboard", exact: true },
    { label: "📑 إعلاناتي العقارية", href: "/dashboard/announcements" },
    { label: "🏢 عن الشركة", href: "/dashboard/profile-settings" },
    { label: "🛠️ خدمات الشركة", href: "/dashboard/company-services" },
    { label: "💳 المعاملات والطلبات", href: "/dashboard/transactions" },
    { label: "💎 باقة الاشتراك", href: "/dashboard/subscriptions" },
    { label: "⚙️ إعدادات الحساب", href: "/dashboard/settings" },
  ];

  const adminLinks = [
    { label: "👥 إدارة المستخدمين", href: "/dashboard/admin-users" },
    { label: "📊 تحليلات وإحصائيات", href: "/dashboard/admin-analytics" },
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
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent z-10" />
              <div className="absolute h-14 w-14 rounded-full border-4 border-indigo-100 animate-pulse" />
            </div>
            <p className="text-sm font-black text-slate-400 animate-pulse">جاري تفعيل وتهيئة بيئة العمل...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // متغير للتحقق هل المستخدم الحالي هو شركة
  const isUserCompany = isCompany || user?.userType === "Company";

  return (
    <ProtectedRoute>
      <div className="flex min-h-[calc(100vh-64px)] bg-[#f8fafc]" dir="rtl">
        
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden transition-all duration-300" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar UI Refactored */}
        <aside className={`fixed inset-y-0 right-0 z-50 w-64 transform border-l border-slate-200/60 bg-white/95 backdrop-blur-md transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex h-full flex-col justify-between overflow-y-auto p-5">
            <div className="space-y-6">
              
              {/* User Identity Header Card */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-5 shadow-lg text-right border border-slate-800 relative overflow-hidden group">
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />
                
                {/* 💡 عرض اسم الشركة لو كان حساب شركة، وإلا عرض اسم الشخص */}
                <p className="text-sm font-black text-white truncate" title={isUserCompany && user?.companyName ? user?.companyName : `${user?.firstName} ${user?.lastName}`}>
                  {isUserCompany && user?.companyName ? user.companyName : `${user?.firstName} ${user?.lastName}`}
                </p>

                {/* 💡 لو كان شركة، نعرض اسم المدير بخط أصغر */}
                {isUserCompany && user?.companyName && (
                  <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                    إدارة: {user?.firstName} {user?.lastName}
                  </p>
                )}

                <p className="text-[11px] text-indigo-300/80 truncate mt-1 font-semibold">{user?.email}</p>
                
                <div className="mt-4">
                  <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide bg-white/10 text-indigo-300 border border-white/5 backdrop-blur-md">
                    {isAdmin ? "👑 مدير النظام" : isUserCompany ? "🏢 شركة عقارية" : "👤 مستخدم عادى"}
                  </span>
                </div>
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
                      className={`group flex items-center rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                        active 
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 border-r-4 border-indigo-900 translate-x-[-2px]" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {isAdmin && (
                  <div className="pt-4 space-y-1 animate-in fade-in duration-500">
                    <div className="my-4 border-t border-slate-100" />
                    <p className="mb-2 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">لوحة المراقبة والإدارة</p>
                    {adminLinks.map((link) => {
                      const active = isActive(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                            active 
                              ? "bg-slate-950 text-white shadow-md border-r-4 border-[#D4AF37] translate-x-[-2px]" 
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
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

            {/* Logout Button */}
            <div className="border-t border-slate-100 pt-4 mt-6">
              <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100/80 text-red-600 px-4 py-3.5 text-sm font-black transition-all transform active:scale-[0.98]">
                🚪 تسجيل الخروج من الحساب
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area UI Revamped */}
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md p-4 lg:hidden sticky top-0 z-30 shadow-sm">
            <span className="text-base font-black text-slate-900">لوحة التحكم</span>
            <button onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 text-slate-600 bg-slate-50 border hover:bg-slate-100 transition">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
          <div className="p-4 sm:p-8 lg:p-10 max-w-6xl animate-in fade-in slide-in-from-bottom-2 duration-400">
            {children}
          </div>
        </main>

      </div>
    </ProtectedRoute>
  );
}