"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { announcementService, feedbackService } from "@/app/services";

export default function MainPlatformAnnouncementPage() {
  const params = useParams();
  const announcementId = params?.id || params?.announcementId; 

  const [loading, setLoading] = useState(true);
  const [estate, setEstate] = useState(null);

  // States التقييمات
  const [feedbacks, setFeedbacks] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const extractData = (res) => {
    if (!res) return [];
    if (res.data !== undefined) return res.data;
    if (res.value !== undefined) return res.value;
    return res;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder-property.jpg";
    if (imagePath.startsWith("http") || imagePath.startsWith("data:")) return imagePath;
    if (imagePath.startsWith("/")) return `https://darak.runasp.net${imagePath}`;
    return `data:image/jpeg;base64,${imagePath}`;
  };

  useEffect(() => {
    if (!announcementId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. جلب تفاصيل الإعلان الحقيقية
        const estateRes = await announcementService.getById(announcementId);
        const data = extractData(estateRes);

        if (!data || Object.keys(data).length === 0) {
           setEstate(null);
           return;
        }

        // 2. معالجة وتوحيد البيانات القادمة ودمج كل احتمالات أسماء الصور
        setEstate({
          id: data.id || data.Id || announcementId,
          title: data.title || data.Title || "عقار بدون عنوان",
          location: `${data.city || data.City || ""}، ${data.address || data.Address || ""}`,
          price: (data.price || data.Price || 0).toLocaleString("ar-EG"),
          status: data.purpose === "Sale" || data.purpose === "للبيع" ? "للبيع" : "للإيجار",
          type: data.propertyType || data.PropertyType || "غير محدد",
          advertiser: {
            name: data.userName || data.UserName || data.companyName || data.CompanyName || "مُعلن موثوق",
            type: data.companyId || data.CompanyId ? "شركة عقارية" : "مالك مباشر",
            avatar: (data.userName || data.UserName || data.companyName || "م")[0],
            companyId: data.companyId || data.CompanyId || null
          },
          description: data.description || data.Description || "لا يوجد وصف متاح لهذا العقار.",
          primaryImage: getImageUrl(data.primaryImage || data.PrimaryImage || data.image || data.Image),
          images: data.images || data.Images || [],
          area: data.area ?? data.Area ?? "-",
          rooms: data.rooms ?? data.Rooms ?? "-",
          bathrooms: data.bathrooms ?? data.Bathrooms ?? "-",
        });

        // 3. جلب التقييمات
        const fbRes = await feedbackService.getAnnouncementFeedbacks(announcementId).catch(() => []);
        setFeedbacks(extractData(fbRes) || []);

      } catch (err) {
        console.error("Failed to fetch announcement details:", err);
        setEstate(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [announcementId]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmittingFeedback(true);
    setFeedbackError("");
    
    try {
      const payload = {
        comment: newComment,
        rating: newRating,
        announcementId: parseInt(announcementId)
      };
      
      await feedbackService.create(payload);
      
      setNewComment("");
      setNewRating(5);
      const fbRes = await feedbackService.getAnnouncementFeedbacks(announcementId);
      setFeedbacks(extractData(fbRes) || []);
    } catch (err) {
      setFeedbackError("حدث خطأ أثناء إضافة التقييم. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-md" />
      </div>
    );
  }

  if (!estate) {
    return (
      <div className="text-center py-32 bg-slate-50 m-8 rounded-3xl border border-dashed border-slate-300">
        <div className="text-5xl mb-4 opacity-50">🏚️</div>
        <h2 className="text-2xl font-bold text-slate-700 mb-2">لم يتم العثور على الإعلان</h2>
        <p className="text-slate-500">قد يكون هذا العقار محذوفاً أو غير متاح حالياً.</p>
        <Link href="/search" className="mt-6 inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700">
          العودة للبحث
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" dir="rtl">
      
      {/* ── رأس الصفحة ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-200 pb-6 gap-4">
        <div>
          <div className="text-xs font-bold text-indigo-600 bg-indigo-50 inline-block px-3 py-1 rounded-full mb-3">
            رقم الإعلان: #{estate.id}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 leading-tight">{estate.title}</h1>
          <p className="text-slate-500 flex items-center gap-1.5 font-medium">
            <span className="opacity-80">📍</span> {estate.location}
          </p>
        </div>
        
        <div className="text-right w-full md:w-auto bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="text-3xl font-black text-indigo-700 flex items-center justify-start md:justify-end gap-2" dir="ltr">
            <span className="text-base text-slate-500 font-bold">ج.م</span>
            {estate.price}
          </div>
          <div className="flex gap-2 justify-start md:justify-end mt-3">
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md text-xs font-bold">{estate.status}</span>
            <span className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-md text-xs font-bold shadow-sm">{estate.type}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── العمود الأيمن (الصور والتفاصيل) ── */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 💡 الصورة الرئيسية معالجة بشكل سليم */}
          <div className="relative bg-slate-100 rounded-3xl h-[400px] sm:h-[500px] overflow-hidden shadow-sm border border-slate-200">
            <img 
              src={estate.primaryImage} 
              alt={estate.title} 
              className="w-full h-full object-cover" 
              onError={(e) => { e.target.src = "/images/placeholder-property.jpg"; }} 
            />
          </div>

          {/* شبكة الصور الإضافية إن وجدت */}
          {estate.images && estate.images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {estate.images.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer hover:opacity-80 transition bg-slate-50">
                  <img 
                    src={getImageUrl(img.url || img.Url || img.path)} 
                    alt={`صورة إضافية ${idx}`} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.src = "/images/placeholder-property.jpg"; }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* الإحصائيات السريعة */}
          <div className="flex flex-wrap gap-4 md:gap-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 text-xs font-bold">غرف النوم</span>
              <span className="text-xl font-black text-slate-800 flex items-center gap-2">🛏️ {estate.rooms}</span>
            </div>
            <div className="w-px bg-slate-100 hidden md:block"></div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 text-xs font-bold">الحمامات</span>
              <span className="text-xl font-black text-slate-800 flex items-center gap-2">🛁 {estate.bathrooms}</span>
            </div>
            <div className="w-px bg-slate-100 hidden md:block"></div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 text-xs font-bold">المساحة</span>
              <span className="text-xl font-black text-slate-800 flex items-center gap-2">📐 {estate.area} م²</span>
            </div>
          </div>

          {/* الوصف */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-4 border-b border-slate-100 pb-3">وصف العقار</h2>
            <p className="text-slate-600 leading-loose whitespace-pre-line font-medium text-[15px]">
              {estate.description}
            </p>
          </div>
        </div>

        {/* ── العمود الأيسر (شريط التواصل) ── */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 text-center sticky top-28">
            <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4 shadow-inner">
              {estate.advertiser.avatar}
            </div>
            <h3 className="text-lg font-black text-slate-900">{estate.advertiser.name}</h3>
            <p className="text-indigo-600 text-xs font-bold mb-6 mt-1">{estate.advertiser.type}</p>
            
            <p className="text-slate-500 text-sm mb-6 leading-relaxed border-t border-slate-100 pt-6">
              تواصل مع المعلن الآن لمعرفة المزيد من التفاصيل أو تحديد موعد للمعاينة.
            </p>
            
            <div className="space-y-3">
              <button className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20">
                📞 عرض رقم الهاتف
              </button>
              {estate.advertiser.companyId && (
                <Link 
                  href={`/company/${estate.advertiser.companyId}`}
                  className="w-full block bg-white text-slate-700 border-2 border-slate-200 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  🏢 زيارة صفحة الشركة
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── قسم التقييمات ── */}
      <div className="mt-16 pt-12 border-t border-slate-200 max-w-4xl">
        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-2">
          ⭐ تقييمات وتجارب الزوار
        </h2>

        <form onSubmit={handleFeedbackSubmit} className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 mb-10 shadow-inner">
          <h3 className="font-bold text-slate-800 mb-4">أضف تقييمك لهذا العقار</h3>
          
          {feedbackError && <div className="text-red-500 text-sm font-bold mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{feedbackError}</div>}

          <div className="flex items-center gap-2 mb-4 cursor-pointer">
            <span className="text-sm font-bold text-slate-600">تقييمك:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setNewRating(star)}
                className={`text-3xl transition-transform hover:scale-110 ${newRating >= star ? "text-amber-400 drop-shadow-sm" : "text-slate-300"}`}
              >
                ★
              </button>
            ))}
          </div>
          
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="3"
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors resize-none mb-4 text-slate-800 placeholder-slate-400 shadow-sm"
            placeholder="شاركنا رأيك وتجربتك مع هذا العقار بصدق..."
            required
          ></textarea>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmittingFeedback}
              className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md flex items-center justify-center min-w-[140px] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmittingFeedback ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "نشر التقييم الآن"}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {feedbacks.length > 0 ? feedbacks.map((fb, idx) => (
            <div key={fb.id || idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black">
                    {(fb.userName || fb.user?.firstName || "ز").charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{fb.userName || fb.user?.firstName || "زائر موثق"}</h4>
                  </div>
                </div>
                <div className="text-amber-400 text-base flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < (fb.rating || 5) ? "★" : "☆"}</span>
                  ))}
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm font-medium whitespace-pre-line pr-2 border-r-2 border-indigo-100">
                "{fb.comment}"
              </p>
            </div>
          )) : (
            <div className="text-center bg-white border border-dashed border-slate-300 rounded-3xl py-12">
              <span className="text-4xl block mb-2 opacity-30">💬</span>
              <p className="text-slate-500 font-bold">لا توجد تقييمات لهذا العقار حتى الآن.</p>
              <p className="text-xs text-slate-400 mt-1">كن أول من يشارك رأيه!</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}