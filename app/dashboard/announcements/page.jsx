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
      // الاستدعاء المباشر للمسار: GET /API/Announcement/my
      const res = await api.get("/Announcement/my", {
        params: {
          Status: activeStatus,
          PageNumber: 1
        }
      });
      
      // ─── قنص المصفوفة بناءً على هيكل الـ JSON الفعلي ───
      // السيرفر يرجعها في: res.data.data.items
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
      setAnnouncements([]); // حماية الجدول عند حدوث أي خطأ أجاكس
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
      return <span className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">تم الموافقة</span>;
    }
    if (status === "Pending" || status === 0) {
      return <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">قيد الانتظار</span>;
    }
    return <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">مرفوض</span>;
  };

  // دالة تصحيح روابط الصور طبقاً لبيانات السيرفر الحالية
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/600x400?text=Darak+RealEstate";
    if (imagePath.startsWith("http") || imagePath.startsWith("data:")) return imagePath;
    if (imagePath.startsWith("/")) return `https://darak.runasp.net${imagePath}`;
    return `data:image/jpeg;base64,${imagePath}`;
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إعلاناتي العقارية</h1>
          <p className="mt-1 text-sm text-slate-500">إدارة العقارات التي قمت بعرضها وتتبع حالات مراجعتها.</p>
        </div>
        <Link href="/add-announcement" className="btn-primary flex items-center gap-2 py-2 text-sm w-fit">
          إضافة إعلان جديد
        </Link>
      </div>

      {/* التبويبات الثلاثة للتصفية */}
      <div className="flex gap-4 border-b border-slate-200">
        {[
          { value: "Pending", label: "قيد الانتظار" },
          { value: "Approved", label: "تمت الموافقة" },
          { value: "Rejected", label: "مرفوضة" }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeStatus === tab.value ? "border-indigo-600 text-indigo-600 font-bold" : "border-transparent text-slate-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="surface-card overflow-hidden bg-white rounded-2xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-900 border-b">
              <tr>
                <th className="px-6 py-4">العقار</th>
                <th className="px-6 py-4">السعر</th>
                <th className="px-6 py-4">الغرض</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
                  </td>
                </tr>
              ) : announcements.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    لا توجد عقارات مسجلة في هذا التصنيف حالياً.
                  </td>
                </tr>
              ) : (
                announcements.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100 border">
                          <img
                            src={getImageUrl(item.primaryImage)}
                            alt={item.title}
                            className="h-full w-full object-cover"
                            onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Darak+RealEstate"; }}
                          />
                        </div>
                        <div>
                          <Link href={`/announcement/${item.id}`} className="hover:text-indigo-600 transition font-bold block">
                            {item.title}
                          </Link>
                          <span className="text-xs text-slate-500">{item.city}، {item.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.price?.toLocaleString("ar-EG")} ج.م</td>
                    <td className="px-6 py-4">{item.purpose === "Sale" || item.purpose === "للبيع" ? "للبيع" : "للإيجار"}</td>
                    <td className="px-6 py-4">{getStatusBadge(item.status ?? activeStatus)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/announcement/${item.id}`} className="text-indigo-600 hover:text-indigo-700 font-medium">عرض</Link>
                        <Link href={`/edit-announcement/${item.id}`} className="text-blue-600 hover:text-blue-700 font-medium">تعديل</Link>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700 font-medium">حذف</button>
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