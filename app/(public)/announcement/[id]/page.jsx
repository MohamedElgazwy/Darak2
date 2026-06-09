"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { announcementService, userService } from "@/app/services";

export default function AnnouncementDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [owner, setOwner] = useState(null);

  // ─── الدالة الذكية الموحدة لمعالجة مسارات الصور وصيغ السيرفر المتفاوتة ───
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/600x400?text=Darak+RealEstate"; 
    
    // 1. إذا كان رابط كامل أو يحتوي على البادئة جاهزة
    if (imagePath.startsWith("http") || imagePath.startsWith("data:")) return imagePath;
    
    // 2. إذا كان مسار نسبي لملفات السيرفر (الحالة القادمة من السيرفر)
    if (imagePath.startsWith("/")) return `https://darak.runasp.net${imagePath}`;
    
    // 3. فرضية الـ Base64 الخام في حال رجعت داتا بدون البادئة
    return `data:image/jpeg;base64,${imagePath}`;
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // استدعاء الـ Endpoint: GET /API/Announcement/{id}
        const res = await announcementService.getById(id);
        const data = res?.data ?? res;
        setProperty(data);
        
        // 🛠️ فحص الصورة بكل المسميات المتاحة في السيرفر لضمان التقاطها (CamelCase أو PascalCase)
        const mainImage = data.primaryImage || data.PrimaryImage || data.imagePath || data.image || data.primaryImageUrl;

        if (mainImage) {
          setActiveImage(getImageUrl(mainImage));
        }
        // جلب بيانات صاحب الإعلان (مستخدم أو شركة) إذا توفرت
        const ownerId = data.companyId || data.userId || data.ownerId;
        if (ownerId) {
          try {
            const ownerRes = await userService.getById(ownerId);
            setOwner(ownerRes?.data || ownerRes || null);
          } catch (e) {
            console.warn("Failed to fetch owner info", e);
            // Fallback: derive owner info from the announcement payload if available
            const fallbackOwner = {
              id: ownerId,
              companyName: data.companyName || data.ownerName || data.organizationName || null,
              firstName: data.ownerFirstName || data.firstName || null,
              lastName: data.ownerLastName || data.lastName || null,
              logo: data.companyLogo || data.logo || null,
              userType: data.companyId ? "Company" : "User",
            };
            setOwner(fallbackOwner);
          }
        }
      } catch (err) {
        console.error(err);
        setError("عذراً، لم نتمكن من العثور على هذا العقار أو ربما تم حذفه.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">{error}</h1>
        <button onClick={() => router.push("/search")} className="btn-primary">
          العودة للبحث
        </button>
      </div>
    );
  }

  // 🛠️ معالجة صور المعرض الإضافية بأمان تام لتدعم كافة احتمالات كيز الباك إند
  const galleryImages = property.images?.map((img) => {
    const path = img.imageData || img.imagePath || img.ImagePath || img.ImageData || img;
    return getImageUrl(path);
  }) || [];
  
  const allImages = activeImage ? [activeImage, ...galleryImages.filter(img => img !== activeImage)] : galleryImages;

  return (
    <div className="container-shell py-8 lg:py-12 text-right" dir="rtl">
      
      {/* ── Breadcrumb & Header ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <button onClick={() => router.push("/")} className="hover:text-indigo-600">الرئيسية</button>
            <span>/</span>
            <button onClick={() => router.push("/search")} className="hover:text-indigo-600">العقارات</button>
            <span>/</span>
            <span className="text-slate-900 font-medium">{property.title}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{property.title}</h1>
          <p className="mt-2 flex items-center gap-2 text-slate-600">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.city}، {property.address}
          </p>
        </div>
        <div className="text-left">
          <p className="text-3xl font-bold text-indigo-600">
            {property.price?.toLocaleString("ar-EG")} <span className="text-lg text-slate-500">ج.م</span>
          </p>
          <div className="mt-2 flex justify-end gap-2">
            <span className="rounded-lg bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
              {property.purpose === "Sale" || property.purpose === "للبيع" ? "للبيع" : "للإيجار"}
            </span>
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              {property.propertyType}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* ── Left Column: Images & Description ── */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
                <img 
                src={activeImage || "https://placehold.co/600x400?text=Darak+RealEstate"} 
                alt={property.title} 
                loading="eager"
                className="h-full w-full object-cover"
                onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Darak+RealEstate"; }}
              />
            </div>
            
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      activeImage === img ? "border-indigo-600 shadow-md opacity-100" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                      <img 
                        src={img} 
                        alt={`Thumbnail ${idx}`} 
                        className="h-full w-full object-cover" 
                        onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Darak+RealEstate"; }} 
                      />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Features Grid */}
          <div className="surface-card p-6 sm:p-8 bg-white rounded-2xl border">
            <h2 className="mb-6 text-xl font-bold text-slate-900">تفاصيل العقار</h2>
            <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-slate-500">المساحة</span>
                <span className="text-lg font-bold text-slate-900">{property.area} م²</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-slate-500">الغرف</span>
                <span className="text-lg font-bold text-slate-900">{property.rooms}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-slate-500">الحمامات</span>
                <span className="text-lg font-bold text-slate-900">{property.bathrooms}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-slate-500">الطابق</span>
                <span className="text-lg font-bold text-slate-900">{property.floor}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="surface-card p-6 sm:p-8 bg-white rounded-2xl border">
            <h2 className="mb-4 text-xl font-bold text-slate-900">الوصف</h2>
            <div className="prose prose-slate max-w-none">
              <p className="whitespace-pre-line leading-relaxed text-slate-700">
                {property.description}
              </p>
            </div>
          </div>
        </div>

        {/* ── Right Column: Sticky Sidebar ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="surface-card p-6 bg-white rounded-2xl border">
              <h3 className="mb-4 text-lg font-bold text-slate-900">مهتم بهذا العقار؟</h3>
              <p className="mb-6 text-sm text-slate-500">
                تواصل مع المعلن الآن لمعرفة المزيد من التفاصيل أو تحديد موعد للمعاينة.
              </p>
              { (property.phone || property.mobile || property.contactPhone || property.ownerPhone || property.contactNumber) ? (
                <a href={`tel:${property.phone || property.mobile || property.contactPhone || property.ownerPhone || property.contactNumber}`} className="btn-primary mb-3 w-full flex items-center justify-center gap-2">
                  عرض رقم الهاتف: {property.phone || property.mobile || property.contactPhone || property.ownerPhone || property.contactNumber}
                </a>
              ) : (
                <button className="btn-primary mb-3 w-full flex items-center justify-center gap-2">عرض رقم الهاتف</button>
              )}
              <button className="btn-secondary w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2">إرسال رسالة</button>
            </div>

            {owner && (
              <div className="surface-card p-4 bg-white rounded-2xl border">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                          {owner.logo ? (
                            <img src={`data:image/jpeg;base64,${owner.logo}`} alt="logo" className="h-full w-auto object-contain" />
                          ) : (
                            <span className="text-slate-700 font-bold">{(owner.companyName || owner.firstName || "?")[0]}</span>
                          )}
                        </div>
                  <div className="flex-1 text-right">
                    <p className="font-semibold text-slate-900">{owner.companyName || `${owner.firstName} ${owner.lastName}`}</p>
                    <p className="text-sm text-slate-500">{owner.userType === "Company" ? "شركة" : "فرد"}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <a href={`/company/${owner.id || property.companyId || property.userId}`} className="text-indigo-600 hover:underline">زيارة صفحة البائع</a>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}