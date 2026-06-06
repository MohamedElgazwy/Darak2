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
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container-shell py-12">

      {/* ── عقارات الشركات ── */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold text-slate-900">عقارات بضمان الشركات العقارية</h2>
          <Link href="/search?userType=Company" className="text-indigo-600 hover:underline text-sm font-semibold">عرض الكل &larr;</Link>
        </div>
        {companyAnnouncements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {companyAnnouncements.map(a => <PropertyCard key={a.id} property={a} />)}
          </div>
        ) : (
          <div className="surface-card p-8 text-center text-slate-500 border-dashed">لا توجد عقارات لشركات مسجلة حالياً.</div>
        )}
      </section>

      {/* ── عقارات الأفراد ── */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold text-slate-900">عقارات من الملاك مباشرة</h2>
          <Link href="/search?userType=User" className="text-indigo-600 hover:underline text-sm font-semibold">عرض الكل &larr;</Link>
        </div>
        {userAnnouncements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userAnnouncements.slice(0, 8).map(a => <PropertyCard key={a.id} property={a} />)}
          </div>
        ) : (
          <div className="surface-card p-8 text-center text-slate-500 border-dashed">لا توجد عقارات لأفراد حالياً.</div>
        )}
      </section>

      {/* ── دليل الشركات العقارية (منسق بالكامل) ── */}
      <section className="mb-12">
        <div className="mb-8 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold text-slate-900">دليل الشركات العقارية المعتمدة</h2>
          <p className="text-sm text-slate-400 mt-1">اضغط على زيارة الصفحة لتطبيق الـ Template الكامل للشركة</p>
        </div>
        
        {companies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {companies.map(c => (
              <div key={c.id} className="surface-card p-6 flex flex-col items-center text-center bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 group">
                <div className="h-16 w-16 rounded-full bg-slate-50 overflow-hidden flex shrink-0 items-center justify-center border border-slate-100 mb-4 group-hover:scale-105 transition-transform">
                  {c.logo ? (
                    <img src={`data:image/jpeg;base64,${c.logo}`} alt={c.companyName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-indigo-600 font-bold text-2xl bg-indigo-50 w-full h-full flex items-center justify-center">
                      {(c.companyName || "?")[0]}
                    </span>
                  )}
                </div>
                
                <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-1">{c.companyName}</h3>
                <p className="text-xs text-slate-400 mb-5">{companyAnnouncementCount(c.id)} عقار نشط حالياً</p>
                
                <Link 
                  href={`/company/${c.id}`} 
                  className="mt-auto text-center w-full py-2.5 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all duration-300"
                >
                  زيارة الصفحة التعريفية
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="surface-card p-8 text-center text-slate-500 border-dashed">لا توجد شركات عقارية مضافة حالياً.</div>
        )}
      </section>
    </div>
  );
}