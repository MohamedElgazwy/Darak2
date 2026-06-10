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
      return <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700 border border-emerald-100">✓ معتمد ونشط</span>;
    }
    if (status === "Pending" || status === 0) {
      return <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-1.5 text-[11px] font-black text-amber-700 border border-amber-100">⏳ تحت الفحص</span>;
    }
    return <span className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-1.5 text-[11px] font-black text-red-700 border border-red-100">✕ مرفوض</span>;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder-property.jpg";
    if (imagePath.startsWith("http") || imagePath.startsWith("data:")) return imagePath;
    if (imagePath.startsWith("/")) return `https://darak.runasp.net${imagePath}`;
    return `data:image/jpeg;base64,${imagePath}`;
  };

  const handleDisabledAction = () => {
    alert("هذا الإعلان قيد المراجعة أو تم رفضه، ولا يمكن اتخاذ أي إجراء (عرض، تعديل، حذف) حتى تتم الموافقة عليه من الإدارة.");
  };

  return (
    <div className="space-y-8 text-right animate-in fade-in slide-in-from-bottom-2 duration-400" dir="rtl">
      
      {/* ── الرأس والإجراء الأساسي ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">📑 المحفظة العقارية لإعلاناتي</h1>
          <p className="text-xs font-semibold text-slate-400">تتبع ومراقبة حالة مراجعة الوحدات المنشورة وتعديلها أولاً بأول.</p>
        </div>
        <Link href="/add-announcement" className="rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 flex items-center justify-center gap-2 py-3.5 px-6 text-xs font-black text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 transform active:scale-[0.99] w-full sm:w-fit">
          ➕ إضافة ونشر عقار جديد
        </Link>
      </div>

      {/* ── شريط التبويبات الفاخر (Tabs Filter) ── */}
      <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/40 shadow-inner">
        {[
          { value: "Pending", label: "⏳ قيد الانتظار" },
          { value: "Approved", label: "✅ تمت الموافقة" },
          { value: "Rejected", label: "❌ عقارات مرفوضة" }
        ].map((tab) => {
          const isCurrent = activeStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              className={`rounded-xl px-5 py-2.5 text-xs font-black transition-all duration-300 ${
                isCurrent 
                  ? "bg-white text-indigo-600 shadow-md border border-slate-200/10 scale-100" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/40 scale-95"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── صندوق الجدول وقائمة المعاينة ── */}
      <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-slate-600">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-black uppercase text-slate-900">
              <tr>
                <th className="px-6 py-4.5">تفاصيل الوحدة العقارية</th>
                <th className="px-6 py-4.5">القيمة المالية</th>
                <th className="px-6 py-4.5">الغرض التعاقدي</th>
                <th className="px-6 py-4.5">الحالة</th>
                <th className="px-6 py-4.5 text-center">التحكم والإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm" />
                      <p className="text-xs font-bold animate-pulse text-slate-400">جاري تحميل محفظتك العقارية الحصري...</p>
                    </div>
                  </td>
                </tr>
              ) : announcements.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-400 font-bold bg-slate-50/30">
                    <div className="text-3xl mb-2 opacity-50">📂</div>
                    <p className="text-xs font-black text-slate-400">لا توجد أي عقارات مدرجة ضمن هذا القسم حالياً.</p>
                  </td>
                </tr>
              ) : (
                announcements.map((item) => {
                  const currentItemStatus = item.status ?? activeStatus;
                  const isApproved = currentItemStatus === "Approved" || currentItemStatus === 1;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-5 font-bold text-slate-900">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm relative group">
                            <img
                              src={getImageUrl(item.primaryImage)}
                              alt={item.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Darak"; }}
                            />
                          </div>
                          <div className="space-y-0.5">
                            {isApproved ? (
                              <Link href={`/announcement/${item.id}`} className="hover:text-indigo-600 transition-colors font-black text-sm block tracking-tight">
                                {item.title}
                              </Link>
                            ) : (
                              <span className="font-black text-sm block text-slate-700 cursor-not-allowed">
                                {item.title}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400 font-bold block">📍 {item.city}، {item.address || ""}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-black text-slate-900 text-sm">
                        {item.price?.toLocaleString("ar-EG")} <span className="text-xs font-semibold text-slate-400 mr-0.5">ج.م</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex px-3 py-1 rounded-lg text-xs bg-slate-100 text-slate-700 font-black border border-slate-200/30 shadow-inner">
                          {item.purpose === "Sale" || item.purpose === "للبيع" ? "للبيع" : "للإيجار"}
                        </span>
                      </td>
                      <td className="px-6 py-5">{getStatusBadge(currentItemStatus)}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold">
                          
                          {isApproved ? (
                            <>
                              <Link href={`/announcement/${item.id}`} className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition shadow-sm">عرض</Link>
                              <Link href={`/edit-announcement/${item.id}`} className="px-3 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition shadow-sm">تعديل</Link>
                              <button onClick={() => handleDelete(item.id)} className="px-3 py-2 bg-red-50 border border-red-100 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition shadow-sm">حذف</button>
                            </>
                          ) : (
                            <>
                              <button onClick={handleDisabledAction} className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl cursor-not-allowed opacity-60 transition shadow-sm" title="غير متاح للعرض حالياً">عرض</button>
                              <button onClick={handleDisabledAction} className="px-2.5 py-2 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl cursor-not-allowed opacity-60 transition shadow-sm" title="غير متاح للتعديل حالياً">تعديل</button>
                              <button onClick={handleDisabledAction} className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl cursor-not-allowed opacity-60 transition shadow-sm" title="غير متاح للحذف حالياً">حذف</button>
                            </>
                          )}
                          
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}