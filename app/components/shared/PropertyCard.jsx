"use client";

import Link from "next/link";

export default function PropertyCard({ property }) {
  // دالة ذكية لمعالجة مسار الصورة لتجنب الأخطاء
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/600x400?text=Darak+Real+Estate";
    if (imagePath.startsWith("http") || imagePath.startsWith("data:")) return imagePath;
    if (imagePath.startsWith("/")) return `https://darak.runasp.net${imagePath}`;
    return `https://darak.runasp.net/${imagePath}`;
  };

  const imageUrl = getImageUrl(property.primaryImage);
  
  // معالجة الغرض إذا كان مرسلاً من الباك إند (وإخفاؤه بذكاء إذا لم يكن موجوداً)
  const purposeText = property.purpose === "Sale" || property.purpose === "للبيع" ? "للبيع" : 
                      property.purpose === "Rent" || property.purpose === "للإيجار" ? "للإيجار" : null;

  return (
    <div className="group flex flex-col bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgba(79,70,229,0.08)] hover:-translate-y-1.5 transition-all duration-300 text-right" dir="rtl">
      
      {/* ── حاوية الصورة والشارات (Badges) ── */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img 
          src={imageUrl} 
          alt={property.title} 
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Darak"; }}
        />
        
        {/* تدرج لوني خفيف أسفل الصورة لإبراز الشارات */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-40 transition-opacity group-hover:opacity-60"></div>
        
        {/* الشارات (النوع والغرض) */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          {purposeText && (
            <span className="rounded-xl bg-indigo-600/90 backdrop-blur-md px-3 py-1.5 text-xs font-black text-white shadow-sm border border-white/20">
              {purposeText}
            </span>
          )}
          {property.propertyType && (
            <span className="rounded-xl bg-white/95 backdrop-blur-md px-3 py-1.5 text-xs font-black text-slate-800 shadow-sm border border-slate-200/50">
              {property.propertyType}
            </span>
          )}
        </div>

        {/* شارة التميز (إن وجدت) */}
        {property.isFeatured && (
          <div className="absolute top-4 left-4">
            <span className="flex items-center gap-1 rounded-xl bg-amber-500/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-white shadow-sm border border-white/20">
              ⭐ مميز
            </span>
          </div>
        )}
      </div>

      {/* ── حاوية المحتوى ── */}
      <div className="flex flex-col flex-1 p-5 md:p-6">
        
        {/* السعر */}
        <div className="mb-2.5">
          <span className="text-2xl font-black tracking-tight text-indigo-600">
            {property.price?.toLocaleString("ar-EG")}
          </span>
          <span className="text-xs font-bold text-slate-400 mr-1.5">ج.م</span>
        </div>

        {/* العنوان */}
        <h3 className="text-lg font-black text-slate-900 line-clamp-1 mb-2.5 group-hover:text-indigo-600 transition-colors">
          {property.title}
        </h3>

        {/* الموقع */}
        <div className="flex items-start gap-1.5 text-sm font-semibold text-slate-500 mb-6">
          <span className="mt-0.5 text-slate-400">📍</span>
          <span className="line-clamp-2 leading-relaxed">{property.city}، {property.address}</span>
        </div>

        {/* زر عرض التفاصيل */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <Link 
            href={`/announcement/${property.id}`} 
            className="flex items-center justify-center w-full py-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-indigo-600 text-sm font-black transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 shadow-sm"
          >
            عرض التفاصيل الكاملة
          </Link>
        </div>

      </div>
    </div>
  );
}