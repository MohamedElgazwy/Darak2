"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { GuestRoute } from "@/app/lib/guards";

export default function LoginPage() {
  return (
    <GuestRoute>
      <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center py-16 px-4 overflow-hidden bg-[#f8fafc]">
        {/* ── Decorative Background Blobs ── */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>

        <div className="relative z-10 w-full max-w-md space-y-8 bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_20px_60px_-10px_rgba(79,70,229,0.1)]">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
              تسجيل الدخول
            </h2>
            <p className="text-sm font-medium text-slate-500">
              مرحباً بعودتك إلى بيئتك العقارية المفضلة في "دارك"
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </GuestRoute>
  );
}

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. تنفيذ طلب تسجيل الدخول (واستقبال البيانات المرجعة من الباك إند)
      const userData = await login(formData);
      
      // 2. التحقق من نوع المستخدم المباشر المرفق في الـ Response
      // نتحقق من خصائص الأمان (Roles) أو من نوع المستخدم (userType)
      const isCompanyUser = userData?.userType === "Company" || userData?.roles?.includes("Company");
      
      // 3. تأخير زمني خفيف جداً لضمان حفظ الـ Cookie والـ LocalStorage بالكامل قبل التوجيه
      setTimeout(() => {
        if (isCompanyUser) {
          router.push("/onboarding"); // توجيه الشركات لصفحة الإعدادات الأولية
        } else {
          router.push("/dashboard"); // توجيه المستخدمين والمديرين للوحة التحكم
        }
      }, 300); // 300 جزء من الثانية تكفي لضمان التوجيه الصحيح
      
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور."
      );
      setLoading(false); // نوقف التحميل فقط في حالة الخطأ
    }
  };

  return (
    <form className="space-y-6 text-right" onSubmit={handleSubmit} dir="rtl">
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600 animate-in slide-in-from-top-2 duration-300 shadow-sm">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <input name="email" type="email" required placeholder="البريد الإلكتروني" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pr-11 pl-4 py-4 text-sm font-medium text-slate-900 transition-all focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 placeholder:text-slate-400" value={formData.email} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <input name="password" type={showPassword ? "text" : "password"} required placeholder="كلمة المرور" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pr-11 pl-12 py-4 text-sm font-medium text-slate-900 transition-all focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 placeholder:text-slate-400" value={formData.password} onChange={handleChange} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors z-10">
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
          <div className="flex justify-end px-1">
            <Link href="/auth/forgot-password" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
              نسيت كلمة المرور؟
            </Link>
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full rounded-2xl bg-gradient-to-l from-indigo-600 to-violet-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:transform-none disabled:cursor-not-allowed flex justify-center items-center gap-2">
        {loading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          "تسجيل الدخول الآمن"
        )}
      </button>

      <p className="text-center text-sm font-medium text-slate-500 pt-4 border-t border-slate-100">
        ليس لديك حساب؟{" "}
        <Link href="/auth/register" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
          إنشاء حساب جديد مجاناً
        </Link>
      </p>
    </form>
  );
}