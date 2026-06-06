// app/dashboard/announcements/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/app/services/api";

export default function MyAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("Pending");

  const fetchMyAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/Announcement/my", {
        params: { Status: activeStatus, PageNumber: 1 }
      });
      
      const dataContainer = res?.data?.data || res?.data || res;
      let finalArray = [];

      if (dataContainer && Array.isArray(dataContainer.items)) {
        finalArray = dataContainer.items;
      } else if (Array.isArray(dataContainer)) {
        finalArray = dataContainer;
      } else if (dataContainer && Array.isArray(dataContainer.data)) {
        finalArray = dataContainer.data;
      }

      setAnnouncements(finalArray);
    } catch (error) {
      console.error("Failed to fetch my announcements:", error);
      setAnnouncements([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAnnouncements();
  }, [activeStatus]);

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا الإعلان نهائياً؟")) return;
    try {
      await api.delete(`/Announcement/${id}`);
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      alert(error.response?.data?.message || "حدث خطأ أثناء محاولة الحذف.");
    }
  };

  const getStatusBadge = (status) => {
    if (status === "Approved" || status === 1) {
      return <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-100/60">✓ معتمد ونشط</span>;
    }
    if (status === "Pending" || status === 0) {
      return <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-100/60">⏳ تحت الفحص</span>;
    }
    return <span className="rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 border border-red-100/60">✕ مرفوض</span>;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/600x400?text=Darak+RealEstate";
    if (imagePath.startsWith("http") || imagePath.startsWith("data:")) return imagePath;
    if (imagePath.startsWith("/")) return `https://darak.runasp.net${imagePath}`;
    return `data:image/jpeg;base64,${imagePath}`;
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-300" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">📑 المحفظة العقارية لإعلاناتي</h1>
          <p className="mt-1 text-xs font-semibold text-slate-400">تتبع ومراقبة حالة مراجعة الوحدات المنشورة وتعديلها أولاً بأول.</p>
        </div>
        <Link href="/add-announcement" className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 py-2.5 text-xs w-full sm:w-fit font-bold shadow-md shadow-indigo-600/10">
          ➕ إضافة ونشر عقار جديد
        </Link>
      </div>

      {/* Tabs Filter Module */}
      <div className="flex gap-2 bg-slate-100/80 border p-1 rounded-2xl w-fit shadow-inner">
        {[
          { value: "Pending", label: "⏳ قيد الانتظار" },
          { value: "Approved", label: "✅ تمت الموافقة" },
          { value: "Rejected", label: "❌ عقارات مرفوضة" }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 ${
              activeStatus === tab.value 
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200/20" 
                : "text-slate-50 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Corporate Table Render Box */}
      <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-slate-600">
            <thead className="bg-slate-50 border-b text-xs font-bold uppercase text-slate-900">
              <tr>
                <th className="px-6 py-4">تفاصيل الوحدة العقارية</th>
                <th className="px-6 py-4">القيمة المالية</th>
                <th className="px-6 py-4">الغرض التعاقدي</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-center">التحكم والإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex justify-center mb-2"><div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
                    جاري تحميل محفظتك العقارية...
                  </td>
                </tr>
              ) : announcements.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold">📂 لا توجد أي عقارات مدرجة ضمن هذا القسم حالياً.</td></tr>
              ) : (
                announcements.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 shrink-0 overflow-hidden rounded-xl border shadow-sm bg-slate-50">
                          <img
                            src={getImageUrl(item.primaryImage)}
                            alt={item.title}
                            className="h-full w-full object-cover"
                            onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Darak"; }}
                          />
                        </div>
                        <div>
                          <Link href={`/announcement/${item.id}`} className="hover:text-indigo-600 transition font-black text-sm block">
                            {item.title}
                          </Link>
                          <span className="text-[11px] text-slate-400 font-medium block mt-0.5">📍 {item.city}، {item.address || ""}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-950">{item.price?.toLocaleString("ar-EG")} <span className="text-xs font-normal text-slate-400">ج.م</span></td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs bg-slate-50 text-slate-600 font-bold border border-slate-200/40">
                        {item.purpose === "Sale" || item.purpose === "للبيع" ? "للبيع" : "للإيجار"}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(item.status ?? activeStatus)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2.5 text-xs font-bold">
                        <Link href={`/announcement/${item.id}`} className="px-2.5 py-1.5 bg-slate-50 border text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-sm">عرض</Link>
                        <Link href={`/edit-announcement/${item.id}`} className="px-2.5 py-1.5 bg-indigo-50 border text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition shadow-sm">تعديل</Link>
                        <button onClick={() => handleDelete(item.id)} className="px-2.5 py-1.5 bg-red-50 border text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition shadow-sm">حذف</button>
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
  );
}