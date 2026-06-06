"use client";

import Link from "next/link";

export default function BrightTheme({ company, announcements, about, services, testimonials }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans transition-colors duration-500 text-right" dir="rtl">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="text-indigo-600 font-bold text-xl mb-2">{company?.companyName}</div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">اكتشف منزل أحلامك بكل سهولة</h1>
          <p className="text-slate-500 max-w-xl">{about?.description}</p>
        </div>
      </div>

      {/* Announcements */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        {announcements?.map((prop) => (
          <div key={prop.id} className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="font-bold text-slate-800 mb-2">{prop.title}</h3>
            <p className="text-indigo-600 font-bold mb-4">{prop.price?.toLocaleString()} ج.م</p>
            <Link href={`/announcement/${prop.id}`} className="text-indigo-600 font-bold text-sm">عرض التفاصيل →</Link>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      {testimonials?.length > 0 && (
        <div className="max-w-7xl mx-auto py-16 px-4">
          <h2 className="text-2xl font-bold text-center mb-10">ماذا يقول عملاؤنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border shadow-sm">
                <p className="text-slate-600 italic text-sm mb-4">"{t.comment}"</p>
                <p className="text-indigo-600 font-bold text-sm">- {t.user?.firstName}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}