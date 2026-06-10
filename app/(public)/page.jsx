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
  const [companiesAll, setCompaniesAll] = useState([]);
  const [companyCurrentPage, setCompanyCurrentPage] = useState(1);
  const [companyTotalPages, setCompanyTotalPages] = useState(1);
  const [companyHasNextPage, setCompanyHasNextPage] = useState(false);
  const [companyHasPreviousPage, setCompanyHasPreviousPage] = useState(false);

  // جلب إعلانات خاصة بالشركات فقط
  const [companyAnnouncements, setCompanyAnnouncements] = useState([]);
  const [companyAnnouncementsLoading, setCompanyAnnouncementsLoading] = useState(true);
  const [companyAnnouncementsPage, setCompanyAnnouncementsPage] = useState(1);
  const [companyAnnouncementsTotalPages, setCompanyAnnouncementsTotalPages] = useState(1);
  const [companyAnnouncementsMap, setCompanyAnnouncementsMap] = useState({});

  // 1. دالة جلب الإعلانات بالصفحة المحددة
  const fetchAnnouncements = async (page = 1) => {
    setAnnouncementsLoading(true);
    try {
      const res = await announcementService.getPaginated({ PageNumber: page, PageSize: 12 });
      const responseData = res?.data || res;
      setAnnouncements(responseData?.items || []);
      
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

  // 2. دالة جلب الشركات
  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    try {
      const resAll = await companyService.getAll();
      console.log("fetchCompanies response:", resAll);
      const data = resAll?.data || resAll || [];
      console.log("companies parsed:", Array.isArray(data) ? data.slice(0,8) : data);
      setCompaniesAll(data || []);
      const total = Math.max(1, Math.ceil((data?.length || 0) / 8));
      setCompanyTotalPages(total);
      
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

  useEffect(() => {
    fetchAnnouncements(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!companiesAll || companiesAll.length === 0) return;
    const start = (companyCurrentPage - 1) * 8;
    const pageCompanies = companiesAll.slice(start, start + 8);
    setCompanies(pageCompanies);
    setCompanyHasNextPage(companyCurrentPage < Math.max(1, Math.ceil(companiesAll.length / 8)));
    setCompanyHasPreviousPage(companyCurrentPage > 1);

    const fetchAnnouncementsForDisplayed = async () => {
      try {
        const res = await announcementService.getPaginated({ PageNumber: 1, PageSize: 50 });
        const responseData = res?.data || res;
        const items = responseData?.items || [];
        const map = {};
        pageCompanies.forEach(c => { map[c.id] = []; });
        items.forEach(a => {
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

  const fetchCompanyAnnouncements = async (page = 1) => {
    setCompanyAnnouncementsLoading(true);
    try {
      const res = await announcementService.getPaginated({ PageNumber: page, PageSize: 8 });
      const responseData = res?.data || res;
      const items = responseData?.items || [];
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
      document.getElementById('announcements-section').scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (announcementsLoading && currentPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="relative flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-md" />
          <p className="text-sm font-bold text-slate-400 animate-pulse">جاري تهيئة الدليل العقاري الموثق...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f8fafc] overflow-hidden text-right pb-24" dir="rtl">
      
      {/* ── Background Soft Mesh Art Blurs ── */}
      <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-indigo-200/20 rounded-full filter blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-purple-200/20 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-blue-200/20 rounded-full filter blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 relative z-10">
        
        {/* ─── 1. قسم الـ Hero الترحيبي الفخم ─── */}
        <section className="mb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 rounded-[3rem] p-8 md:p-16 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200')" }}></div>
          
          <div className="lg:col-span-7 space-y-6 relative z-10 text-white">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-inner backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              ✨ المنصة العقارية الأحدث والأكثر أماناً في مصر
            </span>
            <h1 className="text-4xl sm:text-6xl font-black leading-[1.15] tracking-tight text-white">
              Let's Find Your <br />
              <span className="bg-gradient-to-l from-indigo-400 via-sky-300 to-emerald-300 bg-clip-text text-transparent">Perfect Place</span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg font-medium leading-relaxed max-w-xl">
              منصة دارك تمنحك تجربة تصفح فريدة من نوعها ومباشرة. ابحث بين آلاف الوحدات الموثوقة المدارة بواسطة كبرى الشركات العقارية أو ملاك العقارات مباشرة دون وسيط.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/search" className="rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-4 font-black text-sm text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-600 hover:to-indigo-700 hover:-translate-y-0.5 transition-all duration-300">
                ابدأ رحلة البحث الذكي 🔍
              </Link>
            </div>
          </div>
          
          <div className="lg:col-span-5 hidden lg:block relative h-[380px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/10 group">
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80" 
              alt="Darak Real Estate" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
          </div>
        </section>

        {/* ─── 2. أحدث الإعلانات (مع Pagination) ─── */}
        <section id="announcements-section" className="mb-24 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4 border-b border-slate-200/60 pb-5">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-lg shadow-inner">🏠</span> أحدث العقارات المضافة
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-2">تصفح أحدث الوحدات السكنية والتجارية الحصرية على خريطة المنصة</p>
            </div>
          </div>
          
          {announcementsLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border h-[380px] animate-pulse rounded-3xl p-5 space-y-4">
                  <div className="aspect-[4/3] w-full rounded-2xl bg-slate-100" />
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-10 bg-slate-100 rounded-xl w-full pt-2" />
                </div>
              ))}
            </div>
          ) : announcements.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-500">
                {announcements.map(a => <PropertyCard key={a.id} property={a} />)}
              </div>

              {/* أزرار التنقل الفخمة */}
              <div className="mt-14 flex items-center justify-center gap-3">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPreviousPage}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  السابق
                </button>
                
                <span className="px-4 py-2.5 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200/60 rounded-xl shadow-inner">
                  صفحة <span className="font-black text-indigo-600 px-0.5 text-sm">{currentPage}</span> من <span className="font-black text-slate-800 px-0.5 text-sm">{totalPages}</span>
                </span>

                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  التالي
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-white/60 p-16 text-center text-sm font-bold text-slate-400 backdrop-blur-sm shadow-inner">
              لا توجد عقارات منشورة في هذه الصفحة حالياً.
            </div>
          )}
        </section>

        {/* ─── 3. دليل الشركات العقارية المعتمدة ─── */}
        <section id="companies-section" className="mb-24 scroll-mt-24">
          <div className="mb-10 border-b border-slate-200/60 pb-5">
            <h2 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-amber-50 border border-amber-100 rounded-xl text-lg shadow-inner">💎</span> دليل الشركات العقارية المعتمدة
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-2">اضغط على الكارت لزيارة واجهة المتجر الخاص بالشركة والتعرف على هويتها الحصرية</p>
          </div>
          
          {companiesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-60 bg-white border animate-pulse rounded-3xl p-6 flex flex-col items-center gap-4">
                  <div className="h-20 w-20 bg-slate-100 rounded-full" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-8 bg-slate-100 rounded-xl w-full mt-auto" />
                </div>
              ))}
            </div>
          ) : companies.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
                {companies
                  .filter(c => c.companyName !== null && c.companyName !== undefined && c.companyName.trim() !== "")
                  .map(c => {
                    const displayName = c.companyName;
                    const initials = displayName.charAt(0);
                    
                    return (
                      <Link
                        key={c.id} 
                        href={`/company/${c.id}`} 
                        className="group relative flex flex-col items-center text-center bg-white/90 backdrop-blur-sm border border-slate-200 rounded-[2rem] p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(79,70,229,0.08)] hover:border-indigo-400 hover:-translate-y-1.5"
                      >
                        {/* شارة عدد الوحدات الفاخرة */}
                        {typeof c.announcementsCount === 'number' && c.announcementsCount > 0 && (
                          <span className="absolute top-4 right-4 bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-[10px] font-black px-2.5 py-1 rounded-lg">
                            {c.announcementsCount} وحدة متاح
                          </span>
                        )}

                        {/* لوجو الشركة */}
                        <div className="h-20 w-20 rounded-full bg-slate-50 overflow-hidden flex shrink-0 items-center justify-center border border-slate-200 mb-4 shadow-inner transition-transform duration-300 group-hover:scale-105">
                          {c.logo ? (
                            <img 
                              src={c.logo.startsWith("data:") ? c.logo : `data:image/jpeg;base64,${c.logo}`} 
                              alt={displayName} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <span className="text-indigo-600 font-black text-2xl bg-indigo-50/60 w-full h-full flex items-center justify-center">
                              {initials}
                            </span>
                          )}
                        </div>
                        
                        {/* اسم الشركة */}
                        <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-3 group-hover:text-indigo-600 transition-colors">
                          {displayName}
                        </h3>

                        {/* عرض إعلانات الشركة التابع للماب */}
                        {companyAnnouncementsMap[c.id] && companyAnnouncementsMap[c.id].length > 0 ? (
                          <div className="w-full mb-4 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-right">
                            {companyAnnouncementsMap[c.id].slice(0, 2).map(a => (
                              <span key={a.id} className="block text-[11px] font-bold text-slate-500 truncate">
                                🔹 {a.title || 'وحدة عقارية'} — <span className="text-indigo-600 font-black">{a.price?.toLocaleString()} ج.م</span>
                              </span>
                            ))}
                          </div>
                        ) : null}
                        
                        <div className="mt-auto text-center w-full py-3 bg-slate-50 border border-slate-100 text-slate-700 text-xs font-black rounded-xl transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 group-hover:shadow-md">
                          زيارة معرض الوكالة العقارية
                        </div>
                      </Link>
                    );
                  })}
              </div>

              {/* أزرار تنقل الشركات */}
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  onClick={() => handleCompanyPageChange(companyCurrentPage - 1)}
                  disabled={!companyHasPreviousPage}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  السابق
                </button>

                <span className="px-4 py-2.5 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200/60 rounded-xl shadow-inner">
                  صفحة <span className="font-black text-indigo-600 px-0.5 text-sm">{companyCurrentPage}</span> من <span className="font-black text-slate-800 px-0.5 text-sm">{companyTotalPages}</span>
                </span>

                <button
                  onClick={() => handleCompanyPageChange(companyCurrentPage + 1)}
                  disabled={!companyHasNextPage}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  التالي
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-white/60 p-16 text-center text-sm font-bold text-slate-400 backdrop-blur-sm shadow-inner">
              لا توجد شركات عقارية نشطة مسجلة حالياً.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}