"use client";

import Link from "next/link";
import PropertyCard from "@/app/components/shared/PropertyCard";

export default function BrightTheme({ company, announcements, about, services, testimonials }) {
  // دالة مساعدة لطباعة النجوم بناءً على التقييم العام
  const renderStars = (rating) => {
    const safeRating = rating || 0;
    return (
      <div className="flex items-center gap-1 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className={`w-4 h-4 ${i < Math.round(safeRating) ? "fill-current" : "text-slate-200 fill-current"}`} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-slate-600 text-xs font-bold mr-1 bg-white px-2 py-0.5 rounded-md shadow-sm">
          {safeRating.toFixed(1)} ({company?.totalReviews || 0} تقييم)
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans transition-colors duration-500 text-right" dir="rtl">
      
      {/* ── Hero Section ── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="relative bg-white p-10 md:p-16 rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
          
          <div className="relative z-10 flex-1 space-y-6">
            {/* شارة التقييم والموثوقية */}
            <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-100 p-2 rounded-xl">
              {renderStars(company?.averageRating)}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              نصنع الفارق في <br/> <span className="text-blue-600">رحلتك العقارية</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-xl leading-relaxed font-medium">
              {about?.description || "اكتشف مجموعة من أرقى العقارات المصممة بعناية لتناسب ذوقك الرفيع. نحن هنا لنجعل حلمك حقيقة."}
            </p>
            <div className="pt-4 flex gap-4">
              <a href="#portfolio" className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-1 transition-all">
                تصفح عقاراتنا
              </a>
              <Link href={`/company/${company?.id}/contact`} className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all">
                تواصل معنا
              </Link>
            </div>
          </div>

          <div className="relative z-10 w-full md:w-[450px] h-[350px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
            <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80" alt="Villa" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* ── Announcements (المحفظة العقارية) ── */}
      <div id="portfolio" className="max-w-7xl mx-auto px-4 py-16 scroll-mt-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">المحفظة العقارية</h2>
            <p className="text-slate-500 font-medium mt-2">أحدث الوحدات الحصرية المتاحة لدينا ({announcements?.length || 0} عقار)</p>
          </div>
        </div>

        {announcements?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {announcements.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-300">
            <div className="text-5xl opacity-30 mb-4">🏠</div>
            <h3 className="text-xl font-bold text-slate-700">لا توجد عقارات معروضة حالياً</h3>
            <p className="text-slate-500 mt-2">ترقبوا أحدث إعلاناتنا قريباً.</p>
          </div>
        )}
      </div>

      {/* ── Testimonials (الآراء) ── */}
      {testimonials?.length > 0 && (
        <div className="bg-white border-t border-slate-200 mt-8">
          <div className="max-w-7xl mx-auto py-20 px-4">
            <div className="text-center mb-12">
              <span className="text-blue-600 font-bold bg-blue-50 px-4 py-1.5 rounded-full text-sm">تجارب حقيقية</span>
              <h2 className="text-3xl font-black text-slate-900 mt-4">ماذا يقول عملاؤنا</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.slice(0, 3).map((t, idx) => (
                <div key={idx} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 relative">
                  <div className="text-4xl absolute top-6 left-6 opacity-10">"</div>
                  <div className="flex gap-1 mb-4 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < (t.rating || 5) ? "" : "text-slate-300 opacity-50"}>★</span>
                    ))}
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed mb-6 h-20 overflow-hidden text-ellipsis">"{t.comment}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {(t.user?.firstName || t.userName || "ع")[0]}
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold text-sm">{t.user?.firstName || t.userName || "عميل الشركة"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}