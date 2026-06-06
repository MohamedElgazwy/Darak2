// app/components/company/themes/DarkTheme.jsx
"use client";
import Link from "next/link";

export default function DarkTheme({ company, announcements, about, services }) {
  return (
    <div className="min-h-screen bg-[#111111] text-slate-200" dir="rtl">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative rounded-[2rem] bg-[#1A1A1A] overflow-hidden border border-[#333333]">
          <div className="relative h-[450px] lg:h-[550px] w-full">
            <img src="/images/dark-hero.jpg" alt="Luxury Villa" className="w-full h-full object-cover opacity-60" onError={(e) => e.target.src="https://placehold.co/1200x600/111/D4AF37"} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent"></div>
            
            <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-6">
                 {company?.logo ? <img src={`data:image/jpeg;base64,${company.logo}`} alt="Logo" className="w-12 h-12 rounded-lg border border-[#D4AF37]" /> : null}
                 <span className="text-[#D4AF37] font-bold text-xl tracking-wider uppercase">{company?.companyName}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                اكتشف منزل <br/> أحلامك الفاخر
              </h1>
              <p className="text-slate-400 text-lg max-w-lg mb-8">
                {about?.description || "استكشف العقارات الفاخرة الحصرية المصممة لتلائم أسلوب الحياة العصري والراقي."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Listings */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-white mb-8">القوائم المميزة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {announcements?.slice(0, 4).map((prop) => (
            <div key={prop.id} className="bg-[#1A1A1A] border border-[#222] rounded-2xl overflow-hidden hover:border-[#D4AF37] transition duration-300">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={prop.primaryImage ? `data:image/jpeg;base64,${prop.primaryImage}` : "https://placehold.co/400x300/222/555"} alt={prop.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <p className="text-xl font-bold text-white mb-1">{prop.price.toLocaleString("ar-EG")} <span className="text-sm text-[#D4AF37]">ج.م</span></p>
                <h3 className="font-medium text-slate-300 mb-4 line-clamp-1">{prop.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-5">
                  <span>{prop.rooms} غرف</span> • <span>{prop.bathrooms} حمام</span> • <span>{prop.area} م²</span>
                </div>
                <Link href={`/announcement/${prop.id}`} className="block w-full text-center border border-[#D4AF37] text-[#D4AF37] py-2 rounded-xl text-sm font-semibold hover:bg-[#D4AF37] hover:text-black transition">
                  عرض التفاصيل
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      {services?.length > 0 && (
        <div className="bg-[#151515] border-y border-[#222]">
          <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold text-[#D4AF37] mb-10 text-center">خدماتنا</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {services.map((s, i) => (
                <div key={i} className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#222]">
                  <div className="w-10 h-10 rounded-lg bg-[#222] text-[#D4AF37] flex items-center justify-center mb-4">
                    ✦
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-sm">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}