"use client";

import { ProtectedRoute } from "@/app/lib/guards";
import { companyAboutService } from "@/app/services";
import { useEffect, useState } from "react";
 // تأكد من مسار الاستيراد الصحيح

export default function CompanyProfileSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isNewAbout, setIsNewAbout] = useState(true);

  const [aboutData, setAboutData] = useState({
    description: "",
    vision: "",
    mission: ""
  });

  // دالة مساعدة لاستخراج البيانات من الـ Response
  const extractData = (res) => {
    if (!res) return null;
    if (res.data !== undefined) return res.data;
    return res;
  };

  const fetchCompanyProfile = async () => {
    setLoading(true);
    try {
      const res = await companyAboutService.getList();
      const dataArray = extractData(res);
      
      // إذا كان هناك بيانات محفوظة مسبقاً
      if (dataArray && dataArray.length > 0) {
        const currentAbout = dataArray[0];
        setAboutData({
          description: currentAbout.description || "",
          vision: currentAbout.vision || "",
          mission: currentAbout.mission || ""
        });
        setIsNewAbout(false); // هذا يعني أننا سنقوم بعمل Update وليس Create
      } else {
        setIsNewAbout(true);
      }
    } catch (err) {
      console.error("Failed to load company profile", err);
      setError("حدث خطأ أثناء جلب بيانات الشركة.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAboutData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      // include company/user id for proper scoping on the backend
      const stored = localStorage.getItem("authUser");
      const currentUser = stored ? JSON.parse(stored) : null;
      const payload = { ...aboutData };
      if (currentUser?.id) {
        payload.companyId = currentUser.id;
        payload.userId = currentUser.id;
      }

      if (isNewAbout) {
        await companyAboutService.create(payload);
        setIsNewAbout(false);
      } else {
        await companyAboutService.update(payload);
      }
      setSuccessMsg("تم حفظ بيانات الشركة بنجاح! ✅");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto space-y-8 pb-16 text-right" dir="rtl">
        
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            🏢 إعدادات ملف الشركة (عن الشركة)
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            هذه البيانات ستظهر للعملاء في صفحة شركتك (Storefront). تأكد من كتابتها بشكل جذاب واحترافي.
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-medium">{error}</div>}
        {successMsg && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 font-medium">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          
          {/* وصف الشركة */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">وصف الشركة (Description)</label>
            <textarea
              name="description"
              value={aboutData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all resize-none"
              placeholder="اكتب نبذة تعريفية عن شركتك العقارية وتاريخها..."
              required
            ></textarea>
          </div>

          {/* رؤية الشركة */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">رؤية الشركة (Vision)</label>
            <textarea
              name="vision"
              value={aboutData.vision}
              onChange={handleChange}
              rows="3"
              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all resize-none"
              placeholder="ما هي رؤيتكم المستقبلية في السوق العقاري؟"
            ></textarea>
          </div>

          {/* رسالة الشركة */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">رسالة الشركة (Mission)</label>
            <textarea
              name="mission"
              value={aboutData.mission}
              onChange={handleChange}
              rows="3"
              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all resize-none"
              placeholder="ما هي القيمة التي تقدمونها لعملائكم؟"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className={`px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 ${
                isSaving ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
              }`}
            >
              {isSaving ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "حفظ البيانات"
              )}
            </button>
          </div>

        </form>
      </div>
    </ProtectedRoute>
  );
}