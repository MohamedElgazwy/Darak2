"use client";

import { useEffect, useState } from "react";
import { announcementService, companyService } from "@/app/services";
import PropertyCard from "@/app/components/shared/PropertyCard";
import Link from "next/link";

export default function HomePage() {
  // ─── حالات الإعلانات والـ Pagination ───
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // ─── حالات الشركات ───
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  // احتفظ بكل الشركات محلياً لدعم الـ client-side pagination
  const [companiesAll, setCompaniesAll] = useState([]);
  // حالات الـ Pagination الخاصة بالشركات
  const [companyCurrentPage, setCompanyCurrentPage] = useState(1);
  const [companyTotalPages, setCompanyTotalPages] = useState(1);
  const [companyHasNextPage, setCompanyHasNextPage] = useState(false);
  const [companyHasPreviousPage, setCompanyHasPreviousPage] = useState(false);

  // 1. دالة جلب الإعلانات بالصفحة المحددة
  const fetchAnnouncements = async (page = 1) => {
    setAnnouncementsLoading(true);
    try {
      // نرسل رقم الصفحة مع عدد الإعلانات في كل صفحة (مثلاً 12)
      const res = await announcementService.getPaginated({ PageNumber: page, PageSize: 12 });
      
      const responseData = res?.data || res;
      setAnnouncements(responseData?.items || []);
      
      // تحديث بيانات الـ Pagination
      setCurrentPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPages || 1);
      setHasNextPage(responseData?.hasNextPage || false);
      setHasPreviousPage(responseData?.hasPreviousPage || false);
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  // 2. دالة جلب الشركات (تُنفذ مرة واحدة عند فتح الصفحة)
  // 2. دالة جلب الشركات
  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    try {
      // الخادم لا يدعم companies paginated — نجلب الكل ثم نعمل pagination على المتصفح
      const resAll = await companyService.getAll();
      // DEBUG: inspect raw response from API
      // eslint-disable-next-line no-console
      console.log("fetchCompanies response:", resAll);
      const data = resAll?.data || resAll || [];
      // eslint-disable-next-line no-console
      console.log("companies parsed:", Array.isArray(data) ? data.slice(0,8) : data);
      setCompaniesAll(data || []);
      const total = Math.max(1, Math.ceil((data?.length || 0) / 8));
      setCompanyTotalPages(total);
      // slice initial page
      const start = (companyCurrentPage - 1) * 8;
      setCompanies((data || []).slice(start, start + 8));
      setCompanyHasNextPage(companyCurrentPage < total);
      setCompanyHasPreviousPage(companyCurrentPage > 1);
    } catch (err) {
      console.error("Failed to load companies:", err);
    } finally {
      setCompaniesLoading(false);
    }
  };

  // تنفيذ الدوال عند التحميل وعند تغير الصفحة
  useEffect(() => {
    fetchAnnouncements(currentPage);
  }, [currentPage]);

  // جلب كل الشركات عند أول تحميل
  useEffect(() => {
    fetchCompanies();
  }, []);

  // عند تغير الصفحة نحدّث العرض المحلي للصفحة الحالية
  useEffect(() => {
    if (!companiesAll || companiesAll.length === 0) return;
    const start = (companyCurrentPage - 1) * 8;
    const pageCompanies = companiesAll.slice(start, start + 8);
    setCompanies(pageCompanies);
    setCompanyHasNextPage(companyCurrentPage < Math.max(1, Math.ceil(companiesAll.length / 8)));
    setCompanyHasPreviousPage(companyCurrentPage > 1);

    // جلب إعلانات الشركات الظاهرة حالياً لعرضها تحت كل كارت
    const fetchAnnouncementsForDisplayed = async () => {
      try {
        const res = await announcementService.getPaginated({ PageNumber: 1, PageSize: 50 });
        const responseData = res?.data || res;
        const items = responseData?.items || [];
        const map = {};
        pageCompanies.forEach(c => { map[c.id] = []; });
        items.forEach(a => {
          const key = String(a.companyId) || String(a.userId);
          // if announcement belongs to one of displayed companies
          pageCompanies.forEach(c => {
            if (String(a.companyId) === String(c.id) || String(a.userId) === String(c.id)) {
              map[c.id] = map[c.id] || [];
              map[c.id].push(a);
            }
          });
        });
        setCompanyAnnouncementsMap(map);
      } catch (e) {
        console.error('Failed to fetch announcements for companies', e);
        setCompanyAnnouncementsMap({});
      }
    };

    fetchAnnouncementsForDisplayed();
  }, [companyCurrentPage, companiesAll]);


  const handleCompanyPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= companyTotalPages) {
      setCompanyCurrentPage(newPage);
      document.getElementById('companies-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCompanyAnnouncementsPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= companyAnnouncementsTotalPages) {
      setCompanyAnnouncementsPage(newPage);
      document.getElementById('company-announcements-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // جلب إعلانات خاصة بالشركات فقط (نفلتر محلياً أي إعلان له companyId)
  const [companyAnnouncements, setCompanyAnnouncements] = useState([]);
  const [companyAnnouncementsLoading, setCompanyAnnouncementsLoading] = useState(true);
  const [companyAnnouncementsPage, setCompanyAnnouncementsPage] = useState(1);
  const [companyAnnouncementsTotalPages, setCompanyAnnouncementsTotalPages] = useState(1);
  // مخزن مؤقت لإعلانات الشركات المعروضة في كروت الشركات على الصفحة
  const [companyAnnouncementsMap, setCompanyAnnouncementsMap] = useState({});

  const fetchCompanyAnnouncements = async (page = 1) => {
    setCompanyAnnouncementsLoading(true);
    try {
      const res = await announcementService.getPaginated({ PageNumber: page, PageSize: 8 });
      const responseData = res?.data || res;
      const items = responseData?.items || [];
      // نختار فقط الإعلانات المرتبطة بشركات
      const onlyCompanies = items.filter(i => !!i.companyId || !!i.userId);
      setCompanyAnnouncements(onlyCompanies);
      setCompanyAnnouncementsPage(responseData?.currentPage || 1);
      setCompanyAnnouncementsTotalPages(responseData?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load company announcements:", err);
    } finally {
      setCompanyAnnouncementsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyAnnouncements(companyAnnouncementsPage);
  }, [companyAnnouncementsPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // التمرير لأعلى قسم الإعلانات عند تقليب الصفحة
      document.getElementById('announcements-section').scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (announcementsLoading && currentPage === 1) {
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
      <div className="container-shell max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* ── قسم الـ Hero الترحيبي ── */}
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
              <Link href="/search" className="rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-700 hover:to-indigo-800 hover:-translate-y-0.5 transition-transform duration-200">
                ابدأ البحث الآن 🔍
              </Link>
            </div>
          </div>
          
          <div className="lg:col-span-5 hidden lg:block relative h-[320px] rounded-3xl overflow-hidden shadow-inner border border-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80" 
              alt="Darak Real Estate" 
              className="w-full h-full object-cover" 
            />
          </div>
        </section>

        {/* ── أحدث الإعلانات (مع Pagination) ── */}
        <section id="announcements-section" className="mb-20 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3 border-b border-slate-200/60 pb-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>🏠</span> أحدث العقارات المضافة
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">تصفح أحدث الوحدات السكنية والتجارية على منصة دارك</p>
            </div>
          </div>
          
          {announcementsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-slate-200 rounded-2xl"></div>
              ))}
            </div>
          ) : announcements.length > 0 ? (
            <>
              {/* شبكة الإعلانات */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {announcements.map(a => <PropertyCard key={a.id} property={a} />)}
              </div>

              {/* أزرار التنقل (Pagination) */}
              <div className="mt-12 flex items-center justify-center gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPreviousPage}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  السابق
                </button>
                
                <span className="px-4 py-2 text-sm font-medium text-slate-500">
                  صفحة <span className="font-bold text-slate-900">{currentPage}</span> من <span className="font-bold text-slate-900">{totalPages}</span>
                </span>

                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  التالي
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-sm font-semibold text-slate-400 backdrop-blur-sm">
              لا توجد عقارات منشورة في هذه الصفحة حالياً.
            </div>
          )}
        </section>

        {/* ── دليل الشركات العقارية المعتمدة ── */}
        <section id="companies-section" className="mb-8 scroll-mt-24">
          <div className="mb-8 border-b border-slate-200/60 pb-5">
            <h2 className="text-2xl font-bold text-slate-950 tracking-tight flex items-center gap-2">
              <span>💎</span> دليل الشركات العقارية المعتمدة
            </h2>
            <p className="text-sm font-medium text-slate-400 mt-1">اضغط على الكارت لزيارة صفحة الشركة والتعرف على عقاراتها وخدماتها</p>
          </div>
          
          {companiesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-slate-200 rounded-2xl"></div>
              ))}
            </div>
          ) : companies.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {companies.map(c => {
                  const displayName = c.companyName || c.name || `شركة ${String(c.id || '').slice(0,4)}`;
                  const initials = displayName ? displayName.charAt(0) : '';
                  return (
                  <Link
                    key={c.id} 
                    href={`/company/${c.id}`} 
                    className="group relative flex flex-col items-center text-center bg-white border border-slate-200/70 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-300 hover:shadow-[0_12px_35px_rgba(79,70,229,0.08)] hover:border-indigo-300 hover:-translate-y-1.5"
                  >
                    {/* شارة عدد الوحدات */}
                    {typeof c.announcementsCount === 'number' && c.announcementsCount > 0 && (
                      <span className="absolute top-4 right-4 bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100">
                        {c.announcementsCount} وحدة
                      </span>
                    )}

                    {/* لوجو الشركة */}
                    <div className="h-20 w-20 rounded-full bg-slate-50 overflow-hidden flex shrink-0 items-center justify-center border border-slate-200/80 mb-4 transition-transform duration-300 group-hover:scale-105 shadow-sm">
                      {c.logo ? (
                        <img 
                          src={c.logo.startsWith("data:") ? c.logo : `data:image/jpeg;base64,${c.logo}`} 
                          alt={displayName} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-indigo-600 font-black text-2xl bg-indigo-50/70 w-full h-full flex items-center justify-center">
                          {initials}
                        </span>
                      )}
                    </div>
                    
                    {/* اسم الشركة */}
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-2 group-hover:text-indigo-600 transition-colors">
                      {displayName}
                    </h3>

                    {/* عرض إعلانين قصيرين تابعين للشركة (إن وُجدوا) */}
                    {companyAnnouncementsMap[c.id] && companyAnnouncementsMap[c.id].length > 0 ? (
                      <div className="w-full mb-3 text-sm text-left">
                        {companyAnnouncementsMap[c.id].slice(0,2).map(a => (
                          <Link key={a.id} href={`/company/${c.id}/announcements/${a.id}`} className="block text-sm text-slate-600 hover:text-indigo-600 truncate" >
                            {a.title || a.titles || 'عرض عقار'} — <span className="font-bold text-slate-900">{a.price}</span>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                    
                    <div className="mt-auto text-center w-full py-2.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/40 shadow-sm transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600">
                      زيارة المعرض الخاص بالشركة
                    </div>
                  </Link>
                );
                })}
              </div>

              {/* أزرار تنقل الشركات (Pagination) */}
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handleCompanyPageChange(companyCurrentPage - 1)}
                  disabled={!companyHasPreviousPage}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  السابق
                </button>

                <span className="px-4 py-2 text-sm font-medium text-slate-500">
                  صفحة <span className="font-bold text-slate-900">{companyCurrentPage}</span> من <span className="font-bold text-slate-900">{companyTotalPages}</span>
                </span>

                <button
                  onClick={() => handleCompanyPageChange(companyCurrentPage + 1)}
                  disabled={!companyHasNextPage}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  التالي
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-sm font-semibold text-slate-400 backdrop-blur-sm">
              لا توجد شركات عقارية نشطة مسجلة حالياً.
            </div>
          )}
        </section>

        {/* ── إعلانات من الشركات (قسم منفصل) ── */}
        <section id="company-announcements-section" className="mb-12 scroll-mt-24">
          <div className="mb-6 border-b border-slate-200/60 pb-5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>🏢</span> إعلانات منشورة بواسطة الشركات
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">تصفح الوحدات المنشورة من قبل الشركات العقارية</p>
          </div>

          {companyAnnouncementsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-slate-200 rounded-2xl"></div>
              ))}
            </div>
          ) : companyAnnouncements.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {companyAnnouncements.map(a => <PropertyCard key={a.id} property={a} />)}
              </div>

              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => handleCompanyAnnouncementsPageChange(companyAnnouncementsPage - 1)}
                  disabled={companyAnnouncementsPage <= 1}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  السابق
                </button>

                <span className="px-4 py-2 text-sm font-medium text-slate-500">
                  صفحة <span className="font-bold text-slate-900">{companyAnnouncementsPage}</span> من <span className="font-bold text-slate-900">{companyAnnouncementsTotalPages}</span>
                </span>

                <button
                  onClick={() => handleCompanyAnnouncementsPageChange(companyAnnouncementsPage + 1)}
                  disabled={companyAnnouncementsPage >= companyAnnouncementsTotalPages}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  التالي
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-sm font-semibold text-slate-400 backdrop-blur-sm">
              لا توجد إعلانات منشورة بواسطة شركات حالياً.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}