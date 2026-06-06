// app/dashboard/admin-users/page.jsx
"use client";

import { AdminRoute } from "@/app/lib/guards";
import { userService } from "@/app/services";
import { useEffect, useState } from "react";

const AVAILABLE_ROLES = ["User", "Company", "Admin"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({ id: "", firstName: "", lastName: "", email: "", password: "", roles: [] });

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await userService.getAll();
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

  const handleToggleStatus = async (id, currentName) => {
    if (!window.confirm(`هل أنت متأكد أنك تريد تغيير حالة حساب: ${currentName}؟`)) return;
    try {
      await userService.toggleStatus(id);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "حدث خطأ أثناء تغيير حالة الحساب");
    }
  };

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
        await userService.update(formData.id, {
          id: formData.id, 
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
      <div className="space-y-6 relative text-right animate-in fade-in duration-300" dir="rtl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">👥 إدارة شؤون المستخدمين والعملاء</h1>
            <p className="mt-1 text-xs font-semibold text-slate-400">التحكم الكامل في صلاحيات المسجلين وفك الأقفال الأمنية للحسابات المحظورة.</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 py-2.5 text-xs w-full sm:w-fit font-bold shadow-md shadow-indigo-600/10">
            ➕ تسجيل وإضافة حساب مستخدم جديد
          </button>
        </div>

        {error && <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">{error}</div>}

        <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-slate-600">
              <thead className="bg-slate-50 border-b text-xs font-bold uppercase text-slate-900">
                <tr>
                  <th className="px-6 py-4">اسم العميل</th>
                  <th className="px-6 py-4">البريد الإلكتروني</th>
                  <th className="px-6 py-4">نوع المجموعة الصالحة</th>
                  <th className="px-6 py-4 text-center">الإجراءات الأمنية والتحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                      <div className="flex justify-center mb-2"><div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
                      جاري تحميل بيانات المسجلين...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-bold">🚫 لا يوجد أي مستخدمين مسجلين حالياً بالمنصة.</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">{user.firstName} {user.lastName}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{user.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {user.roles?.map((role) => {
                            let roleClass = "bg-slate-100 text-slate-700 border-slate-200/60";
                            if (role === "Admin") roleClass = "bg-slate-950 text-[#D4AF37] border-slate-800 shadow-sm";
                            if (role === "Company") roleClass = "bg-indigo-50 text-indigo-700 border-indigo-100/60";
                            return (
                              <span key={role} className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold border ${roleClass}`}>
                                {role === "Admin" ? "👑 مدير" : role === "Company" ? "🏢 شركة" : "👤 مستخدم"}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2.5 text-xs font-bold">
                          <button onClick={() => openEditModal(user)} className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border rounded-lg transition shadow-sm">تعديل</button>
                          <button onClick={() => handleToggleStatus(user.id, user.firstName)} className="px-2.5 py-1.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition">حظر/تفعيل</button>
                          <button onClick={() => handleUnlock(user.id, user.firstName)} className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition">🔓 فك القفل</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Window Redesigned */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border text-right">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/60">
                <h3 className="text-lg font-black text-slate-950">{modalMode === "create" ? "👤 إضافة مستخدم للنظام" : "✏️ تعديل بيانات الحساب العميل"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white border h-8 w-8 rounded-full flex items-center justify-center transition shadow-sm">&times;</button>
              </div>

              <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
                {formError && <div className="rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs font-bold text-red-600">{formError}</div>}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">الاسم الأول</label>
                    <input required type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm focus:bg-white focus:border-indigo-600 focus:outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">الاسم الأخير</label>
                    <input required type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm focus:bg-white focus:border-indigo-600 focus:outline-none transition" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">البريد الإلكتروني للأمان</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={modalMode === "edit"} className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none transition ${modalMode === "edit" ? "bg-slate-100 text-slate-400 cursor-not-allowed" : ""}`} />
                </div>

                {modalMode === "create" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">كلمة المرور الابتدائية</label>
                    <input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm focus:bg-white focus:border-indigo-600 focus:outline-none transition" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2.5 mr-1">المجموعة الممنوحة (Roles)</label>
                  <div className="flex gap-4 flex-wrap p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    {AVAILABLE_ROLES.map((role) => (
                      <label key={role} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.roles.includes(role)} onChange={() => handleRoleToggle(role)} className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-50 focus:ring-4 cursor-pointer" />
                        <span className="text-xs font-bold text-slate-700 select-none mr-0.5">{role === "Admin" ? "👑 مدير" : role === "Company" ? "🏢 شركة" : "👤 مستخدم"}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                  <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 py-3 text-sm bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10 font-bold">{isSubmitting ? "جاري التحديث والتشهير..." : "حفظ واعتماد التغييرات"}</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-3 text-sm font-bold shadow-sm">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminRoute>
  );
}