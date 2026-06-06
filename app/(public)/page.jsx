// app/page.jsx
"use client";

import { useEffect, useState } from "react";
import { announcementService, userService } from "@/app/services";
import PropertyCard from "@/app/components/shared/PropertyCard";
import Link from "next/link";

export default function HomePage() {
  const [companyAnnouncements, setCompanyAnnouncements] = useState([]);
  const [userAnnouncements, setUserAnnouncements] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      let fetchedAnnouncements = [];

      // 1. جلب الإعلانات العامة وتصنيفها
      try {
        const res = await announcementService.getPaginated({ PageNumber: 1, PageSize: 24 });
        fetchedAnnouncements = res?.data?.items || res?.items || res?.data || [];
        
        const companyOwned = fetchedAnnouncements.filter(a => a.userType === "Company");
        const userOwned = fetchedAnnouncements.filter(a => a.userType === "User");
        
        setCompanyAnnouncements(companyOwned);
        setUserAnnouncements(userOwned);
      } catch (err) {
        console.error("Failed to load announcements:", err);
      }

      // 2. جلب الشركات وبناء الكروت الحقيقية باستخدام الـ Endpoint العامة والجديدة للبروفايل
      try {
        let baseUsers = [];
        try {
          const usersRes = await userService.getAll();
          baseUsers = usersRes?.data || usersRes || [];
        } catch (err) {
          console.warn("403 or fallback triggering for user listing. Injecting active IDs from announcements...");
          // Fallback: إذا كان مسار الـ List مغلقاً للأدمن فقط، نستخرج الـ IDs الحقيقية من الإعلانات التي جلبناها للتو
          const uniqueIds = new Set();
          fetchedAnnouncements.forEach(a => {
            if (a.userType === "Company" && (a.companyId || a.userId)) {
              uniqueIds.add(a.companyId || a.userId);
            }
          });
          baseUsers = Array.from(uniqueIds).map(id => ({ id }));
        }

        // فحص الشركات وتصفيتها
        const filteredCompanies = baseUsers.filter(u => u.userType === "Company" || u.isCompany || u.companyName || String(u.id).length > 2);

        // ⚡ السحر هنا: جلب تفاصيل بروفايل كل شركة بشكل متوازي وسريع من الـ Endpoint العامة الجديدة
        const fullCompaniesData = await Promise.all(
          filteredCompanies.slice(0, 8).map(async (comp) => {
            try {
              // استدعاء المسار العام للبروفايل المكتشف حديثاً
              const profile = await userService.getProfile(comp.id);
              return {
                ...comp,
                id: comp.id,
                companyName: profile.companyName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "شركة عقارية معتمدة",
                logo: profile.logo || null,
                userType: profile.userType || "Company",
                templateId: profile.templateId || 3, // التمبلت المختار للشركة
                averageRating: profile.averageRating || 0,
                totalReviews: profile.totalReviews || 0
              };
            } catch (err) {
              // التمبلت والبيانات الاحتياطية في حال الفشل
              return {
                id: comp.id,
                companyName: comp.companyName || "شريك دارك العقاري",
                logo: comp.logo || null,
                templateId: 3,
                averageRating: 0
              };
            }
          })
        );

        setCompanies(fullCompaniesData);
      } catch (err) {
        console.error("Failed to compile full store profiles:", err);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const companyAnnouncementCount = (companyId) =>
    companyAnnouncements.filter(a => String(a.companyId) === String(companyId) || String(a.userId) === String(companyId)).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <div className="absolute h-16 w-16 rounded-full border-4 border-indigo-100 animate-pulse -z-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 md:py-16 text-right" dir="rtl">
      <div className="container-shell">
        
        {/* ── قسم الـ Hero الترحيبي والتسويقي ── */}
        <section className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-slate-200/60 rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="lg:col-span-7 space-y-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100/50">
              ✨ المنصة العقارية الأحدث في مصر
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-950 leading-[1.2] tracking-tight">
              Let's Find Your <br />
              <span className="bg-gradient-to-l from-indigo-600 to-violet-600 bg-clip-text text-transparent">Perfect Place</span>
            </h1>
            <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed max-w-xl">
              منصة دارك تمنحك تجربة تصفح فريدة من نوعها ومباشرة. ابحث بين آلاف الوحدات الموثوقة المدارة بواسطة كبرى الشركات العقارية أو ملاك العقارات مباشرة.
            </p>
            <div className="flex flex-wrap gap-3.5 pt-2">
              <Link href="/search" className="rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-700 hover:to-indigo-800 hover:-translate-y-0.5 transition-all duration-200 transform active:scale-95">
                ابدأ البحث الآن 🔍
              </Link>
            </div>
          </div>
          
          <div className="lg:col-span-5 hidden lg:block relative h-[320px] rounded-3xl overflow-hidden shadow-inner border border-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80" 
              alt="Darak Real Estate Overview" 
              className="w-full h-full object-cover" 
            />
          </div>
        </section>

        {/* ── عقارات الشركات ── */}
        <section className="mb-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3 border-b border-slate-200/60 pb-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>🏢</span> عقارات بضمان الشركات العقارية
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">وحدات سكنية وتجارية موثوقة ومدارة من وكالات معتمدة</p>
            </div>
            <Link 
              href="/search?userType=Company" 
              className="group inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-200 text-sm font-bold transition-all duration-200"
            >
              <span>عرض كافة العقارات</span>
              <span className="transition-transform group-hover:-translate-x-1">&larr;</span>
            </Link>
          </div>
          
          {companyAnnouncements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {companyAnnouncements.map(a => <PropertyCard key={a.id} property={a} />)}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-sm font-semibold text-slate-400 backdrop-blur-sm">
              لا توجد عقارات منشورة تابعة للشركات حالياً.
            </div>
          )}
        </section>

        {/* ── دليل الشركات العقارية المعتمدة ── */}
        <section className="mb-8">
          <div className="mb-8 border-b border-slate-200/60 pb-5">
            <h2 className="text-2xl font-bold text-slate-950 tracking-tight flex items-center gap-2">
              <span>💎</span> دليل الشركات العقارية المعتمدة
            </h2>
            <p className="text-sm font-medium text-slate-400 mt-1">اضغط على الكارت لزيارة صفحة الشركة بالتنسيق والهوية المحددة لها</p>
          </div>
          
          {companies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {companies.map(c => (
                <Link
                  key={c.id} 
                  href={`/company/${c.id}`} // سينتقل لصفحة الشركة ليعرض التنسيق بناءً على templateId
                  className="group relative flex flex-col items-center text-center bg-white border border-slate-200/70 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-300 hover:shadow-[0_12px_35px_rgba(79,70,229,0.08)] hover:border-indigo-300 hover:-translate-y-1.5"
                >
                  {/* شارة عدد الوحدات المرفوعة */}
                  <span className="absolute top-4 right-4 bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100">
                    {companyAnnouncementCount(c.id)} وحدة
                  </span>

                  {/* لوجو الشركة المحدث الذكي (يدعم الـ Base64 أو روابط الصور المباشرة) */}
                  <div className="h-20 w-20 rounded-full bg-slate-50 overflow-hidden flex shrink-0 items-center justify-center border border-slate-200/80 mb-4 transition-transform duration-300 group-hover:scale-105 shadow-sm">
                    {c.logo ? (
                      <img 
                        src={c.logo.startsWith("data:") ? c.logo : `data:image/jpeg;base64,${c.logo}`} 
                        alt={c.companyName} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-indigo-600 font-black text-2xl bg-indigo-50/70 w-full h-full flex items-center justify-center">
                        {(c.companyName || "?")[0]}
                      </span>
                    )}
                  </div>
                  
                  {/* اسم وتفاصيل الشركة */}
                  <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">
                    {c.companyName}
                  </h3>
                  
                  {/* شارة التقييم الحقيقي من الـ Profile في حال وجودها */}
                  <div className="flex items-center gap-1 text-amber-500 my-2">
                    <span className="text-xs font-bold text-slate-600">({c.totalReviews || 0})</span>
                    <span className="text-sm font-black">{c.averageRating ? c.averageRating.toFixed(1) : "5.0"}</span>
                    <span>★</span>
                  </div>

                  <p className="text-[11px] font-medium text-slate-400 mb-4">شريك عقاري معتمد في المنصة</p>
                  
                  <div className="mt-auto text-center w-full py-2.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/40 shadow-sm transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600">
                    زيارة المعرض الخاص بالشركة
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-sm font-semibold text-slate-400 backdrop-blur-sm">
              لا توجد شركات عقارية نشطة مسجلة حالياً.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}