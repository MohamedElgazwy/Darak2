"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/services";
import { ProtectedRoute } from "@/app/lib/guards";


export default function CompanyOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [packages, setPackages] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [cardInfo, setCardInfo] = useState({ cardNumber: "", expiryDate: "", cvv: "" });

  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        const [templatesRes, packagesRes] = await Promise.all([
          api.get("/Templates/List"),
          api.get("/Packages/List")
        ]);

        const tplRaw = templatesRes?.data?.data || templatesRes?.data?.items || templatesRes?.data || templatesRes || [];
        setTemplates(Array.isArray(tplRaw) ? tplRaw : (Array.isArray(tplRaw.items) ? tplRaw.items : []));

        const pkgRaw = packagesRes?.data?.data || packagesRes?.data?.items || packagesRes?.data || packagesRes || [];
        setPackages(Array.isArray(pkgRaw) ? pkgRaw : (Array.isArray(pkgRaw.items) ? pkgRaw.items : []));

      } catch (err) {
        console.error("Onboarding Fetch Error:", err);
        setError("حدث خطأ أثناء جلب الخيارات المتاحة من السيرفر.");
        setTemplates([]);
        setPackages([]);
      } finally {
        setPageLoading(false);
      }
    };
    fetchOnboardingData();
  }, []);

  const handleCardChange = (e) => {
    setCardInfo({ ...cardInfo, [e.target.name]: e.target.value });
  };

  const handleConfirmSubscription = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      templateId: Number(selectedTemplateId),
      packageId: Number(selectedPackageId),
      paymentMethod,
      cardNumber: paymentMethod === "Cash" ? "" : cardInfo.cardNumber,
      expiryDate: paymentMethod === "Cash" ? "" : cardInfo.expiryDate,
      cvv: paymentMethod === "Cash" ? "" : cardInfo.cvv
    };

    try {
      await api.post("/Subscriptions/Create", payload);
      alert("تم تسجيل طلب الاشتراك وتفعيل واجهة الشركة بنجاح!");
      router.replace("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "فشلت عملية إنشاء الاشتراك.");
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-md" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 py-12 px-4 text-right" dir="rtl">
        <div className="mx-auto max-w-5xl">
          
          {/* Progress Bar */}
          <div className="mb-10 flex items-center justify-center gap-4 text-sm font-medium text-slate-500">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-colors ${step === 1 ? "bg-indigo-600 text-white" : "bg-emerald-500 text-white"}`}>
              {step > 1 ? "✓" : "1"}
            </span>
            <span className={step === 1 ? "text-indigo-600 font-bold" : "text-emerald-600"}>واجهة الشركة</span>
            <div className={`h-1 w-20 rounded-full transition-colors ${step === 2 ? "bg-indigo-600" : "bg-slate-200"}`} />
            <span className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${step === 2 ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-400 border-slate-300"}`}>2</span>
            <span className={step === 2 ? "text-indigo-600 font-bold" : ""}>باقة الاشتراك</span>
          </div>

          {error && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600 font-bold border border-red-100 shadow-sm">{error}</div>}

          {/* ── Step 1: Template Selection ── */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">واجهة عرض مخصصة لشركتك 🏢</h1>
                <p className="mt-3 text-base text-slate-500 max-w-2xl mx-auto">اختر القالب الذي يعكس الهوية البصرية لشركتك العقارية. سيتم تطبيقه فوراً على كافة صفحاتك المتاحة للجمهور.</p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {templates.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  const isBright = tpl.id === 1;
                  const isClassic = tpl.id === 2;
                  const isDark = tpl.id === 3;

                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`group relative flex flex-col justify-between rounded-3xl border bg-white p-6 cursor-pointer transition-all duration-300 ease-out ${
                        isSelected ? "border-indigo-600 ring-4 ring-indigo-600/10 transform -translate-y-2 shadow-xl" : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                      }`}
                    >
                      <div>
                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold ${
                          isClassic ? "bg-amber-50 text-amber-700 border border-amber-200" : 
                          isDark ? "bg-slate-900 text-white border border-slate-700" : 
                          "bg-sky-50 text-sky-700 border border-sky-200"
                        }`}>
                          {isClassic ? "كلاسيكي ورسمي" : isDark ? "فاخر وحديث" : "مشرق وعصري"}
                        </span>
                        <h3 className="mt-5 text-xl font-black text-slate-900">
                          {tpl.name || (isClassic ? "Classic" : isDark ? "Dark" : "Bright")}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 leading-relaxed min-h-[60px]">
                          {tpl.description || (isClassic ? "طابع كلاسيكي يعكس العراقة." : isDark ? "تصميم ليلي فاخر للقصور." : "تصميم نقي للوضوح والاتساع.")}
                        </p>
                      </div>
                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-xs font-bold text-slate-400">اختر هذا القالب</span>
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}`}>
                          {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-white animate-in zoom-in" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  disabled={!selectedTemplateId}
                  onClick={() => setStep(2)}
                  className="w-full sm:w-72 rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  تأكيد الانتقال للخطوة التالية ←
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Package Selection ── */}
          {step === 2 && (
            <form onSubmit={handleConfirmSubscription} className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900">اختر خطة الاشتراك المناسبة 💳</h2>
                <p className="mt-2 text-base text-slate-500">أسعار واضحة وشفافة لتنمية أعمالك العقارية عبر منصة دارك.</p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {packages.map((pkg, index) => {
                  const isSelected = selectedPackageId === pkg.id;
                  const isPopular = index === 1; // Assuming the middle one is popular
                  
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`relative flex flex-col justify-between rounded-3xl border bg-white p-8 cursor-pointer transition-all duration-300 ${
                        isSelected ? "border-indigo-600 ring-4 ring-indigo-600/10 shadow-2xl transform scale-105 z-10" : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                      }`}
                    >
                      {isPopular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-1 rounded-full text-xs font-black shadow-sm">الأكثر طلباً</div>}
                      
                      <div className="text-center border-b border-slate-100 pb-6 mb-6">
                        <h3 className="text-xl font-black text-slate-900">{pkg.name}</h3>
                        <p className="mt-4 flex items-center justify-center text-slate-900">
                          <span className="text-4xl font-black tracking-tight">{pkg.price}</span>
                          <span className="mr-1 text-sm font-bold text-slate-500">ج.م / شهرياً</span>
                        </p>
                      </div>

                      <ul className="space-y-4 text-sm font-bold text-slate-600 flex-1">
                        <li className="flex items-center gap-3">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">✓</span>
                          {pkg.announcementsLimit === -1 ? "إعلانات غير محدودة" : `${pkg.announcementsLimit} إعلانات نشطة`}
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">✓</span>
                          مدة الصلاحية: {pkg.durationDays} يوم
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">✓</span>
                          صفحات متجر مخصصة ({pkg.maxPages})
                        </li>
                      </ul>

                      <div className="mt-8 flex h-6 w-6 items-center justify-center rounded-full border-2 mx-auto transition-colors">
                        <div className={`h-3 w-3 rounded-full ${isSelected ? "bg-indigo-600" : "bg-transparent"}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Payment Method */}
              <div className="p-8 bg-white border border-slate-200 rounded-3xl space-y-6 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4">طريقة الدفع المريحة</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className={`flex flex-1 items-center justify-between p-5 rounded-2xl cursor-pointer transition-all border-2 ${paymentMethod === "Cash" ? "border-indigo-600 bg-indigo-50/50" : "border-slate-200 hover:bg-slate-50"}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💵</span>
                      <span className="font-bold text-slate-900">الدفع نقداً (Cash)</span>
                    </div>
                    <input type="radio" name="paymentMethod" value="Cash" checked={paymentMethod === "Cash"} onChange={() => setPaymentMethod("Cash")} className="h-5 w-5 text-indigo-600 focus:ring-indigo-500" />
                  </label>
                  <label className={`flex flex-1 items-center justify-between p-5 rounded-2xl cursor-pointer transition-all border-2 ${paymentMethod === "Visa" ? "border-indigo-600 bg-indigo-50/50" : "border-slate-200 hover:bg-slate-50"}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💳</span>
                      <span className="font-bold text-slate-900">بطاقة ائتمان (Visa/MC)</span>
                    </div>
                    <input type="radio" name="paymentMethod" value="Visa" checked={paymentMethod === "Visa"} onChange={() => setPaymentMethod("Visa")} className="h-5 w-5 text-indigo-600 focus:ring-indigo-500" />
                  </label>
                </div>

                {paymentMethod === "Visa" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-slate-700 mb-2">رقم البطاقة</label>
                      <input required type="text" name="cardNumber" value={cardInfo.cardNumber} onChange={handleCardChange} placeholder="4000 1234 5678 9010" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-mono" dir="ltr" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-2">تاريخ الانتهاء</label>
                      <input required type="text" name="expiryDate" value={cardInfo.expiryDate} onChange={handleCardChange} placeholder="MM/YY" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-mono" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">رمز CVV</label>
                      <input required type="text" name="cvv" value={cardInfo.cvv} onChange={handleCardChange} placeholder="123" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-mono" dir="ltr" maxLength="4" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                <button type="button" onClick={() => setStep(1)} className="rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 hover:bg-slate-50 transition-all">
                  العودة للخطوة السابقة
                </button>
                <button type="submit" disabled={submitting || !selectedPackageId} className="flex-1 rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3">
                  {submitting ? <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "إتمام الدفع وتفعيل الواجهة 🚀"}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}