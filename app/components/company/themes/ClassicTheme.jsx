// app/components/company/themes/ClassicTheme.jsx
"use client";
import Link from "next/link";

export default function ClassicTheme({ company, announcements, about, services }) {
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#3B2F2F] font-serif" dir="rtl">
      {/* Hero Section */}
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#EADDCD] shadow-lg border border-[#D5C6B5]">
          <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
          <div className="relative flex flex-col md:flex-row items-center p-8 md:p-16 gap-8">
            <div className="flex-1 text-center md:text-right z-10">
              <div className="mx-auto md:mx-0 h-20 w-20 mb-6 bg-white rounded-xl flex items-center justify-center border-2 border-[#8C7A6B] overflow-hidden shadow-sm">
                {company?.logo ? <img src={`data:image/jpeg;base64,${company.logo}`} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-[#5A4634] text-2xl font-bold">{company?.companyName?.[0]}</span>}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#3B2F2F] leading-tight mb-4">
                اكتشف منزلك <br/> ذو الطابع الخالد
              </h1>
              <p className="text-[#5A4634] text-lg max-w-lg mb-8">
                {about?.description || "عش تجربة الأناقة ذات الطابع الدائم مع مجموعتنا المختارة بعناية من العقارات الكلاسيكية."}
              </p>
            </div>
            <div className="flex-1 w-full relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden border-4 border-white/40 shadow-xl">
               <img src="/images/classic-hero.jpg" alt="Classic Estate" className="w-full h-full object-cover" onError={(e) => e.target.src="https://placehold.co/800x600/4A3B32/FFF"} />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Estates */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[#3B2F2F] mb-8 text-center md:text-right">العقارات المميزة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {announcements?.slice(0, 4).map((prop) => (
            <div key={prop.id} className="bg-[#FFFDF8] border border-[#E6DFD3] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="aspect-[4/3] overflow-hidden relative p-2">
                <img src={prop.primaryImage ? `data:image/jpeg;base64,${prop.primaryImage}` : "https://placehold.co/400x300/EADDCD/3B2F2F"} alt={prop.title} className="w-full h-full object-cover rounded-lg" />
              </div>
              <div className="p-5">
                <p className="text-2xl font-bold text-[#3B2F2F] mb-1">{prop.price.toLocaleString("ar-EG")} <span className="text-sm font-normal">ج.م</span></p>
                <h3 className="font-semibold text-[#5A4634] mb-3 line-clamp-1">{prop.title}</h3>
                <div className="flex items-center gap-3 text-xs text-[#8C7A6B] mb-4 border-t border-[#E6DFD3] pt-3">
                  <span>{prop.rooms} غرف</span>
                  <span>{prop.bathrooms} حمام</span>
                  <span>{prop.area} م²</span>
                </div>
                <Link href={`/announcement/${prop.id}`} className="block w-full text-center bg-[#5A4634] text-[#F4EFE6] py-2.5 rounded-lg text-sm font-semibold hover:bg-[#3B2F2F] transition">
                  عرض العقار
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Provisions / Services */}
      {services?.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 border-t border-[#E6DFD3]">
          <h2 className="text-3xl font-bold text-[#3B2F2F] mb-12 text-center">خدماتنا المتميزة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <div key={i} className="text-center px-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#EADDCD] text-[#5A4634] flex items-center justify-center mb-4 border border-[#8C7A6B]">
                  ✦
                </div>
                <h3 className="text-xl font-bold text-[#3B2F2F] mb-2">{s.title}</h3>
                <p className="text-[#8C7A6B] text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}