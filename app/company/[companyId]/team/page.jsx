"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useCompanyTheme } from "@/app/context/CompanyThemeContext";

export default function CompanyTeamPage() {
  const params = useParams();
  const companyId = params?.companyId;
  const { storeData } = useCompanyTheme(); // 👈 جلب الألوان الديناميكية للقالب

  // إذا كانت الألوان لم تحمل بعد
  if (!storeData) return <div className="min-h-[60vh]"></div>;
  const theme = storeData.themeStyles; // 👈 سحب قاموس الألوان

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-12 min-h-[70vh] flex flex-col items-center justify-center" dir="rtl">
      
      {/* ── أيقونة متحركة وتأثير إضاءة (Glowing Effect) ── */}
      <div className="relative">
        <div className={`absolute inset-0 blur-3xl opacity-30 animate-pulse ${theme.accentBg}`}></div>
        <div className={`relative w-28 h-28 mx-auto rounded-full flex items-center justify-center text-5xl shadow-xl border-4 ${theme.card} ${theme.divider} z-10`}>
          🚀
        </div>
      </div>

      {/* ── النصوص التوضيحية ── */}
      <div className="space-y-5 relative z-10">
        <span className={`inline-block px-5 py-2 rounded-full text-xs font-black tracking-widest shadow-sm ${theme.accentBg}`}>
          قريباً جداً (COMING SOON)
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          صفحة فريق العمل
        </h1>
        <p className={`text-lg max-w-lg mx-auto leading-relaxed font-medium ${theme.mutedText}`}>
          نعمل حالياً على تطوير هذه المساحة لتمكين الشركات من استعراض وكلائها والخبراء العقاريين بطريقة احترافية وتفاعلية.
        </p>
      </div>

      {/* ── صندوق التشويق (Teaser Box) ── */}
      <div className={`p-8 md:p-10 rounded-[2.5rem] border-2 border-dashed shadow-sm w-full max-w-2xl mx-auto text-right ${theme.card} ${theme.divider}`}>
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <span>✨</span> ماذا تتوقع في هذا التحديث؟
        </h3>
        <ul className={`space-y-4 text-sm font-medium ${theme.mutedText}`}>
          <li className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${theme.accentBg}`}></div>
            ملف تعريفي (Profile) مخصص لكل وكيل ومستشار عقاري.
          </li>
          <li className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${theme.accentBg}`}></div>
            عرض إحصائيات المبيعات وتقييمات العملاء لكل فرد في الفريق.
          </li>
          <li className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${theme.accentBg}`}></div>
            أزرار تواصل مباشر وسريع (واتساب / إيميل) مع الوكيل المختص.
          </li>
        </ul>
      </div>

      {/* ── زر العودة ── */}
      <Link 
        href={`/company/${companyId}`}
        className={`inline-flex items-center justify-center px-10 py-4 rounded-xl font-bold text-lg transition-transform hover:-translate-y-1 shadow-lg ${theme.accentBg}`}
      >
        العودة للصفحة الرئيسية
      </Link>
      
    </div>
  );
}