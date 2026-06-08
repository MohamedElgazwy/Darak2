// app/dashboard/profile-settings/page.jsx
"use client";

import { useState, useEffect } from "react";
import api from "@/app/services/api";
import { ProtectedRoute } from "@/app/lib/guards";

export default function CompanyProfileSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
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
        console.error(err);
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
      // include company/user id for backend scoping
      const stored = localStorage.getItem("authUser");
      const currentUser = stored ? JSON.parse(stored) : null;
      const payload = { ...aboutData };
      if (currentUser?.id) {
        payload.companyId = currentUser.id;
        payload.userId = currentUser.id;
      }

      if (isNewAbout) {
        await api.post("/CompanyAbouts/Create", payload);
      } else {
        await api.put("/CompanyAbouts/Update", payload);
      }
      setSuccess("تم تحديث الملف التعريفي للشركة بنجاح!");
      setIsNewAbout(false);
    } catch (err) {
      setError("فشلت عملية حفظ البيانات التعريفية.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-medium">
        <div className="flex justify-center mb-2"><div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
        جاري جلب الملف التعريفي للوكالة...
      </div>
    );
  }

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