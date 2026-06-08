"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { GuestRoute } from "@/app/lib/guards";

export default function RegisterPage() {
  return (
    <GuestRoute>
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-slate-100/50 to-indigo-50/30">
        <div className="w-full max-w-lg space-y-8 bg-white border border-slate-200/60 rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)]">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
              إنشاء حساب جديد
            </h2>
            <p className="text-sm font-medium text-slate-500">
              انضم إلى منصة دارك وابدأ رحلتك العقارية الذكية
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </GuestRoute>
  );
}

function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  
  // 💡 التعديل هنا: إضافة phoneNumber للـ State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "", // <-- الحقل الجديد
    password: "",
    userType: "User", 
    companyName: "",
    logo: "", 
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        setFormData((prev) => ({ ...prev, logo: base64String }));
      };
      reader.readAsDataURL(file);
    }
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.userType === "Company" && !formData.logo) {
      setError("يجب إرفاق شعار الشركة (Logo) لإتمام التسجيل.");
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 4000);
    } catch (err) {
      console.error("Registration Error Details:", err.response?.data); 
      const responseData = err.response?.data;
      if (responseData) {
        const hasValidationErrors = responseData.errors && Object.keys(responseData.errors).length > 0;
        if (hasValidationErrors) {
          const validationMsgs = Object.values(responseData.errors).flat();
          setError(`خطأ في البيانات: ${validationMsgs.join(" | ")}`);
        } 
        else if (responseData.message) {
          setError(responseData.message);
        } 
        else {
          setError("حدث خطأ أثناء إنشاء الحساب. تأكد من صحة البيانات.");
        }
      } else {
        setError("تعذر الاتصال بالخادم. تأكد من اتصالك بالإنترنت.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-5 py-6 animate-in fade-in zoom-in-95 duration-300 text-right" dir="rtl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-inner">
          <svg className="h-8 w-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-900">تم إنشاء الحساب بنجاح!</h3>
        <p className="text-slate-600 leading-relaxed text-sm">
          لقد أرسلنا رابط التفعيل إلى بريدك الإلكتروني. يرجى مراجعة صندوق الوارد الخاص بك لتأكيد حسابك قبل محاولة تسجيل الدخول.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 pt-4">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
          <span>جاري تحويلك تلقائياً إلى صفحة الدخول...</span>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-5 text-right" onSubmit={handleSubmit} dir="rtl">
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50/60 backdrop-blur-sm p-4 text-sm font-medium text-red-600 animate-in slide-in-from-top-2 duration-200">
          {error}
        </div>
      )}

      {/* Account Type Toggle */}
      <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/40 shadow-inner">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, userType: "User", companyName: "", logo: "" })}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            formData.userType === "User" 
              ? "bg-white text-indigo-600 shadow-sm border border-slate-200/20" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          👤 مستخدم عادي
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, userType: "Company" })}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            formData.userType === "Company" 
              ? "bg-white text-indigo-600 shadow-sm border border-slate-200/20" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          🏢 شركة عقارية
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">الاسم الأول</label>
            <input
              name="firstName"
              required
              type="text"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition-all duration-200 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">الاسم الأخير</label>
            <input
              name="lastName"
              required
              type="text"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition-all duration-200 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
        </div>

        {formData.userType === "Company" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">اسم الشركة العقارية *</label>
              <input
                name="companyName"
                required={formData.userType === "Company"}
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition-all duration-200 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">شعار الشركة (Logo) *</label>
              <div className="relative flex items-center justify-center w-full border-2 border-dashed border-slate-200 bg-slate-50/40 rounded-xl p-4 transition-colors hover:bg-slate-50 hover:border-indigo-300">
                <input
                  type="file"
                  accept="image/*"
                  required={formData.userType === "Company"}
                  onChange={handleLogoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center space-y-1">
                  <span className="text-slate-400 text-lg">📁</span>
                  <p className="text-xs font-semibold text-indigo-600">اضغط لرفع شعار الشركة</p>
                  <p className="text-[10px] text-slate-400">يدعم صيغ PNG, JPG بحد أقصى 2 ميجا</p>
                </div>
              </div>
              {formData.logo && <p className="text-[11px] text-emerald-600 font-bold mt-1 mr-1">✓ تم تحميل الشعار بنجاح في الخلفية</p>}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">البريد الإلكتروني</label>
          <input
            name="email"
            type="email"
            required
            placeholder="name@example.com"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition-all duration-200 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* 💡 التعديل هنا: حقل رقم الهاتف الجديد */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">رقم الهاتف</label>
          <input
            name="phoneNumber"
            type="tel"
            required
            dir="ltr" // لضمان كتابة الأرقام بشكل صحيح من اليسار لليمين
            placeholder="01xxxxxxxxx"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition-all duration-200 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 text-left"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">كلمة المرور</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-12 pr-4 py-3 text-sm text-slate-900 transition-all duration-200 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-600/10 hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transform active:scale-[0.99]"
      >
        {loading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          "إنشاء الحساب وانطلاق"
        )}
      </button>

      <p className="text-center text-sm font-medium text-slate-500 pt-2 border-t border-slate-100">
        لديك حساب بالفعل؟{" "}
        <Link href="/auth/login" className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4 decoration-indigo-200 hover:decoration-indigo-600 transition-all">
          تسجيل الدخول مباشرة
        </Link>
      </p>
    </form>
  );
}