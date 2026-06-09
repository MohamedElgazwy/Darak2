"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { companyAboutService, userService } from "@/app/services";

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
        // 1. Fetch company profile for name/logo display
        const profileRes = await userService.getProfile(companyId);
        const companyInfo = profileRes?.data || profileRes;
        setCompany(companyInfo);

        // 2. Fetch ALL company abouts — no filter endpoint exists in the API
        //    so we fetch the full list and match by companyId / userId
        const aboutRes = await companyAboutService.getList();
        const aboutList = Array.isArray(aboutRes?.data)
          ? aboutRes.data
          : Array.isArray(aboutRes)
          ? aboutRes
          : [];

        const matched = aboutList.find(
          (item) =>
            String(item.companyId) === String(companyId) ||
            String(item.userId) === String(companyId)
        );

        setAboutData(matched || null);
      } catch (err) {
        console.error("Failed to load company about:", err);
        setError("تعذّر تحميل بيانات الشركة.");
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, [companyId]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent opacity-40" />
          <p className="text-sm font-medium opacity-60">جاري تحميل بيانات الشركة...</p>
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

  // ── No data ──
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
      <div className="relative overflow-hidden rounded-[2.5rem] bg-current bg-opacity-5 border border-current border-opacity-10 p-10 md:p-16">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-current opacity-[0.04] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-current opacity-[0.04] blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          {/* Company logo / initials */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-current bg-opacity-10 border border-current border-opacity-20 shadow-sm overflow-hidden">
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
            <p className="text-sm font-bold opacity-50 mb-2 tracking-widest uppercase">
              من نحن
            </p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {companyName}
            </h1>
          </div>

          <div className="w-16 h-1 bg-current opacity-20 mx-auto rounded-full" />

          <p className="text-lg md:text-xl opacity-70 leading-relaxed max-w-2xl mx-auto">
            {aboutData.description}
          </p>
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
            className="bg-current bg-opacity-5 border border-current border-opacity-10 rounded-2xl py-6 px-4"
          >
            <div className="text-3xl font-black mb-1">{s.num}</div>
            <div className="text-xs font-bold opacity-50">{s.label}</div>
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
              className="bg-current bg-opacity-5 border border-current border-opacity-10 rounded-2xl p-6 hover:border-opacity-25 transition-colors"
            >
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-base mb-2">{item.title}</h3>
              <p className="text-sm opacity-70 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="text-center pt-8 border-t border-current border-opacity-10">
        <h3 className="text-2xl font-bold mb-3">جاهز لبدء رحلتك العقارية؟</h3>
        <p className="opacity-60 mb-8 text-sm max-w-md mx-auto leading-relaxed">
          فريقنا متاح للإجابة على جميع استفساراتك وتقديم أفضل الاستشارات المجانية.
        </p>
        <Link
          href={`/company/${companyId}/contact`}
          className="inline-block bg-current text-white dark:text-slate-900 invert dark:invert-0 px-10 py-4 rounded-xl font-bold hover:opacity-80 transition-opacity shadow-lg"
        >
          تواصل معنا الآن
        </Link>
      </div>
    </div>
  );
}

function VisionMissionCard({ icon, title, text }) {
  return (
    <div className="bg-current bg-opacity-5 p-8 rounded-[2rem] border border-current border-opacity-10 hover:border-opacity-25 transition-colors space-y-4">
      <div className="w-14 h-14 bg-current bg-opacity-10 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="opacity-75 leading-relaxed text-sm">{text}</p>
    </div>
  );
}