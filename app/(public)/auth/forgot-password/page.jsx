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
      <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center py-16 px-4 overflow-hidden bg-[#f8fafc]" dir="rtl">
        {/* ── Decorative Background Blobs ── */}
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-emerald-300/20 rounded-full mix-blend-multiply filter blur-[80px] opacity-70"></div>

        <div className="relative z-10 w-full max-w-md space-y-8 bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-indigo-100">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              نسيت كلمة المرور؟
            </h2>
            <p className="text-sm font-medium text-slate-500">
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً مشفراً لإعادة تعيين كلمة المرور الخاصة بك.
            </p>
          </div>

          {status.success ? (
            <div className="rounded-2xl bg-emerald-50 p-6 text-center border border-emerald-200 shadow-sm animate-in fade-in zoom-in-95">
              <div className="text-emerald-500 text-4xl mb-3">✅</div>
              <p className="font-black text-emerald-800 mb-2">تم إرسال الرابط بنجاح!</p>
              <p className="text-sm text-emerald-700 font-medium">يرجى التحقق من صندوق الوارد الخاص بك (أو مجلد البريد المزعج) واتباع التعليمات.</p>
              <Link href="/auth/login" className="mt-6 inline-block w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-md hover:bg-emerald-700 transition">
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {status.error && (
                <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600 animate-in slide-in-from-top-2 shadow-sm">
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  {status.error}
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input type="email" required placeholder="البريد الإلكتروني المسجل" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pr-11 pl-4 py-4 text-sm font-medium text-slate-900 transition-all focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 placeholder:text-slate-400" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <button type="submit" disabled={status.loading} className="w-full rounded-2xl bg-slate-900 py-4 text-base font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:transform-none flex justify-center items-center gap-2">
                {status.loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "إرسال رابط الاستعادة ✉️"}
              </button>

              <p className="text-center text-sm font-medium text-slate-500 pt-4 border-t border-slate-100">
                تذكرت كلمة المرور؟{" "}
                <Link href="/auth/login" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                  العودة لتسجيل الدخول
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </GuestRoute>
  );
}