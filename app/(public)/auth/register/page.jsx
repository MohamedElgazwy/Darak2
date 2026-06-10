"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { GuestRoute } from "@/app/lib/guards";

export default function RegisterPage() {
  return (
    <GuestRoute>
      <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center py-16 px-4 overflow-hidden bg-[#f8fafc]">
        {/* ── Decorative Background Blobs ── */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>

        <div className="relative z-10 w-full max-w-xl space-y-8 bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_20px_60px_-10px_rgba(79,70,229,0.1)]">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
              إنشاء حساب جديد
            </h2>
            <p className="text-sm font-medium text-slate-500">
              انضم إلى منصة دارك وابدأ رحلتك العقارية الذكية اليوم
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
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
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
        } else if (responseData.message) {
          setError(responseData.message);
        } else {
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
      <div className="text-center space-y-6 py-8 animate-in fade-in zoom-in-95 duration-500 text-right" dir="rtl">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 border-8 border-emerald-100/50 shadow-inner">
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900">تم إنشاء الحساب بنجاح! 🎉</h3>
          <p className="text-slate-500 leading-relaxed text-sm font-medium px-4">
            لقد أرسلنا رابط التفعيل إلى بريدك الإلكتروني. يرجى مراجعة صندوق الوارد الخاص بك لتأكيد حسابك.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 text-xs font-bold text-indigo-600 bg-indigo-50 py-3 rounded-2xl">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          <span>جاري تحويلك تلقائياً إلى صفحة الدخول...</span>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6 text-right" onSubmit={handleSubmit} dir="rtl">
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600 animate-in slide-in-from-top-2 duration-300 shadow-sm">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {error}
        </div>
      )}

      {/* ── Account Type Toggle (Premium Pill Design) ── */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl shadow-inner border border-slate-200/50">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, userType: "User", companyName: "", logo: "" })}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            formData.userType === "User" 
              ? "bg-white text-indigo-600 shadow-md shadow-slate-200/50 scale-100" 
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 scale-95"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          مستخدم عادي
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, userType: "Company" })}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            formData.userType === "Company" 
              ? "bg-white text-indigo-600 shadow-md shadow-slate-200/50 scale-100" 
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 scale-95"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          شركة عقارية
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <input name="firstName" required type="text" placeholder="الاسم الأول" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pr-11 pl-4 py-3.5 text-sm font-medium text-slate-900 transition-all focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 placeholder:text-slate-400" value={formData.firstName} onChange={handleChange} />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <input name="lastName" required type="text" placeholder="الاسم الأخير" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pr-11 pl-4 py-3.5 text-sm font-medium text-slate-900 transition-all focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 placeholder:text-slate-400" value={formData.lastName} onChange={handleChange} />
          </div>
        </div>

        {formData.userType === "Company" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-400">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <input name="companyName" required={formData.userType === "Company"} type="text" placeholder="اسم الشركة العقارية *" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pr-11 pl-4 py-3.5 text-sm font-medium text-slate-900 transition-all focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 placeholder:text-slate-400" value={formData.companyName} onChange={handleChange} />
            </div>
            
            <div className="relative flex flex-col items-center justify-center w-full border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-2xl p-5 transition-all hover:bg-indigo-50 hover:border-indigo-400 cursor-pointer group">
              <input type="file" accept="image/*" required={formData.userType === "Company"} onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="text-center space-y-2 pointer-events-none">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <p className="text-sm font-bold text-indigo-900">اضغط لرفع شعار الشركة *</p>
                <p className="text-[11px] font-medium text-slate-400">يدعم صيغ PNG, JPG بحد أقصى 2 ميجا</p>
              </div>
            </div>
            {formData.logo && <p className="text-xs text-emerald-600 font-bold px-2 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> تم إرفاق الشعار بنجاح</p>}
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <input name="email" type="email" required placeholder="البريد الإلكتروني" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pr-11 pl-4 py-3.5 text-sm font-medium text-slate-900 transition-all focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 placeholder:text-slate-400" value={formData.email} onChange={handleChange} />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          </div>
          <input name="phoneNumber" type="tel" required dir="ltr" placeholder="رقم الهاتف (01xxxxxxxxx)" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pr-4 pl-11 py-3.5 text-sm font-medium text-slate-900 transition-all focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 text-left placeholder:text-slate-400" value={formData.phoneNumber} onChange={handleChange} />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <input name="password" type={showPassword ? "text" : "password"} required placeholder="كلمة المرور" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pr-11 pl-12 py-3.5 text-sm font-medium text-slate-900 transition-all focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 placeholder:text-slate-400" value={formData.password} onChange={handleChange} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors z-10">
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full rounded-2xl bg-gradient-to-l from-indigo-600 to-violet-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:transform-none disabled:cursor-not-allowed flex justify-center items-center gap-2">
        {loading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          "إنشاء الحساب والانطلاق 🚀"
        )}
      </button>

      <p className="text-center text-sm font-medium text-slate-500 pt-4 border-t border-slate-100">
        لديك حساب بالفعل؟{" "}
        <Link href="/auth/login" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
          تسجيل الدخول من هنا
        </Link>
      </p>
    </form>
  );
}