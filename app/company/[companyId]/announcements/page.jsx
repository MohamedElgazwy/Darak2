"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CompanyAnnouncementsPage() {
  const params = useParams();
  const companyId = params?.companyId;

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchCompanyAnnouncements = async () => {
      setLoading(true);
      try {
        // جلب صفحة أولى بعدد مناسب ثم فلترة حسب companyId أو userId
        const res = await (await import("@/app/services")).announcementService.getPaginated({ PageNumber: 1, PageSize: 50 });
        const responseData = res?.data || res;
        const items = responseData?.items || [];
        const filtered = items.filter(a => String(a.companyId) === String(companyId) || String(a.userId) === String(companyId));
        setAnnouncements(filtered);
      } catch (e) {
        console.error("Failed to fetch company announcements:", e);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyAnnouncements();
  }, [companyId]);

  // دالة لتصفية الإعلانات بناءً على البحث والنوع
  const filteredAnnouncements = announcements.filter((item) => {
    const title = item?.title || item?.titles || "";
    const location = item?.location || item?.address || "";
    const matchSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === "all" || (item?.type === filterType);
    return matchSearch && matchType;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent opacity-50"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      
      {/* ── 1. رأس الصفحة ── */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-black tracking-tight drop-shadow-sm">إعلاناتنا العقارية</h1>
        <p className="opacity-70 text-lg">
          تصفح أحدث العقارات المتاحة للبيع أو الإيجار. استخدم الفلاتر للوصول السريع لما تبحث عنه.
        </p>
      </div>

      {/* ── 2. شريط البحث والفلترة ── */}
      <div className="flex flex-col md:flex-row gap-4 bg-current bg-opacity-5 p-4 rounded-3xl border border-current border-opacity-10">
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 right-4 flex items-center opacity-50">🔍</span>
          <input 
            type="text" 
            placeholder="ابحث باسم العقار أو الموقع..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border border-current border-opacity-20 rounded-2xl py-3 pr-12 pl-4 outline-none focus:border-opacity-50 transition-colors placeholder-current placeholder-opacity-50"
          />
        </div>
        
        <div className="w-full md:w-64">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-transparent border border-current border-opacity-20 rounded-2xl py-3 px-4 outline-none focus:border-opacity-50 transition-colors cursor-pointer appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "left 1rem top 50%", backgroundSize: "0.65rem auto" }}
          >
            <option value="all" className="text-slate-900">كل العقارات</option>
            <option value="villa" className="text-slate-900">فيلات</option>
            <option value="apartment" className="text-slate-900">شقق</option>
          </select>
        </div>
      </div>

      {/* ── 3. شبكة الإعلانات (Grid) ── */}
      {filteredAnnouncements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAnnouncements.map((estate) => (
            <div 
              key={estate.id} 
              className="group border border-current border-opacity-10 rounded-3xl overflow-hidden hover:border-opacity-30 hover:-translate-y-1 transition-all duration-300 flex flex-col bg-current bg-opacity-[0.02]"
            >
              {/* صورة العقار */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={estate.image} 
                  alt={estate.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm">
                  متاح للبيع
                </div>
              </div>

              {/* تفاصيل العقار */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-2 line-clamp-1">{estate.title}</h3>
                <p className="opacity-70 text-sm mb-4 flex items-center gap-1.5">
                  <span className="opacity-80">📍</span> {estate.location}
                </p>
                
                {/* الإحصائيات */}
                <div className="flex items-center justify-between opacity-80 text-sm mb-6 border-y border-current border-opacity-10 py-3">
                  <div className="flex items-center gap-1.5"><span className="opacity-80">🛏️</span> {estate.beds}</div>
                  <div className="flex items-center gap-1.5"><span className="opacity-80">🛁</span> {estate.baths}</div>
                  <div className="flex items-center gap-1.5"><span className="opacity-80">📐</span> {estate.area} م²</div>
                </div>

                {/* السعر والزر */}
                <div className="mt-auto flex items-center justify-between">
                  <div className="font-black text-xl tracking-tight">
                    {estate.price} <span className="text-sm opacity-70 font-normal">ج.م</span>
                  </div>
                  <Link 
                    href={`/company/${companyId}/announcements/${estate.id}`}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-current text-white dark:text-slate-900 invert dark:invert-0 hover:opacity-80 transition-opacity"
                  >
                    التفاصيل
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* حالة عدم وجود نتائج */
        <div className="text-center py-20 border border-current border-opacity-10 border-dashed rounded-3xl">
          <div className="text-5xl mb-4 opacity-50">📭</div>
          <h3 className="text-2xl font-bold mb-2">لا توجد نتائج مطابقة</h3>
          <p className="opacity-70">جرب البحث بكلمات مختلفة أو تغيير نوع العقار المفلتر.</p>
          <button 
            onClick={() => {setSearchTerm(""); setFilterType("all");}}
            className="mt-6 text-sm font-bold underline opacity-80 hover:opacity-100"
          >
            إلغاء الفلاتر
          </button>
        </div>
      )}

    </div>
  );
}