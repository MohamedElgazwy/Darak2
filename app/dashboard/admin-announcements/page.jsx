// app/dashboard/admin-announcements/page.jsx
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
      <div className="space-y-6 text-right animate-in fade-in duration-300" dir="rtl">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">📝 مراجعة وفحص الإعلانات العقارية</h1>
          <p className="mt-1 text-xs font-semibold text-slate-400">إدارة وفحص دقة العقارات المعروضة من مستخدمي المنصة قبل النشر العام.</p>
        </div>

        {/* Status Filtering Tabs UI */}
        <div className="flex gap-2 bg-slate-100/80 border p-1 rounded-2xl w-fit shadow-inner">
          {STATUS_TABS.map((tab) => {
            const isSelected = activeTab === tab.value;
            return (
              <button 
                key={tab.value} 
                onClick={() => setActiveTab(tab.value)} 
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 ${
                  isSelected 
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/20" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Table Wrapper Component */}
        <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.01)]">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase text-slate-900">
                <tr>
                  <th className="px-6 py-4">العقار والعنوان</th>
                  <th className="px-6 py-4">النوع / الغرض</th>
                  <th className="px-6 py-4">القيمة المالية</th>
                  <th className="px-6 py-4 text-center">اتخاذ إجراء فوري</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                      <div className="flex justify-center mb-2"><div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
                      جاري فحص العقارات المتاحة...
                    </td>
                  </tr>
                ) : announcements.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-bold">
                      📭 لا توجد أي عقارات مدرجة ضمن هذا التصنيف حالياً.
                    </td>
                  </tr>
                ) : (
                  announcements.map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <Link href={`/announcement/${item.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition block">
                          {item.title}
                        </Link>
                        <span className="text-[11px] text-slate-400 font-medium mt-0.5 inline-block">📍 {item.city}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-700 font-bold border border-slate-200/40">
                          {item.propertyType} • {item.purpose === "Sale" ? "للبيع" : "للإيجار"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">
                        {item.price?.toLocaleString("ar-EG")} <span className="text-xs font-normal text-slate-400">ج.م</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2.5 text-xs font-bold">
                          {activeTab !== "Approved" && (
                            <button onClick={() => handleChangeStatus(item.id, "Approved")} className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-200 shadow-sm">قبول وتفعيل</button>
                          )}
                          {activeTab !== "Rejected" && (
                            <button onClick={() => handleChangeStatus(item.id, "Rejected")} className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm">رفض وحجب</button>
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