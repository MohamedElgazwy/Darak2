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
      setFormError("يجب اختيار صلاحية (Role) واحدة على الأقل للمستخدم لتأمين الحساب.");
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
        setFormError(`خطأ في البيانات الممررة: ${Object.values(responseData.errors).flat().join(" | ")}`);
      } else {
        setFormError(responseData?.message || "حدث خطأ أثناء حفظ التغييرات. يرجى مراجعة المدخلات.");
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
              <span className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-lg shadow-inner">👥</span> إدارة شؤون المستخدمين
            </h1>
            <p className="mt-2 text-xs font-semibold text-slate-400">التحكم الكامل في صلاحيات المسجلين وفك الأقفال الأمنية للحسابات المحظورة بالمنصة.</p>
          </div>
          <button onClick={openCreateModal} className="bg-gradient-to-l from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-black shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 w-full sm:w-fit">
            ➕ إضافة وتوثيق حساب جديد
          </button>
        </div>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600 shadow-sm animate-in slide-in-from-top-2">{error}</div>}

        <div className="bg-white/90 backdrop-blur-md border border-slate-200/70 rounded-[2rem] overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-5">اسم العميل المسجل</th>
                  <th className="px-6 py-5">البريد الإلكتروني الموثق</th>
                  <th className="px-6 py-5">نوع المصفوفة الصالحة (Roles)</th>
                  <th className="px-6 py-5 text-center">الإجراءات الأمنية والتحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-slate-400">
                      <div className="flex flex-col justify-center items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm" />
                        <p className="text-xs font-bold animate-pulse text-slate-400">جاري سحب داتا المسجلين وقواعد البيانات...</p>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-slate-400 font-bold bg-slate-50/30">
                      <div className="text-4xl mb-3 opacity-40">📭</div>
                      <p className="text-sm font-black text-slate-500">لا يوجد أي مستخدمين مسجلين حالياً بالمنصة المركزية.</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-6 py-5 font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{user.firstName} {user.lastName}</td>
                      <td className="px-6 py-5 text-slate-500 font-semibold font-mono text-xs">{user.email}</td>
                      <td className="px-6 py-5">
                        <div className="flex gap-2 flex-wrap">
                          {user.roles?.map((role) => {
                            let roleClass = "bg-slate-100 text-slate-600 border-slate-200/80 shadow-inner";
                            if (role === "Admin") roleClass = "bg-slate-900 text-[#D4AF37] border-slate-800 shadow-md";
                            if (role === "Company") roleClass = "bg-indigo-50 text-indigo-700 border-indigo-100/60 shadow-sm";
                            return (
                              <span key={role} className={`rounded-lg px-2.5 py-1 text-[10px] font-black tracking-wide border ${roleClass}`}>
                                {role === "Admin" ? "👑 مدير النظام" : role === "Company" ? "🏢 شركة عقارية" : "👤 مستخدم"}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2.5 text-xs font-bold">
                          <button onClick={() => openEditModal(user)} className="px-3 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-md transform active:scale-95">✏️ تعديل الداتا</button>
                          <button onClick={() => handleToggleStatus(user.id, user.firstName)} className="px-3 py-2 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm hover:shadow-md transform active:scale-95">⛔ حظر/تفعيل</button>
                          <button onClick={() => handleUnlock(user.id, user.firstName)} className="px-3 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm hover:shadow-md transform active:scale-95">🔓 فك القفل</button>
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
                  {modalMode === "create" ? "✨ إضافة حساب جديد للنظام" : "✏️ تعديل بيانات الحساب الجاري"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 bg-white border border-slate-200 h-8 w-8 rounded-full flex items-center justify-center transition shadow-sm font-bold">&times;</button>
              </div>

              <form onSubmit={handleModalSubmit} className="p-6 md:p-8 space-y-6">
                {formError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-600 shadow-inner animate-in slide-in-from-top-2">{formError}</div>}

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 mr-1">الاسم الأول *</label>
                    <input required type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 mr-1">الاسم الأخير *</label>
                    <input required type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 mr-1">البريد الإلكتروني للأمان *</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={modalMode === "edit"} className={`w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition ${modalMode === "edit" ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-100" : ""}`} />
                </div>

                {modalMode === "create" && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 mr-1">كلمة المرور الابتدائية (التشفير) *</label>
                    <input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition" />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 mr-1">المجموعة والصلاحيات الممنوحة (Roles) *</label>
                  <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50/50 border border-slate-200/60 rounded-2xl shadow-inner">
                    {AVAILABLE_ROLES.map((role) => {
                      const isChecked = formData.roles.includes(role);
                      return (
                        <label key={role} className={`flex flex-col items-center justify-center gap-2 cursor-pointer p-3 rounded-xl transition-all border ${isChecked ? 'bg-white border-indigo-400 shadow-md ring-2 ring-indigo-50' : 'bg-white border-slate-200 hover:border-indigo-200'}`}>
                          <input type="checkbox" checked={isChecked} onChange={() => handleRoleToggle(role)} className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-50 focus:ring-4 cursor-pointer" />
                          <span className={`text-[11px] font-black select-none ${isChecked ? 'text-indigo-700' : 'text-slate-500'}`}>
                            {role === "Admin" ? "👑 مدير" : role === "Company" ? "🏢 شركة" : "👤 مستخدم"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex gap-4 border-t border-slate-50 mt-8">
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl text-xs shadow-lg shadow-indigo-600/20 font-black transition transform active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
                    {isSubmitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "💾 حفظ واعتماد الصلاحيات"}
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