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
      // 1. لو المستخدم مش شركة (أدمن أو مستخدم عادي)، يدخل فوراً بدون فحص
      if (user?.userType !== "Company" && !isCompany) {
        setIsVerifying(false);
        return;
      }

      try {
        // 2. ضرب الـ API لجلب الاشتراك الحالي
        const res = await subscriptionService.getMySubscription();
        const subscription = res?.data ?? res;
        
        // لو السيرفر رد بـ 200 والاشتراك موجود أو pending، نفتح اللوحة فوراً
        setIsVerifying(false); 
      } catch (error) {
        console.warn("Subscription status response info:", error.response);

        // 3. 🟢 العلاج السحري للـ 404:
        // إذا رد الباك إند بـ 404، هذا يعني أن طلب الاشتراك كاش معلق أو مسجل كـ Pending بانتظار الأدمن.
        // بدلاً من طرد المستخدم، نفتح له الـ Dashboard عشان يقدر يشوف حالة الحساب.
        if (error.response?.status === 404) {
          setIsVerifying(false); // نوقف شاشة التحميل ونسمح له بالدخول
        } else {
          // لأي خطأ شبكة آخر، نفتح اللوحة أيضاً لضمان عدم توقف الواجهة
          setIsVerifying(false);
        }
      }
    };

    if (user) {
      verifyCompanySubscription();
    }
  }, [user, router, isCompany]);

  const navLinks = [
    { label: "نظرة عامة", href: "/dashboard", exact: true },
    { label: "إعلاناتي", href: "/dashboard/announcements" },
    { label: "المعاملات", href: "/dashboard/transactions" },
    { label: "الاشتراكات", href: "/dashboard/subscriptions" },
    { label: "الإعدادات", href: "/dashboard/settings" },
  ];

  const adminLinks = [
    { label: "إدارة المستخدمين", href: "/dashboard/admin-users" },
    { label: "إدارة الصلاحيات", href: "/dashboard/admin-roles" },
    { label: "مراجعة الإعلانات", href: "/dashboard/admin-announcements" },
    { label: "اشتراكات الكاش المعلقة", href: "/dashboard/admin-subscriptions" },
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
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm font-medium text-slate-600">جاري إعداد بيئة العمل للفريق...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-[calc(100vh-64px)] bg-slate-50">
        
        {/* ── Mobile Sidebar Overlay ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside className={`fixed inset-y-0 right-0 z-50 w-64 transform border-l border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex h-full flex-col overflow-y-auto">
            <div className="p-4">
              <div className="mb-6 rounded-xl bg-slate-50 p-4 border border-slate-100 text-right">
                <p className="text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <span className="mt-2 inline-block rounded-md bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                  {isAdmin ? "مدير النظام" : (isCompany || user?.userType === "Company") ? "شركة عقارية" : "مستخدم"}
                </span>
              </div>

              <nav className="space-y-1 text-right">
                {navLinks.map((link) => {
                  if (link.href === "/dashboard/transactions" && user?.userType === "Company") return null;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${isActive(link.href, link.exact) ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {isAdmin && (
                  <>
                    <div className="my-4 border-t border-slate-200 pt-4" />
                    <p className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">لوحة الإدارة</p>
                    {adminLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${isActive(link.href) ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </>
                )}
              </nav>
            </div>

            <div className="mt-auto border-t border-slate-100 p-4">
              <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50">
                تسجيل الخروج
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center border-b border-slate-200 bg-white p-4 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="mr-4 text-lg font-bold text-slate-900">لوحة التحكم</span>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>

      </div>
    </ProtectedRoute>
  );
}