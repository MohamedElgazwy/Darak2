// app/components/company/themes/BrightTheme.jsx
"use client";

import Link from "next/link";

export default function BrightTheme({ company, announcements, about, services }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans transition-colors duration-500 text-right" dir="rtl">
      {/* ── Hero Section ── */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative rounded-[2rem] bg-white overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row">
          
          <div className="p-8 md:p-16 flex-1 flex flex-col justify-center bg-gradient-to-l from-indigo-50/40 via-white to-white">
            {/* ترويسة هويّة الشركة بوضوح */}
            <div className="flex items-center gap-3 mb-4 text-indigo-600 font-bold text-xl">
               <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-100 p-1 shrink-0">
                 {company?.logo ? (
                   <img src={`data:image/jpeg;base64,${company.logo}`} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                 ) : (
                   <span className="text-indigo-600 font-bold text-lg">{(company?.companyName || "د")[0]}</span>
                 )}
               </div>
               <span className="text-slate-900 font-extrabold text-lg tracking-tight">{company?.companyName}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">
              ابحث واكتشف <br/> منزل أحلامك العصري
            </h1>
            <p className="text-slate-500 text-base mb-6 max-w-md leading-relaxed">
              {about?.description || about?.mission || "نحن نوفر استمارات وحلول بحث ذكية وعقارات معتمدة تلبي طموحاتك المعيشية العصرية بأسعار مدروسة."}
            </p>
          </div>

          {/* الصورة المعمارية المضيئة */}
          <div className="flex-1 w-full h-[300px] md:h-auto bg-slate-50 relative">
             <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80" alt="Modern Architecture" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* ── شبكة العقارات المتاحة ── */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-tight">أحدث العقارات المدرجة</h2>
        {announcements?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {announcements.map((prop) => (
              <div key={prop.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="aspect-[4/3] overflow-hidden p-2 bg-slate-50">
                    <img 
                      src={prop.primaryImage ? (prop.primaryImage.startsWith('/') ? `https://darak.runasp.net${prop.primaryImage}` : `data:image/jpeg;base64,${prop.primaryImage}`) : "https://placehold.co/400x300/EEF2FF/4F46E5?text=Darak"} 
                      alt={prop.title} 
                      className="w-full h-full object-cover rounded-2xl" 
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-2xl font-black text-slate-900 mb-1">{prop.price?.toLocaleString("ar-EG")} <span className="text-xs font-semibold text-slate-400">ج.م</span></p>
                    <h3 className="font-bold text-slate-800 text-base mb-1 line-clamp-1">{prop.title}</h3>
                    <p className="text-xs text-slate-400 truncate">{prop.city}، {prop.address || ""}</p>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-4 bg-indigo-50/50 py-2 px-3 rounded-xl w-fit">
                    <span>{prop.area} م²</span> • <span>{prop.rooms} غرف</span> • <span>{prop.bathrooms} حمام</span>
                  </div>
                  <Link href={`/announcement/${prop.id}`} className="block w-full text-center bg-white border border-slate-200 text-indigo-600 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-50 hover:border-indigo-200 transition duration-200 shadow-sm">
                    عرض كافة التفاصيل
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 shadow-sm">
            لا توجد عقارات منشورة تابعة لهذه الشركة حالياً.
          </div>
        )}
      </div>

      {/* ── الخدمات المتكاملة ── */}
      {services?.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-tight">منظومة خدماتنا المتكاملة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 text-lg font-bold">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title || s.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}