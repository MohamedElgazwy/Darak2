// app/dashboard/profile-settings/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/app/services/api";
import { ProtectedRoute } from "@/app/lib/guards";

export default function CompanyProfileSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPremiumLocked, setIsPremiumLocked] = useState(false); // 👈 حالة قفل الباقة المدفوعة
  
  const [aboutData, setAboutData] = useState({ description: "", vision: "", mission: "" });
  const [isNewAbout, setIsNewAbout] = useState(true);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const res = await api.get("/CompanyAbouts/List");
        const currentAbout = res?.data?.[0] || res?.[0];
        if (currentAbout) {
          setAboutData({
            description: currentAbout.description || "",
            vision: currentAbout.vision || "",
            mission: currentAbout.mission || ""
          });
          setIsNewAbout(false);
        }
      } catch (err) {
        // ⚡ إذا أرجع السيرفر 403، فهذا يعني أن الميزة غير مشمولة في باقة الشركة
        if (err.response?.status === 403) {
          setIsPremiumLocked(true);
        } else {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyProfile();
  }, []);

  const handleSaveAbout = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (isNewAbout) {
        await api.post("/CompanyAbouts/Create", aboutData);
      } else {
        await api.put("/CompanyAbouts/Update", aboutData);
      }
      setSuccess("تم تحديث الملف التعريفي للشركة بنجاح!");
      setIsNewAbout(false);
    } catch (err) {
      if (err.response?.status === 403) {
        setIsPremiumLocked(true);
      } else {
        setError("فشلت عملية حفظ البيانات التعريفية.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-medium flex flex-col items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-4" />
        جاري فحص صلاحيات باقتكم...
      </div>
    );
  }

  // ─── واجهة القفل (Premium Gate UI) ───
  if (isPremiumLocked) {
    return (
      <ProtectedRoute>
        <div className="max-w-2xl mx-auto mt-10 animate-in fade-in zoom-in-95 duration-500 text-right" dir="rtl">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2.5rem] p-10 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="mx-auto w-20 h-20 bg-slate-800/80 border border-slate-700 flex items-center justify-center rounded-2xl shadow-inner mb-6">
                <span className="text-4xl">💎</span>
              </div>
              <h2 className="text-2xl font-black text-white">ميزة مخصصة للباقات المتقدمة</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
                إنشاء ملف تعريفي خاص وتخصيص رؤية ورسالة شركتكم لعرضها بداخل واجهة المتجر هي ميزة حصرية ضمن باقات الشركات المتقدمة. قم بالترقية الآن لتعزيز ثقة عملائك.
              </p>
              <div className="pt-4">
                <Link href="/templates" className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition transform active:scale-95">
                  استكشاف باقات الترقية
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ─── الواجهة الطبيعية ───
  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto space-y-6 text-right animate-in fade-in duration-300" dir="rtl">
        <div className="border-b border-slate-200/60 pb-5">
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">🏢 الهوية والملف التعريفي للشركة</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">قم بتحديث من نحن، رؤية ورسالة الوكالة لتظهر تلقائياً بداخل القالب المختار للعملاء.</p>
        </div>

        {success && <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold shadow-sm">{success}</div>}
        {error && <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold shadow-sm">{error}</div>}

        <form onSubmit={handleSaveAbout} className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm relative overflow-hidden">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">وصف الشركة وعنوان (من نحن) *</label>
            <textarea required rows="4" value={aboutData.description} onChange={(e) => setAboutData({...aboutData, description: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition leading-relaxed placeholder-slate-400" placeholder="اكتب نبذة تفصيلية ومختصرة عن تاريخ شركتكم العقارية وعملائها وتاريخ التأسيس..." />
          </div>
          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">رؤية الشركة الاستراتيجية</label>
              <textarea rows="3" value={aboutData.vision} onChange={(e) => setAboutData({...aboutData, vision: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition leading-relaxed" placeholder="ما هي تطلعات وأهداف الوكالة المستقبلية في السوق؟" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">رسالة الشركة وقيم العمل</label>
              <textarea rows="3" value={aboutData.mission} onChange={(e) => setAboutData({...aboutData, mission: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition leading-relaxed" placeholder="ما هي القيم والمعايير التي تلتزمون بها تجاه المستأجر والمشتري؟" />
            </div>
          </div>
          
          <div className="pt-4 border-t flex justify-end">
            <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/10 transition transform active:scale-95 disabled:opacity-50">
              {submitting ? "جاري الحفظ والتشهير..." : "💾 حفظ الهوية التعريفية"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}