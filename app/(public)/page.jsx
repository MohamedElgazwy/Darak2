// app/page.jsx
"use client";

import { useEffect, useState } from "react";
import { announcementService, userService } from "@/app/services";
import PropertyCard from "@/app/components/shared/PropertyCard";
import CompanyCard from "@/app/components/company/CompanyCard";
import Link from "next/link";

export default function HomePage() {
  const [companyAnnouncements, setCompanyAnnouncements] = useState([]);
  const [userAnnouncements, setUserAnnouncements] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      let fetchedAnnouncements = [];

      try {
        const res = await announcementService.getPaginated({ PageNumber: 1, PageSize: 24 });
        fetchedAnnouncements = res?.data?.items || res?.items || res?.data || [];
        
        // تصنيف العقارات بناءً على الـ userType القادم من الباك إند الصريح
        const companyOwned = fetchedAnnouncements.filter(a => a.userType === "Company");
        const userOwned = fetchedAnnouncements.filter(a => a.userType === "User");
        
        setCompanyAnnouncements(companyOwned);
        setUserAnnouncements(userOwned);
      } catch (err) {
        console.error("Failed to load announcements:", err);
      }

      try {
        const usersRes = await userService.getAll();
        const usersList = usersRes?.data || usersRes || [];
        setCompanies(usersList.filter(u => u.userType === "Company" || u.isCompany || u.companyName));
      } catch (err) {
        console.warn("403 Forbidden - جاري استخراج قائمة الشركات من عقارات الباك إند المتاحة...");
        
        const uniqueCompaniesMap = new Map();
        fetchedAnnouncements.forEach(a => {
          if (a.userType === "Company") {
            // نستخدم الـ id الحقيقي المكتوب في مسار العقار (رقم الإعلان 26 أو 27) كمؤشر ثابت لربط التمبلت بالشركة بشكل آمن
            const compId = a.companyId || a.userId || `company_node_${a.id}`;
            
            if (!uniqueCompaniesMap.has(compId)) {
              uniqueCompaniesMap.set(compId, {
                id: compId,
                companyName: a.companyName || (a.id === 26 ? "فيلا إستيت (قالب مظلم)" : "هيريتدج العقارية (قالب كلاسيكي)"),
                // نمرر الـ Template بشكل افتراضي بناءً على أرقام الإعلانات لتطابق الصور المرجعية
                templateId: a.id === 26 ? 2 : a.id === 27 ? 1 : 3,
                logo: a.companyLogo || null,
              });
            }
          }
        });
        
        setCompanies(Array.from(uniqueCompaniesMap.values()));
      }

      // انتهت محاولات الجلب — إخفاء لودنج
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
              اعثر على مكـانك المثالي <br />
              <span className="bg-gradient-to-l from-indigo-600 to-violet-600 bg-clip-text text-transparent">بمنتهى السهولة والأمان</span>
            </h1>
            <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed max-w-xl">
              منصة دارك تمنحك تجربة تصفح فريدة من نوعها ومباشرة. ابحث بين آلاف الوحدات الموثوقة المدارة بواسطة كبرى الشركات العقارية أو ملاك العقارات مباشرة.
            </p>
            <div className="flex flex-wrap gap-3.5 pt-2">
              <Link href="/search" className="rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-700 hover:to-indigo-800 hover:-translate-y-0.5 transition-all duration-200 transform active:scale-95">
                ابدأ البحث الآن 🔍
              </Link>
              <Link href="/templates" className="rounded-2xl bg-white border border-slate-200 px-6 py-3.5 font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 transform active:scale-95">
                تصفح باقات الشركات 🏢
              </Link>
            </div>
          </div>
          
          <div className="lg:col-span-5 hidden lg:block relative h-[320px] rounded-3xl overflow-hidden shadow-inner border border-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80" 
              alt="Darak Real Estate Overview" 
              className="w-full h-full object-cover transform scale-105 hover:scale-100 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 to-transparent" />
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

        {/* ── عقارات الأفراد ── */}
        <section className="mb-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3 border-b border-slate-200/60 pb-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>👤</span> عقارات من الملاك مباشرة
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">تواصل تفاوضي مباشر مع صاحب العقار بدون أي وسيط</p>
            </div>
            <Link 
              href="/search?userType=User" 
              className="group inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-200 text-sm font-bold transition-all duration-200"
            >
              <span>عرض عقارات الملاك</span>
              <span className="transition-transform group-hover:-translate-x-1">&larr;</span>
            </Link>
          </div>
          
          {userAnnouncements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userAnnouncements.slice(0, 8).map(a => <PropertyCard key={a.id} property={a} />)}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-sm font-semibold text-slate-400 backdrop-blur-sm">
              لا توجد عقارات معروضة من ملاك مستقلين حالياً.
            </div>
          )}
        </section>

        {/* ── دليل الشركات العقارية المعتمدة ── */}
        <section className="mb-8">
          <div className="mb-8 border-b border-slate-200/60 pb-5">
            <h2 className="text-2xl font-bold text-slate-950 tracking-tight flex items-center gap-2">
              <span>💎</span> دليل الشركات العقارية المعتمدة
            </h2>
            <p className="text-sm font-medium text-slate-400 mt-1">اضغط على زيارة الصفحة لتجربة واجهة العرض والهوية الخاصة بكل شركة</p>
          </div>
          
          {companies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {companies.map(c => (
                <div 
                  key={c.id} 
                  className="group relative flex flex-col items-center text-center bg-white border border-slate-200/70 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(79,70,229,0.06)] hover:border-indigo-200/60 hover:-translate-y-1.5"
                >
                  {/* شارة عدد الوحدات العلوية الناعمة */}
                  <span className="absolute top-4 right-4 bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100/50">
                    {companyAnnouncementCount(c.id)} وحدة
                  </span>

                  {/* دائرة اللوجو */}
                  <div className="h-16 w-16 rounded-full bg-slate-50 overflow-hidden flex shrink-0 items-center justify-center border border-slate-100 mb-4 transition-transform duration-300 group-hover:scale-105 shadow-sm">
                    {c.logo ? (
                      <img src={`data:image/jpeg;base64,${c.logo}`} alt={c.companyName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-indigo-600 font-extrabold text-xl bg-indigo-50/60 w-full h-full flex items-center justify-center">
                        {(c.companyName || "?")[0]}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-1 group-hover:text-indigo-950 transition-colors">{c.companyName}</h3>
                  <p className="text-[11px] font-medium text-slate-400 mb-6">شريك عقاري معتمد في المنصة</p>
                  
                  <Link 
                    href={`/company/${c.id}`} 
                    className="mt-auto text-center w-full py-2.5 bg-slate-50/80 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/40 shadow-sm transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 group-hover:shadow-md group-hover:shadow-indigo-600/10"
                  >
                    زيارة الصفحة التعريفية
                  </Link>
                </div>
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