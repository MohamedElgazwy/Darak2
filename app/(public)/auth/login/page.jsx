"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { GuestRoute } from "@/app/lib/guards";

export default function LoginPage() {
  return (
    <GuestRoute>
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-slate-100/50 to-indigo-50/30">
        <div className="w-full max-w-md space-y-8 bg-white border border-slate-200/60 rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)]">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
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
  const [showPassword, setShowPassword] = useState(false); // حالة إظهار وإخفاء كلمة المرور

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5 text-right" onSubmit={handleSubmit} dir="rtl">
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50/60 backdrop-blur-sm p-4 text-sm font-medium text-red-600 animate-in slide-in-from-top-2 duration-200">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">
            البريد الإلكتروني
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition-all duration-200 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5 px-1">
            <label className="block text-xs font-bold text-slate-700">
              كلمة المرور
            </label>
            <Link 
              href="/auth/forgot-password" 
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"} // يتغير النوع ديناميكياً
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-12 pr-4 py-3 text-sm text-slate-900 transition-all duration-200 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            {/* زر الإخفاء والإظهار بتصميم متناسق */}
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
          "تسجيل الدخول الآمن"
        )}
      </button>

      <p className="text-center text-sm font-medium text-slate-500 pt-2 border-t border-slate-100">
        ليس لديك حساب؟{" "}
        <Link href="/auth/register" className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4 decoration-indigo-200 hover:decoration-indigo-600 transition-all">
          إنشاء حساب جديد مجاناً
        </Link>
      </p>
    </form>
  );
}