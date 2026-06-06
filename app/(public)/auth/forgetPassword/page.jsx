"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authService } from "@/app/services";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // استخراج البيانات من الرابط
  const emailParam = searchParams.get("email") || "";
  let rawCode = searchParams.get("code") || "";

  // تنظيف الكود في حال التصق به نص حقوق الملكية من الإيميل
  if (rawCode.includes(" ©")) {
    rawCode = rawCode.split(" ©")[0];
  }
  // استبدال المسافات الفارغة بعلامة الزائد (لضمان صحة التشفير)
  const cleanCode = rawCode.replace(/ /g, "+");

  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "", success: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: false });

    try {
      await authService.resetPassword({
        email: emailParam,
        code: cleanCode,
        newPassword: newPassword,
      });
      
      setStatus({ loading: false, error: "", success: true });
      // تحويل المستخدم لتسجيل الدخول بعد 3 ثوانٍ من النجاح
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err) {
      console.error(err);
      setStatus({
        loading: false,
        error: err.response?.data?.message || "رابط غير صالح أو منتهي الصلاحية.",
        success: false,
      });
    }
  };

  // واجهة النجاح
  if (status.success) {
    return (
      <div className="text-center py-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900">تم تغيير كلمة المرور بنجاح!</h3>
        <p className="mt-2 text-slate-600">جاري تحويلك إلى صفحة تسجيل الدخول...</p>
      </div>
    );
  }

  // إذا تم فتح الصفحة بدون رابط صحيح
  if (!emailParam || !rawCode) {
    return (
      <div className="text-center py-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">رابط غير صالح</h3>
        <p className="text-slate-600 mb-6">الرجاء استخدام الرابط المرسل إلى بريدك الإلكتروني.</p>
        <Link href="/auth/forgetPassword" className="btn-primary px-6 text-sm">
          طلب رابط جديد
        </Link>
      </div>
    );
  }

  // واجهة إدخال كلمة المرور الجديدة
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
          placeholder="أدخل كلمة مرور جديدة"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={status.loading || !emailParam || !cleanCode}
        className="btn-primary w-full disabled:opacity-70 flex justify-center"
      >
        {status.loading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
      </button>
    </form>
  );
}

export default function ForgetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 surface-card p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            إعادة تعيين كلمة المرور
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            أدخل كلمة المرور الجديدة لحسابك لتتمكن من تسجيل الدخول مجدداً.
          </p>
        </div>
        <Suspense fallback={<div className="text-center py-4">جاري التحميل...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}