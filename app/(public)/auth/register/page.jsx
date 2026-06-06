"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { GuestRoute } from "@/app/lib/guards";

export default function RegisterPage() {
  return (
    <GuestRoute>
      <div className="flex min-h-[calc(100vh-140px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-8 surface-card p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              إنشاء حساب جديد
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              انضم إلى منصة دارك وابدأ رحلتك العقارية
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </GuestRoute>
  );
}

function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    userType: "User", // Enum: [ User, Company ]
    companyName: "",
    logo: "", // 👈 أضفنا حقل اللوجو هنا
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // ─── دالة تحويل الصورة إلى Base64 ───
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // نأخذ النص الخاص بالصورة فقط بدون المقدمة (data:image/png;base64,)
        const base64String = reader.result.split(",")[1];
        setFormData((prev) => ({ ...prev, logo: base64String }));
      };
      reader.readAsDataURL(file);
    }
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // التحقق من رفع اللوجو إذا كان المستخدم شركة
    if (formData.userType === "Company" && !formData.logo) {
      setError("يجب إرفاق شعار الشركة (Logo) لإتمام التسجيل.");
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 4000);
    } catch (err) {
      console.error("Registration Error Details:", err.response?.data); 

      const responseData = err.response?.data;

      if (responseData) {
        const hasValidationErrors = responseData.errors && Object.keys(responseData.errors).length > 0;
        
        if (hasValidationErrors) {
          const validationMsgs = Object.values(responseData.errors).flat();
          setError(`خطأ في البيانات: ${validationMsgs.join(" | ")}`);
        } 
        else if (responseData.message) {
          setError(responseData.message);
        } 
        else {
          setError("حدث خطأ أثناء إنشاء الحساب. تأكد من صحة البيانات.");
        }
      } else {
        setError("تعذر الاتصال بالخادم. تأكد من اتصالك بالإنترنت.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900">تم إنشاء الحساب بنجاح!</h3>
        <p className="text-slate-600">
          لقد أرسلنا رابط التفعيل إلى بريدك الإلكتروني. يرجى مراجعة صندوق الوارد الخاص بك لتأكيد حسابك قبل محاولة تسجيل الدخول.
        </p>
        <p className="text-sm text-slate-400">جاري تحويلك إلى صفحة تسجيل الدخول...</p>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Account Type Toggle */}
      <div className="flex gap-4 p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, userType: "User", companyName: "", logo: "" })}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
            formData.userType === "User" 
              ? "bg-white text-indigo-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          مستخدم عادي
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, userType: "Company" })}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
            formData.userType === "Company" 
              ? "bg-white text-indigo-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          شركة عقارية
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الأول</label>
            <input
              name="firstName"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الأخير</label>
            <input
              name="lastName"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* حقول الشركة تظهر فقط إذا كان المستخدم شركة */}
        {formData.userType === "Company" && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">اسم الشركة *</label>
              <input
                name="companyName"
                required={formData.userType === "Company"}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">شعار الشركة (Logo) *</label>
              <input
                type="file"
                accept="image/*"
                required={formData.userType === "Company"}
                onChange={handleLogoUpload}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
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
          "إنشاء الحساب"
        )}
      </button>

      <p className="text-center text-sm text-slate-500">
        لديك حساب بالفعل؟{" "}
        <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}