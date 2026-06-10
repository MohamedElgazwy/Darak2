"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { companyServicesService } from "@/app/services";

const DEFAULT_ICONS = ["🤝", "📊", "🏢", "🚀", "⚖️", "🎨", "🔑", "📋", "💼", "🌟"];

export default function CompanyServicesPage() {
  const params = useParams();
  const companyId = params?.companyId;

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      if (!companyId) return;
      setLoading(true);
      setError(null);

      try {
        // 💡 استخدام الـ Endpoint الجديدة لجلب خدمات هذه الشركة فقط
        const res = await companyServicesService.getCompanyServices(companyId);
        const fetchedServices = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        
        setServices(fetchedServices);
      } catch (err) {
        console.error("Failed to load company services:", err);
        setError("تعذّر تحميل خدمات الشركة في الوقت الحالي.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-current border-t-transparent opacity-40" />
          <p className="text-sm font-bold opacity-60">جاري تحميل الخدمات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="text-6xl opacity-40">⚠️</div>
        <p className="text-lg font-bold opacity-70">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm font-bold underline opacity-60 hover:opacity-100 transition-opacity"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-20" dir="rtl">
      {/* ── Header ── */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <p className="text-sm font-black opacity-50 tracking-widest uppercase bg-current bg-opacity-5 inline-block px-4 py-1.5 rounded-full border border-current border-opacity-10">
          دليلك العقاري
        </p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
          خدماتنا المتكاملة
        </h1>
        <div className="w-20 h-1.5 bg-current opacity-20 mx-auto rounded-full" />
        <p className="opacity-70 text-lg leading-relaxed">
          مجموعة شاملة من الخدمات العقارية المصممة لتلبية احتياجاتك، من أول استشارة حتى استلام مفتاح منزلك.
        </p>
      </div>

      {/* ── Services Grid ── */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div 
              key={service.id || idx} 
              className="group bg-current bg-opacity-[0.03] border border-current border-opacity-10 rounded-[2rem] p-8 hover:bg-current hover:bg-opacity-[0.06] hover:border-opacity-25 hover:-translate-y-2 transition-all duration-300 flex flex-col gap-6"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border border-current border-opacity-10 bg-white dark:bg-slate-900 shadow-sm group-hover:scale-110 transition-transform duration-300 shrink-0">
                {service.icon || DEFAULT_ICONS[idx % DEFAULT_ICONS.length]}
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-2xl font-bold leading-snug">{service.title}</h3>
                <p className="text-base opacity-70 leading-relaxed">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center bg-current bg-opacity-[0.03] rounded-[3rem] py-24 border border-current border-opacity-10 border-dashed max-w-3xl mx-auto space-y-4">
          <div className="text-6xl opacity-30 mb-2">📭</div>
          <h3 className="text-2xl font-bold opacity-70">لا توجد خدمات مضافة بعد</h3>
          <p className="text-base opacity-50 max-w-md mx-auto leading-relaxed">
            لم تقم الشركة بإضافة الخدمات التي تقدمها حتى الآن. يمكنك التواصل معها مباشرة للاستفسار.
          </p>
          <Link
            href={`/company/${companyId}/contact`}
            className="inline-block mt-6 px-8 py-3 rounded-xl border border-current border-opacity-20 text-sm font-bold opacity-80 hover:bg-current hover:text-white dark:hover:text-slate-900 transition-all"
          >
            تواصل مع الشركة
          </Link>
        </div>
      )}

      {/* ── Call to Action ── */}
      <div className="bg-current bg-opacity-5 rounded-[3rem] border border-current border-opacity-10 p-10 md:p-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 text-right">
          <div className="space-y-4 flex-1">
            <h3 className="text-3xl md:text-4xl font-black">تحتاج إحدى خدماتنا؟</h3>
            <p className="opacity-70 leading-relaxed max-w-xl text-lg">
              سواء كنت تبحث عن استشارة سريعة أو تريد إدارة عقارك بالكامل، فريقنا مستعد لتقديم الدعم اللازم لك في أي وقت.
            </p>
          </div>
          <div className="flex-shrink-0 w-full md:w-auto">
            <Link
              href={`/company/${companyId}/contact`}
              className="block text-center bg-current text-white dark:text-slate-900 invert dark:invert-0 px-10 py-5 rounded-2xl font-bold text-lg hover:opacity-80 transition-opacity shadow-2xl"
            >
              اطلب خدمتك الآن
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}