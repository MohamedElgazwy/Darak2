"use client";

import { AdminRoute } from "@/app/lib/guards";
import { roleService } from "@/app/services";
import { useEffect, useState } from "react";

const AVAILABLE_PERMISSIONS = [
  "Announcements:read",
  "AnnouncementsStatus:Update",
  "users:read",
  "users:add",
  "users:update",
  "roles:read",
  "roles:add",
  "roles:update"
];

export default function AdminRolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({ id: "", name: "", permissions: [] });

  const fetchRoles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await roleService.getAll(true);
      const rolesData = res?.data || res || [];
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (err) {
      console.error("Failed to fetch roles", err);
      setError("حدث خطأ أثناء جلب الصلاحيات من الخادم. يرجى التحقق من اتصال الشبكة.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleToggleStatus = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد أنك تريد تغيير حالة صلاحية الدور: ${name}؟`)) return;
    try {
      await roleService.toggleStatus(id);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء تغيير حالة الدور.");
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({ id: "", name: "", permissions: [] });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = async (role) => {
    try {
      const res = await roleService.getById(role.id);
      const roleDetails = res?.data || res;
      
      setModalMode("edit");
      setFormData({
        id: roleDetails.id || role.id,
        name: roleDetails.name || role.name || "",
        permissions: roleDetails.permissions || role.permissions || [], 
      });
      setFormError("");
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء جلب تفاصيل الصلاحية المخصصة.");
    }
  };

  const handlePermissionToggle = (permission) => {
    setFormData((prev) => {
      const permissions = prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission];
      return { ...prev, permissions };
    });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("اسم الصلاحية مطلوب.");
      setIsSubmitting(false);
      return;
    }

    const payload = { name: formData.name, permissions: formData.permissions };

    try {
      if (modalMode === "create") {
        await roleService.create(payload);
      } else {
        await roleService.update(formData.id, payload);
      }
      setIsModalOpen(false);
      fetchRoles(); 
    } catch (err) {
      console.error("Role Form Submit Error:", err);
      const responseData = err.response?.data;
      if (responseData?.errors) {
        const validationErrors = Object.values(responseData.errors).flat().join(" | ");
        setFormError(`سبب الرفض: ${validationErrors}`);
      } else {
        setFormError(responseData?.message || "حدث خطأ أثناء الحفظ. تأكد من مطابقة مدخلات السيرفر.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminRoute>
      <div className="space-y-8 relative text-right animate-in fade-in duration-300" dir="rtl">
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-5">
          <div>
            <h1 className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-lg shadow-inner">🔐</span> إدارة المجموعات والصلاحيات
            </h1>
            <p className="mt-2 text-xs font-semibold text-slate-400">التحكم المطلق في جدار الحماية، وتعيين أذونات الموظفين والمديرين بالسيرفر.</p>
          </div>
          <button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-black shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 w-full sm:w-fit">
            ➕ إضافة دور مخصص جديد
          </button>
        </div>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600 shadow-sm">{error}</div>}

        {/* Roles Table Board UI */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/70 rounded-[2rem] overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-5">اسم الدور الأمني (Role Name)</th>
                  <th className="px-6 py-5">حالة النظام الحالية</th>
                  <th className="px-6 py-5 text-center">الإجراءات والتحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-16 text-center text-slate-400">
                      <div className="flex flex-col justify-center items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm" />
                        <p className="text-xs font-bold animate-pulse text-slate-400">جاري جلب المصفوفات الأمنية...</p>
                      </div>
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-16 text-center text-slate-400 font-bold bg-slate-50/30">
                      <div className="text-4xl mb-3 opacity-40">🛡️</div>
                      <p className="text-sm font-black text-slate-500">لم يتم تكوين أدوار مخصصة بالسيرفر بعد.</p>
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-6 py-5 font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{role.name}</td>
                      <td className="px-6 py-5">
                        {role.isDeleted ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-[11px] font-black text-red-700 border border-red-100 shadow-inner">⛔ معطل / محجوب</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700 border border-emerald-100 shadow-inner">⚡ نشط ومفعل</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3 text-xs font-bold">
                          <button onClick={() => openEditModal(role)} className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-md transform active:scale-95">تعديل الأذونات</button>
                          <button onClick={() => handleToggleStatus(role.id, role.name)} className="px-4 py-2 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm hover:shadow-md transform active:scale-95">تغيير النشاط</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Window Redesigned with Glassmorphism Overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 text-right">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/60">
                <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
                  {modalMode === "create" ? "✨ إضافة دور جديد" : "✏️ تعديل صلاحيات الدور"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 bg-white border border-slate-200 h-8 w-8 rounded-full flex items-center justify-center transition shadow-sm font-bold">&times;</button>
              </div>

              <form onSubmit={handleModalSubmit} className="p-6 md:p-8 space-y-6">
                {formError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-600 shadow-inner animate-in slide-in-from-top-2">{formError}</div>}

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 mr-1">اسم الدور الأمني (Role Name) *</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="مثال: SuperAdmin أو Manager" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition" />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 mr-1">الأذونات البرمجية الممنوحة (Claims)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-3 bg-slate-50/50 border border-slate-200/60 rounded-2xl shadow-inner">
                    {AVAILABLE_PERMISSIONS.map((perm) => {
                      const isChecked = formData.permissions.includes(perm);
                      return (
                        <label key={perm} className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all border ${isChecked ? 'bg-white border-indigo-300 shadow-sm ring-2 ring-indigo-50' : 'bg-white border-slate-200 hover:border-indigo-200'}`}>
                          <input type="checkbox" checked={isChecked} onChange={() => handlePermissionToggle(perm)} className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-50 focus:ring-4 transition cursor-pointer" />
                          <span className={`text-[11px] font-bold select-none truncate ${isChecked ? 'text-indigo-700' : 'text-slate-600'}`} title={perm}>{perm}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex gap-4 border-t border-slate-50 mt-8">
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl text-xs shadow-lg shadow-indigo-600/20 font-black transition transform active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
                    {isSubmitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "💾 حفظ واعتماد الصلاحية"}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 py-3.5 rounded-xl text-xs font-bold shadow-sm transition active:scale-95">إلغاء الأمر</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminRoute>
  );
}