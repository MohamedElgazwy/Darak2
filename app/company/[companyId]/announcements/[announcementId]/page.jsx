"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function AnnouncementDetailsPage() {
  const params = useParams();
  const companyId = params?.companyId;
  const announcementId = params?.announcementId;

  const [loading, setLoading] = useState(true);
  const [estate, setEstate] = useState(null);
  
  // States الخاصة بقسم التقييمات (Feedback)
  const [feedbacks, setFeedbacks] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    // 💡 محاكاة جلب بيانات الإعلان من الباك إند
    setTimeout(() => {
      setEstate({
        id: announcementId,
        title: "فيلا فاخرة بإطلالة بحرية ساحرة",
        type: "فيلا",
        status: "للبيع",
        location: "الساحل الشمالي، مصر",
        price: "15,000,000",
        beds: 5,
        baths: 4,
        area: 450,
        description: "استمتع بالرفاهية المطلقة في هذه الفيلا الفاخرة المصممة على أحدث طراز معماري. تتميز بإطلالة بانورامية مباشرة على البحر، وحديقة خاصة واسعة مع مسبح إنفينيتي. تتكون الفيلا من طابقين ومجهزة بأحدث أنظمة المنزل الذكي (Smart Home). تشطيبات فائقة الجودة (سوبر لوكس) جاهزة للسكن الفوري. موقع استراتيجي بالقرب من كافة الخدمات والمناطق الترفيهية.",
        features: ["مسبح خاص", "حديقة", "جراج لسيارتين", "أمن وحراسة 24/7", "تكييف مركزي", "منزل ذكي"],
        images: [
          "https://images.unsplash.com/photo-1613490900233-08cf04b73cb3?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop"
        ]
      });

      // 💡 محاكاة جلب تقييمات هذا الإعلان
      setFeedbacks([
        { id: 1, user: "أحمد محمود", rating: 5, comment: "الفيلا ممتازة ومطابقة تماماً للصور. تعامل راقي جداً من الشركة." },
        { id: 2, user: "سارة عبد الله", rating: 4, comment: "الموقع رائع والتصميم عصري، لكن السعر مرتفع قليلاً مقارنة بالسوق." }
      ]);
      setLoading(false);
    }, 1000);
  }, [announcementId]);

  // دالة إرسال تقييم جديد
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingFeedback(true);
    
    // محاكاة إرسال التقييم للباك إند
    setTimeout(() => {
      setFeedbacks([{ id: Date.now(), user: "زائر جديد", rating: newRating, comment: newComment }, ...feedbacks]);
      setNewComment("");
      setNewRating(5);
      setIsSubmittingFeedback(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent opacity-50"></div>
      </div>
    );
  }

  if (!estate) return <div className="text-center py-20">لم يتم العثور على الإعلان.</div>;

  return (
    <div className="space-y-12 pb-16">
      
      {/* ── 1. زر العودة ── */}
      <div>
        <Link href={`/company/${companyId}/announcements`} className="inline-flex items-center gap-2 font-bold opacity-70 hover:opacity-100 transition-opacity">
          <span>&rarr;</span> العودة للإعلانات
        </Link>
      </div>

      {/* ── 2. معرض الصور (Hero Image) ── */}
      <div className="relative h-[50vh] min-h-[400px] rounded-[2.5rem] overflow-hidden shadow-xl border border-current border-opacity-10">
        <img src={estate.images[0]} alt={estate.title} className="w-full h-full object-cover" />
        <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md text-white text-sm font-bold px-5 py-2 rounded-full">
          {estate.status}
        </div>
        <div className="absolute top-6 left-6 bg-amber-500 text-slate-900 text-sm font-bold px-5 py-2 rounded-full shadow-lg">
          {estate.type}
        </div>
      </div>

      {/* ── 3. تفاصيل العقار ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* العمود الأيمن (البيانات الرئيسية) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* العنوان والسعر */}
          <div className="space-y-4 border-b border-current border-opacity-10 pb-8">
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">{estate.title}</h1>
            <p className="opacity-70 text-lg flex items-center gap-2">
              <span>📍</span> {estate.location}
            </p>
            <div className="text-4xl font-black mt-4">
              {estate.price} <span className="text-xl opacity-70 font-normal">ج.م</span>
            </div>
          </div>

          {/* الإحصائيات السريعة */}
          <div className="flex flex-wrap gap-4 md:gap-8 bg-current bg-opacity-5 p-6 rounded-3xl border border-current border-opacity-10">
            <div className="flex flex-col gap-1">
              <span className="opacity-60 text-sm font-bold">غرف النوم</span>
              <span className="text-xl font-black flex items-center gap-2">🛏️ {estate.beds}</span>
            </div>
            <div className="w-px bg-current opacity-10 hidden md:block"></div>
            <div className="flex flex-col gap-1">
              <span className="opacity-60 text-sm font-bold">الحمامات</span>
              <span className="text-xl font-black flex items-center gap-2">🛁 {estate.baths}</span>
            </div>
            <div className="w-px bg-current opacity-10 hidden md:block"></div>
            <div className="flex flex-col gap-1">
              <span className="opacity-60 text-sm font-bold">المساحة</span>
              <span className="text-xl font-black flex items-center gap-2">📐 {estate.area} م²</span>
            </div>
          </div>

          {/* الوصف */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">وصف العقار</h2>
            <p className="opacity-80 leading-relaxed text-lg text-justify">
              {estate.description}
            </p>
          </div>

          {/* المميزات (Features) */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">المميزات والمرافق</h2>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {estate.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 opacity-80 font-medium">
                  <span className="text-emerald-500">✔</span> {feature}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* العمود الأيسر (كرت التواصل السريع) */}
        <div className="space-y-6">
          <div className="sticky top-28 bg-current bg-opacity-5 p-8 rounded-[2rem] border border-current border-opacity-10 shadow-lg text-center">
            <div className="w-20 h-20 bg-current bg-opacity-10 rounded-full mx-auto flex items-center justify-center text-3xl mb-4">
              🏢
            </div>
            <h3 className="text-xl font-bold mb-2">هل أعجبك هذا العقار؟</h3>
            <p className="opacity-70 text-sm mb-8">تواصل معنا الآن لتحديد موعد للمعاينة أو لمعرفة المزيد من التفاصيل.</p>
            
            <Link 
              href={`/company/${companyId}/contact`}
              className="w-full inline-block bg-amber-500 text-slate-900 font-bold py-4 rounded-xl hover:bg-amber-400 transition-colors shadow-md mb-4"
            >
              تواصل معنا
            </Link>
            <button className="w-full inline-block bg-transparent border-2 border-current border-opacity-20 font-bold py-3.5 rounded-xl hover:border-opacity-100 transition-colors">
              مشاركة الإعلان 🔗
            </button>
          </div>
        </div>

      </div>

      {/* ── 4. قسم التقييمات (Feedback Section) ── */}
      <div className="mt-16 pt-12 border-t border-current border-opacity-10 max-w-4xl">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-2">
          ⭐ تقييمات الزوار
        </h2>

        {/* نموذج إضافة تقييم */}
        <form onSubmit={handleFeedbackSubmit} className="bg-current bg-opacity-5 p-6 rounded-3xl border border-current border-opacity-10 mb-10">
          <h3 className="font-bold mb-4 opacity-90">أضف تقييمك لهذا العقار</h3>
          <div className="flex items-center gap-2 mb-4 cursor-pointer">
            <span className="text-sm opacity-70">التقييم:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setNewRating(star)}
                className={`text-2xl transition-all ${newRating >= star ? "text-amber-400" : "opacity-20"}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="3"
            className="w-full p-4 bg-transparent border border-current border-opacity-20 rounded-2xl outline-none focus:border-opacity-50 transition-colors resize-none mb-4 placeholder-current placeholder-opacity-50"
            placeholder="ما رأيك في هذا العقار؟ شاركنا تجربتك..."
            required
          ></textarea>
          <button
            type="submit"
            disabled={isSubmittingFeedback}
            className="bg-current text-white dark:text-slate-900 invert dark:invert-0 px-8 py-3 rounded-xl font-bold hover:opacity-80 transition-opacity flex items-center justify-center min-w-[120px]"
          >
            {isSubmittingFeedback ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : "نشر التقييم"}
          </button>
        </form>

        {/* قائمة التقييمات السابقة */}
        <div className="space-y-6">
          {feedbacks.length > 0 ? feedbacks.map((fb) => (
            <div key={fb.id} className="pb-6 border-b border-current border-opacity-10 last:border-0 last:pb-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-amber-400 text-lg">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < fb.rating ? "★" : "☆"}</span>
                  ))}
                </div>
                <span className="font-bold opacity-90">{fb.user}</span>
              </div>
              <p className="opacity-80 leading-relaxed text-sm md:text-base">{fb.comment}</p>
            </div>
          )) : (
            <div className="text-center opacity-60 py-8">لا توجد تقييمات لهذا العقار حتى الآن. كن أول من يقيم!</div>
          )}
        </div>
      </div>

    </div>
  );
}