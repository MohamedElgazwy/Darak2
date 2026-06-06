// app/dashboard/services/page.jsx
"use client";

import { ProtectedRoute } from "@/app/lib/guards";
import { api } from "@/app/services";
import { useState, useEffect } from "react";

export default function CompanyServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); 
  const [formData, setFormData] = useState({ id: 0, title: "", description: "", icon: "home" });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/CompanyServices/List");
      setServices(res?.data || res || []);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تحميل خدمات الشركة من السيرفر.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({ id: 0, title: "", description: "", icon: "home" });
    setIsOpen(true);
  };

  const openEditModal = (svc) => {
    setModalMode("edit");
    setFormData({
      id: svc.id || svc.Id,
      title: svc.title || "",
      description: svc.description || "",
      icon: svc.icon || "home"
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (modalMode === "create") {
        await api.post("/CompanyServices/Create", {
          title: formData.title,
          description: formData.description,
          icon: formData.icon
        });
        setSuccess("تم إضافة الخدمة بنجاح!");
      } else {
        await api.put("/CompanyServices/Update", {
          id: Number(formData.id),
          title: formData.title,
          description: formData.description,
          icon: formData.icon
        });
        setSuccess("تم تحديث بيانات الخدمة بنجاح!");
      }
      setIsOpen(false);
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || "فشلت العملية، يرجى مراجعة الحقول.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto space-y-6 text-right animate-in fade-in duration-300" dir="rtl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">💼 إدارة حزم خدمات الشركة</h1>
            <p className="text-sm font-medium text-slate-400 mt-1">أضف باقات خدماتكم (مثل: التثمين العقاري، صيانة الأملاك) لعرضها بوضوح بداخل القالب المختار.</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-md shadow-indigo-600/10 shrink-0">
            ➕ إضافة باقة خدمة جديدة للواجهة
          </button>
        </div>

        {success && <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold shadow-sm">{success}</div>}
        {error && <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold shadow-sm">{error}</div>}

        {/* Services Box Cards UI */}
        {loading ? (
          <div className="text-center py-10 text-slate-400 font-medium">جاري تحديث حزم الخدمات...</div>
        ) : services.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center text-sm font-bold text-slate-400 border-dashed">📭 لا توجد أي خدمات مضافة ومسجلة لشركتكم حالياً بالمنصة.</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((svc) => (
              <div key={svc.id} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between hover:border-indigo-100 hover:shadow-md transition duration-300 group">
                <div className="space-y-3">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-600 border border-indigo-100/50 flex items-center justify-center rounded-xl font-bold text-base shadow-inner group-hover:scale-105 transition-transform duration-300">💼</div>
                  <h3 className="font-extrabold text-slate-900 text-base line-clamp-1">{svc.title}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-3">{svc.description}</p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                  <button onClick={() => openEditModal(svc)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4 decoration-indigo-100 hover:decoration-indigo-500 transition-all">تعديل بيانات الخدمة &larr;</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Popup Modal Control */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4 border text-right">
              <h3 className="text-lg font-black text-slate-950">{modalMode === "create" ? "💼 إضافة خدمة جديدة للواجهة" : "✏️ تعديل حزمة الخدمة المسجلة"}</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 mr-1">عنوان الخدمة *</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition" placeholder="مثال: إدارة وتأجير الأملاك العقارية" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 mr-1">وصف وتفاصيل الخدمة للعملاء *</label>
                  <textarea required rows="4" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition leading-relaxed" placeholder="اكتب تفاصيل ومزايا الخدمة التي توفرها للعملاء لجذب المشترين والمستأجرين..." />
                </div>
                <div className="flex gap-3 pt-3 border-t mt-4">
                  <button type="submit" disabled={submitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-bold text-white rounded-xl shadow-md shadow-indigo-600/10 disabled:opacity-50 transition transform active:scale-95">{submitting ? "جاري الحفظ..." : "حفظ الخدمة باللوحة"}</button>
                  <button type="button" onClick={() => setIsOpen(false)} className="flex-1 border bg-white text-slate-700 py-3 text-xs font-bold rounded-xl shadow-sm hover:bg-slate-50 transition">إلغاء الأمر</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}