"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { subscriptionService } from "@/app/services";

const PAGE_NAMES = {
  1: "الرئيسية",
  2: "الإعلانات العقارية",
  3: "عن الشركة",
  4: "الخدمات",
  5: "تواصل معنا",
  6: "آراء العملاء",
  7: "فريق العمل",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  const [packages, setPackages] = useState([]);
  const [templates, setTemplates] = useState([]);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const extractData = (res) => {
    if (!res) return null;
    if (res.value !== undefined) return res.value;
    if (res.data !== undefined) return res.data;
    return res;
  };

  const getTemplateImage = (tpl) => {
    const name = (tpl?.name || "").toLowerCase();
    if (name.includes("classic")) return "/images/classic.png";
    if (name.includes("dark") || name.includes("luxury")) return "/images/dark.png";
    return "/images/bright.png";
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // 1. التحقق مما إذا كان لدى الشركة اشتراك بالفعل لتخطي هذه الصفحة
        const mySubRes = await subscriptionService.getMySubscription().catch(() => null);
        const currentSub = extractData(mySubRes);
        if (currentSub) {
          router.push("/dashboard");
          return;
        }

        // 2. جلب القوالب والباقات المتاحة
        const [packagesRes, templatesRes] = await Promise.all([
          subscriptionService.getPackages().catch(() => []),
          subscriptionService.getTemplates().catch(() => [])
        ]);

        setPackages(extractData(packagesRes) || []);
        setTemplates(extractData(templatesRes) || []);
      } catch (err) {
        console.error("Failed to load onboarding data", err);
        setError("تعذر تحميل البيانات، يرجى تحديث الصفحة.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInitialData();
    }
  }, [user, router]);

  const handleSubscribe = async () => {
    if (!selectedTemplate || !selectedPackage) {
      setError("يرجى إكمال اختيار القالب والباقة للمتابعة.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitLoading(true);
    setError("");

    try {
      const subPayload = {
        templateId: selectedTemplate,
        packageId: selectedPackage,
        paymentMethod: "Cash",
        cardNumber: "",
        expiryDate: "",
        cvv: ""
      };

      await subscriptionService.create(subPayload);
      
      // التوجيه فوراً للوحة التحكم بعد نجاح الطلب
      router.push("/dashboard");

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data || "حدث خطأ أثناء معالجة طلبك.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitLoading(false);
    }
  };

  const parseAvailablePages = (pagesString) => {
    if (!pagesString) return [];
    try {
      return JSON.parse(pagesString);
    } catch (e) {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm mb-4"></div>
        <p className="text-sm font-black text-slate-500 animate-pulse">جاري تجهيز بيئة العمل لشركتكم...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#f8fafc] overflow-hidden text-right pb-24 selection:bg-indigo-200" dir="rtl">
      
      {/* ── مؤثرات الخلفية (Background Mesh) ── */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-300/20 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-emerald-300/20 rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* ── شريط علوي بسيط للترحيب وتسجيل الخروج ── */}
      <header className="relative z-10 w-full p-6 flex justify-between items-center max-w-5xl mx-auto border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏢</span>
          <span className="font-black text-xl tracking-tight text-slate-900">إعداد المتجر العقاري</span>
        </div>
        <button onClick={logout} className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors">
          تسجيل الخروج
        </button>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 mt-12 space-y-12">
        
        {/* ── رسالة الترحيب ── */}
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            أهلاً بك، <span className="text-indigo-600">{user?.firstName}</span> 👋
          </h1>
          <p className="text-sm md:text-base font-semibold text-slate-500 max-w-2xl mx-auto">
            لقد اقتربت جداً! لنقم بتهيئة الواجهة العامة لمتجرك العقاري واختيار خطة النشر التي تناسب طموحات شركتك.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-bold text-center animate-in zoom-in-95">
            {error}
          </div>
        )}

        {/* ── الخطوة 1: اختيار القالب ── */}
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-6 md:p-10 animate-in fade-in duration-700 delay-150">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-8">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 text-sm">1</span>
            ما هو الطابع البصري الأنسب لشركتك؟
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => {
              const isSelected = selectedTemplate === tpl.id;
              return (
                <div 
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`cursor-pointer border-2 rounded-[2rem] p-5 transition-all duration-300 relative bg-white flex flex-col justify-between ${
                    isSelected 
                      ? "border-indigo-600 ring-4 ring-indigo-50 shadow-lg transform -translate-y-1" 
                      : "border-slate-200 hover:border-indigo-300 hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="mb-4 rounded-2xl overflow-hidden border shadow-inner">
                      <img src={getTemplateImage(tpl)} alt={tpl.name} className="w-full h-40 object-cover" />
                    </div>
                    <h4 className="font-black text-slate-900 text-base">{tpl.name}</h4>
                    <p className="text-xs font-semibold text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{tpl.description}</p>
                  </div>
                  
                  <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className={isSelected ? "text-indigo-600" : ""}>{isSelected ? "🎯 القالب المختار" : "انقر للاختيار"}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── الخطوة 2: اختيار الباقة ── */}
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-6 md:p-10 animate-in fade-in duration-700 delay-300">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-8">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 text-sm">2</span>
            اختر الباقة المناسبة لحجم أعمالك
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const allowedPagesIds = parseAvailablePages(pkg.avaliablePages);
              const isSelected = selectedPackage === pkg.id;

              return (
                <div 
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`cursor-pointer flex flex-col justify-between border-2 rounded-[2.5rem] p-6 transition-all duration-300 relative bg-white ${
                    isSelected 
                      ? "border-indigo-600 shadow-2xl transform scale-[1.03] z-10 ring-4 ring-indigo-50" 
                      : "border-slate-200 hover:border-indigo-300 opacity-95"
                  }`}
                >
                  <div>
                    {isSelected && (
                      <span className="absolute -top-3 right-8 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
                        اختيارك الحالي
                      </span>
                    )}
                    <h4 className="text-xl font-black text-slate-900 text-center mb-1">{pkg.name}</h4>
                    <p className="text-center text-xs font-semibold text-slate-400 mb-6 px-2">{pkg.description}</p>
                    
                    <div className="mb-6 text-center bg-slate-50/50 rounded-2xl py-5 border border-slate-100">
                      <span className={`text-4xl font-black tracking-tight ${isSelected ? "text-indigo-600" : "text-slate-800"}`}>{pkg.price || 0}</span>
                      <span className="text-xs font-bold text-slate-400 mr-1">ج.م / شهرياً</span>
                    </div>

                    <ul className="space-y-4 text-xs text-slate-600 font-bold mb-8 px-2">
                      <li className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                        صلاحية الباقة: <span className="text-slate-900">{pkg.durationDays} يوم</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                        الحد الأقصى للنشر: <span className="text-slate-900">{pkg.maxAds} إعلان</span>
                      </li>
                    </ul>
                  </div>

                  <div className={`p-4 rounded-2xl border transition-colors mt-auto ${isSelected ? "bg-indigo-50/50 border-indigo-100/50" : "bg-slate-50 border-slate-100"}`}>
                    <p className="text-[11px] font-black text-slate-500 mb-3 border-b border-slate-200/60 pb-2">
                      الصفحات المتاحة ({pkg.maxPages}):
                    </p>
                    <ul className="grid grid-cols-2 gap-2 text-[10px] text-slate-700 font-bold">
                      {allowedPagesIds.map(pageId => (
                        <li key={pageId} className="flex items-center gap-1.5 truncate">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? "bg-indigo-500" : "bg-slate-400"}`}></span>
                          {PAGE_NAMES[pageId] || `صفحة إضافية`}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── الخطوة 3: زر الإرسال النهائي ── */}
        <div className="flex justify-center pt-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <button 
            onClick={handleSubscribe}
            disabled={submitLoading || !selectedTemplate || !selectedPackage}
            className={`w-full max-w-md px-8 py-5 rounded-[2rem] font-black text-lg transition-all flex justify-center items-center gap-3 ${
              !selectedTemplate || !selectedPackage 
                ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                : "bg-gradient-to-l from-indigo-600 to-indigo-800 text-white hover:shadow-[0_15px_40px_rgba(79,70,229,0.3)] hover:-translate-y-1"
            }`}
          >
            {submitLoading ? (
              <span className="h-6 w-6 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            ) : (
              <>
                <span>تأكيد الإعدادات ودخول المنصة</span>
                <span>🚀</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}