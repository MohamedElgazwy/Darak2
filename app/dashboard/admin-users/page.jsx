"use client";

import { AdminRoute } from "@/app/lib/guards";
import { userService } from "@/app/services";
import { useEffect, useState } from "react";

// الصلاحيات المتاحة والمطابقة لـ ASP.NET Identity Roles بالسيرفر
const AVAILABLE_ROLES = ["User", "Company", "Admin"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ─── Modal State ───
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "", // يُستخدم فقط في الإنشاء
    roles: [],
  });

  // ─── جلب المستخدمين بأمان من السيرفر ───
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await userService.getAll();
      // قنص المصفوفة بأكثر من صيغة لضمان الحماية طبقاً لردود السيرفر الموحدة [data.items أو data]
      const usersData = res?.data?.items || res?.items || res?.data || res || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setError("حدث خطأ أثناء جلب قائمة المستخدمين من السيرفر. يرجى التأكد من صلاحيات حسابك.");
      setUsers([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ─── حظر أو تفعيل الحساب ───
  const handleToggleStatus = async (id, currentName) => {
    if (!window.confirm(`هل أنت متأكد أنك تريد تغيير حالة حساب: ${currentName}؟`)) return;
    try {
      await userService.toggleStatus(id);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "حدث خطأ أثناء تغيير حالة الحساب");
    }
  };

  // ─── فك القفل الأمني الذكي ───
  const handleUnlock = async (id, currentName) => {
    if (!window.confirm(`هل تريد فك القفل الأمني عن حساب: ${currentName}؟`)) return;
    try {
      await userService.unlock(id);
      alert("تم فك قفل الحساب بنجاح!");
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "حدث خطأ أثناء فك القفل");
    }
  };

  // ─── التحكم في الـ Modal ───
  const openCreateModal = () => {
    setModalMode("create");
    setFormData({ id: "", firstName: "", lastName: "", email: "", password: "", roles: ["User"] });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setModalMode("edit");
    setFormData({
      id: user.id || user.Id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      password: "", 
      roles: user.roles || ["User"],
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleRoleToggle = (role) => {
    setFormData((prev) => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  // ─── إرسال البيانات للسيرفر ───
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    if (formData.roles.length === 0) {
      setFormError("يجب اختيار صلاحية واحدة على الأقل للمستخدم.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (modalMode === "create") {
        await userService.create({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          roles: formData.roles,
        });
      } else {
        // تمرير الـ id متبوعاً بجسم التحديث المتوافق مع الـ UpdateUserDto في دوت نت
        await userService.update(formData.id, {
          id: formData.id, // تضمين المعرف داخل البودي للتأكيد
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          roles: formData.roles,
        });
      }
      
      setIsModalOpen(false);
      fetchUsers(); 
    } catch (error) {
      console.error("User Action Form Error:", error);
      const responseData = error.response?.data;
      if (responseData?.errors) {
        setFormError(`خطأ في البيانات: ${Object.values(responseData.errors).flat().join(" | ")}`);
      } else {
        setFormError(responseData?.message || "حدث خطأ أثناء حفظ التغييرات. يرجى مراجعة الحقول.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminRoute>
      <div className="space-y-6 relative text-right" dir="rtl">
        {/* ── الـ Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">إدارة المستخدمين</h1>
            <p className="mt-1 text-sm text-slate-500">التحكم الكامل في حسابات وصلاحيات المسجلين على منصة دارك.</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 py-2 text-sm w-fit font-semibold">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            إضافة مستخدم جديد
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* ── جدول المستخدمين ── */}
        <div className="surface-card overflow-hidden border border-slate-200 shadow-sm rounded-xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-900 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">الاسم</th>
                  <th className="px-6 py-4">البريد الإلكتروني</th>
                  <th className="px-6 py-4">الصلاحيات</th>
                  <th className="px-6 py-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex justify-center mb-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      </div>
                      جاري تحميل بيانات المستخدمين...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                      لا يوجد مستخدمين مسجلين حالياً أو فشل جلب البيانات.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{user.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {user.roles && user.roles.map((role) => (
                            <span key={role} className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
                              {role === "Admin" ? "مدير" : role === "Company" ? "شركة" : "مستخدم عادى"}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openEditModal(user)} className="font-semibold text-indigo-600 hover:text-indigo-700 transition">
                            تعديل
                          </button>
                          <button onClick={() => handleToggleStatus(user.id, user.firstName)} className="font-semibold text-amber-600 hover:text-amber-700 transition">
                            حظر/تفعيل
                          </button>
                          <button onClick={() => handleUnlock(user.id, user.firstName)} className="font-semibold text-green-600 hover:text-green-700 transition">
                            فك القفل
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-right">
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900">
                  {modalMode === "create" ? "إضافة مستخدم جديد" : "تعديل بيانات المستخدم"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 font-medium">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الأول</label>
                    <input required type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الأخير</label>
                    <input required type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={modalMode === "edit"} className={`w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none ${modalMode === "edit" ? "bg-slate-50 text-slate-500" : ""}`} />
                </div>

                {modalMode === "create" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
                    <input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">الصلاحيات (Roles)</label>
                  <div className="flex gap-4 flex-wrap">
                    {AVAILABLE_ROLES.map((role) => (
                      <label key={role} className="flex items-center gap-2 cursor-pointer p-1">
                        <input
                          type="checkbox"
                          checked={formData.roles.includes(role)}
                          onChange={() => handleRoleToggle(role)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span className="text-sm font-medium text-slate-700 mr-1">{role === "Admin" ? "مدير" : role === "Company" ? "شركة" : "مستخدم"}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                  <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 bg-indigo-600 hover:bg-indigo-700 py-2.5 text-sm font-semibold">
                    {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
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