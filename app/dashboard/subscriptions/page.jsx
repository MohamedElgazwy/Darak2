"use client";

import { ProtectedRoute } from "@/app/lib/guards";
import { subscriptionService } from "@/app/services";
import { useEffect, useState } from "react";

const PAGE_NAMES = {
  1: "الرئيسية",
  2: "الإعلانات العقارية",
  3: "عن الشركة",
  4: "الخدمات",
  5: "تواصل معنا",
  6: "آراء العملاء",
  7: "فريق العمل",
};

const ERROR_MESSAGES = {
  "ActiveSubscriptionExists": "لديك اشتراك نشط بالفعل. لا يمكنك إضافة اشتراك جديد حتى ينتهي اشتراكك الحالي.",
  "SubscriptionNotFound": "لم يتم العثور على بيانات الاشتراك.",
  "InvalidPaymentMethod": "طريقة الدفع المحددة غير صالحة.",
  "Forbidden": "عفواً، حسابك الحالي ليس لديه صلاحية لعرض أو شراء باقات الشركات.",
  "DEFAULT": "حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقاً."
};

export default function SubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const [packages, setPackages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);

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

  const getErrorMessage = (errString) => {
    if (!errString) return ERROR_MESSAGES.DEFAULT;
    const matchedKey = Object.keys(ERROR_MESSAGES).find(key => errString.includes(key));
    return matchedKey ? ERROR_MESSAGES[matchedKey] : errString; 
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const fetchPackages = subscriptionService.getPackages().catch(() => []);
      const fetchTemplates = subscriptionService.getTemplates().catch(() => []);
      const fetchSub = subscriptionService.getMySubscription().catch(() => null);

      const [packagesRes, templatesRes, mySubRes] = await Promise.all([
        fetchPackages,
        fetchTemplates,
        fetchSub
      ]);

      setPackages(extractData(packagesRes) || []);
      setTemplates(extractData(templatesRes) || []);
      setCurrentSub(extractData(mySubRes));
    } catch (err) {
      console.error("Failed to load subscription data", err);
      setError("حدث خطأ أثناء تحميل بيانات الصفحة.");
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubscribe = async () => {
    if (!selectedTemplate || !selectedPackage) {
      setError("يرجى اختيار القالب والباقة أولاً.");
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

      const createRes = await subscriptionService.create(subPayload);
      
      let newSubId = null;
      if (createRes && createRes.message && !isNaN(parseInt(createRes.message))) {
        newSubId = parseInt(createRes.message); 
      }

      if (newSubId) {
        alert("تم إرسال طلب الاشتراك بنجاح! بانتظار تأكيد الدفع الكاش وتفعيل الباقة من الإدارة.");
        setSelectedPackage(null);
        setSelectedTemplate(null);
        fetchData();
      } else {
        throw new Error("لم يتم التعرف على رقم الاشتراك من استجابة الخادم.");
      }
    } catch (err) {
      console.error(err);
      const rawError = err.response?.data?.message || err.response?.data || err.message;
      setError(getErrorMessage(typeof rawError === "string" ? rawError : JSON.stringify(rawError)));
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
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-12 max-w-5xl mx-auto pb-16 text-right" dir="rtl">
        
        {/* الرأس والترقية */}
        <div className="space-y-4">
          <div className="border-b border-slate-200/60 pb-5">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
              💳 إدارة باقات اشتراك الوكالة
            </h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">تتبع دورة الفوترة الخاصة بشركتكم، تفعيل صلاحيات النشر، واختيار الهوية البصرية المناسبة.</p>
          </div>

          {currentSub ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-sm flex items-center gap-4 animate-in fade-in duration-300">
              <span className="text-3xl">🎉</span>
              <div>
                <p className="font-black text-emerald-800 text-base mb-0.5">صلاحيات حسابكم نشطة ومفعلة بالكامل</p>
                <p className="text-emerald-700/90 font-medium">شركتكم العقارية مسجلة حالياً بنظام باقة جارية بنجاح، يمكنك إدارة المتجر ونشر الإعلانات بحرية مطلقة.</p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/70 border border-amber-200 text-amber-800 rounded-2xl p-6 text-sm flex items-center gap-3 shadow-sm animate-in fade-in duration-300">
              <span className="text-xl">⏳</span>
              <p className="font-bold">تنبيه إداري: لا توجد باقة نشطة حالياً لشركتكم أو بانتظار مراجعة وتأكيد فاتورة الدفع الكاش من قبل الإدارة.</p>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-bold text-center">
            {error}
          </div>
        )}

        {currentSub ? (
          <div className="text-center bg-white border border-slate-200 rounded-[2.5rem] py-16 px-6 shadow-sm">
            <span className="text-5xl block mb-4">🚀</span>
            <h3 className="text-xl font-black text-slate-900 mb-1">المعرض العقاري مفعّل</h3>
            <p className="text-slate-400 text-sm font-semibold max-w-sm mx-auto leading-relaxed">باقة النشر الحالية تغطي كافة متطلباتكم التسويقية، يمكنك متابعة الوحدات من لوحة التحكم الخاصة بك.</p>
          </div>
        ) : (
          <>
            {/* قوالب المتجر */}
            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 font-black text-xs">1</span>
                اختر القالب والهوية البصرية المتناسقة (Template)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.length > 0 ? templates.map((tpl) => {
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <div 
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`cursor-pointer border-2 rounded-[2rem] p-5 transition-all duration-300 relative bg-white flex flex-col justify-between ${
                        isSelected 
                          ? "border-indigo-600 ring-4 ring-indigo-50 shadow-md transform -translate-y-1" 
                          : "border-slate-200 hover:border-indigo-300 hover:shadow-sm"
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
                        <span>{isSelected ? "🎯 القالب المختار" : "اختر هذا التصميم"}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-slate-400 text-xs font-bold italic col-span-full bg-slate-50 p-4 rounded-2xl border border-dashed text-center">جاري استرجاع خيارات القوالب الفاخرة...</p>
                )}
              </div>
            </div>

            {/* باقات النشر */}
            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 font-black text-xs">2</span>
                اختر خطة وباقة النشر الاستثمارية (Package)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.length > 0 ? packages.map((pkg) => {
                  const allowedPagesIds = parseAvailablePages(pkg.avaliablePages);
                  const isSelected = selectedPackage === pkg.id;

                  return (
                    <div 
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`cursor-pointer flex flex-col justify-between border-2 rounded-[2rem] p-6 transition-all duration-300 relative bg-white ${
                        isSelected 
                          ? "border-indigo-600 shadow-xl transform scale-[1.03] z-10 ring-4 ring-indigo-50" 
                          : "border-slate-200 hover:border-indigo-300 opacity-95"
                      }`}
                    >
                      <div>
                        <h4 className="text-lg font-black text-slate-900 text-center mb-1">{pkg.name}</h4>
                        <p className="text-center text-xs font-medium text-slate-400 mb-5 leading-relaxed px-2">{pkg.description}</p>
                        
                        <div className="mb-6 text-center bg-indigo-50/40 rounded-2xl py-4 border border-indigo-100/30">
                          <span className="text-3xl font-black text-indigo-600 tracking-tight">{pkg.price || 0}</span>
                          <span className="text-xs font-bold text-indigo-800 mr-1">ج.م / شهرياً</span>
                        </div>

                        <ul className="space-y-3.5 text-xs text-slate-600 font-semibold mb-6 px-1">
                          <li className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                            صلاحية الباقة: {pkg.durationDays} يوم كامل
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                            الحد الأقصى للنشر: {pkg.maxAds} إعلان نشط
                          </li>
                        </ul>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-auto">
                        <p className="text-[11px] font-black text-slate-500 mb-3 border-b border-slate-200 pb-2">
                          الصفحات والتبويبات المتاحة ({pkg.maxPages}):
                        </p>
                        <ul className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-bold">
                          {allowedPagesIds.map(pageId => (
                            <li key={pageId} className="flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
                              {PAGE_NAMES[pageId] || `صفحة إضافية`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-slate-400 text-xs font-bold italic col-span-full bg-slate-50 p-4 rounded-2xl border border-dashed text-center">جاري جلب خطط الاستثمار المتاحة...</p>
                )}
              </div>
            </div>

            {/* تأكيد الاشتراك */}
            {packages.length > 0 && templates.length > 0 && (
              <div className="pt-8 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={handleSubscribe}
                  disabled={submitLoading || !selectedTemplate || !selectedPackage}
                  className={`w-full sm:w-fit px-10 py-4 rounded-2xl font-black text-base transition-all flex justify-center items-center gap-2 ${
                    !selectedTemplate || !selectedPackage 
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 hover:-translate-y-0.5"
                  }`}
                >
                  {submitLoading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "💳 إرسال طلب تفعيل الاشتراك (كاش)"
                  )}
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </ProtectedRoute>
  );
}