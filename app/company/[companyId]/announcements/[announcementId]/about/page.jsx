"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CompanyAboutPage() {
  const params = useParams();
  const companyId = params?.companyId;

  const [loading, setLoading] = useState(true);
  const [aboutData, setAboutData] = useState(null);

  useEffect(() => {
    // 💡 محاكاة جلب بيانات "عن الشركة" من الباك إند
    // في الواقع ستستخدم: api.get(`/CompanyAbouts/Company/${companyId}`) أو ما شابه
    setTimeout(() => {
      setAboutData({
        description: "نحن شركة رائدة في مجال الاستثمار والتسويق العقاري، تأسسنا بهدف تغيير مفهوم الخدمات العقارية في السوق. نجمع بين الخبرة العميقة والابتكار لنقدم لعملائنا أفضل الفرص السكنية والتجارية. فريقنا من الخبراء يعمل بشغف واحترافية لضمان تجربة سلسة وشفافة من لحظة البحث وحتى استلام المفتاح. نؤمن بأن العقار ليس مجرد جدران، بل هو استثمار للمستقبل ومكان لصنع الذكريات.",
        vision: "أن نكون الخيار الأول والأكثر ثقة في السوق العقاري، من خلال تقديم معايير عالمية في جودة الخدمة، والاعتماد على التكنولوجيا لتسهيل رحلة العميل في البحث عن عقار أحلامه.",
        mission: "مهمتنا هي تمكين عملائنا من اتخاذ قرارات عقارية ذكية ومدروسة. نقدم استشارات نزيهة، وحلولاً مبتكرة، وخدمة عملاء استثنائية تبني علاقات طويلة الأمد مبنية على الثقة المتبادلة والشفافية التامة."
      });
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

  if (!aboutData) {
    return <div className="text-center py-20 opacity-70">لم تقم الشركة بإضافة تفاصيل بعد.</div>;
  }

  return (
    <div className="space-y-16 pb-16">
      
      {/* ── 1. قسم العنوان (Header) ── */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm">
          من نحن
        </h1>
        <div className="w-24 h-1.5 bg-current opacity-20 mx-auto rounded-full"></div>
        <p className="opacity-70 text-lg md:text-xl leading-relaxed">
          تعرف على قصتنا، قيمنا، والدافع الذي يجعلنا شركاءك الأفضل في رحلتك العقارية.
        </p>
      </div>

      {/* ── 2. قسم الوصف الرئيسي (Main Description) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">قصتنا وتاريخنا</h2>
          <p className="opacity-80 leading-relaxed text-lg text-justify">
            {aboutData.description}
          </p>
          
          {/* إحصائيات سريعة للثقة (Social Proof) */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-current border-opacity-10 mt-6 text-center">
            <div>
              <div className="text-3xl font-black mb-1">10+</div>
              <div className="text-sm opacity-60 font-bold">سنوات خبرة</div>
            </div>
            <div>
              <div className="text-3xl font-black mb-1">5K+</div>
              <div className="text-sm opacity-60 font-bold">عميل سعيد</div>
            </div>
            <div>
              <div className="text-3xl font-black mb-1">200+</div>
              <div className="text-sm opacity-60 font-bold">مشروع حصري</div>
            </div>
          </div>
        </div>

        {/* صورة تعبيرية للمكتب أو الفريق */}
        <div className="relative h-[400px] lg:h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-current border-opacity-10 group">
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop" 
            alt="مكتب الشركة" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>
        </div>
      </div>

      {/* ── 3. قسم الرؤية والرسالة (Vision & Mission) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
        
        {/* الرؤية */}
        <div className="bg-current bg-opacity-5 p-10 rounded-[2.5rem] border border-current border-opacity-10 hover:border-opacity-30 transition-colors">
          <div className="w-16 h-16 bg-current bg-opacity-10 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">
            👁️
          </div>
          <h3 className="text-2xl font-bold mb-4">رؤيتنا المستقبلية</h3>
          <p className="opacity-80 leading-relaxed text-lg">
            {aboutData.vision}
          </p>
        </div>

        {/* الرسالة */}
        <div className="bg-current bg-opacity-5 p-10 rounded-[2.5rem] border border-current border-opacity-10 hover:border-opacity-30 transition-colors">
          <div className="w-16 h-16 bg-current bg-opacity-10 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">
            🎯
          </div>
          <h3 className="text-2xl font-bold mb-4">رسالتنا والتزامنا</h3>
          <p className="opacity-80 leading-relaxed text-lg">
            {aboutData.mission}
          </p>
        </div>

      </div>

      {/* ── 4. دعوة لاتخاذ إجراء (Call to Action) ── */}
      <div className="text-center mt-16 pt-12 border-t border-current border-opacity-10">
        <h3 className="text-2xl font-bold mb-4">جاهز للبدء في رحلتك العقارية؟</h3>
        <p className="opacity-70 mb-8 max-w-xl mx-auto">
          فريقنا هنا للإجابة على جميع استفساراتك وتقديم أفضل الاستشارات المجانية لك.
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