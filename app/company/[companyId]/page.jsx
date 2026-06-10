"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/app/services/api";

export default function CompanyStorefront() {
  const { id } = useParams();
  const router = useRouter();
  
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const res = await api.get(`/Users/${id}/profile`);
        const data = res?.data?.data || res?.data || res;
        setCompany(data);
      } catch (err) {
        console.error("Error fetching company profile:", err);
        setError("تعذر تحميل الصفحة الشخصية لهذه الشركة. قد يكون الرابط غير صحيح أو تم إغلاق الحساب.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCompanyProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm"></div>
          <p className="text-sm font-bold text-slate-500 animate-pulse">جاري تحضير المعرض العقاري للشركة...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center" dir="rtl">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm max-w-lg border border-slate-200">
          <div className="text-6xl mb-4 opacity-50">🏢</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">عفواً، المتجر غير متاح!</h2>
          <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
            {error || "لم يتم العثور على بيانات لهذه الشركة. يرجى التحقق من الرابط والمحاولة لاحقاً."}
          </p>
          <button onClick={() => router.push('/')} className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95">
            العودة للمنصة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  // ─── إعداد متغيرات الـ Theme بناءً على الـ TemplateId الخاص بالشركة ───
  const tplId = company.templateId || 1;
  let themeConfig = {
    bgApp: "bg-[#f8fafc]",
    heroGradient: "bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950",
    textHeroTitle: "text-white",
    textHeroSub: "text-indigo-200",
    cardBg: "bg-white",
    cardBorder: "border-slate-200/60 hover:border-indigo-300",
    cardTextTitle: "text-slate-900",
    cardTextPrice: "text-indigo-600",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-100",
    btnPrimary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20",
  };

  if (tplId === 2) {
    // Classic Luxury Theme
    themeConfig = {
      bgApp: "bg-[#F4EFE6]",
      heroGradient: "bg-gradient-to-b from-[#5A4634] to-[#3B2F2F]",
      textHeroTitle: "text-[#EADDCD]",
      textHeroSub: "text-[#D5C6B5]",
      cardBg: "bg-[#FFFDF8]",
      cardBorder: "border-[#E6DFD3] hover:border-[#5A4634]",
      cardTextTitle: "text-[#3B2F2F]",
      cardTextPrice: "text-[#8C7A6B]",
      badgeBg: "bg-[#EADDCD] text-[#5A4634] border-[#D5C6B5]",
      btnPrimary: "bg-[#5A4634] text-white hover:bg-[#3B2F2F] shadow-[#5A4634]/20",
    };
  } else if (tplId === 3) {
    // Dark Modern Theme
    themeConfig = {
      bgApp: "bg-[#050505]",
      heroGradient: "bg-[#111111]",
      textHeroTitle: "text-[#D4AF37]",
      textHeroSub: "text-slate-400",
      cardBg: "bg-[#1A1A1A]",
      cardBorder: "border-[#333333] hover:border-[#D4AF37]",
      cardTextTitle: "text-white",
      cardTextPrice: "text-[#D4AF37]",
      badgeBg: "bg-[#222222] text-[#D4AF37] border-[#333333]",
      btnPrimary: "bg-[#D4AF37] text-[#111111] hover:bg-[#c29e2f] shadow-[#D4AF37]/10",
    };
  }

  // معالجة اللوجو
  const logoUrl = company.logo
    ? (company.logo.startsWith("data:") || company.logo.startsWith("http") ? company.logo : `data:image/jpeg;base64,${company.logo}`)
    : "https://placehold.co/400x400?text=Logo";

  // دالة ذكية لمعالجة مسار صور العقارات
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/600x400?text=Darak+Property";
    if (imagePath.startsWith("http") || imagePath.startsWith("data:")) return imagePath;
    if (imagePath.startsWith("/")) return `https://darak.runasp.net${imagePath}`;
    return `https://darak.runasp.net/${imagePath}`;
  };

  return (
    <div className={`min-h-screen relative pb-24 ${themeConfig.bgApp}`} dir="rtl">
      
      {/* ─── زر العودة السريع العائم (Floating Action Button) ─── */}
      <button 
        onClick={() => router.push('/')}
        className="fixed bottom-8 left-8 z-50 flex items-center justify-center gap-2 bg-slate-900/90 backdrop-blur-md hover:bg-black text-white px-5 py-3.5 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 group border border-slate-700/50"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform">🔙</span>
        <span className="text-xs font-black tracking-wide hidden sm:block">العودة لمنصة دارك</span>
      </button>

      {/* ─── 1. قسم البانر الفاخر (Hero Section) ─── */}
      <section className={`relative pt-24 pb-32 px-4 sm:px-6 lg:px-8 text-center ${themeConfig.heroGradient} overflow-hidden rounded-b-[4rem] shadow-xl`}>
        {/* مؤثرات خلفية ناعمة */}
        {tplId !== 3 && tplId !== 2 && (
          <>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/5 rounded-full filter blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-[100px] pointer-events-none"></div>
          </>
        )}
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white p-1.5 rounded-full shadow-2xl mb-6 relative group overflow-hidden border-4 border-white/20">
            <img src={logoUrl} alt={company.companyName} className="w-full h-full object-cover rounded-full" />
            {company.averageRating > 0 && (
              <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm text-amber-400 text-[10px] font-black py-1.5 text-center flex items-center justify-center gap-1">
                ⭐ {company.averageRating.toFixed(1)}
              </div>
            )}
          </div>
          
          <h1 className={`text-4xl md:text-5xl font-black tracking-tight mb-4 ${themeConfig.textHeroTitle}`}>
            {company.companyName || `${company.firstName} ${company.lastName}`}
          </h1>
          <p className={`text-sm md:text-base font-semibold max-w-2xl mx-auto leading-relaxed ${themeConfig.textHeroSub}`}>
            {company.email}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 text-white flex items-center gap-3 shadow-inner">
              <span className="text-xl">🏘️</span>
              <div className="text-right">
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">حجم المحفظة</p>
                <p className="text-lg font-black">{company.announcementResponses?.length || 0} عقار</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 text-white flex items-center gap-3 shadow-inner">
              <span className="text-xl">💬</span>
              <div className="text-right">
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">تجارب العملاء</p>
                <p className="text-lg font-black">{company.totalReviews || 0} تقييم</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. كشاف الوحدات والعقارات ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className={`p-6 md:p-10 rounded-[3rem] shadow-2xl border ${themeConfig.cardBg} ${themeConfig.cardBorder}`}>
          
          <div className="mb-10 text-center">
            <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${themeConfig.cardTextTitle}`}>
              المحفظة العقارية الحصرية للشركة
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-2">تصفح أحدث الوحدات المدرجة والمدارة من قبل فريق الوكالة مباشرة.</p>
          </div>

          {company.announcementResponses && company.announcementResponses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {company.announcementResponses.map((item) => {
                const purposeText = item.purpose === "Sale" || item.purpose === "للبيع" ? "للبيع" : 
                                  item.purpose === "Rent" || item.purpose === "للإيجار" ? "للإيجار" : null;

                return (
                  <div key={item.id} className={`group flex flex-col rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-2xl ${themeConfig.cardBg} ${themeConfig.cardBorder}`}>
                    
                    {/* الصورة والشارات */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                      <img 
                        src={getImageUrl(item.primaryImage)} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.src = "https://placehold.co/600x400?text=No+Image"; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                      
                      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                        {purposeText && (
                          <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm border ${themeConfig.badgeBg}`}>
                            {purposeText}
                          </span>
                        )}
                      </div>

                      {item.isFeatured && (
                        <div className="absolute top-4 left-4">
                          <span className="flex items-center gap-1 rounded-xl bg-amber-500/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-white shadow-sm border border-white/20">
                            ⭐ مميز
                          </span>
                        </div>
                      )}
                    </div>

                    {/* تفاصيل العقار */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="mb-2">
                        <span className={`text-2xl font-black tracking-tight ${themeConfig.cardTextPrice}`}>
                          {item.price?.toLocaleString("ar-EG")}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 ml-1">ج.م</span>
                      </div>

                      <h3 className={`text-lg font-black line-clamp-1 mb-3 ${themeConfig.cardTextTitle}`}>
                        {item.title}
                      </h3>

                      <div className="flex items-start gap-1.5 text-xs font-bold text-slate-500 mb-6">
                        <span className="mt-0.5 text-slate-400">📍</span>
                        <span className="line-clamp-2 leading-relaxed">{item.city}، {item.address}</span>
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100/50">
                        <Link 
                          href={`/announcement/${item.id}`} 
                          className={`flex items-center justify-center w-full py-3.5 rounded-xl text-sm font-black transition-all duration-300 shadow-md transform active:scale-95 ${themeConfig.btnPrimary}`}
                        >
                          معاينة التفاصيل الكاملة
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
              <div className="text-6xl mb-4 opacity-30">📭</div>
              <h3 className={`text-xl font-black ${themeConfig.cardTextTitle}`}>المحفظة العقارية فارغة</h3>
              <p className="text-sm font-semibold text-slate-400 mt-2 max-w-sm">لم تقم الشركة بإدراج أي وحدات عقارية للجمهور حتى الآن، يرجى العودة لاحقاً.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}