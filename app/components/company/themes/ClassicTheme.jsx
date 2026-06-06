// app/components/company/themes/ClassicTheme.jsx
"use client";

import Link from "next/link";

export default function ClassicTheme({ company, announcements, about, services }) {
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#3B2F2F] font-serif transition-colors duration-500 text-right" dir="rtl">
      {/* ── Hero Section ── */}
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#EADDCD] shadow-md border border-[#D5C6B5]">
          <div className="absolute inset-0 bg-black/5 mix-blend-multiply"></div>
          <div className="relative flex flex-col md:flex-row items-center p-8 md:p-16 gap-8">
            
            <div className="flex-1 text-center md:text-right z-10">
              {/* ترويسة هويّة الشركة بوضوح */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-6">
                <div className="h-20 w-20 bg-white rounded-xl flex items-center justify-center border-2 border-[#8C7A6B] overflow-hidden shadow-sm shrink-0">
                  {company?.logo ? (
                    <img src={`data:image/jpeg;base64,${company.logo}`} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#5A4634] text-2xl font-bold">{(company?.companyName || "هـ")[0]}</span>
                  )}
                </div>
                <div className="text-center md:text-right">
                  <span className="text-xs uppercase tracking-widest text-[#8C7A6B] font-bold block mb-1">شركة عقارية معتمدة</span>
                  <h2 className="text-2xl font-extrabold text-[#5A4634]">{company?.companyName}</h2>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-[#3B2F2F] leading-tight mb-4">
                اكتشف منزلك <br/> ذو الطابع الخالد
              </h1>
              <p className="text-[#8C7A6B] text-base max-w-lg mb-8 leading-relaxed">
                {about?.description || about?.mission || "عش تجربة الأناقة ذات الطابع الدائم مع مجموعتنا المختارة بعناية من العقارات الكلاسيكية العريقة."}
              </p>
            </div>

            {/* الصورة الجانبية الكلاسيكية */}
            <div className="flex-1 w-full relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden border-4 border-white/40 shadow-xl">
               <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" alt="Classic Estate" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* ── العقارات المميزة ── */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-[#3B2F2F] mb-8 pb-3 border-b border-[#E6DFD3]">المحفظة العقارية الحالية</h2>
        {announcements?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {announcements.map((prop) => (
              <div key={prop.id} className="bg-[#FFFDF8] border border-[#E6DFD3] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
                <div>
                  <div className="aspect-[4/3] overflow-hidden relative p-2 bg-[#F4EFE6]">
                    <img 
                      src={prop.primaryImage ? (prop.primaryImage.startsWith('/') ? `https://darak.runasp.net${prop.primaryImage}` : `data:image/jpeg;base64,${prop.primaryImage}`) : "https://placehold.co/400x300/EADDCD/3B2F2F?text=Darak"} 
                      alt={prop.title} 
                      className="w-full h-full object-cover rounded-xl" 
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-2xl font-extrabold text-[#3B2F2F] mb-1">{prop.price?.toLocaleString("ar-EG")} <span className="text-xs font-normal text-[#8C7A6B]">ج.م</span></p>
                    <h3 className="font-bold text-[#5A4634] text-base mb-3 line-clamp-1">{prop.title}</h3>
                    <p className="text-xs text-[#8C7A6B] truncate mb-4">{prop.city}، {prop.address || ""}</p>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <div className="flex items-center justify-between text-xs text-[#8C7A6B] mb-4 border-t border-[#E6DFD3] pt-3">
                    <span>{prop.rooms || 0} غرف</span>
                    <span>{prop.bathrooms || 0} حمام</span>
                    <span>{prop.area || 0} م²</span>
                  </div>
                  <Link href={`/announcement/${prop.id}`} className="block w-full text-center bg-[#5A4634] text-[#F4EFE6] py-2.5 rounded-xl text-sm font-semibold hover:bg-[#3B2F2F] transition duration-200">
                    عرض العقار بالكامل
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-[#8C7A6B] bg-[#FFFDF8] rounded-2xl border border-dashed border-[#D5C6B5]">
            لا توجد عقارات حصرية معروضة لهذه الشركة حالياً.
          </div>
        )}
      </div>

      {/* ── الخدمات ── */}
      {services?.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 border-t border-[#E6DFD3]">
          <h2 className="text-2xl font-bold text-[#3B2F2F] mb-12 text-center">الخدمات الاستشارية والتنفيذية</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <div key={i} className="text-center px-4 bg-[#FFFDF8]/50 p-6 rounded-2xl border border-[#E6DFD3]/60">
                <div className="mx-auto w-12 h-12 rounded-xl bg-[#EADDCD] text-[#5A4634] flex items-center justify-center mb-4 border border-[#8C7A6B] font-bold">
                  ✦
                </div>
                <h3 className="text-lg font-bold text-[#3B2F2F] mb-2">{s.title || s.name}</h3>
                <p className="text-[#8C7A6B] text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}