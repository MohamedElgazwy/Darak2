"use client";

import Link from "next/link";

export default function ClassicTheme({ company, announcements, about, services, testimonials }) {
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#3B2F2F] font-serif transition-colors duration-500 text-right" dir="rtl">
      {/* Hero */}
      <div className="relative mx-auto max-w-7xl px-4 py-12">
        <div className="bg-[#EADDCD] p-10 rounded-[2rem] border border-[#D5C6B5]">
          <h2 className="text-2xl font-extrabold text-[#5A4634] mb-4">{company?.companyName}</h2>
          <h1 className="text-4xl md:text-5xl font-bold text-[#3B2F2F] mb-4">اكتشف منزلك ذو الطابع الخالد</h1>
          <p className="text-[#8C7A6B] text-base max-w-lg">{about?.description}</p>
        </div>
      </div>

      {/* Announcements */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-[#3B2F2F] mb-8 border-b border-[#E6DFD3] pb-3">المحفظة العقارية</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {announcements?.map((prop) => (
            <div key={prop.id} className="bg-[#FFFDF8] border border-[#E6DFD3] rounded-2xl p-5">
              <h3 className="font-bold text-[#5A4634] mb-2">{prop.title}</h3>
              <p className="text-xl font-extrabold text-[#3B2F2F] mb-4">{prop.price?.toLocaleString("ar-EG")} ج.م</p>
              <Link href={`/announcement/${prop.id}`} className="block text-center bg-[#5A4634] text-[#F4EFE6] py-2 rounded-xl text-sm font-semibold">عرض العقار</Link>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      {testimonials?.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16 border-t border-[#E6DFD3]">
          <h2 className="text-2xl font-bold text-[#3B2F2F] mb-12 text-center">شهادات الملاك</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-[#FFFDF8] border border-[#E6DFD3] p-6 rounded-2xl shadow-sm">
                <p className="text-[#5A4634] text-xs italic mb-4">" {t.comment} "</p>
                <p className="text-[11px] font-bold text-[#8C7A6B]">✦ {t.user?.firstName}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}