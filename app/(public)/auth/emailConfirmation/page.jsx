"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/app/services";
import { GuestRoute } from "@/app/lib/guards";

function ConfirmEmailHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const userId = searchParams.get("userId");
  const rawCode = searchParams.get("code");
  
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!userId || !rawCode) {
      setStatus("error");
      setErrorMessage("رابط التفعيل يفتقد لمعلمات المعرف أو الكود الأمني.");
      return;
    }

    // تنظيف الكود واستبدال المسافات بعلامة الزائد وضمان فك تشفير الـ URL بالكامل
    let cleanCode = rawCode.trim().replace(/ /g, "+");
    
    // حل مشكلة التصاق نصوص الحقوق إذا أرسلها السيرفر داخل ملف الـ HTML
    if (cleanCode.includes(" ©")) {
      cleanCode = cleanCode.split(" ©")[0];
    }

    const confirmAccount = async () => {
      try {
        // استدعاء الـ Endpoint: POST /API/Auth/ConfirmEmail
        await authService.confirmEmail({ 
          userId: userId, 
          code: cleanCode 
        });
        
        setStatus("success");
      } catch (error) {
        console.error("Email Confirmation API Error:", error.response?.data);
        
        setStatus("error");
        setErrorMessage(
          error.response?.data?.message || 
          "رابط التفعيل غير صالح، أو قد يكون منتهي الصلاحية (التوكن منتهي)."
        );
      }
    };

    confirmAccount();
  }, [userId, rawCode]);

  if (status === "loading") {
    return (
      <div className="text-center py-10">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="mt-4 text-slate-600 font-medium">جاري تأكيد حسابك وتفعيل البيئة...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center py-8" dir="rtl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">تم تأكيد الحساب بنجاح!</h2>
        <p className="text-slate-600 mb-8">تم تفعيل حسابك على منصة دارك. يمكنك الآن تسجيل الدخول مباشرة.</p>
        <Link href="/auth/login" className="btn-primary px-8">
          الذهاب لتسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-8" dir="rtl">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">فشل تأكيد الحساب</h2>
      <p className="text-slate-600 mb-8">{errorMessage || "الرابط غير صالح أو منتهي الصلاحية."}</p>
      <Link href="/auth/login" className="btn-secondary px-8">
        العودة لتسجيل الدخول
      </Link>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <GuestRoute>
      <div className="flex min-h-[calc(100vh-140px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg surface-card p-8">
          <Suspense fallback={<div className="text-center py-10">جاري التحميل...</div>}>
            <ConfirmEmailHandler />
          </Suspense>
        </div>
      </div>
    </GuestRoute>
  );
}