"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GuestRoute } from "@/app/lib/guards";
import { authService } from "@/app/services";


function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extract tokens from URL (e.g. ?email=test@test.com&code=12345)
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
      <div className="text-center py-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900">تم تغيير كلمة المرور!</h3>
        <p className="mt-2 text-slate-600">جاري تحويلك إلى صفحة تسجيل الدخول...</p>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {status.error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {status.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          كلمة المرور الجديدة
        </label>
        <input
          type="password"
          required
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:outline-none"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={status.loading || !emailParam || !codeParam}
        className="btn-primary w-full disabled:opacity-70"
      >
        {status.loading ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <GuestRoute>
      <div className="flex min-h-[calc(100vh-140px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 surface-card p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              إعادة تعيين كلمة المرور
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              أدخل كلمة المرور الجديدة لحسابك.
            </p>
          </div>
          <Suspense fallback={<div className="text-center py-4">جاري التحميل...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </GuestRoute>
  );
}