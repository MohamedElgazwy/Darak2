"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { companyService, userService } from "@/app/services";

export default function CompanyAboutPage() {
  const params = useParams();
  const companyId = params?.companyId;

  const [loading, setLoading] = useState(true);
  const [aboutData, setAboutData] = useState(null);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAbout = async () => {
      if (!companyId) return;
      setLoading(true);
      setError(null);

      try {
        const profileRes = await userService.getProfile(companyId).catch(() => null);
        const companyInfo = profileRes?.data || profileRes;
        setCompany(companyInfo);

        const aboutRes = await companyService.getCompanyAbout(companyId);
        const aboutInfo = aboutRes?.data || aboutRes?.value || aboutRes;

        if (aboutInfo && (aboutInfo.description || aboutInfo.vision || aboutInfo.mission)) {
          setAboutData(aboutInfo);
        } else {
          setAboutData(null);
        }
      } catch (err) {
        console.error("Failed to load company about:", err);
        if (err?.response?.status === 404) {
          setAboutData(null);
        } else {
          setError("تعذّر تحميل بيانات الشركة.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-400 border-t-transparent opacity-60" />
          <p className="text-sm font-medium opacity-60">جاري تحميل بيانات الشركة...</p>
        </div>
      </div>
    );
  }

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

  if (!aboutData) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <div className="text-5xl opacity-30">📋</div>
        <h3 className="text-xl font-bold opacity-60">لم تُضف هذه الشركة بياناتها التعريفية بعد.</h3>
        <p className="text-sm opacity-50">يرجى التواصل مباشرة مع الشركة للاستفسار.</p>
      </div>
    );
  }

  const companyName =
    company?.companyName ||
    `${company?.firstName || ""} ${company?.lastName || ""}`.trim() ||
    "الشركة";

  return (
    <div className="space-y-20 pb-20" dir="rtl">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-500/10 border border-slate-500/20 p-10 md:p-16">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-slate-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-500/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-500/20 border border-slate-500/30 shadow-sm overflow-hidden">
            {company?.logo ? (
              <img
                src={
                  company.logo.startsWith("data:")
                    ? company.logo
                    : `data:image/jpeg;base64,${company.logo}`
                }
                alt={companyName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl font-black opacity-70">
                {companyName.charAt(0)}
              </span>
            )}
          </div>

          <div>
            <p className="text-sm font-bold opacity-60 mb-2 tracking-widest uppercase">
              من نحن
            </p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {companyName}
            </h1>
          </div>

          <div className="w-16 h-1 bg-slate-500/30 mx-auto rounded-full" />

          {aboutData.description && (
            <p className="text-lg md:text-xl opacity-80 leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
              {aboutData.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto text-center">
        {[
          { num: "10+", label: "سنوات خبرة" },
          { num: "500+", label: "عميل راضٍ" },
          { num: "100+", label: "وحدة مباعة" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-slate-500/10 border border-slate-500/20 rounded-2xl py-6 px-4"
          >
            <div className="text-3xl font-black mb-1">{s.num}</div>
            <div className="text-xs font-bold opacity-60">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Vision & Mission ── */}
      {(aboutData.vision || aboutData.mission) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {aboutData.vision && (
            <VisionMissionCard
              icon="👁️"
              title="رؤيتنا المستقبلية"
              text={aboutData.vision}
            />
          )}
          {aboutData.mission && (
            <VisionMissionCard
              icon="🎯"
              title="رسالتنا والتزامنا"
              text={aboutData.mission}
            />
          )}
        </div>
      )}

      {/* ── Why us ── */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-center">لماذا تختارنا؟</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: "🤝", title: "شفافية تامة", desc: "نؤمن بالوضوح في كل خطوة، من التسعير حتى التوثيق والتسليم." },
            { icon: "🏆", title: "خبرة موثوقة", desc: "فريقنا من الخبراء يضمن لك أفضل الخيارات الاستثمارية بأقل مخاطرة." },
            { icon: "⚡", title: "استجابة فورية", desc: "نرد على استفساراتك في أسرع وقت ممكن لأننا نعرف قيمة وقتك." },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-slate-500/10 border border-slate-500/20 rounded-2xl p-6 hover:bg-slate-500/20 transition-colors"
            >
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-base mb-2">{item.title}</h3>
              <p className="text-sm opacity-80 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="text-center pt-8 border-t border-slate-500/20">
        <h3 className="text-2xl font-bold mb-3">جاهز لبدء رحلتك العقارية؟</h3>
        <p className="opacity-70 mb-8 text-sm max-w-md mx-auto leading-relaxed">
          فريقنا متاح للإجابة على جميع استفساراتك وتقديم أفضل الاستشارات المجانية.
        </p>
        <Link
          href={`/company/${companyId}/contact`}
          className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
        >
          تواصل معنا الآن
        </Link>
      </div>
    </div>
  );
}

function VisionMissionCard({ icon, title, text }) {
  return (
    <div className="bg-slate-500/10 p-8 rounded-[2rem] border border-slate-500/20 hover:bg-slate-500/20 transition-colors space-y-4">
      <div className="w-14 h-14 bg-slate-500/20 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="opacity-80 leading-relaxed text-sm whitespace-pre-line">{text}</p>
    </div>
  );
}