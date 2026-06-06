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

  // Modal States
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
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
      <div className="max-w-5xl mx-auto space-y-6 text-right" dir="rtl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">إدارة خدمات الشركة</h1>
            <p className="text-sm text-slate-500">أضف الخدمات العقارية المتميزة التي تقدمها شركتكم لعرضها في واجهتكم الخاصة.</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl">
            + إضافة خدمة جديدة
          </button>
        </div>

        {success && <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm border font-medium">{success}</div>}
        {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border font-medium">{error}</div>}

        {/* شبكة عرض الخدمات */}
        {loading ? (
          <div className="text-center py-10 text-slate-400">جاري تحميل الخدمات...</div>
        ) : services.length === 0 ? (
          <div className="bg-white border rounded-2xl p-10 text-center text-slate-400">لا توجد خدمات مضافة لشركتكم حتى الآن.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {services.map((svc) => (
              <div key={svc.id} className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-xl font-bold text-lg mb-3">💼</div>
                  <h3 className="font-bold text-slate-900 text-base">{svc.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{svc.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t flex justify-end">
                  <button onClick={() => openEditModal(svc)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">تعديل الخدمة ←</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal المنبثق */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">{modalMode === "create" ? "إضافة خدمة جديدة" : "تعديل الخدمة"}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">عنوان الخدمة *</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full rounded-xl border p-2.5 text-sm focus:outline-none focus:border-indigo-600" placeholder="مثال: إدارة الأملاك العقارية" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">وصف الخدمة *</label>
                  <textarea required rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-xl border p-2.5 text-sm focus:outline-none focus:border-indigo-600" placeholder="اكتب تفاصيل الخدمة والمميزات التي توفرها للعملاء..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="flex-1 bg-indigo-600 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50">{submitting ? "جاري الحفظ..." : "حفظ الخدمة"}</button>
                  <button type="button" onClick={() => setIsOpen(false)} className="flex-1 border py-2.5 text-sm rounded-xl">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}