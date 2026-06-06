"use client";

import { useState, useEffect } from "react";
import { accountService } from "@/app/services";
import { useAuth } from "@/app/hooks/useAuth";

export default function SettingsPage() {
  const { user } = useAuth();
  
  // ─── Profile Info State ───
  const [infoForm, setInfoForm] = useState({ firstName: "", lastName: "" });
  const [infoStatus, setInfoStatus] = useState({ loading: false, error: "", success: "" });

  // ─── Password State ───
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

  // ─── Handlers ───
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
      setPasswordStatus({ loading: false, error: "", success: "تم تغيير كلمة المرور بنجاح." });
      setPasswordForm({ currentPassword: "", newPassword: "" }); // Reset form
    } catch (error) {
      setPasswordStatus({ 
        loading: false, 
        error: error.response?.data?.message || "كلمة المرور الحالية غير صحيحة", 
        success: "" 
      });
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">إعدادات الحساب</h1>
        <p className="mt-1 text-sm text-slate-500">إدارة معلوماتك الشخصية وكلمة المرور.</p>
      </div>

      {/* ── Profile Info Form ── */}
      <section className="surface-card p-6 sm:p-8">
        <h2 className="mb-6 text-lg font-bold text-slate-900">المعلومات الشخصية</h2>
        
        {infoStatus.success && <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700">{infoStatus.success}</div>}
        {infoStatus.error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">{infoStatus.error}</div>}

        <form onSubmit={handleInfoSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">الاسم الأول</label>
              <input
                type="text"
                required
                value={infoForm.firstName}
                onChange={(e) => setInfoForm({ ...infoForm, firstName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">الاسم الأخير</label>
              <input
                type="text"
                required
                value={infoForm.lastName}
                onChange={(e) => setInfoForm({ ...infoForm, lastName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">البريد الإلكتروني (غير قابل للتعديل)</label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-500"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button disabled={infoStatus.loading} type="submit" className="btn-primary px-8 text-sm">
              {infoStatus.loading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </section>

      {/* ── Change Password Form ── */}
      <section className="surface-card p-6 sm:p-8">
        <h2 className="mb-6 text-lg font-bold text-slate-900">تغيير كلمة المرور</h2>
        
        {passwordStatus.success && <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700">{passwordStatus.success}</div>}
        {passwordStatus.error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">{passwordStatus.error}</div>}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">كلمة المرور الحالية</label>
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full max-w-md rounded-xl border border-slate-300 px-4 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">كلمة المرور الجديدة</label>
            <input
              type="password"
              required
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full max-w-md rounded-xl border border-slate-300 px-4 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>
          <div className="flex justify-start pt-2">
            <button disabled={passwordStatus.loading} type="submit" className="btn-secondary px-8 text-sm">
              {passwordStatus.loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}