"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { feedbackService } from "@/app/services/feedback.service"; // تأكد من المسار

export default function AnnouncementDetailsPage() {
  const params = useParams();
  const companyId = params?.companyId;
  const announcementId = params?.announcementId;

  const [loading, setLoading] = useState(true);
  const [estate, setEstate] = useState(null);
  
  // States التقييمات (Feedback)
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

  useEffect(() => {
    const fetchAnnouncementAndFeedbacks = async () => {
      setLoading(true);
      try {
        // 💡 1. جلب بيانات الإعلان الأساسية (استبدلها بالدالة الحقيقية الخاصة بك)
        // const estateRes = await announcementService.getById(announcementId);
        
        // بيانات وهمية للإعلان لحين ربط الـ API الخاص به
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
          description: "استمتع بالرفاهية المطلقة في هذه الفيلا الفاخرة...",
          features: ["مسبح خاص", "حديقة", "أمن وحراسة 24/7", "منزل ذكي"],
          images: ["https://images.unsplash.com/photo-1613490900233-08cf04b73cb3?q=80&w=1200&auto=format&fit=crop"]
        });

        // 💡 2. جلب التقييمات الحقيقية لهذا الإعلان
        const fbRes = await feedbackService.getAnnouncementFeedbacks(announcementId).catch(() => []);
        setFeedbacks(extractData(fbRes) || []);

      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncementAndFeedbacks();
  }, [announcementId]);

  // دالة إرسال تقييم جديد
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
      
      // تفريغ الحقول وإعادة جلب التقييمات لتحديث القائمة
      setNewComment("");
      setNewRating(5);
      const fbRes = await feedbackService.getAnnouncementFeedbacks(announcementId);
      setFeedbacks(extractData(fbRes) || []);
      
    } catch (err) {
      console.error("Failed to submit feedback", err);
      setFeedbackError("حدث خطأ أثناء إضافة التقييم. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-400 border-t-transparent opacity-60" />
      </div>
    );
  }

  if (!estate) return <div className="text-center py-20">لم يتم العثور على الإعلان.</div>;

  return (
    <div className="space-y-12 pb-16" dir="rtl">
      
      {/* ── زر العودة ── */}
      <div>
        <Link href={`/company/${companyId}/announcements`} className="inline-flex items-center gap-2 font-bold opacity-70 hover:opacity-100 transition-opacity">
          <span>&rarr;</span> العودة للإعلانات
        </Link>
      </div>

      {/* ── معرض الصور ── */}
      <div className="relative h-[50vh] min-h-[400px] rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-500/20">
        <img src={estate.images[0]} alt={estate.title} className="w-full h-full object-cover" />
        <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md text-white text-sm font-bold px-5 py-2 rounded-full">
          {estate.status}
        </div>
      </div>

      {/* ── تفاصيل العقار ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* العمود الأيمن */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4 border-b border-slate-500/20 pb-8">
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">{estate.title}</h1>
            <p className="opacity-70 text-lg flex items-center gap-2">
              <span>📍</span> {estate.location}
            </p>
            <div className="text-4xl font-black mt-4">
              {estate.price} <span className="text-xl opacity-70 font-normal">ج.م</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 md:gap-8 bg-slate-500/10 p-6 rounded-3xl border border-slate-500/20">
            <div className="flex flex-col gap-1">
              <span className="opacity-60 text-sm font-bold">غرف النوم</span>
              <span className="text-xl font-black flex items-center gap-2">🛏️ {estate.beds}</span>
            </div>
            <div className="w-px bg-slate-500/20 hidden md:block"></div>
            <div className="flex flex-col gap-1">
              <span className="opacity-60 text-sm font-bold">الحمامات</span>
              <span className="text-xl font-black flex items-center gap-2">🛁 {estate.baths}</span>
            </div>
            <div className="w-px bg-slate-500/20 hidden md:block"></div>
            <div className="flex flex-col gap-1">
              <span className="opacity-60 text-sm font-bold">المساحة</span>
              <span className="text-xl font-black flex items-center gap-2">📐 {estate.area} م²</span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">وصف العقار</h2>
            <p className="opacity-80 leading-relaxed text-lg text-justify whitespace-pre-line">
              {estate.description}
            </p>
          </div>
        </div>

        {/* العمود الأيسر (التواصل) */}
        <div className="space-y-6">
          <div className="sticky top-28 bg-slate-500/10 p-8 rounded-[2rem] border border-slate-500/20 shadow-lg text-center">
            <h3 className="text-xl font-bold mb-2">هل أعجبك هذا العقار؟</h3>
            <p className="opacity-70 text-sm mb-8">تواصل معنا لتحديد موعد للمعاينة أو لمعرفة المزيد.</p>
            <Link 
              href={`/company/${companyId}/contact`}
              className="w-full inline-block bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
            >
              تواصل معنا
            </Link>
          </div>
        </div>

      </div>

      {/* ── قسم التقييمات (Feedback Section) ── */}
      <div className="mt-16 pt-12 border-t border-slate-500/20 max-w-4xl">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-2">
          ⭐ تقييمات الزوار
        </h2>

        {/* نموذج إضافة تقييم */}
        <form onSubmit={handleFeedbackSubmit} className="bg-slate-500/10 p-6 rounded-3xl border border-slate-500/20 mb-10">
          <h3 className="font-bold mb-4 opacity-90">أضف تقييمك لهذا العقار</h3>
          
          {feedbackError && <div className="text-red-500 text-sm font-bold mb-4">{feedbackError}</div>}

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
            className="w-full p-4 bg-transparent border border-slate-500/30 rounded-2xl outline-none focus:border-slate-500/60 transition-colors resize-none mb-4 placeholder-current placeholder-opacity-50"
            placeholder="ما رأيك في هذا العقار؟ شاركنا تجربتك..."
            required
          ></textarea>
          <button
            type="submit"
            disabled={isSubmittingFeedback}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center min-w-[120px]"
          >
            {isSubmittingFeedback ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "نشر التقييم"}
          </button>
        </form>

        {/* قائمة التقييمات السابقة */}
        <div className="space-y-6">
          {feedbacks.length > 0 ? feedbacks.map((fb, idx) => (
            <div key={fb.id || idx} className="pb-6 border-b border-slate-500/10 last:border-0 last:pb-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-amber-400 text-lg">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < (fb.rating || 5) ? "★" : "☆"}</span>
                  ))}
                </div>
                <span className="font-bold opacity-90">{fb.userName || "زائر موثق"}</span>
              </div>
              <p className="opacity-80 leading-relaxed text-sm md:text-base whitespace-pre-line">{fb.comment}</p>
            </div>
          )) : (
            <div className="text-center opacity-60 py-8">لا توجد تقييمات لهذا العقار حتى الآن. كن أول من يقيم!</div>
          )}
        </div>
      </div>

    </div>
  );
}