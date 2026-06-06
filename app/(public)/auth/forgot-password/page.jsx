"use client";

import { useState } from "react";
import Link from "next/link";
import { GuestRoute } from "@/app/lib/guards";
import { authService } from "@/app/services";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "", success: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: false });

    try {
      // استدعاء API إرسال إيميل الاستعادة
      await authService.forgetPassword({ email });
      setStatus({ loading: false, error: "", success: true });
    } catch (err) {
      setStatus({
        loading: false,
        error: err.response?.data?.message || "حدث خطأ. تأكد من أن البريد الإلكتروني مسجل لدينا.",
        success: false,
      });
    }
  };

  return (
    <GuestRoute>
      <div className="flex min-h-[calc(100vh-140px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 surface-card p-8 shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              نسيت كلمة المرور؟
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
            </p>
          </div>

          {status.success ? (
            <div className="rounded-lg bg-green-50 p-6 text-center text-green-800 border border-green-100">
              <p className="font-semibold mb-2">تم إرسال الرابط بنجاح!</p>
              <p className="text-sm">يرجى التحقق من صندوق الوارد الخاص بك (أو مجلد البريد المزعج) واتباع التعليمات.</p>
              <Link href="/auth/login" className="mt-6 inline-block text-sm font-bold text-indigo-600 hover:text-indigo-700">
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {status.error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                  {status.error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={status.loading}
                className="btn-primary w-full disabled:opacity-70 flex justify-center"
              >
                {status.loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "إرسال رابط الاستعادة"
                )}
              </button>

              <p className="text-center text-sm text-slate-500">
                تذكرت كلمة المرور؟{" "}
                <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  تسجيل الدخول
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </GuestRoute>
  );
}