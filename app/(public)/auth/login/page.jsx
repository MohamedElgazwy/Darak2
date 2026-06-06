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
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition-all duration-200 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
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