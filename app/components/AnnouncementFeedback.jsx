"use client";

import { useEffect, useState } from "react";
import { feedbackService } from "../services";

export default function AnnouncementFeedback({ announcementId }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States للفورم الجديد
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5); // التقييم الافتراضي 5 نجوم
  const [isSubmitting, setIsSubmitting] = useState(false);

  // استخراج البيانات
  const extractData = (res) => {
    if (!res) return [];
    if (res.data !== undefined) return res.data;
    return res;
  };

  // جلب التقييمات
  const fetchFeedbacks = async () => {
    try {
      const res = await feedbackService.getAnnouncementFeedbacks(announcementId);
      setFeedbacks(extractData(res) || []);
    } catch (err) {
      console.error("Failed to load feedbacks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (announcementId) {
      fetchFeedbacks();
    }
  }, [announcementId]);

  // إرسال تقييم جديد
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        comment,
        rating,
        announcementId: parseInt(announcementId)
      };
      
      await feedbackService.create(payload);
      
      // تفريغ الحقول وتحديث القائمة بعد النجاح
      setComment("");
      setRating(5);
      fetchFeedbacks();
      
    } catch (err) {
      console.error("Failed to submit feedback", err);
      alert("حدث خطأ أثناء إضافة التقييم.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mt-8 text-right" dir="rtl">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
        ⭐ تقييمات العملاء
      </h2>

      {/* قسم إضافة تقييم جديد */}
      <form onSubmit={handleSubmit} className="mb-10 bg-slate-50 p-5 rounded-2xl border border-slate-100">
        <h3 className="font-bold text-slate-700 mb-4">أضف تقييمك لهذا العقار</h3>
        
        {/* اختيار النجوم */}
        <div className="flex items-center gap-2 mb-4 cursor-pointer">
          <span className="text-sm text-slate-500">التقييم:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl transition-all ${rating >= star ? "text-amber-400" : "text-slate-300 hover:text-amber-200"}`}
            >
              ★
            </button>
          ))}
        </div>

        {/* حقل التعليق */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="3"
          className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none resize-none mb-4"
          placeholder="ما رأيك في هذا العقار؟ شاركنا تجربتك..."
          required
        ></textarea>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center min-w-[120px]"
        >
          {isSubmitting ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "نشر التقييم"
          )}
        </button>
      </form>

      {/* قائمة التقييمات السابقة */}
      {loading ? (
        <div className="text-center text-slate-500 py-8">جاري تحميل التقييمات...</div>
      ) : feedbacks.length > 0 ? (
        <div className="space-y-6">
          {feedbacks.map((fb, index) => (
            <div key={fb.id || index} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 mb-2">
                {/* عرض النجوم بناءً على التقييم */}
                <div className="text-amber-400 flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < fb.rating ? "★" : "☆"}</span>
                  ))}
                </div>
                {/* يمكنك إضافة اسم المستخدم هنا إذا كان الـ API يرجعه */}
                <span className="text-sm font-bold text-slate-700 mx-2">عميل موثق</span> 
              </div>
              <p className="text-slate-600 leading-relaxed text-sm">{fb.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center bg-slate-50 rounded-2xl py-8 border border-dashed border-slate-200">
          <p className="text-slate-500">لا توجد تقييمات لهذا العقار حتى الآن. كن أول من يقيم!</p>
        </div>
      )}
    </div>
  );
}