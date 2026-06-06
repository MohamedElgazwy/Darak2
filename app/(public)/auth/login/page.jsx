"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { GuestRoute } from "@/app/lib/guards";


export default function LoginPage() {
  return (
    <GuestRoute>
      <div className="flex min-h-[calc(100vh-140px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 surface-card p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              تسجيل الدخول
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              أهلاً بك مجدداً في منصة دارك
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
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            البريد الإلكتروني
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700">
              كلمة المرور
            </label>
            <Link 
              href="/auth/forgot-password" 
              className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-70 disabled:cursor-not-allowed flex justify-center"
      >
        {loading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          "تسجيل الدخول"
        )}
      </button>

      <p className="text-center text-sm text-slate-500">
        ليس لديك حساب؟{" "}
        <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
          إنشاء حساب جديد
        </Link>
      </p>
    </form>
  );
}