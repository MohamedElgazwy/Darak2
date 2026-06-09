"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { feedbackService } from "@/app/services/feedback.service"; // تأكد من المسار

export default function CompanyFeedbackPage() {
  const params = useParams();
  const companyId = params?.companyId;

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const extractData = (res) => {
    if (!res) return [];
    if (res.data !== undefined) return res.data;
    if (res.value !== undefined) return res.value;
    return res;
  };

  useEffect(() => {
    const fetchCompanyTestimonials = async () => {
      if (!companyId) return;
      
      setLoading(true);
      try {
        const res = await feedbackService.getCompanyTestimonials(companyId);
        const allFeedbacks = extractData(res) || [];
        
        // 💡 الفلترة: عرض الآراء الإيجابية فقط (4 أو 5 نجوم)
        const positiveFeedbacks = allFeedbacks.filter(fb => (fb.rating || 5) >= 4);
        
        setFeedbacks(positiveFeedbacks);
      } catch (err) {
        console.error("Failed to load testimonials", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyTestimonials();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-400 border-t-transparent opacity-60" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-16" dir="rtl">
      
      {/* ── رأس الصفحة (Header) ── */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="bg-slate-500/10 text-current px-4 py-1.5 rounded-full text-sm font-bold tracking-wide opacity-80 border border-slate-500/20">
          آراء عملائنا
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm mt-4">
          ماذا يقول العملاء عن خدماتنا؟
        </h1>
        <div className="w-24 h-1.5 bg-slate-500/30 mx-auto rounded-full mt-4"></div>
        <p className="opacity-70 text-lg md:text-xl leading-relaxed">
          نفخر بثقة عملائنا ونسعى دائماً لتقديم أفضل تجربة عقارية لهم. اقرأ تجارب من تعاملوا معنا في شراء واستئجار عقاراتهم.
        </p>
      </div>

      {/* ── شبكة التقييمات (Testimonials Grid) ── */}
      {feedbacks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {feedbacks.map((fb, index) => (
            <div 
              key={fb.id || index} 
              className="bg-slate-500/10 border border-slate-500/20 rounded-[2rem] p-8 hover:-translate-y-1 hover:bg-slate-500/20 transition-all duration-300 relative group flex flex-col"
            >
              {/* علامة الاقتباس الجمالية */}
              <div className="absolute top-6 left-6 text-6xl opacity-10 font-serif leading-none select-none group-hover:scale-110 transition-transform">
                "
              </div>

              {/* النجوم */}
              <div className="flex gap-1 mb-6 relative z-10">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-5 h-5 ${i < (fb.rating || 5) ? "text-amber-400" : "text-slate-300 opacity-30"}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* التعليق */}
              <p className="opacity-80 leading-relaxed text-[15px] mb-8 relative z-10 flex-1 whitespace-pre-line">
                "{fb.comment}"
              </p>

              {/* معلومات العميل */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-500/20 relative z-10 mt-auto">
                <div className="w-10 h-10 rounded-full bg-slate-500/30 flex items-center justify-center font-bold shadow-sm">
                  👤
                </div>
                <div>
                  <h4 className="font-bold text-sm opacity-90">{fb.userName || "عميل موثق"}</h4>
                  <p className="text-xs opacity-60">تفاعل مع أحد إعلاناتنا</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center bg-slate-500/10 rounded-3xl py-16 border border-slate-500/20 border-dashed max-w-2xl mx-auto">
          <div className="text-5xl mb-4 opacity-40">⭐</div>
          <h3 className="text-xl font-bold mb-2 opacity-80">لا توجد آراء مسجلة بعد</h3>
          <p className="opacity-60 text-sm">سجلت الشركة للتو أو لم يتم ترك أي تقييمات من العملاء حتى الآن.</p>
        </div>
      )}
    </div>
  );
}