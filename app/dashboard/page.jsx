// app/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { announcementService } from "../services";
import { subscriptionService } from "../services/subscription.service";

export default function DashboardOverview() {
  const { user, isCompany, isAdmin } = useAuth(); // استخراج isAdmin هنا للتحكم في الواجهة
  
  const [stats, setStats] = useState({
    activeAnnouncements: 0,
    packageName: "جاري التحميل...",
    pendingAdminCount: 0, // إضافة متغير لحساب الإعلانات المعلقة الخاصة بالأدمن
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        let totalAnnouncements = 0;
        let pendingCount = 0;

        // 🛠️ فحص الصلاحية لتحديد نوع الـ Endpoints المستدعاة
        if (isAdmin) {
          // الأدمن يرى إعلاناته الشخصية المرفوعة (لو رفع عقارات) + نلقي نظرة على العقارات المعلقة بانتظار مراجعته
          try {
            const myAnnRes = await announcementService.getMyAnnouncements({ PageNumber: 1 });
            totalAnnouncements = myAnnRes?.data?.totalCount || myAnnRes?.data?.items?.length || myAnnRes?.items?.length || 0;
            
            // جلب الإعلانات المعلقة بانتظار التفعيل ليعرف الأدمن كم طلب ينتظره
            const pendingRes = await announcementService.getAdminPaginated({ Status: "Pending", PageNumber: 1 });
            pendingCount = pendingRes?.data?.totalCount || pendingRes?.data?.items?.length || pendingRes?.items?.length || 0;
          } catch (e) {
            console.error(e);
          }
        } else {
          // الشركات والمستخدمين العاديين
          try {
            const myAnnRes = await announcementService.getMyAnnouncements({ PageNumber: 1 });
            const myDataContainer = myAnnRes?.data?.data || myAnnRes?.data || myAnnRes;
            totalAnnouncements = myDataContainer?.totalCount || myDataContainer?.items?.length || (Array.isArray(myDataContainer) ? myDataContainer.length : 0);
          } catch (err) {
            const annRes = await announcementService.getPaginated({ PageNumber: 1, PageSize: 100 });
            const allItems = annRes?.data?.items || annRes?.items || [];
            totalAnnouncements = allItems.filter(a => String(a.userId) === String(user?.id) || String(a.companyId) === String(user?.id)).length;
          }
        }

        let pkgName = "مستخدم عادي (مجاني)";

        // فحص باقة الشركة فقط إذا لم يكن مستخدم أدمن
        if (!isAdmin && (isCompany || user?.userType === "Company")) {
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
            pkgName = "قيد الانتظار / مراجعة الكاش ⏳";
          }
        }

        setStats({
          activeAnnouncements: totalAnnouncements,
          packageName: pkgName,
          pendingAdminCount: pendingCount,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user, isCompany, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

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

      {/* ── التوزيع الديناميكي للكروت بناء على نوع الحساب ── */}
      <div className={`grid grid-cols-1 gap-6 ${isAdmin ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        
        {/* كارت عدد الإعلانات */}
        <div className="surface-card p-6 border-r-4 border-r-indigo-600 bg-white border rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">إعلاناتك المرفوعة</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.activeAnnouncements}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* 🛠️ التحكم بالحقن البصري: لو هو أدمن، يرى كارت المهام المعلقة بانتظاره، ولو مستخدم يرى باقته */}
        {isAdmin ? (
          <div className="surface-card p-6 border-r-4 border-r-amber-500 bg-white border rounded-2xl shadow-sm">
            <div className="flex items-center gap-4 justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">إعلانات معلقة تنتظر مراجعتك</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pendingAdminCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="surface-card p-6 border-r-4 border-r-emerald-500 bg-white border rounded-2xl shadow-sm">
            <div className="flex items-center gap-4 justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">حالة الاشتراك / الباقة</p>
                <p className="text-base font-bold text-slate-900 mt-2 truncate max-w-[200px]">{stats.packageName}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}
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