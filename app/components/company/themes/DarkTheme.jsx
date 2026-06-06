"use client";

import Link from "next/link";

export default function DarkTheme({ company, announcements, about, services, testimonials }) {
  return (
    <div className="min-h-screen bg-[#111111] text-slate-300 transition-colors duration-500 text-right" dir="rtl">
      {/* ── Hero Section ── */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative rounded-[2rem] bg-[#1A1A1A] overflow-hidden border border-[#262626]">
          <div className="relative h-[450px] w-full">
            <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80" alt="Luxury Villa" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/60 to-transparent"></div>
            
            <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-xl bg-[#222222] border border-[#D4AF37] flex items-center justify-center overflow-hidden shrink-0">
                  {company?.logo ? (
                    <img src={`data:image/jpeg;base64,${company.logo}`} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#D4AF37] font-bold text-xl">{(company?.companyName || "ف")[0]}</span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-wide">{company?.companyName}</h1>
                </div>
              </div>

              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                اكتشف عقارك الحصري
              </h2>
              <p className="text-slate-400 text-base max-w-lg mb-4 leading-relaxed">
                {about?.description || "مجموعات فاخرة ومنتقاة من القصور والفلل الفارهة المصممة لتعيد رسم معايير السكن النخبي."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── العقارات ── */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-xl font-medium text-white mb-8 border-b border-[#222] pb-4">المحفظة الاستثمارية</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {announcements?.map((prop) => (
            <div key={prop.id} className="bg-[#1A1A1A] border border-[#222] p-6 rounded-2xl">
              <h3 className="text-white font-bold mb-2">{prop.title}</h3>
              <p className="text-[#D4AF37] mb-4">{prop.price?.toLocaleString()} ج.م</p>
              <Link href={`/announcement/${prop.id}`} className="text-[#D4AF37] underline text-sm">عرض التفاصيل</Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── Testimonials ── */}
      {testimonials?.length > 0 && (
        <div className="max-w-7xl mx-auto py-16 px-4 border-t border-[#222]">
          <h2 className="text-white text-center mb-10">آراء النخبة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-[#161616] p-6 rounded-2xl border border-[#222]">
                <p className="text-slate-400 text-sm italic">"{t.comment}"</p>
                <p className="text-[#D4AF37] mt-3 font-bold text-sm">- {t.user?.firstName}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}