"use client";

import Link from "next/link";

export default function PropertyCard({ property }) {
  
  // ─── الدالة الذكية المحدثة لمعالجة تضارب صيغ الصور قادمة من السيرفر ───
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder-property.jpg"; // صورة احتياطية لو مفيش داتا
    
    // 1. إذا كان المسار يبدأ بـ http أو يحتوي على مقدمة base64 جاهزة، نمرره فوراً
    if (imagePath.startsWith("http") || imagePath.startsWith("data:")) {
      return imagePath;
    }
    
    // 2. إذا كان الباك إند يرسل مسار ملف نسبي (وهي حالتك الحالية)
    if (imagePath.startsWith("/")) {
      return `https://darak.runasp.net${imagePath}`;
    }
    
    // 3. إذا كان باعت نص Base64 خام بدون الـ Prefix تبعه
    return `data:image/jpeg;base64,${imagePath}`;
  };

  const imageSrc = getImageUrl(property.primaryImage || property.image);

  return (
    <div className="group surface-card flex flex-col overflow-hidden transition-all hover:shadow-md bg-white rounded-2xl border text-right" dir="rtl">
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
          <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            {property.purpose === "Sale" || property.purpose === "للبيع" ? "للبيع" : "للإيجار"}
          </span>
          <span className="rounded-md bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
            {property.propertyType}
          </span>
        </div>
        
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // لو فشل تحميل الصورة لأي سبب أخر، نضع الـ placeholder لحماية الواجهة من الانهيار
            e.target.src = "/images/placeholder-property.jpg";
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="line-clamp-1 text-lg font-bold text-slate-900">
            {property.price?.toLocaleString("ar-EG")} ج.م
          </h3>
        </div>
        
        <p className="line-clamp-2 text-sm font-medium text-slate-700 mb-4">
          {property.title}
        </p>

        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <span className="truncate">{property.city}، {property.address}</span>
        </div>

        {/* Features Divider */}
        <div className="mt-auto grid grid-cols-3 divide-x divide-x-reverse divide-slate-100 border-t border-slate-100 pt-4">
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-xs text-slate-400">المساحة</span>
            <span className="text-sm font-semibold text-slate-700">{property.area} م²</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-xs text-slate-400">الغرف</span>
            <span className="text-sm font-semibold text-slate-700">{property.rooms}</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-xs text-slate-400">الحمامات</span>
            <span className="text-sm font-semibold text-slate-700">{property.bathrooms}</span>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <Link 
          href={`/announcement/${property.id}`}
          className="flex w-full items-center justify-center rounded-xl bg-slate-50 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
        >
          التفاصيل
        </Link>
      </div>
    </div>
  );
}