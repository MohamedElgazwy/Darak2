"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { announcementService } from "@/app/services";
import { AdminRoute } from "@/app/lib/guards";

const STATUS_TABS = [
  { value: "Pending", label: "⏳ قيد المراجعة" },
  { value: "Approved", label: "✅ معتمدة ومقبولة" },
  { value: "Rejected", label: "❌ مرفوضة حالياً" },
];

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await announcementService.getAdminPaginated({
        Status: activeTab,
        PageNumber: 1,
      });
      setAnnouncements(res?.data?.items || res?.items || res?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [activeTab]);

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await announcementService.changeStatus({ id: parseInt(id), status: newStatus });
      fetchAnnouncements(); 
    } catch (error) {
      alert("حدث خطأ أثناء تغيير حالة الإعلان");
    }
  };

  return (
    <AdminRoute>
      <div className="space-y-8 text-right animate-in fade-in duration-300" dir="rtl">
        <div className="border-b border-slate-200/60 pb-5">
          <h1 className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-3">
            <span className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-lg shadow-inner">📝</span> مراجعة الإعلانات العقارية
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-400">إدارة وفحص دقة العقارات المعروضة من مستخدمي المنصة قبل النشر العام للجمهور.</p>
        </div>

        {/* Status Filtering Tabs UI */}
        <div className="inline-flex p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/40 shadow-inner">
          {STATUS_TABS.map((tab) => {
            const isSelected = activeTab === tab.value;
            return (
              <button 
                key={tab.value} 
                onClick={() => setActiveTab(tab.value)} 
                className={`rounded-xl px-5 py-2.5 text-xs font-black transition-all duration-300 ${
                  isSelected 
                    ? "bg-white text-indigo-600 shadow-md border border-slate-200/10 scale-100" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 scale-95"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Table Wrapper Component */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/70 rounded-[2rem] overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-5">العقار والعنوان</th>
                  <th className="px-6 py-5">النوع / الغرض</th>
                  <th className="px-6 py-5">القيمة المالية</th>
                  <th className="px-6 py-5 text-center">اتخاذ إجراء فوري</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-slate-400">
                      <div className="flex flex-col justify-center items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm" />
                        <p className="text-xs font-bold animate-pulse text-slate-400">جاري فحص العقارات المتاحة بالمستودع...</p>
                      </div>
                    </td>
                  </tr>
                ) : announcements.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-slate-400 font-bold bg-slate-50/30">
                      <div className="text-4xl mb-3 opacity-40">📭</div>
                      <p className="text-sm font-black text-slate-500">لا توجد أي عقارات مدرجة ضمن هذا التصنيف حالياً.</p>
                    </td>
                  </tr>
                ) : (
                  announcements.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-slate-50/60 group">
                      <td className="px-6 py-5">
                        <Link href={`/announcement/${item.id}`} className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors block text-sm tracking-tight mb-1">
                          {item.title}
                        </Link>
                        <span className="text-[11px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-md inline-block">📍 {item.city}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex px-3 py-1 rounded-lg text-xs bg-indigo-50 text-indigo-700 font-black border border-indigo-100/50 shadow-inner">
                          {item.propertyType} • {item.purpose === "Sale" ? "للبيع" : "للإيجار"}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-black text-slate-900 text-sm">
                        {item.price?.toLocaleString("ar-EG")} <span className="text-xs font-semibold text-slate-400">ج.م</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3 text-xs font-bold">
                          {activeTab !== "Approved" && (
                            <button onClick={() => handleChangeStatus(item.id, "Approved")} className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md transform active:scale-95">✅ تفعيل</button>
                          )}
                          {activeTab !== "Rejected" && (
                            <button onClick={() => handleChangeStatus(item.id, "Rejected")} className="px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md transform active:scale-95">❌ رفض</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}