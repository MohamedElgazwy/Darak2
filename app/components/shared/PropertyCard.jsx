"use client";

import Link from "next/link";

export default function PropertyCard({ property }) {
  
  // دالة ذكية للتعامل مع مسارات الصور القادمة من الباك إند
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder-property.jpg";
    if (imagePath.startsWith("http") || imagePath.startsWith("data:")) return imagePath;
    if (imagePath.startsWith("/")) return `https://darak.runasp.net${imagePath}`;
    return `data:image/jpeg;base64,${imagePath}`;
  };

  // دوال مساعدة لاستخراج البيانات أياً كانت حالة الأحرف
  const id = property.id || property.Id;
  const price = property.price || property.Price || 0;
  const title = property.title || property.Title || "بدون عنوان";
  const city = property.city || property.City || "";
  const address = property.address || property.Address || "";
  const purpose = property.purpose || property.Purpose;
  const propertyType = property.propertyType || property.PropertyType;
  
  // 💡 الحل الجذري لمشكلة الشرطة (-): استخدام ?? بدلاً من || ليسمح بظهور الرقم 0
  const area = property.area ?? property.Area ?? "-";
  const rooms = property.rooms ?? property.Rooms ?? "-";
  const bathrooms = property.bathrooms ?? property.Bathrooms ?? "-";
  
  // شمولية في التقاط اسم مفتاح الصورة من السيرفر
  const imageSrc = getImageUrl(property.primaryImage || property.PrimaryImage || property.image || property.Image);

  return (
    <div className="group surface-card flex flex-col overflow-hidden transition-all hover:shadow-md bg-white rounded-2xl border text-right" dir="rtl">
      {/* ── Image Container ── */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
          <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            {purpose === "Sale" || purpose === "للبيع" ? "للبيع" : "للإيجار"}
          </span>
          <span className="rounded-md bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
            {propertyType}
          </span>
        </div>
        
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { e.target.src = "/images/placeholder-property.jpg"; }}
        />
      </div>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="line-clamp-1 text-lg font-black text-indigo-700">
            {price.toLocaleString("ar-EG")} <span className="text-xs font-medium text-slate-500">ج.م</span>
          </h3>
        </div>
        
        <p className="line-clamp-2 text-sm font-bold text-slate-900 mb-4">
          {title}
        </p>

        <div className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 font-medium">
          <span className="opacity-80">📍</span>
          <span className="truncate">{city}، {address}</span>
        </div>

        {/* ── Features Divider ── */}
        <div className="mt-auto grid grid-cols-3 divide-x divide-x-reverse divide-slate-100 border-t border-slate-100 pt-4">
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-[11px] font-bold text-slate-400">المساحة</span>
            <span className="text-sm font-black text-slate-700">{area} م²</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-[11px] font-bold text-slate-400">الغرف</span>
            <span className="text-sm font-black text-slate-700">{rooms}</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-[11px] font-bold text-slate-400">الحمامات</span>
            <span className="text-sm font-black text-slate-700">{bathrooms}</span>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <Link 
          href={`/announcement/${id}`}
          className="flex w-full items-center justify-center rounded-xl bg-slate-50 border border-slate-100 py-3 text-sm font-bold text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
        >
          عرض التفاصيل الكاملة
        </Link>
      </div>
    </div>
  );
}