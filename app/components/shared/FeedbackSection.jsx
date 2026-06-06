"use client";

import { useState, useEffect } from "react";
import { feedbackService } from "@/app/services";
import { useAuth } from "@/app/hooks/useAuth";

export default function FeedbackSection({ announcementId }) {
  const { isAuthenticated, user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for new feedback form
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: "", text: "" });

  const fetchFeedbacks = async () => {
    try {
      const res = await feedbackService.getAnnouncementFeedbacks(announcementId);
      const data = res?.data || res || [];
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (announcementId) fetchFeedbacks();
  }, [announcementId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setFormMessage({ type: "error", text: "يرجى تحديد التقييم بالنجوم أولاً." });
      return;
    }
    
    setSubmitting(true);
    setFormMessage({ type: "", text: "" });

    try {
      await feedbackService.create({
        announcementId: Number(announcementId),
        rating: rating,
        comment: comment
      });
      
      setFormMessage({ type: "success", text: "تم إضافة تقييمك بنجاح! شكراً لمساهمتك." });
      setComment("");
      setRating(0);
      fetchFeedbacks(); // تحديث القائمة فوراً
    } catch (err) {
      setFormMessage({ type: "error", text: err.response?.data?.message || "حدث خطأ أثناء إرسال التقييم." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm text-right" dir="rtl">
      <div className="border-b border-slate-100 pb-4 flex justify-between items-end">
        <div>
          <h3 className="text-xl font-black text-slate-900">تقييمات العقار والآراء</h3>
          <p className="text-xs font-semibold text-slate-400 mt-1">آراء الزوار والعملاء حول هذه الوحدة العقارية</p>
        </div>
        <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
          <span className="font-black text-sm">{feedbacks.length}</span>
          <span className="text-xs font-bold text-amber-700">تقييم</span>
        </div>
      </div>

      {/* ── قائمة التقييمات السابقة ── */}
      <div className="space-y-4">
        {loading ? (
          <div className="animate-pulse flex space-x-4 space-x-reverse">
            <div className="rounded-full bg-slate-200 h-10 w-10"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-2 bg-slate-200 rounded w-1/4"></div>
              <div className="h-2 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-8 text-slate-400 font-medium text-sm border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            كن أول من يكتب تقييماً حول هذا العقار!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbacks.map((fb, idx) => (
              <div key={fb.id || idx} className="bg-slate-50/70 border border-slate-100 p-5 rounded-2xl">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      {(fb.user?.firstName || "ع")[0]}
                    </div>
                    <span className="text-sm font-bold text-slate-800">{fb.user?.firstName || "عميل دارك"}</span>
                  </div>
                  <div className="flex text-amber-400 text-xs">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < fb.rating ? "text-amber-400" : "text-slate-300"}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">"{fb.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── استمارة إضافة تقييم جديد ── */}
      <div className="mt-8 pt-8 border-t border-slate-100">
        <h4 className="font-bold text-slate-900 mb-4">إضافة تقييمك الخاص</h4>
        
        {!isAuthenticated ? (
          <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl text-center">
            <p className="text-sm text-indigo-800 font-medium mb-3">يجب تسجيل الدخول لتتمكن من كتابة تقييم للملاك.</p>
            <a href="/auth/login" className="inline-block bg-indigo-600 text-white text-xs font-bold px-5 py-2 rounded-lg hover:bg-indigo-700 transition">تسجيل الدخول الآن</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {formMessage.text && (
              <div className={`p-3 rounded-xl text-xs font-bold ${formMessage.type === "error" ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
                {formMessage.text}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">تقييمك العام (بالنجوم) *</label>
              <div className="flex gap-1 flex-row-reverse justify-end">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <svg className={`w-8 h-8 ${star <= (hoverRating || rating) ? "text-amber-400 drop-shadow-sm" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">تعليقك وتجربتك *</label>
              <textarea
                required
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="شاركنا رأيك بصراحة عن العقار والموقع وتعاملك مع المالك..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button disabled={submitting} type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50">
                {submitting ? "جاري الإرسال..." : "نشر التقييم"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}