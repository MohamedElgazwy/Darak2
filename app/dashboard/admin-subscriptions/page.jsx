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
      const rawData = res?.data?.data || res?.data?.items || res?.data || res || [];
      const finalArray = Array.isArray(rawData) ? rawData : (Array.isArray(rawData.items) ? rawData.items : []);
      setPendingSubs(finalArray);
    } catch (err) {
      console.error("Error fetching pending subscriptions:", err);
      setError("حدث خطأ أثناء تحميل طلبات الاشتراكات المعلقة من السيرفر.");
      setPendingSubs([]);
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
      alert("تم تأكيد دفع الكاش وتفعيل حساب الشركة بنجاح! ✅");
      fetchPendingSubscriptions(); 
    } catch (err) {
      alert(err.response?.data?.message || "فشلت عملية تأكيد الدفع.");
    } finally {
      setActionId(null);
    }
  };

  const safePendingSubs = Array.isArray(pendingSubs) ? pendingSubs : [];

  return (
    <AdminRoute>
      <div className="space-y-8 text-right animate-in fade-in duration-300" dir="rtl">
        <div className="border-b border-slate-200/60 pb-5">
          <h1 className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-3">
            <span className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-lg shadow-inner">💰</span> اشتراكات الكاش المعلقة
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-400">مراجعة طلبات تفعيل الشركات وتأكيد فواتير الدفع النقدية اليدوية قبل منح صلاحيات النشر.</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600 shadow-sm animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-md border border-slate-200/70 rounded-[2rem] overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-5">رقم الطلب التسلسلي</th>
                  <th className="px-6 py-5">معرف الشركة الطالبة (User ID)</th>
                  <th className="px-6 py-5">طريقة الدفع المسجلة</th>
                  <th className="px-6 py-5 text-center">الإجراء الحاسم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-slate-400">
                      <div className="flex flex-col justify-center items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm" />
                        <p className="text-xs font-bold animate-pulse text-slate-400">جاري تحميل طلبات الكاش وسحب الداتا...</p>
                      </div>
                    </td>
                  </tr>
                ) : safePendingSubs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-slate-400 font-bold bg-slate-50/30">
                      <div className="text-4xl mb-3 opacity-40">📭</div>
                      <p className="text-sm font-black text-slate-500">لا توجد أي طلبات اشتراكات كاش معلقة بالخادم حالياً.</p>
                    </td>
                  </tr>
                ) : (
                  safePendingSubs.map((sub, idx) => (
                    <tr key={sub.id || idx} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-6 py-5 font-black text-slate-900 text-sm">
                        <span className="bg-slate-100 px-2 py-1 rounded-lg text-xs font-bold text-slate-500 mr-2 border border-slate-200/60 shadow-inner">#{sub.id}</span>
                      </td>
                      <td className="px-6 py-5 font-semibold text-slate-600 truncate max-w-[200px]" title={sub.userId}>
                        <span className="font-mono text-xs">{sub.userId || "حساب شركة عقارية"}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-black border border-amber-200/50 shadow-inner">
                          💵 {sub.paymentMethod || "دفع كاش (Cash)"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => handleConfirmCash(sub.id)}
                          disabled={actionId === sub.id}
                          className="bg-emerald-600 hover:bg-emerald-700 font-black text-white px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center mx-auto gap-2 min-w-[150px]"
                        >
                          {actionId === sub.id ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "✅ تأكيد استلام الكاش والتفعيل"}
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