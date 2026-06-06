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
      if (isNewAbout) {
        await api.post("/CompanyAbouts/Create", aboutData);
      } else {
        await api.put("/CompanyAbouts/Update", aboutData);
      }
      setSuccess("تم تحديث الملف التعريفي للشركة بنجاح!");
      setIsNewAbout(false);
    } catch (err) {
      setError("فشلت عملية حفظ البيانات التعريفية.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">جاري تحميل بيانات الملف التعريفي...</div>;

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto space-y-6 text-right" dir="rtl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الملف التعريفي للشركة</h1>
          <p className="text-sm text-slate-500">تحديث من نحن، الرؤية، والرسالة لعرضها داخل القالب المختار للعملاء.</p>
        </div>

        {success && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">{success}</div>}
        {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">{error}</div>}

        <form onSubmit={handleSaveAbout} className="bg-white border rounded-2xl p-6 space-y-5 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">وصف الشركة (من نحن) *</label>
            <textarea required rows="4" value={aboutData.description} onChange={(e) => setAboutData({...aboutData, description: e.target.value})} className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:border-indigo-600" placeholder="اكتب نبذة مختصرة عن تاريخ شركتكم العقارية وعملائها..." />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">رؤية الشركة</label>
              <textarea rows="3" value={aboutData.vision} onChange={(e) => setAboutData({...aboutData, vision: e.target.value})} className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:border-indigo-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">رسالة الشركة</label>
              <textarea rows="3" value={aboutData.mission} onChange={(e) => setAboutData({...aboutData, mission: e.target.value})} className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:border-indigo-600" />
            </div>
          </div>
          <div className="pt-4 border-t flex justify-end">
            <button type="submit" disabled={submitting} className="bg-indigo-600 px-6 py-2.5 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
              {submitting ? "جاري الحفظ..." : "حفظ بيانات الشركة"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}