"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { announcementService } from "@/app/services";
import { AdminRoute } from "@/app/lib/guards";

const STATUS_TABS = [
  { value: "Pending", label: "قيد المراجعة" },
  { value: "Approved", label: "مقبولة" },
  { value: "Rejected", label: "مرفوضة" },
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
      <div className="space-y-6 text-right" dir="rtl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">مراجعة الإعلانات</h1>
          <p className="mt-1 text-sm text-slate-500">إدارة ومراجعة العقارات المضافة من قبل مستخدمي دارك.</p>
        </div>

        <div className="flex gap-2 border-b border-slate-200">
          {STATUS_TABS.map((tab) => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.value ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-900">
                <tr>
                  <th className="px-6 py-4">العقار</th>
                  <th className="px-6 py-4">النوع / الغرض</th>
                  <th className="px-6 py-4">السعر</th>
                  <th className="px-6 py-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">جاري التحميل...</td></tr>
                ) : announcements.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">لا توجد عقارات في هذا التصنيف.</td></tr>
                ) : (
                  announcements.map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <Link href={`/announcement/${item.id}`} className="hover:text-indigo-600 hover:underline">{item.title}</Link>
                        <div className="text-xs text-slate-500">{item.city}</div>
                      </td>
                      <td className="px-6 py-4">{item.propertyType} - {item.purpose === "Sale" ? "للبيع" : "للإيجار"}</td>
                      <td className="px-6 py-4">{item.price?.toLocaleString("ar-EG")} ج.م</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {activeTab !== "Approved" && (
                            <button onClick={() => handleChangeStatus(item.id, "Approved")} className="font-medium text-green-600 hover:text-green-700">قبول</button>
                          )}
                          {activeTab !== "Rejected" && (
                            <button onClick={() => handleChangeStatus(item.id, "Rejected")} className="font-medium text-red-600 hover:text-red-700">رفض</button>
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