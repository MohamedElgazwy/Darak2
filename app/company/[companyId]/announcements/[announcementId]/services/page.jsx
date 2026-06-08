"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CompanyServicesPage() {
  const params = useParams();
  const companyId = params?.companyId;

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);

  useEffect(() => {
    // 💡 محاكاة جلب خدمات الشركة من الباك إند
    // في الواقع ستستخدم: api.get(`/CompanyServices/Company/${companyId}`)
    setTimeout(() => {
      setServices([
        {
          id: 1,
          title: "الاستشارات العقارية",
          description: "نقدم استشارات متخصصة لمساعدتك في اتخاذ قرارات استثمارية صحيحة ومدروسة بناءً على تحليل دقيق لاتجاهات السوق العقاري.",
          icon: "🤝"
        },
        {
          id: 2,
          title: "التقييم والتثمين العقاري",
          description: "تحديد القيمة العادلة والدقيقة لعقارك باستخدام أحدث المعايير المعتمدة، سواء بغرض البيع، الشراء، أو التمويل العقاري.",
          icon: "📊"
        },
        {
          id: 3,
          title: "إدارة الأملاك والعقارات",
          description: "نتولى عنك كافة أعباء إدارة عقارك، بدءاً من تحصيل الإيجارات، الصيانة الدورية، وحتى التعامل مع المستأجرين لضمان راحة بالك.",
          icon: "🏢"
        },
        {
          id: 4,
          title: "التسويق العقاري الاحترافي",
          description: "نستخدم أحدث استراتيجيات التسويق الرقمي والتصوير الاحترافي للترويج لعقارك وضمان الوصول إلى المشتري المناسب في أسرع وقت.",
          icon: "🚀"
        },
        {
          id: 5,
          title: "الدعم القانوني والتوثيق",
          description: "نوفر لك فريقاً من الخبراء القانونيين لضمان سلامة كافة العقود والعمليات الورقية وتسجيل العقارات وفقاً للقوانين المتبعة.",
          icon: "⚖️"
        },
        {
          id: 6,
          title: "التشطيبات والتصميم الداخلي",
          description: "شراكات استراتيجية مع أفضل شركات الديكور لتحويل عقارك الجديد إلى منزل أحلامك بتصميمات عصرية وتشطيبات عالية الجودة.",
          icon: "🎨"
        }
      ]);
      setLoading(false);
    }, 800);
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent opacity-50"></div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-16">
      
      {/* ── 1. قسم العنوان (Header) ── */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm">
          خدماتنا المتكاملة
        </h1>
        <div className="w-24 h-1.5 bg-current opacity-20 mx-auto rounded-full"></div>
        <p className="opacity-70 text-lg md:text-xl leading-relaxed">
          نفخر بتقديم مجموعة شاملة من الخدمات العقارية المصممة خصيصاً لتلبية احتياجاتك، من لحظة التفكير في الاستثمار وحتى الاستقرار في منزلك.
        </p>
      </div>

      {/* ── 2. شبكة الخدمات (Services Grid) ── */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="group bg-current bg-opacity-5 p-10 rounded-[2.5rem] border border-current border-opacity-10 hover:border-opacity-30 hover:-translate-y-2 transition-all duration-300"
            >
              {/* أيقونة الخدمة */}
              <div className="w-20 h-20 bg-current bg-opacity-10 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 ease-out">
                {service.icon || "✨"}
              </div>
              
              {/* تفاصيل الخدمة */}
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="opacity-70 leading-relaxed text-[15px]">
                {service.description}
              </p>
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

      {/* ── 3. قسم دعوة لاتخاذ إجراء (Call to Action) ── */}
      <div className="mt-16 bg-current bg-opacity-5 rounded-[3rem] border border-current border-opacity-10 p-10 md:p-16 text-center flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-right flex-1" dir="rtl">
          <h3 className="text-3xl font-black mb-4">تحتاج لإحدى خدماتنا؟</h3>
          <p className="opacity-70 text-lg max-w-xl">
            سواء كنت تبحث عن استشارة سريعة أو ترغب في إدارة عقارك بالكامل، فريقنا مستعد لتقديم الدعم اللازم.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link 
            href={`/company/${companyId}/contact`}
            className="inline-block bg-current text-white dark:text-slate-900 invert dark:invert-0 px-10 py-4 rounded-xl font-bold text-lg hover:opacity-80 transition-opacity shadow-xl"
          >
            اطلب خدمتك الآن
          </Link>
        </div>
      </div>

    </div>
  );
}