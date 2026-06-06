// app/dashboard/admin-roles/page.jsx
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
      <div className="space-y-6 relative text-right animate-in fade-in duration-300" dir="rtl">
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">🔐 إدارة المجموعات والأدوار الأمنية</h1>
            <p className="mt-1 text-xs font-semibold text-slate-400">التحكم المطلق في جدار الحماية، وتعيين أذونات الموظفين والمديرين بالسيرفر.</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 py-2.5 text-xs w-full sm:w-fit font-bold shadow-md shadow-indigo-600/10">
            ➕ إضافة دور مخصص جديد
          </button>
        </div>

        {error && <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">{error}</div>}

        {/* Roles Table Board UI */}
        <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-slate-600">
              <thead className="bg-slate-50 border-b text-xs font-bold uppercase text-slate-900">
                <tr>
                  <th className="px-6 py-4">اسم الدور الأمني (Role Name)</th>
                  <th className="px-6 py-4">حالة النظام الحالية</th>
                  <th className="px-6 py-4 text-center">الإجراءات والتحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-400">
                      <div className="flex justify-center mb-2"><div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
                      جاري جلب المصفوفات الأمنية...
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr><td colSpan="3" className="px-6 py-12 text-center text-slate-400 font-bold">🚫 لم يتم تكوين أدوار مخصصة بالسيرفر بعد.</td></tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">{role.name}</td>
                      <td className="px-6 py-4">
                        {role.isDeleted ? (
                          <span className="rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 border border-red-100/60">⛔ معطل / محجوب</span>
                        ) : (
                          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-100/60">⚡ نشط ومفعل</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3 text-xs font-bold">
                          <button onClick={() => openEditModal(role)} className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition">تعديل الأذونات</button>
                          <button onClick={() => handleToggleStatus(role.id, role.name)} className="px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition">تغيير حالة النشاط</button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border text-right">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/60">
                <h3 className="text-lg font-black text-slate-950">{modalMode === "create" ? "🔒 إضافة صلاحية جديدة" : "✏️ تعديل صلاحيات الدور البنائي"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white border h-8 w-8 rounded-full flex items-center justify-center transition shadow-sm">&times;</button>
              </div>

              <form onSubmit={handleModalSubmit} className="p-6 space-y-5">
                {formError && <div className="rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs font-bold text-red-600">{formError}</div>}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">اسم الدور الأمني (Role Name)</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="مثال: SuperAdmin أو Manager" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 mr-1">الأذونات البرمجية الممنوحة (Claims)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <label key={perm} className="flex items-center gap-3.5 cursor-pointer p-2.5 bg-white border border-slate-200/60 rounded-xl hover:border-indigo-200 transition shadow-sm">
                        <input type="checkbox" checked={formData.permissions.includes(perm)} onChange={() => handlePermissionToggle(perm)} className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-50 focus:ring-4 transition cursor-pointer" />
                        <span className="text-xs font-bold text-slate-700 select-none truncate" title={perm}>{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                  <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 py-3 text-sm bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10 font-bold">{isSubmitting ? "جاري الحفظ والتشهير..." : "حفظ واعتماد الصلاحية"}</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-3 text-sm font-bold shadow-sm">إلغاء الأمر</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminRoute>
  );
}