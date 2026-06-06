"use client";

import { useState, useEffect } from "react";
import api from "@/app/services/api";
import { AdminRoute } from "@/app/lib/guards";

export default function AdminPendingSubscriptionsPage() {
  const [pendingSubs, setPendingSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  const fetchPendingSubscriptions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/Subscriptions/Pending");
      
      // 🟢 قنص مصفوفة الاشتراكات المعلقة بذكاء بناءً على هيكل ردود السيرفر الموحدة لـ Darak
      const rawData = res?.data?.data || res?.data?.items || res?.data || res || [];
      const finalArray = Array.isArray(rawData) ? rawData : (Array.isArray(rawData.items) ? rawData.items : []);
      
      setPendingSubs(finalArray);
    } catch (err) {
      console.error("Error fetching pending subscriptions:", err);
      setError("حدث خطأ أثناء تحميل طلبات الاشتراكات المعلقة من السيرفر.");
      setPendingSubs([]); // حماية الـ State في حالة حدوث خطأ
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSubscriptions();
  }, []);

  const handleConfirmCash = async (subId) => {
    if (!window.confirm("هل تأكدت من استلام قيمة الاشتراك نقداً وتريد تفعيل حساب الشركة الآن؟")) return;
    setActionId(subId);
    try {
      await api.post("/Payments/Confirm-Cash", { subscriptionId: Number(subId) });
      alert("تم تأكيد دفع الكاش وتفعيل حساب الشركة بنجاح!");
      fetchPendingSubscriptions(); // إعادة تحميل الجدول بعد التفعيل
    } catch (err) {
      alert(err.response?.data?.message || "فشلت عملية تأكيد الدفع.");
    } finally {
      setActionId(null);
    }
  };

  // تأمين إضافي للتأكد بنسبة 100% أن المتغير مصفوفة قبل الرندرة
  const safePendingSubs = Array.isArray(pendingSubs) ? pendingSubs : [];

  return (
    <AdminRoute>
      <div className="space-y-6 text-right animate-in fade-in duration-200" dir="rtl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">طلبات اشتراكات الكاش المعلقة 💰</h1>
          <p className="text-sm text-slate-500">مراجعة طلبات تفعيل الشركات وتأكيد فواتير الدفع النقدية قبل منحهم صلاحيات النشر.</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-900 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">رقم الطلب</th>
                  <th className="px-6 py-4">معرف الشركة (User ID)</th>
                  <th className="px-6 py-4">طريقة الدفع</th>
                  <th className="px-6 py-4">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex justify-center mb-3">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      </div>
                      جاري تحميل طلبات الكاش...
                    </td>
                  </tr>
                ) : safePendingSubs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-400 font-medium">
                      لا توجد طلبات اشتراكات كاش معلقة حالياً.
                    </td>
                  </tr>
                ) : (
                  safePendingSubs.map((sub, idx) => (
                    <tr key={sub.id || idx} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">#{sub.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-600 truncate max-w-[200px]" title={sub.userId}>
                        {sub.userId || "حساب شركة عقارية"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-amber-200">
                          {sub.paymentMethod || "Cash"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleConfirmCash(sub.id)}
                          disabled={actionId === sub.id}
                          className="bg-green-600 hover:bg-green-700 font-semibold text-white px-4 py-2 rounded-xl text-xs transition disabled:opacity-50"
                        >
                          {actionId === sub.id ? "جاري التفعيل..." : "تأكيد استلام الكاش"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}