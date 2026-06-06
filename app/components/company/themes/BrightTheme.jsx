// app/components/company/themes/BrightTheme.jsx
"use client";
import Link from "next/link";

export default function BrightTheme({ company, announcements, about, services }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans" dir="rtl">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative rounded-[2rem] bg-white overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row">
          <div className="p-8 md:p-16 flex-1 flex flex-col justify-center bg-gradient-to-l from-indigo-50/50 to-white">
            <div className="flex items-center gap-3 mb-6 text-indigo-600 font-bold text-xl">
               {company?.logo && <img src={`data:image/jpeg;base64,${company.logo}`} alt="Logo" className="w-8 h-8 rounded-md" />}
               {company?.companyName}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">
              اكتشف منزل أحلامك <br/> بكل سهولة
            </h1>
            <p className="text-slate-500 text-lg mb-8 max-w-md leading-relaxed">
              {about?.description || "استكشف العقارات الفاخرة الحصرية المصممة لتلائم أسلوب الحياة العصري والنظيف."}
            </p>
          </div>
          <div className="flex-1 w-full h-[300px] md:h-auto">
             <img src="/images/bright-hero.jpg" alt="Modern Villa" className="w-full h-full object-cover" onError={(e) => e.target.src="https://placehold.co/800x600/4F46E5/FFF"} />
          </div>
        </div>
      </div>

      {/* Featured Listings */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">أحدث القوائم</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {announcements?.slice(0, 4).map((prop) => (
            <div key={prop.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-100 transition duration-200">
              <div className="aspect-[4/3] overflow-hidden p-2">
                <img src={prop.primaryImage ? `data:image/jpeg;base64,${prop.primaryImage}` : "https://placehold.co/400x300/EEF2FF/4F46E5"} alt={prop.title} className="w-full h-full object-cover rounded-2xl" />
              </div>
              <div className="p-5">
                <p className="text-xl font-extrabold text-slate-900 mb-1">{prop.price.toLocaleString("ar-EG")} <span className="text-sm font-medium text-slate-500">ج.م</span></p>
                <h3 className="font-bold text-slate-700 mb-3 line-clamp-1">{prop.title}</h3>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-5 bg-slate-50 py-2 px-3 rounded-lg w-fit">
                  <span>{prop.rooms} غرف</span> • <span>{prop.bathrooms} حمام</span>
                </div>
                <Link href={`/announcement/${prop.id}`} className="block w-full text-center bg-white border border-slate-200 text-indigo-600 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-50 hover:border-indigo-200 transition">
                  عرض الوحدة
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      {services?.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">خدماتنا المتكاملة</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 text-xl">
                  ✧
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}