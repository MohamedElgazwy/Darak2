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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      if (!companyId) return;
      setLoading(true);
      setError(null);

      try {
        // Fetch ALL services — no filter endpoint exists in the API.
        // Match by companyId or userId on each record.
        const res = await companyServicesService.getList();
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];

        const matched = list.filter(
          (item) =>
            String(item.companyId) === String(companyId) ||
            String(item.userId) === String(companyId)
        );

        setServices(matched);
      } catch (err) {
        console.error("Failed to load company services:", err);
        setError("تعذّر تحميل خدمات الشركة.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [companyId]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent opacity-40" />
          <p className="text-sm font-medium opacity-60">جاري تحميل الخدمات...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="text-5xl opacity-40">⚠️</div>
        <p className="font-bold opacity-70">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm font-bold underline opacity-60 hover:opacity-100"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20" dir="rtl">

      {/* ── Header ── */}
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <p className="text-sm font-bold opacity-40 tracking-widest uppercase">ما نقدمه</p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
          خدماتنا المتكاملة
        </h1>
        <div className="w-16 h-1 bg-current opacity-20 mx-auto rounded-full" />
        <p className="opacity-65 text-lg leading-relaxed">
          مجموعة شاملة من الخدمات العقارية المصممة لتلبية احتياجاتك، من أول استشارة حتى استلام مفتاح منزلك.
        </p>
      </div>

      {/* ── Services Grid ── */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <ServiceCard key={service.id || idx} service={service} index={idx} />
          ))}
        </div>
      ) : (
        <EmptyServices companyId={companyId} />
      )}

      {/* ── Process section ── */}
      <div className="space-y-8 pt-4">
        <h2 className="text-2xl font-bold text-center">كيف نعمل معك؟</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {PROCESS_STEPS.map((step, idx) => (
            <div key={idx} className="relative text-center space-y-3">
              {/* connector line */}
              {idx < PROCESS_STEPS.length - 1 && (
                <div className="hidden sm:block absolute top-6 left-1/2 w-full h-px bg-current opacity-10 translate-x-4" />
              )}
              <div className="relative mx-auto w-12 h-12 rounded-full bg-current bg-opacity-10 border border-current border-opacity-15 flex items-center justify-center text-lg font-black">
                {idx + 1}
              </div>
              <p className="text-sm font-bold">{step.title}</p>
              <p className="text-xs opacity-55 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="bg-current bg-opacity-5 rounded-[2.5rem] border border-current border-opacity-10 p-10 md:p-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-right">
          <div className="space-y-3 flex-1">
            <h3 className="text-2xl md:text-3xl font-black">تحتاج إحدى خدماتنا؟</h3>
            <p className="opacity-65 leading-relaxed max-w-lg text-sm">
              سواء كنت تبحث عن استشارة سريعة أو تريد إدارة عقارك بالكامل، فريقنا مستعد لتقديم الدعم اللازم.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              href={`/company/${companyId}/contact`}
              className="inline-block bg-current text-white dark:text-slate-900 invert dark:invert-0 px-8 py-4 rounded-xl font-bold hover:opacity-80 transition-opacity shadow-xl"
            >
              اطلب خدمتك الآن
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Service Card ──────────────────────────────────────────────
function ServiceCard({ service, index }) {
  // Cycle through a set of accent colours so cards feel distinct
  const accents = [
    "bg-indigo-50 border-indigo-100 text-indigo-600",
    "bg-amber-50 border-amber-100 text-amber-600",
    "bg-emerald-50 border-emerald-100 text-emerald-600",
    "bg-violet-50 border-violet-100 text-violet-600",
    "bg-rose-50 border-rose-100 text-rose-600",
    "bg-sky-50 border-sky-100 text-sky-600",
  ];
  const accent = accents[index % accents.length];

  return (
    <div className="group bg-current bg-opacity-[0.03] border border-current border-opacity-10 rounded-[1.75rem] p-7 hover:border-opacity-25 hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-5">
      {/* Icon */}
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${accent} group-hover:scale-110 transition-transform duration-300 shrink-0`}
      >
        {service.icon || DEFAULT_ICONS[index % DEFAULT_ICONS.length]}
      </div>

      {/* Content */}
      <div className="space-y-2 flex-1">
        <h3 className="text-lg font-bold leading-snug">{service.title}</h3>
        <p className="text-sm opacity-65 leading-relaxed">{service.description}</p>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
function EmptyServices({ companyId }) {
  return (
    <div className="text-center bg-current bg-opacity-[0.03] rounded-3xl py-20 border border-current border-opacity-10 border-dashed max-w-2xl mx-auto space-y-4">
      <div className="text-5xl opacity-30">📭</div>
      <h3 className="text-xl font-bold opacity-60">لا توجد خدمات مضافة بعد</h3>
      <p className="text-sm opacity-45 max-w-sm mx-auto leading-relaxed">
        لم تقم الشركة بإضافة الخدمات التي تقدمها حتى الآن. يمكنك التواصل معها مباشرة للاستفسار.
      </p>
      <Link
        href={`/company/${companyId}/contact`}
        className="inline-block mt-4 text-sm font-bold underline opacity-60 hover:opacity-100 transition-opacity"
      >
        تواصل مع الشركة
      </Link>
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────
const DEFAULT_ICONS = ["🤝", "📊", "🏢", "🚀", "⚖️", "🎨", "🔑", "📋", "💼", "🌟"];

const PROCESS_STEPS = [
  { title: "التواصل الأولي", desc: "أخبرنا بما تحتاجه وسنستمع باهتمام." },
  { title: "تحليل الاحتياج", desc: "نُقيّم وضعك ونقترح الحل الأنسب." },
  { title: "تنفيذ الخدمة", desc: "فريقنا يعمل بكفاءة واحترافية." },
  { title: "متابعة ما بعد الخدمة", desc: "لا نتركك بعد الانتهاء، نبقى معك." },
];