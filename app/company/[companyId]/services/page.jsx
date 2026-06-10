"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { companyServicesService } from "@/app/services";
import { useCompanyTheme } from "@/app/context/CompanyThemeContext"; // 👈 استدعاء المحرك

const DEFAULT_ICONS = ["🤝", "📊", "🏢", "🚀", "⚖️", "🎨", "🔑"];

export default function CompanyServicesPage() {
  const { companyId } = useParams();
  const { storeData } = useCompanyTheme(); // 👈 جلب الألوان
  
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await companyServicesService.getCompanyServices(companyId);
        setServices(Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      } catch (err) {
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    if (companyId) fetchServices();
  }, [companyId]);

  if (loading || !storeData) return <div className="min-h-[50vh]"></div>;

  const theme = storeData.themeStyles; // 👈 سحب قاموس الألوان!

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20" dir="rtl">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">خدماتنا المتكاملة</h1>
        <div className={`w-20 h-1.5 mx-auto rounded-full ${theme.accentBg}`} />
        <p className={`text-lg leading-relaxed ${theme.mutedText}`}>
          مجموعة شاملة من الخدمات العقارية المصممة لتلبية احتياجاتك، من أول استشارة حتى استلام مفتاح منزلك.
        </p>
      </div>

      {/* Services Grid الديناميكي الساحر */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div key={service.id || idx} className={`rounded-[2rem] p-8 flex flex-col gap-6 transition-all duration-300 border ${theme.card}`}>
              
              {/* أيقونة الخدمة (تأخذ لون الـ Accent الخاص بالقالب) */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border shadow-sm ${theme.iconBox}`}>
                {service.icon || DEFAULT_ICONS[idx % DEFAULT_ICONS.length]}
              </div>

              <div className="space-y-3 flex-1">
                <h3 className="text-2xl font-bold leading-snug">{service.title}</h3>
                <p className={`text-base leading-relaxed ${theme.mutedText}`}>{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center rounded-[3rem] py-24 border border-dashed max-w-3xl mx-auto ${theme.divider}`}>
          <div className="text-6xl opacity-30 mb-2">📭</div>
          <h3 className="text-2xl font-bold">لا توجد خدمات مضافة بعد</h3>
        </div>
      )}

      {/* Call to Action الملون حسب القالب */}
      <div className={`rounded-[3rem] border p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 text-right ${theme.card}`}>
        <div className="space-y-4 flex-1">
          <h3 className="text-3xl md:text-4xl font-black">تحتاج إحدى خدماتنا؟</h3>
          <p className={`leading-relaxed max-w-xl text-lg ${theme.mutedText}`}>سواء كنت تبحث عن استشارة سريعة أو تريد إدارة عقارك بالكامل، فريقنا مستعد.</p>
        </div>
        <div className="flex-shrink-0 w-full md:w-auto">
          <Link href={`/company/${companyId}/contact`} className={`block text-center px-10 py-5 rounded-2xl font-bold text-lg transition-transform hover:-translate-y-1 shadow-lg ${theme.accentBg}`}>
            اطلب خدمتك الآن
          </Link>
        </div>
      </div>
      
    </div>
  );
}