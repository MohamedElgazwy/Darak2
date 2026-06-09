"use client";

import { ProtectedRoute } from "@/app/lib/guards";
import { companyServicesService, subscriptionService } from "@/app/services";
import { useEffect, useState } from "react";

export default function CompanyServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [servicesAllowed, setServicesAllowed] = useState(true);
  
  // إذا كانت currentService فارغة، يعني أننا نضيف خدمة جديدة، وإذا كان بها بيانات يعني أننا نعدل
  const [currentService, setCurrentService] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", icon: "" });

  const extractData = (res) => {
    if (!res) return [];
    if (res.data !== undefined) return res.data;
    return res;
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await companyServicesService.getList();
      setServices(extractData(res) || []);
    } catch (err) {
      console.error("Failed to load services", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    // check whether current company subscription allows 'Services' page (id 4)
    const stored = localStorage.getItem("authUser");
    const currentUser = stored ? JSON.parse(stored) : null;
    const checkTemplate = async () => {
      try {
        const tplId = currentUser?.templateId || currentUser?.template?.id;
        if (!tplId) return setServicesAllowed(true);
        const tplRes = await subscriptionService.getTemplateById(tplId);
        const tpl = tplRes?.data || tplRes;
        let available = true;
        if (tpl?.avaliablePages) {
          const pages = JSON.parse(tpl.avaliablePages);
          available = Array.isArray(pages) ? pages.includes(4) : true;
        }
        setServicesAllowed(available);
      } catch (e) {
        // assume allowed on error to avoid blocking users accidentally
        setServicesAllowed(true);
      }
    };
    checkTemplate();
  }, []);

  // فتح النافذة المنبثقة
  const openModal = (service = null) => {
    if (!servicesAllowed) {
      alert("خدمات الشركة غير متاحة في باقتك الحالية. تواصل مع الدعم أو قم بترقية باقتك.");
      return;
    }
    if (service) {
      setCurrentService(service);
      setFormData({ title: service.title, description: service.description, icon: service.icon });
    } else {
      setCurrentService(null);
      setFormData({ title: "", description: "", icon: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentService(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // include company/user id for backend scoping
      const stored = localStorage.getItem("authUser");
      const currentUser = stored ? JSON.parse(stored) : null;
      const payload = { ...formData };
      if (currentUser?.id) {
        // backend may expect PascalCase keys or companyId; include both to be safe
        payload.companyId = currentUser.id;
        payload.userId = currentUser.id;
        payload.CompanyId = currentUser.companyId || currentUser.id || undefined;
        payload.UserId = currentUser.id || undefined;
      }

      // Basic client-side validation
      if (!payload.title || !payload.title.trim()) {
        throw new Error('يرجى إدخال عنوان الخدمة');
      }
      if (!payload.description || !payload.description.trim()) {
        throw new Error('يرجى إدخال وصف الخدمة');
      }

      // Debug: log payload sent to API
      // eslint-disable-next-line no-console
      console.log('Creating service payload:', payload);

      if (currentService) {
        // تعديل خدمة موجودة
        await companyServicesService.update({ id: currentService.id, ...payload });
      } else {
        // إضافة خدمة جديدة
        await companyServicesService.create(payload);
      }
      closeModal();
      fetchServices(); // تحديث القائمة بعد الحفظ
    } catch (err) {
      // Show more informative error when available
      // eslint-disable-next-line no-console
      console.error("Failed to save service", err);
      const serverMsg = err?.serverData || err?.response?.data || err?.message || "حدث خطأ أثناء حفظ الخدمة.";
      // present readable message to user
      try {
        const msg = typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg);
        alert(msg);
      } catch (e) {
        alert("حدث خطأ أثناء حفظ الخدمة.");
      }
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
      <div className="max-w-6xl mx-auto space-y-8 pb-16 text-right" dir="rtl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              🛠️ الخدمات التي تقدمها الشركة
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              أضف الخدمات التي تتميز بها شركتكم (مثل: التقييم العقاري، الاستشارات، إدارة الأملاك...).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => servicesAllowed ? openModal() : null}
              disabled={!servicesAllowed}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 ${
                servicesAllowed ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>+ إضافة خدمة جديدة</span>
            </button>

            {!servicesAllowed && (
              <div className="bg-yellow-50 text-yellow-800 border border-yellow-100 rounded-lg px-3 py-2 text-sm flex items-center gap-3">
                <div>خدمات الشركة غير متاحة في باقتك.</div>
                <a href="/dashboard/subscriptions" className="text-indigo-600 font-semibold hover:underline">ترقية الباقة</a>
              </div>
            )}
          </div>
        </div>

        {/* Services Grid */}
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv) => (
              <div key={srv.id} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all relative group">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl border border-indigo-100">
                    {srv.icon || "✨"}
                  </div>
                  <button 
                    onClick={() => openModal(srv)}
                    className="text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                    title="تعديل الخدمة"
                  >
                    ✏️
                  </button>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{srv.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{srv.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-slate-50 rounded-3xl py-16 border border-slate-200 border-dashed">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-bold text-slate-700">لا توجد خدمات مضافة حتى الآن</h3>
            <p className="text-slate-500 text-sm mt-1">ابدأ بإضافة أول خدمة تقدمها شركتك لجذب المزيد من العملاء.</p>
          </div>
        )}

        {/* Modal (نافذة الإضافة / التعديل) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800">
                  {currentService ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
                </h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-red-500 text-2xl leading-none">&times;</button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">عنوان الخدمة</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none"
                    placeholder="مثال: إدارة الأملاك والعقارات"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">وصف الخدمة</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                    placeholder="اشرح باختصار ما تقدمه في هذه الخدمة..."
                    required
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">رمز تعبيري (Icon)</label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none"
                    placeholder="مثال: 🔑 أو 📄 (اختياري)"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex justify-center"
                  >
                    {isSaving ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "حفظ"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}