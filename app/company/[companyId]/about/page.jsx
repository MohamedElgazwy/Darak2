"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { companyService, userService } from "@/app/services"; // 👈 التعديل هنا: استخدام companyService

export default function CompanyAboutPage() {
  const params = useParams();
  const companyId = params?.companyId;

  const [loading, setLoading] = useState(true);
  const [aboutData, setAboutData] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) return;
      setLoading(true);

      try {
        // 1. جلب بيانات الملف الشخصي (الاسم واللوجو)
        const profileRes = await userService.getProfile(companyId).catch(() => null);
        const profile = profileRes?.data || profileRes;
        setCompanyProfile(profile);

        // 2. ⚡ جلب بيانات "من نحن" المخصصة باستخدام الـ Endpoint المباشرة
        const aboutRes = await companyService.getCompanyAbout(companyId);
        const aboutInfo = aboutRes?.data || aboutRes?.value || aboutRes;
        
        // التحقق من وجود بيانات فعلية مدخلة
        if (aboutInfo && (aboutInfo.description || aboutInfo.vision || aboutInfo.mission)) {
          setAboutData(aboutInfo);
        } else if (profile?.description) {
          // Fallback لاستخدام الوصف العام إذا لم توجد بيانات مخصصة في جدول About
          setAboutData({ description: profile.description, vision: "", mission: "" });
        } else {
          setAboutData(null);
        }

      } catch (err) {
        console.error("Failed to load company data:", err);
        setAboutData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent opacity-50"></div>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="text-center py-32 bg-current bg-opacity-5 rounded-3xl border border-current border-opacity-10 border-dashed max-w-4xl mx-auto">
        <div className="text-5xl mb-4 opacity-40">📋</div>
        <h3 className="text-xl font-bold mb-2">لم يتم إعداد الملف التعريفي</h3>
        <p className="opacity-70 text-sm max-w-md mx-auto">لم تقم هذه الشركة بكتابة النبذة التعريفية الخاصة بها حتى الآن. يرجى العودة لاحقاً.</p>
      </div>
    );
  }

  const displayName = companyProfile?.companyName || `${companyProfile?.firstName || ''} ${companyProfile?.lastName || ''}`.trim() || 'الشركة العقارية';

  return (
    <div className="space-y-16 pb-16">
      
      {/* ── 1. قسم العنوان (Header) ── */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm">
          قصتنا وهويتنا
        </h1>
        <div className="w-24 h-1.5 bg-current opacity-20 mx-auto rounded-full"></div>
        <p className="opacity-70 text-lg md:text-xl leading-relaxed">
          تعرف على قيمنا، الدافع وراء تميزنا، وكيف نصنع الفارق في رحلتك العقارية.
        </p>
      </div>

      {/* ── 2. قسم الوصف الرئيسي (Main Description) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 bg-current bg-opacity-10 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
              {companyProfile?.logo ? (
                <img 
                  src={companyProfile.logo.startsWith("data:") ? companyProfile.logo : `data:image/jpeg;base64,${companyProfile.logo}`} 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-bold opacity-80">{displayName.charAt(0)}</span>
              )}
            </div>
            عن {displayName}
          </h2>
          <p className="opacity-80 leading-relaxed text-lg text-justify whitespace-pre-line">
            {aboutData.description}
          </p>
        </div>

        {/* صورة جمالية تعبيرية */}
        <div className="relative h-[400px] lg:h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-current border-opacity-10 group bg-current bg-opacity-5">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop" 
            alt="مبنى الشركة" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>
        </div>
      </div>

      {/* ── 3. قسم الرؤية والرسالة (Vision & Mission) ── */}
      {(aboutData.vision || aboutData.mission) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-current border-opacity-10 mt-8">
          
          {aboutData.vision && (
            <div className="bg-current bg-opacity-5 p-10 rounded-[2.5rem] border border-current border-opacity-10 hover:border-opacity-30 transition-colors">
              <div className="w-16 h-16 bg-current bg-opacity-10 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">
                👁️
              </div>
              <h3 className="text-2xl font-bold mb-4">رؤيتنا الاستراتيجية</h3>
              <p className="opacity-80 leading-relaxed text-lg whitespace-pre-line">
                {aboutData.vision}
              </p>
            </div>
          )}

          {aboutData.mission && (
            <div className="bg-current bg-opacity-5 p-10 rounded-[2.5rem] border border-current border-opacity-10 hover:border-opacity-30 transition-colors">
              <div className="w-16 h-16 bg-current bg-opacity-10 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">
                🎯
              </div>
              <h3 className="text-2xl font-bold mb-4">رسالتنا وقيمنا</h3>
              <p className="opacity-80 leading-relaxed text-lg whitespace-pre-line">
                {aboutData.mission}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── 4. دعوة لاتخاذ إجراء (Call to Action) ── */}
      <div className="text-center mt-16 pt-12">
        <h3 className="text-2xl font-bold mb-4">نحن شركاؤك في النجاح</h3>
        <p className="opacity-70 mb-8 max-w-xl mx-auto">
          فريق العمل متاح لتقديم الدعم الكامل والإجابة على أي استفسارات تتعلق بالمشاريع والعقارات المعروضة.
        </p>
        <Link 
          href={`/company/${companyId}/contact`}
          className="inline-block bg-current text-white dark:text-slate-900 invert dark:invert-0 px-10 py-4 rounded-2xl font-bold hover:opacity-80 transition-opacity shadow-lg"
        >
          تواصل معنا الآن
        </Link>
      </div>

    </div>
  );
}