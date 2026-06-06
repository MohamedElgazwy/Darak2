"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { announcementService } from "../services";
import { subscriptionService } from "../services/subscription.service";

export default function DashboardOverview() {
  const { user, isCompany } = useAuth();
  
  const [stats, setStats] = useState({
    activeAnnouncements: 0,
    packageName: "جاري التحميل...",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. جلب عدد الإعلانات العقارية
        const annRes = await announcementService.getPaginated({ PageNumber: 1 });
        const totalAnnouncements = annRes?.data?.totalCount || annRes?.data?.items?.length || annRes?.items?.length || 0;

        let pkgName = "مستخدم عادي (مجاني)";

        // 2. فحص حالة اشتراك الشركة بأمان تام ضد الـ 404
        if (isCompany || user?.userType === "Company") {
          try {
            const subRes = await subscriptionService.getMySubscription();
            
            const subData = subRes?.data || subRes?.result || subRes;
            const activeSub = Array.isArray(subData) ? subData[0] : subData;

            if (activeSub && (activeSub.package || activeSub.packageName || activeSub.Package)) {
              pkgName = activeSub.package?.name || activeSub.packageName || activeSub.Package?.Name || "باقة مفعلة";
            } else if (activeSub && (activeSub.id || activeSub.Id)) {
              pkgName = "باقة مفعلة (نشطة)";
            } else {
              pkgName = "قيد الانتظار / مراجعة الكاش";
            }
          } catch (e) {
            // 🟢 هنا سر العلاج: لو السيرفر رجع 404 أو أي خطأ، لا نضرب كراش للـ Dashboard
            // نغير اسم الباقة فقط لتوضيح الحالة ونترك الصفحة تعمل بسلاسة
            console.warn("Subscription not active yet or pending cash activation.");
            pkgName = "قيد الانتظار / مراجعة الكاش ⏳";
          }
        }

        setStats({
          activeAnnouncements: totalAnnouncements,
          packageName: pkgName,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user, isCompany]);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          مرحباً، {user?.firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          إليك نظرة سريعة على حسابك ونشاطاتك الأخيرة في منصة دارك.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* كارت عدد الإعلانات */}
        <div className="surface-card p-6 border-r-4 border-r-indigo-600 bg-white border rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">إعلاناتك المرفوعة</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? "..." : stats.activeAnnouncements}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* كارت حالة الاشتراك المطور والمحمي من الكراش */}
        <div className="surface-card p-6 border-r-4 border-r-emerald-500 bg-white border rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">حالة الاشتراك / الباقة</p>
              <p className="text-base font-bold text-slate-900 mt-2 truncate max-w-[200px]">
                {loading ? "جاري الفحص..." : stats.packageName}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* إجراءات سريعة */}
      <div className="surface-card p-6 mt-8 bg-white border rounded-2xl shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/add-announcement" className="btn-primary py-2.5 px-5 text-sm bg-indigo-600 text-white rounded-xl font-semibold">
            + إضافة إعلان جديد
          </Link>
          <Link href="/dashboard/settings" className="btn-secondary py-2.5 px-5 text-sm bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-medium">
            تعديل الملف الشخصي
          </Link>
        </div>
      </div>
    </div>
  );
}