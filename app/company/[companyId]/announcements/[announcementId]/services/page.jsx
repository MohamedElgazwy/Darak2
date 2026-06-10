"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { companyServicesService } from "@/app/services";

export default function CompanyServicesPage() {
  const params = useParams();
  const companyId = params?.companyId;

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;

    const fetchServices = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await companyServicesService.getCompanyServices(companyId);
        if (cancelled) return;
        const data = res?.data ?? res ?? [];
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load services:", err);
        setError("حدث خطأ أثناء جلب خدمات الشركة.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchServices();
    return () => { cancelled = true; };
  }, [companyId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse h-44 bg-current bg-opacity-5 rounded-2xl p-6" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 font-bold mb-4">{error}</div>
        <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-xl bg-indigo-600 text-white">أعد المحاولة</button>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm">خدماتنا المتكاملة</h1>
        <div className="w-24 h-1.5 bg-current opacity-20 mx-auto rounded-full" />
        <p className="opacity-70 text-lg md:text-xl leading-relaxed">نفخر بتقديم مجموعة شاملة من الخدمات العقارية المصممة خصيصاً لتلبية احتياجاتك، من لحظة التفكير في الاستثمار وحتى الاستقرار في منزلك.</p>
      </div>

      {services && services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id || service.Id} className="group bg-current bg-opacity-5 p-10 rounded-[2.5rem] border border-current border-opacity-10 hover:border-opacity-30 hover:-translate-y-2 transition-all duration-300">
              <div className="w-20 h-20 bg-current bg-opacity-10 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 ease-out">{service.icon || service.Icon || "✨"}</div>
              <h3 className="text-2xl font-bold mb-4">{service.title || service.Title}</h3>
              <p className="opacity-70 leading-relaxed text-[15px]">{service.description || service.Description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center bg-current bg-opacity-5 rounded-3xl py-16 border border-current border-opacity-10 border-dashed max-w-2xl mx-auto">
          <div className="text-5xl mb-4 opacity-50">📭</div>
          <h3 className="text-xl font-bold mb-2">لا توجد خدمات مضافة بعد</h3>
          <p className="opacity-70">لم تقم الشركة بإضافة الخدمات التي تقدمها حتى الآن.</p>
        </div>
      )}

      <div className="mt-16 bg-current bg-opacity-5 rounded-[3rem] border border-current border-opacity-10 p-10 md:p-16 text-center flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-right flex-1" dir="rtl">
          <h3 className="text-3xl font-black mb-4">تحتاج لإحدى خدماتنا؟</h3>
          <p className="opacity-70 text-lg max-w-xl">سواء كنت تبحث عن استشارة سريعة أو ترغب في إدارة عقارك بالكامل، فريقنا مستعد لتقديم الدعم اللازم.</p>
        </div>
        <div className="flex-shrink-0">
          <Link href={`/company/${companyId}/contact`} className="inline-block bg-current text-white dark:text-slate-900 invert dark:invert-0 px-10 py-4 rounded-xl font-bold text-lg hover:opacity-80 transition-opacity shadow-xl">اطلب خدمتك الآن</Link>
        </div>
      </div>
    </div>
  );
}