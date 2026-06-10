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
      setInfoStatus({ loading: false, error: "", success: "تم تحديث بياناتك الشخصية بنجاح! يرجى إعادة تحميل المتصفح لتحديث الواجهات الجارية." });
    } catch (error) {
      setInfoStatus({ 
        loading: false, 
        error: error.response?.data?.message || "حدث خطأ غير متوقع أثناء محاولة المزامنة والتحديث الحالية.", 
        success: "" 
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, error: "", success: "" });
    try {
      await accountService.changePassword(passwordForm);
      setPasswordStatus({ loading: false, error: "", success: "تم تحديث واعتماد جدار حماية كلمة المرور الجديدة بنجاح! 🔒" });
      setPasswordForm({ currentPassword: "", newPassword: "" }); 
    } catch (error) {
      setPasswordStatus({ 
        loading: false, 
        error: error.response?.data?.message || "كلمة المرور الحالية المعتمدة غير صحيحة، يرجى إعادة المحاولة الموثقة.", 
        success: "" 
      });
    }
  };

  return (
    <div className="max-w-4xl space-y-10 text-right animate-in fade-in duration-300" dir="rtl">
      <div className="border-b border-slate-200/60 pb-5">
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">⚙️ إعدادات الحساب وجدار الأمان</h1>
        <p className="mt-1 text-xs font-semibold text-slate-400">تحويل وتعديل البيانات الفردية الشخصية ومراقبة تشفير حماية الحساب الخاص بك.</p>
      </div>

      {/* نموذج البيانات الشخصية */}
      <section className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">👤 الملف الشخصي والاسم التجاري</h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">الاسم والبيانات المعتمدة للمعلن وتظهر تلقائياً على كروت المعاينة والعقارات</p>
        </div>
        
        {infoStatus.success && <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-bold text-emerald-700 shadow-sm animate-in slide-in-from-top-2">{infoStatus.success}</div>}
        {infoStatus.error && <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-xs font-bold text-red-600 shadow-sm animate-in slide-in-from-top-2">{infoStatus.error}</div>}

        <form onSubmit={handleInfoSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 mr-1">الاسم الأول *</label>
              <input type="text" required value={infoForm.firstName} onChange={(e) => setInfoForm({ ...infoForm, firstName: e.target.value })} className="w-full p-3.5 border border-slate-200 bg-slate-50/40 rounded-xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition font-medium" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 mr-1">الاسم الأخير *</label>
              <input type="text" required value={infoForm.lastName} onChange={(e) => setInfoForm({ ...infoForm, lastName: e.target.value })} className="w-full p-3.5 border border-slate-200 bg-slate-50/40 rounded-xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition font-medium" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 mr-1">البريد الإلكتروني الموثق (غير قابل للتعديل للحماية)</label>
            <input type="email" disabled value={user?.email || ""} className="w-full p-3.5 border border-slate-200 bg-slate-100 rounded-xl text-slate-400 font-bold cursor-not-allowed text-left" dir="ltr" />
          </div>
          <div className="flex justify-end pt-2 border-t border-slate-50">
            <button disabled={infoStatus.loading} type="submit" className="w-full sm:w-fit rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-xs font-black text-white shadow-md shadow-indigo-600/10 transition transform active:scale-[0.98] disabled:opacity-50">
              {infoStatus.loading ? "جاري مزامنة الداتا..." : "💾 حفظ التغييرات الشخصية"}
            </button>
          </div>
        </form>
      </section>

      {/* نموذج كلمة المرور */}
      <section className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">🔒 تحديث جدار حماية كلمة المرور</h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">احرص على تعيين تشفير قوي يحتوي على رموز متباينة لتأمين الدخول</p>
        </div>
        
        {passwordStatus.success && <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-bold text-emerald-700 shadow-sm animate-in slide-in-from-top-2">{passwordStatus.success}</div>}
        {passwordStatus.error && <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-xs font-bold text-red-600 shadow-sm animate-in slide-in-from-top-2">{passwordStatus.error}</div>}

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 mr-1">كلمة المرور الحالية المعتمدة *</label>
              <input type="password" required value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full p-3.5 border border-slate-200 bg-slate-50/40 rounded-xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 mr-1">كلمة المرور السرية الجديدة *</label>
              <input type="password" required value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full p-3.5 border border-slate-200 bg-slate-50/40 rounded-xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition" />
            </div>
          </div>
          <div className="flex justify-end pt-3 border-t border-slate-50">
            <button disabled={passwordStatus.loading} type="submit" className="w-full sm:w-fit rounded-xl bg-slate-950 hover:bg-slate-900 px-6 py-3 text-xs font-black text-white shadow-md transition transform active:scale-[0.98] disabled:opacity-50">
              {passwordStatus.loading ? "جاري تشفير الداتا بالخادم..." : "🔐 اعتماد وتحديث كلمة المرور"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}