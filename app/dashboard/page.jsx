"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { announcementService } from "../services";
import { subscriptionService } from "../services/subscription.service";

export default function DashboardOverview() {
  const { user, isCompany, isAdmin } = useAuth(); 
  
  const [stats, setStats] = useState({
    activeAnnouncements: 0,
    packageName: "جاري التحميل...",
    pendingAdminCount: 0, 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        let totalAnnouncements = 0;
        let pendingCount = 0;

        if (isAdmin) {
          try {
            const myAnnRes = await announcementService.getMyAnnouncements({ PageNumber: 1 });
            totalAnnouncements = myAnnRes?.data?.totalCount || myAnnRes?.data?.items?.length || myAnnRes?.items?.length || 0;
            
            const pendingRes = await announcementService.getAdminPaginated({ Status: "Pending", PageNumber: 1 });
            pendingCount = pendingRes?.data?.totalCount || pendingRes?.data?.items?.length || pendingRes?.items?.length || 0;
          } catch (e) {
            console.error(e);
          }
        } else {
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
      <div className="min-h-[50vh] flex items-center justify-center bg-transparent">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-right animate-in fade-in duration-300" dir="rtl">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          مرحباً، {user?.firstName} 👋
        </h1>
        <p className="mt-1.5 text-sm font-medium text-slate-400">
          إليك نظرة شاملة وتحليل سريع لنشاطات حسابك العقاري في منصة دارك.
        </p>
      </div>

      {/* ── كروت الإحصائيات الفاخرة (Premium Cards) ── */}
      <div className={`grid grid-cols-1 gap-6 ${isAdmin ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        
        {/* كارت 1: الإعلانات المرفوعة */}
        <div className="relative group overflow-hidden bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-200">
          <div className="absolute top-0 right-0 h-full w-1.5 bg-indigo-600" />
          <div className="flex items-center gap-4 justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">إعلاناتك المرفوعة</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.activeAnnouncements}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/50 shadow-inner">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* كارت 2 الديناميكي: للأدمن أو المستخدمين */}
        {isAdmin ? (
          <div className="relative group overflow-hidden bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-200">
            <div className="absolute top-0 right-0 h-full w-1.5 bg-amber-500" />
            <div className="flex items-center gap-4 justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">إعلانات معلقة بانتظارك</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.pendingAdminCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100/50 shadow-inner">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative group overflow-hidden bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:border-emerald-200">
            <div className="absolute top-0 right-0 h-full w-1.5 bg-emerald-500" />
            <div className="flex items-center gap-4 justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">حالة الباقة والاشتراك</p>
                <p className="text-lg font-black text-slate-800 tracking-tight mt-1 line-clamp-1 max-w-[180px]">{stats.packageName}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 shadow-inner">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── قسم الإجراءات السريعة (Quick Actions) ── */}
      <div className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
          <span className="text-lg">⚡</span>
          <h2 className="text-base font-black text-slate-900 tracking-tight">إجراءات سريعة ومباشرة</h2>
        </div>
        <div className="flex flex-wrap gap-3.5">
          <Link href="/add-announcement" className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 px-6 text-xs font-bold text-white shadow-md shadow-indigo-600/10 hover:from-indigo-700 hover:to-indigo-800 transition-all transform active:scale-[0.99]">
            ➕ إضافة وإدراج عقار جديد
          </Link>
          <Link href="/dashboard/settings" className="rounded-xl bg-slate-50 border border-slate-200/80 py-3 px-6 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all transform active:scale-[0.99]">
            ⚙️ تعديل بيانات الملف التعريفي
          </Link>
        </div>
      </div>
    </div>
  );
}