// app/components/company/themes/DarkTheme.jsx
"use client";

import Link from "next/link";

export default function DarkTheme({ company, announcements, about, services }) {
  return (
    <div className="min-h-screen bg-[#111111] text-slate-300 transition-colors duration-500 text-right" dir="rtl">
      {/* ── Hero Section ── */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative rounded-[2rem] bg-[#1A1A1A] overflow-hidden border border-[#262626]">
          <div className="relative h-[450px] lg:h-[550px] w-full">
            <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80" alt="Luxury Villa" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/60 to-transparent"></div>
            
            <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center">
              {/* ترويسة هويّة الشركة بوضوح */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-xl bg-[#222222] border border-[#D4AF37] flex items-center justify-center overflow-hidden shrink-0">
                  {company?.logo ? (
                    <img src={`data:image/jpeg;base64,${company.logo}`} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#D4AF37] font-bold text-xl">{(company?.companyName || "ف")[0]}</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] tracking-widest text-[#D4AF37] font-bold block uppercase mb-0.5">الحشيد العقاري النخبي</span>
                  <h1 className="text-2xl font-bold text-white tracking-wide">{company?.companyName}</h1>
                </div>
              </div>

              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                اكتشف عقارك الحصري <br/> المجهز للحياة العصرية
              </h2>
              <p className="text-slate-400 text-base max-w-lg mb-4 leading-relaxed">
                {about?.description || about?.vision || "مجموعات فاخرة ومنتقاة من القصور والفلل الفارهة المصممة لتعيد رسم معايير السكن النخبي بأسلوب فريد."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── العقارات الفاخرة ── */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-xl font-medium text-white mb-8 border-b border-[#222] pb-4 tracking-wide">المحفظة الاستثمارية الحصرية</h2>
        {announcements?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {announcements.map((prop) => (
              <div key={prop.id} className="bg-[#1A1A1A] border border-[#222222] rounded-2xl overflow-hidden hover:border-[#D4AF37] transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="aspect-[4/3] overflow-hidden bg-[#222]">
                    <img 
                      src={prop.primaryImage ? (prop.primaryImage.startsWith('/') ? `https://darak.runasp.net${prop.primaryImage}` : `data:image/jpeg;base64,${prop.primaryImage}`) : "https://placehold.co/400x300/111/D4AF37?text=Luxury"} 
                      alt={prop.title} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xl font-bold text-white mb-1">{prop.price?.toLocaleString("ar-EG")} <span className="text-xs text-[#D4AF37] font-normal">ج.م</span></p>
                    <h3 className="font-light text-slate-200 text-base mb-2 line-clamp-1">{prop.title}</h3>
                    <p className="text-xs text-slate-500 truncate">{prop.city} • {prop.propertyType || "وحدة سكنية"}</p>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 border-t border-[#222] pt-3">
                    <span>{prop.area} م²</span> • <span>{prop.rooms} غرف</span> • <span>{prop.bathrooms} حمام</span>
                  </div>
                  <Link href={`/announcement/${prop.id}`} className="block w-full text-center border border-[#D4AF37] text-[#D4AF37] py-2.5 rounded-xl text-sm font-semibold hover:bg-[#D4AF37] hover:text-black transition-all duration-300">
                    استعراض التفاصيل الحصرية &larr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-600 border border-dashed border-[#222] rounded-2xl">
            لا تتوفر أي وحدات فاخرة معروضة حالياً ضمن هذه المحفظة.
          </div>
        )}
      </div>

      {/* ── الخدمات ── */}
      {services?.length > 0 && (
        <div className="bg-[#151515] border-y border-[#222]">
          <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-xl font-light text-white mb-10 text-center tracking-widest uppercase">مزايا نلتزم بتقديمها</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((s, i) => (
                <div key={i} className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#222]">
                  <div className="w-10 h-10 rounded-xl bg-[#222] text-[#D4AF37] flex items-center justify-center mb-4 border border-[#333]">
                    ✦
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{s.title || s.name}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}