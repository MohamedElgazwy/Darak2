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

// 💡 قاموس ترجمة أخطاء الخادم إلى رسائل عربية مفهومة
const ERROR_MESSAGES = {
  "ActiveSubscriptionExists": "لديك اشتراك نشط بالفعل. لا يمكنك إضافة اشتراك جديد حتى ينتهي اشتراكك الحالي.",
  "SubscriptionNotFound": "لم يتم العثور على بيانات الاشتراك.",
  "InvalidPaymentMethod": "طريقة الدفع المحددة غير صالحة.",
  "Forbidden": "عفواً، حسابك الحالي (مستخدم عادي) ليس لديه صلاحية لعرض أو شراء باقات الشركات.",
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

  // دالة مساعدة لترجمة الخطأ
  const getErrorMessage = (errString) => {
    if (!errString) return ERROR_MESSAGES.DEFAULT;
    // البحث في القاموس عن أي تطابق نصي
    const matchedKey = Object.keys(ERROR_MESSAGES).find(key => errString.includes(key));
    return matchedKey ? ERROR_MESSAGES[matchedKey] : errString; // إذا لم يجده يعرض الخطأ كما هو أو يمكن وضع DEFAULT
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // 💡 قمنا بإضافة console.error لنعرف لماذا لا تظهر الباقات للحساب الثاني
      const fetchPackages = subscriptionService.getPackages().catch((e) => {
        console.error("خطأ في جلب الباقات:", e.response?.status);
        return [];
      });
      const fetchTemplates = subscriptionService.getTemplates().catch((e) => {
        console.error("خطأ في جلب القوالب:", e.response?.status);
        return [];
      });
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
    } finally {
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
      // 💡 استخدام دالة الترجمة هنا
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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-12 max-w-5xl mx-auto pb-16 text-right" dir="rtl">
        
        {/* ── 1. رأس الصفحة وحالة الاشتراك الحالية ── */}
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
              💳 اشتراك شركتكم العقارية
            </h1>
            <p className="text-slate-500 text-sm mt-2">تتبع دورة الفوترة الشهرية لحسابكم، ومراقبة حالة تفعيل صلاحيات النشر لرمز الوكالة.</p>
          </div>

          <div className="w-16 h-1 bg-slate-200 mx-auto rounded-full"></div>

          {currentSub ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-6 text-sm flex items-center gap-4">
              <span className="text-3xl">✅</span>
              <div>
                <p className="font-bold text-lg mb-1">اشتراكك نشط حالياً</p>
                <p>أنت مشترك الآن في باقة صالحة. يمكنك الاستفادة من كافة خصائص الباقة بحرية.</p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/70 border border-amber-200 text-amber-800 rounded-xl p-6 text-sm text-center shadow-sm">
              <p className="font-bold mb-2 flex items-center justify-center gap-2">
                ⚠️ تنبيه إداري: لا يوجد اشتراك نشط تملك شركتكم حالياً أو لم يتم تأكيد دفع فاتورة الكاش بعد.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-bold text-center">
            {error}
          </div>
        )}

        {/* 💡 تحسين تجربة المستخدم: إخفاء القوالب والباقات إذا كان المستخدم مشتركاً بالفعل */}
        {currentSub ? (
          <div className="text-center bg-slate-50 border border-slate-200 rounded-3xl py-12">
            <span className="text-5xl">🎉</span>
            <h3 className="text-xl font-bold text-slate-800 mt-4 mb-2">حسابكم مفعل بالكامل</h3>
            <p className="text-slate-500">لا تحتاج لإجراء أي اشتراكات جديدة في الوقت الحالي. يمكنك إدارة إعلاناتك من لوحة التحكم.</p>
          </div>
        ) : (
          <>
            {/* ── 2. اختيار القالب (Templates) ── */}
            <div className="space-y-5">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs">1</span>
                اختر تصميم صفحة شركتك (Template)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {templates.length > 0 ? templates.map((tpl) => (
                  <div 
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`cursor-pointer border-2 rounded-2xl p-5 transition-all duration-300 relative ${
                      selectedTemplate === tpl.id 
                        ? "border-indigo-600 bg-indigo-50 shadow-md transform scale-[1.02]" 
                        : "border-slate-200 bg-white hover:border-indigo-300"
                    }`}
                  >
                    {selectedTemplate === tpl.id && (
                      <div className="absolute top-3 left-3 bg-indigo-600 text-white rounded-full p-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    )}
                    <h4 className="font-bold text-lg text-slate-900">{tpl.name}</h4>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">{tpl.description}</p>
                  </div>
                )) : (
                  <p className="text-slate-400 text-sm italic col-span-full bg-slate-50 p-4 rounded-xl border border-slate-100">
                    جاري تجهيز القوالب، أو أن حسابك لا يملك صلاحية لعرضها.
                  </p>
                )}
              </div>
            </div>

            {/* ── 3. اختيار الباقة (Packages) ── */}
            <div className="space-y-5">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs">2</span>
                اختر باقة النشر (Package)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.length > 0 ? packages.map((pkg) => {
                  const allowedPagesIds = parseAvailablePages(pkg.avaliablePages);

                  return (
                    <div 
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`cursor-pointer flex flex-col border-2 rounded-3xl p-6 transition-all duration-300 relative bg-white ${
                        selectedPackage === pkg.id 
                          ? "border-indigo-600 shadow-xl transform scale-105 z-10" 
                          : "border-slate-200 hover:border-indigo-300 opacity-95"
                      }`}
                    >
                      {selectedPackage === pkg.id && (
                        <span className="absolute -top-3 right-6 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          اختيارك الحالي
                        </span>
                      )}
                      <h4 className="text-xl font-black text-slate-900 text-center mb-1">{pkg.name}</h4>
                      <p className="text-center text-sm text-slate-500 mb-4">{pkg.description}</p>
                      
                      <div className="mb-5 text-center bg-slate-50 rounded-2xl py-4 border border-slate-100">
                        <span className="text-4xl font-black text-indigo-600">{pkg.price || 0}</span>
                        <span className="text-slate-500 font-bold ml-1">ج.م</span>
                      </div>

                      <ul className="space-y-3 text-sm text-slate-600 flex-1 font-medium mb-6">
                        <li className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                          صلاحية النشر: {pkg.durationDays} يوم
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                          عدد الإعلانات: {pkg.maxAds} إعلان
                        </li>
                      </ul>

                      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                        <p className="text-xs font-bold text-indigo-800 mb-3 border-b border-indigo-100 pb-2">
                          الصفحات المتاحة لشركتك ({pkg.maxPages}):
                        </p>
                        <ul className="grid grid-cols-2 gap-2 text-xs text-indigo-700 font-medium">
                          {allowedPagesIds.map(pageId => (
                            <li key={pageId} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                              {PAGE_NAMES[pageId] || `صفحة إضافية`}
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  );
                }) : (
                  <p className="text-slate-400 text-sm italic col-span-full bg-slate-50 p-4 rounded-xl border border-slate-100">
                    جاري تجهيز الباقات، أو أن حسابك لا يملك صلاحية لعرضها.
                  </p>
                )}
              </div>
            </div>

            {/* ── 4. زر تأكيد الاشتراك ── */}
            {packages.length > 0 && templates.length > 0 && (
              <div className="pt-8 border-t border-slate-200">
                <button 
                  onClick={handleSubscribe}
                  disabled={submitLoading || !selectedTemplate || !selectedPackage}
                  className={`w-full md:w-auto md:mr-auto px-10 py-4 rounded-2xl font-bold text-lg transition-all flex justify-center items-center gap-2 ${
                    !selectedTemplate || !selectedPackage 
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:-translate-y-1"
                  }`}
                >
                  {submitLoading ? (
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "تأكيد الاشتراك (الدفع كاش)"
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