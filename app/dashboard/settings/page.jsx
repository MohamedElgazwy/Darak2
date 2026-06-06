// app/dashboard/settings/page.jsx
"use client";

import { useState, useEffect } from "react";
import { accountService } from "@/app/services";
import { useAuth } from "@/app/hooks/useAuth";

export default function SettingsPage() {
  const { user } = useAuth();
  
  const [infoForm, setInfoForm] = useState({ firstName: "", lastName: "" });
  const [infoStatus, setInfoStatus] = useState({ loading: false, error: "", success: "" });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: "", success: "" });

  useEffect(() => {
    if (user) {
      setInfoForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
  }, [user]);

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setInfoStatus({ loading: true, error: "", success: "" });
    try {
      await accountService.updateInfo(infoForm);
      setInfoStatus({ loading: false, error: "", success: "تم تحديث بياناتك الشخصية بنجاح! يرجى إعادة تحميل الصفحة لتحديث الواجهة." });
    } catch (error) {
      setInfoStatus({ 
        loading: false, 
        error: error.response?.data?.message || "حدث خطأ أثناء تحديث البيانات", 
        success: "" 
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, error: "", success: "" });
    try {
      await accountService.changePassword(passwordForm);
      setPasswordStatus({ loading: false, error: "", success: "تم تغيير كلمة المرور بأمان بنجاح." });
      setPasswordForm({ currentPassword: "", newPassword: "" }); 
    } catch (error) {
      setPasswordStatus({ 
        loading: false, 
        error: error.response?.data?.message || "كلمة المرور الحالية غير صحيحة", 
        success: "" 
      });
    }
  };

  return (
    <div className="max-w-3xl space-y-8 text-right animate-in fade-in duration-300" dir="rtl">
      <div className="border-b border-slate-200/60 pb-5">
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">⚙️ إعدادات الحساب والأمان</h1>
        <p className="mt-1 text-xs font-semibold text-slate-400">تحديث البيانات الفردية الشخصية وتغيير الرقم السري لتوثيق حماية حسابك.</p>
      </div>

      {/* ── Profile Info Form UI Refactored ── */}
      <section className="bg-white border border-slate-200/60 p-6 sm:p-8 rounded-3xl shadow-sm">
        <h2 className="mb-2 text-base font-extrabold text-slate-900">👤 المعلومات الشخصية للعميل</h2>
        <p className="text-slate-400 text-xs font-medium mb-6">الاسم المسجل بالمنصة ويظهر على إعلاناتك العقارية</p>
        
        {infoStatus.success && <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-bold text-emerald-700">{infoStatus.success}</div>}
        {infoStatus.error && <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-4 text-xs font-bold text-red-600">{infoStatus.error}</div>}

        <form onSubmit={handleInfoSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 mr-1">الاسم الأول</label>
              <input type="text" required value={infoForm.firstName} onChange={(e) => setInfoForm({ ...infoForm, firstName: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 mr-1">الاسم الأخير</label>
              <input type="text" required value={infoForm.lastName} onChange={(e) => setInfoForm({ ...infoForm, lastName: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 mr-1">البريد الإلكتروني الأساسي لجلسة الدخول (غير قابل للتغيير)</label>
            <input type="email" disabled value={user?.email || ""} className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed font-medium" />
          </div>
          <div className="flex justify-end pt-2">
            <button disabled={infoStatus.loading} type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/10 transition transform active:scale-95 disabled:opacity-50">
              {infoStatus.loading ? "جاري الحفظ والتشهير..." : "💾 حفظ التغييرات الفردية"}
            </button>
          </div>
        </form>
      </section>

      {/* ── Change Password Form UI Refactored ── */}
      <section className="bg-white border border-slate-200/60 p-6 sm:p-8 rounded-3xl shadow-sm">
        <h2 className="mb-2 text-base font-extrabold text-slate-900">🔒 تحديث جدار حماية كلمة المرور</h2>
        <p className="text-slate-400 text-xs font-medium mb-6">ننصح بانتخاب كلمات مرور معقدة تشمل أرقاماً ورموزاً لضمان عدم اختراق حسابك</p>
        
        {passwordStatus.success && <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-bold text-emerald-700">{passwordStatus.success}</div>}
        {passwordStatus.error && <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-4 text-xs font-bold text-red-600">{passwordStatus.error}</div>}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 mr-1">كلمة المرور الحالية المعتمدة</label>
            <input type="password" required value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full max-w-md rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 mr-1">كلمة المرور السرية الجديدة</label>
            <input type="password" required value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full max-w-md rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition" />
          </div>
          <div className="flex justify-end pt-2">
            <button disabled={passwordStatus.loading} type="submit" className="rounded-xl bg-slate-900 hover:bg-slate-800 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition transform active:scale-95 disabled:opacity-50">
              {passwordStatus.loading ? "جاري تشفير وتحديث السيرفر..." : "🔐 تحديث واعتماد كلمة المرور"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}