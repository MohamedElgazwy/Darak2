// app/dashboard/subscriptions/page.jsx
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
        setSubscription(res?.data || res);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          setError("هذه الصفحة مخصصة فقط للشركات التي تمتلك اشتراكاً مفعلًا وباقة نشطة.");
        } else {
          setError("لا يوجد اشتراك نشط تملك شركتكم حالياً أو لم يتم تأكيد دفع فاتورة الكاش بعد.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMySubscription();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-400 font-medium">
        <div className="flex justify-center mb-2"><div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
        جاري قراءة وتأمين تفاصيل باقتكم الحالية...
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto space-y-6 text-right animate-in fade-in duration-300" dir="rtl">
        <div className="border-b border-slate-200/60 pb-5">
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">💳 اشتراك شركتكم العقارية الحالي</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">تتبع دورة الفوترة الشهرية لحسابكم، ومراقبة حالة تفعيل صلاحيات النشر لرمز الوكالة.</p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 backdrop-blur-sm p-5 text-xs font-bold text-amber-800 leading-relaxed shadow-sm">
            ⚠️ تنبيه إداري: {error}
            <div className="mt-3 text-[11px] font-medium text-slate-500 border-t pt-3 border-amber-200/40">إذا قمت باختيار سداد قيمة الباقة نقداً (Cash) للمندوب، يرجى الانتظار حتى يقوم مدير النظام بفحص الدفعة النقدية وتفعيل صلاحيات النشر بلوحة تحكمكم.</div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-5">
              <div>
                <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">اسم الباقة المفعلة بحسابكم</span>
                <span className="text-xl font-black text-indigo-600 mt-0.5 block">{subscription?.package?.name || subscription?.packageName || "الباقة الاحترافية للشركات العقارية"}</span>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black px-3 py-1.5 rounded-full shadow-inner">✓ اشتراك نشط ومعتمد</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1 text-sm font-medium">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl shadow-inner">
                <span className="text-[10px] font-black text-slate-400 block tracking-wider">طريقة وآلية السداد المعتمدة</span>
                <span className="font-extrabold text-slate-800 mt-1 block">{subscription?.paymentMethod === "Cash" ? "💵 الدفع النقدى للمندوب (Cash)" : "💳 سداد إلكتروني (Visa Card)"}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl shadow-inner">
                <span className="text-[10px] font-black text-slate-400 block tracking-wider">رقم القالب المعتمد لواجهتكم للعملاء</span>
                <span className="font-extrabold text-slate-800 mt-1 block">قالب عرض الهوية رقم #{subscription?.templateId || 1}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}