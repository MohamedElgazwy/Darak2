"use client";

import { AdminRoute } from "@/app/lib/guards";
import { roleService } from "@/app/services";
import { useEffect, useState } from "react";

// الأذونات الافتراضية للنظام
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

  // ─── Modal States ───
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    permissions: [],
  });

  // ─── 1. جلب قائمة الأدوار ───
  const fetchRoles = async () => {
    setLoading(true);
    setError("");
    try {
      // نرسل true لجلب جميع الصلاحيات بما فيها المعطلة
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

  // ─── 2. تغيير حالة الدور (تفعيل / تعطيل) ───
  const handleToggleStatus = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد أنك تريد تغيير حالة صلاحية الدور: ${name}؟`)) return;
    try {
      await roleService.toggleStatus(id);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء تغيير حالة الدور.");
    }
  };

  // ─── 3. التحكم في الـ Modal ───
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

  // ─── 4. إرسال بيانات الدور للسيرفر ───
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("اسم الصلاحية مطلوب.");
      setIsSubmitting(false);
      return;
    }

    // تجهيز الـ Object كـ JSON صريح لأن الـ Roles المعقدة في دوت نت تفضل الـ JSON وبودي مخصص
    const payload = {
      name: formData.name,
      permissions: formData.permissions,
    };

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
      <div className="space-y-6 relative text-right" dir="rtl">
        
        {/* ── عنوان الصفحة ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">إدارة الصلاحيات والأدوار</h1>
            <p className="mt-1 text-sm text-slate-500">التحكم في مجموعات الصلاحيات (Roles) والأذونات المخصصة لكل مجموعة.</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 py-2 text-sm w-fit font-semibold">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            إضافة صلاحية جديدة
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* ── جدول الصلاحيات ── */}
        <div className="surface-card overflow-hidden border border-slate-200 shadow-sm rounded-xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-900 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">اسم الدور (Role)</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex justify-center mb-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      </div>
                      جاري تحميل البيانات...
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                      لا يوجد صلاحيات مسجلة حتى الآن.
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {role.name}
                      </td>
                      <td className="px-6 py-4">
                        {role.isDeleted ? (
                          <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 border border-red-100">معطل / محذوف</span>
                        ) : (
                          <span className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 border border-green-100">مفعل</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openEditModal(role)} className="font-semibold text-indigo-600 hover:text-indigo-700 transition">
                            تعديل الأذونات
                          </button>
                          <button onClick={() => handleToggleStatus(role.id, role.name)} className="font-semibold text-amber-600 hover:text-amber-700 transition">
                            تغيير الحالة
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── النافذة المنبثقة (Modal) للإنشاء والتعديل ── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900">
                  {modalMode === "create" ? "إضافة صلاحية جديدة" : "تعديل الصلاحية"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="p-6 space-y-5 text-right">
                {formError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 font-medium">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">اسم الدور (Role Name)</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="مثال: SuperAdmin أو Manager"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">الأذونات الممنوحة (Permissions)</label>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <label key={perm} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm)}
                          onChange={() => handlePermissionToggle(perm)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span className="text-sm font-medium text-slate-700">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                  <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 font-semibold">
                    {isSubmitting ? "جاري الحفظ..." : "حفظ الصلاحية"}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-2.5 text-sm font-medium">
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminRoute>
  );
}