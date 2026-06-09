"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { feedbackService } from "@/app/services/feedback.service"; // تأكد من مسار الخدمة الخاص بك

export default function MainPlatformAnnouncementPage() {
  const params = useParams();
  const announcementId = params?.id; // أو params?.announcementId بناءً على اسم المجلد عندك

  // ── 1. States ──
  const [loading, setLoading] = useState(true);
  const [estate, setEstate] = useState(null);

  // States الخاصة بالتقييمات
  const [feedbacks, setFeedbacks] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  // دالة مساعدة لاستخراج البيانات
  const extractData = (res) => {
    if (!res) return [];
    if (res.data !== undefined) return res.data;
    if (res.value !== undefined) return res.value;
    return res;
  };

  // ── 2. Fetch Data ──
  useEffect(() => {
    if (!announcementId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 💡 جلب تفاصيل الإعلان (استبدلها بالـ API الحقيقي الخاص بك)
        // const estateRes = await announcementService.getById(announcementId);
        
        // بيانات وهمية لمحاكاة الشكل في صورتك
        setEstate({
          id: announcementId,
          title: "test before hamada",
          location: "المنوفية، honololo",
          price: "500,000",
          status: "للبيع",
          type: "مكتب",
          advertiser: {
            name: "MohamedFarag",
            type: "فرد",
            avatar: "M"
          },
          description: "هذا النص هو وصف تجريبي للعقار يعرض تفاصيل المساحة والمميزات والموقع بشكل دقيق للمشتري."
        });

        // 💡 جلب التقييمات الحقيقية لهذا الإعلان من الباك إند
        const fbRes = await feedbackService.getAnnouncementFeedbacks(announcementId).catch(() => []);
        setFeedbacks(extractData(fbRes) || []);

      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [announcementId]);

  // ── 3. Handle Feedback Submit ──
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
      
      // تفريغ الحقل وتحديث قائمة التقييمات لتظهر فوراً
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

  // ── 4. Loading State ──
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent opacity-80" />
      </div>
    );
  }

  if (!estate) return <div className="text-center py-20 text-slate-600 font-bold">لم يتم العثور على الإعلان.</div>;

  // ── 5. Main Render ──
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" dir="rtl">
      
      {/* رأس الصفحة (Title & Price) مطابقة لصورتك */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-200 pb-6">
        <div>
          <div className="text-sm text-slate-500 mb-2 flex items-center gap-2">
            <span>الرئيسية</span> / <span>العقارات</span> / <span>{estate.title}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{estate.title}</h1>
          <p className="text-slate-500 flex items-center gap-1">
            📍 {estate.location}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 text-left">
          <div className="text-3xl font-black text-indigo-700 flex items-center justify-end gap-2 text-left" dir="ltr">
            <span className="text-lg text-slate-500 font-medium">ج.م</span>
            {estate.price}
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm font-bold">{estate.status}</span>
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm font-bold">{estate.type}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* العمود الأيمن (الصور والتفاصيل) */}
        <div className="lg:col-span-2 space-y-8">
          {/* مساحة الصورة */}
          <div className="bg-slate-200 rounded-2xl h-[400px] flex items-center justify-center text-4xl font-black text-slate-400 select-none">
            Darak RealEstate
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">التفاصيل</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {estate.description}
            </p>
          </div>
        </div>

        {/* العمود الأيسر (شريط التواصل) مطابقة لصورتك */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-2">مهتم بهذا العقار؟</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              تواصل مع المعلن الآن لمعرفة المزيد من التفاصيل أو تحديد موعد للمعاينة.
            </p>
            
            <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors mb-3">
              عرض رقم الهاتف
            </button>
            <button className="w-full bg-white text-slate-700 border border-slate-300 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors mb-6">
              إرسال رسالة
            </button>

            <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
              <div className="text-right">
                <p className="font-bold text-slate-900">{estate.advertiser.name}</p>
                <p className="text-sm text-slate-500">{estate.advertiser.type}</p>
                <Link href="#" className="text-indigo-600 text-sm font-bold mt-1 inline-block hover:underline">
                  زيارة صفحة البائع
                </Link>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xl font-bold text-slate-600">
                {estate.advertiser.avatar}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── قسم التقييمات (Feedback Section) المضاف حديثاً ── */}
      <div className="mt-16 pt-12 border-t border-slate-200 max-w-4xl">
        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-2">
          ⭐ تقييمات الزوار
        </h2>

        {/* نموذج إضافة تقييم */}
        <form onSubmit={handleFeedbackSubmit} className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 mb-10 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">أضف تقييمك لهذا العقار</h3>
          
          {feedbackError && <div className="text-red-500 text-sm font-bold mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{feedbackError}</div>}

          <div className="flex items-center gap-2 mb-4 cursor-pointer">
            <span className="text-sm font-bold text-slate-600">تقييمك:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setNewRating(star)}
                className={`text-3xl transition-all hover:scale-110 ${newRating >= star ? "text-amber-400" : "text-slate-300"}`}
              >
                ★
              </button>
            ))}
          </div>
          
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="3"
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors resize-none mb-4 text-slate-800 placeholder-slate-400 shadow-inner"
            placeholder="شاركنا رأيك وتجربتك مع هذا العقار بصدق..."
            required
          ></textarea>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmittingFeedback}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center min-w-[140px] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmittingFeedback ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "نشر التقييم"}
            </button>
          </div>
        </form>

        {/* قائمة التقييمات السابقة */}
        <div className="space-y-6">
          {feedbacks.length > 0 ? feedbacks.map((fb, idx) => (
            <div key={fb.id || idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    {(fb.userName || "ز").charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{fb.userName || "زائر موثق"}</h4>
                    <span className="text-xs text-slate-400">تقييم معتمد</span>
                  </div>
                </div>
                <div className="text-amber-400 text-lg flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < (fb.rating || 5) ? "★" : "☆"}</span>
                  ))}
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-line pr-12">
                {fb.comment}
              </p>
            </div>
          )) : (
            <div className="text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-10">
              <span className="text-4xl block mb-2 opacity-30">💬</span>
              <p className="text-slate-500 font-medium">لا توجد تقييمات لهذا العقار حتى الآن. كن أول من يشارك رأيه!</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}