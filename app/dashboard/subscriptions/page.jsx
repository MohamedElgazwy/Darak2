"use client";

import { ProtectedRoute } from "@/app/lib/guards";
import { api } from "@/app/services";
import { useEffect, useState } from "react";


export default function MySubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMySubscription = async () => {
      try {
        const res = await api.get("/Subscriptions/me");
        // قنص كائن الاشتراك الفعلي القادم من السيرفر
        setSubscription(res?.data || res);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          setError("هذه الصفحة مخصصة فقط للشركات التي تمتلك اشتراكاً مفعلًا.");
        } else {
          setError("لا يوجد اشتراك نشط حالياً أو لم يتم تأكيد دفع الكاش بعد.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMySubscription();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400">جاري قراءة تفاصيل باقتك الحالية...</div>;

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto space-y-6 text-right" dir="rtl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">اشتراك شركتكم الحالي 💳</h1>
          <p className="text-sm text-slate-500">تتبع حالة الباقة المفعلة وتفاصيل التجديد الشهري الخاص بكم.</p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700 font-medium leading-relaxed">
            ⚠️ {error}
            <div className="mt-3 text-xs text-slate-500">إذا قمت بالاشتراك نقداً (Cash)، يرجى الانتظار حتى يقوم مدير النظام بتأكيد استلام الدفعة وتفعيل لوحة تحكمكم.</div>
          </div>
        ) : (
          <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <span className="text-xs text-slate-400 block">الباقة المفعلة</span>
                <span className="text-xl font-bold text-indigo-600">{subscription?.package?.name || subscription?.packageName || "الباقة الاحترافية الشركات"}</span>
              </div>
              <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-3 py-1 rounded-full">✓ اشتراك نشط</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block">طريقة السداد</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{subscription?.paymentMethod === "Cash" ? "نقداً (Cash)" : "بطاقة ائتمانية (Visa)"}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block">القالب المعتمد للواجهة</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">قالب رقم #{subscription?.templateId || 1}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}