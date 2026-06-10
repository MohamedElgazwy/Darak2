"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GuestRoute } from "@/app/lib/guards";
import { authService } from "@/app/services";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const emailParam = searchParams.get("email") || "";
  const codeParam = searchParams.get("code") || "";

  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "", success: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: false });

    try {
      await authService.resetPassword({
        email: emailParam,
        code: codeParam,
        newPassword: newPassword,
      });
      setStatus({ loading: false, error: "", success: true });
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err) {
      setStatus({
        loading: false,
        error: err.response?.data?.message || "رابط غير صالح أو منتهي الصلاحية.",
        success: false,
      });
    }
  };

  if (status.success) {
    return (
      <div className="text-center py-6 animate-in fade-in zoom-in-95">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 border-4 border-emerald-100/50 shadow-inner">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">تم تغيير كلمة المرور!</h3>
        <p className="text-sm font-medium text-slate-500 bg-slate-50 py-2 rounded-xl inline-block px-4">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600 ml-2 align-middle" />
          جاري تحويلك إلى صفحة تسجيل الدخول...
        </p>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {status.error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600 animate-in slide-in-from-top-2 shadow-sm">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {status.error}
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <input type="password" required placeholder="كلمة المرور الجديدة" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pr-11 pl-4 py-4 text-sm font-medium text-slate-900 transition-all focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 placeholder:text-slate-400" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </div>

      <button type="submit" disabled={status.loading || !emailParam || !codeParam} className="w-full rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:transform-none flex justify-center items-center gap-2">
        {status.loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "حفظ كلمة المرور والدخول"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <GuestRoute>
      <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center py-16 px-4 overflow-hidden bg-[#f8fafc]" dir="rtl">
        {/* ── Decorative Background Blobs ── */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>

        <div className="relative z-10 w-full max-w-md space-y-8 bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              إعادة تعيين كلمة المرور
            </h2>
            <p className="text-sm font-medium text-slate-500">
              أدخل كلمة المرور الجديدة والقوية لحسابك لضمان أعلى معايير الأمان.
            </p>
          </div>
          <Suspense fallback={<div className="text-center py-8 text-indigo-600 font-bold animate-pulse">جاري التحقق من الرابط...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </GuestRoute>
  );
}