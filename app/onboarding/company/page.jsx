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

        // 🟢 تأمين قنص مصفوفة القوالب (Templates) بذكاء من رد السيرفر
        const tplRaw = templatesRes?.data?.data || templatesRes?.data?.items || templatesRes?.data || templatesRes || [];
        const tplArray = Array.isArray(tplRaw) ? tplRaw : (Array.isArray(tplRaw.items) ? tplRaw.items : []);
        setTemplates(tplArray);

        // 🟢 تأمين قنص مصفوفة الباقات (Packages) بذكاء من رد السيرفر
        const pkgRaw = packagesRes?.data?.data || packagesRes?.data?.items || packagesRes?.data || packagesRes || [];
        const pkgArray = Array.isArray(pkgRaw) ? pkgRaw : (Array.isArray(pkgRaw.items) ? pkgRaw.items : []);
        setPackages(pkgArray);

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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // تأمين إضافي للتأكد أن المتغيرات مصفوفات قبل عمل الـ map
  const safeTemplates = Array.isArray(templates) ? templates : [];
  const safePackages = Array.isArray(packages) ? packages : [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 py-12 px-4 text-right" dir="rtl">
        <div className="mx-auto max-w-4xl">
          
          {/* شريط تقدم الخطوات الداخلي */}
          <div className="mb-10 flex items-center justify-center gap-4 text-sm font-medium text-slate-500">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md ${step === 1 ? "bg-indigo-600 text-white" : "bg-green-600 text-white"}`}>
              {step > 1 ? "✓" : "1"}
            </span>
            <span className={step === 1 ? "text-indigo-600 font-bold" : "text-green-600"}>واجهات مخصصة لشركتك</span>
            <div className={`h-0.5 w-16 ${step === 2 ? "bg-indigo-600" : "bg-slate-200"}`} />
            <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${step === 2 ? "bg-indigo-600 text-white" : "bg-white text-slate-400"}`}>2</span>
            <span className={step === 2 ? "text-indigo-600 font-bold" : ""}>باقات الاشتراك والدفع</span>
          </div>

          {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 font-medium">{error}</div>}

          {/* ── الخطوة الأولى: اختيار واجهة العرض للشركة ── */}
          {step === 1 && (
            <div className="animate-in fade-in duration-200">
              <div className="text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">واجهات مخصصة لشركتك 🏢</h1>
                <p className="mt-3 text-base text-slate-500">تميز عن المنافسين بامتلاك صفحة مخصصة لعرض عقارات شركتك بالتصميم الذي يعكس هويتك التجارية.</p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {safeTemplates.map((tpl, idx) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  const isDark = tpl.name?.toLowerCase().includes("dark") || tpl.id === 2;
                  const isClassic = tpl.name?.toLowerCase().includes("classic") || tpl.id === 1;

                  return (
                    <div
                      key={tpl.id || idx}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm cursor-pointer transition-all duration-300 ${
                        isSelected ? "border-indigo-600 ring-2 ring-indigo-600/20 transform -translate-y-1" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <span className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold ${isClassic ? "bg-amber-50 text-amber-700 border border-amber-200" : isDark ? "bg-slate-900 text-white" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                          {isClassic ? "كلاسيكي" : isDark ? "فاخر" : "الأكثر طلباً"}
                        </span>
                        <h3 className="mt-4 text-lg font-bold text-slate-900">
                          {isClassic ? "القالب الكلاسيكي (Classic)" : isDark ? "القالب المظلم (Dark)" : "القالب المضيء (Bright)"}
                        </h3>
                        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                          {isClassic ? "تصميم ذو طابع كلاسيكي وعتيق يعكس العراقة والأصالة للمشاريع والشركات." : isDark ? "تصميم ليلي أنيق يبرز الفخامة والرقي في العقارات والفيات الفاخرة." : "تصميم عصري ونظيف يركز على الوضوح وسهولة التصفح والبحث السريع."}
                        </p>
                      </div>
                      <div className="mt-6 flex items-center justify-end">
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}`}>
                          {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
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
                  className="w-full sm:w-64 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  حفظ واختيار باقة الاشتراك ←
                </button>
              </div>
            </div>
          )}

          {/* ── الخطوة الثانية: عرض باقات الاشتراك ووسائل الدفع ── */}
          {step === 2 && (
            <form onSubmit={handleConfirmSubscription} className="animate-in fade-in duration-200 space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">اختر خطة الاشتراك المناسبة لعملك 💳</h2>
                <p className="mt-2 text-sm text-slate-500">أسعار واضحة وشفافة لتنمية أعمالك العقارية عبر منصة دارك.</p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {safePackages.map((pkg, index) => {
                  const isSelected = selectedPackageId === pkg.id;
                  const isPopular = index === 1;
                  return (
                    <div
                      key={pkg.id || index}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm cursor-pointer transition-all ${
                        isSelected ? "border-indigo-600 ring-2 ring-indigo-600/20 shadow-md" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {isPopular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-3 py-0.5 rounded-full text-xs font-bold">الأكثر طلباً</div>}
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
                        <p className="mt-4 flex items-baseline text-slate-900">
                          <span className="text-3xl font-extrabold tracking-tight">{pkg.price}</span>
                          <span className="mr-1 text-xs font-semibold text-slate-500">ج.م / شهرياً</span>
                        </p>
                        <ul className="mt-4 space-y-2 text-xs text-slate-600 border-t pt-4">
                          <li>✔ {pkg.announcementsLimit === -1 ? "إعلانات غير محدودة" : `${pkg.announcementsLimit} إعلانات نشطة`}</li>
                          <li>✔ صفحة مخصصة للشركة بالفلاتر</li>
                          <li>✔ دعم فني متكامل</li>
                        </ul>
                      </div>
                      <div className="mt-6 flex h-5 w-5 items-center justify-center rounded-full border mr-auto">
                        <div className={`h-3 w-3 rounded-full ${isSelected ? "bg-indigo-600" : "bg-transparent"}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* تحديد طريقة الدفع */}
              <div className="p-6 bg-white border rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-slate-900">طريقة الدفع</h3>
                <div className="flex gap-4">
                  <label className="flex border p-4 rounded-xl flex-1 justify-between items-center cursor-pointer hover:bg-slate-50">
                    <span className="text-sm font-medium text-slate-700">نقداً للمندوب (Cash)</span>
                    <input type="radio" name="paymentMethod" value="Cash" checked={paymentMethod === "Cash"} onChange={() => setPaymentMethod("Cash")} className="text-indigo-600" />
                  </label>
                  <label className="flex border p-4 rounded-xl flex-1 justify-between items-center cursor-pointer hover:bg-slate-50">
                    <span className="text-sm font-medium text-slate-700">بطاقة ائتمانية (Visa)</span>
                    <input type="radio" name="paymentMethod" value="Visa" checked={paymentMethod === "Visa"} onChange={() => setPaymentMethod("Visa")} className="text-indigo-600" />
                  </label>
                </div>

                {paymentMethod === "Visa" && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-dashed animate-in slide-in-from-top-2 duration-200">
                    <div className="col-span-3">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">رقم البطاقة</label>
                      <input required type="text" name="cardNumber" value={cardInfo.cardNumber} onChange={handleCardChange} placeholder="xxxx xxxx xxxx xxxx" className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:border-indigo-600" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">تاريخ الانتهاء</label>
                      <input required type="text" name="expiryDate" value={cardInfo.expiryDate} onChange={handleCardChange} placeholder="MM/YY" className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:border-indigo-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">رمز التحقق (CVV)</label>
                      <input required type="text" name="cvv" value={cardInfo.cvv} onChange={handleCardChange} placeholder="123" className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:border-indigo-600" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button type="submit" disabled={submitting || !selectedPackageId} className="flex-1 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50">
                  {submitting ? "جاري تفعيل الاشتراك..." : "تأكيد الاشتراك وتفعيل الحساب"}
                </button>
                <button type="button" onClick={() => setStep(1)} className="rounded-xl border bg-white px-6 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                  السابق
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}