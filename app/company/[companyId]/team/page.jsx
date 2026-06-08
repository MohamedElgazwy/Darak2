"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CompanyTeamPage() {
  const params = useParams();
  const companyId = params?.companyId;

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    // 💡 محاكاة جلب بيانات أعضاء الفريق من الباك إند
    setTimeout(() => {
      setTeam([
        {
          id: 1,
          name: "أحمد عبد الرحمن",
          role: "المدير التنفيذي (CEO)",
          bio: "خبرة تزيد عن 15 عاماً في السوق العقاري، يقود رؤية الشركة نحو التوسع وتقديم أفضل قيمة استثمارية للعملاء.",
          image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop",
          email: "ahmed@company.com"
        },
        {
          id: 2,
          name: "سارة النجار",
          role: "مديرة المبيعات",
          bio: "خبيرة في استراتيجيات البيع والتفاوض. تضمن سارة حصول عملائنا على أفضل الصفقات العقارية المتاحة.",
          image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
          email: "sara@company.com"
        },
        {
          id: 3,
          name: "عمر فاروق",
          role: "مستشار عقاري أول",
          bio: "متخصص في العقارات الفاخرة والمشاريع الساحلية. دليلك الموثوق لاختيار منزل أحلامك.",
          image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
          email: "omar@company.com"
        },
        {
          id: 4,
          name: "نورهان طارق",
          role: "مستشارة قانونية",
          bio: "تضمن نورهان سلامة كافة العقود والإجراءات القانونية لتوفير بيئة استثمارية آمنة وخالية من المخاطر.",
          image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop",
          email: "nourhan@company.com"
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
          فريق العمل
        </h1>
        <div className="w-24 h-1.5 bg-current opacity-20 mx-auto rounded-full"></div>
        <p className="opacity-70 text-lg md:text-xl leading-relaxed">
          وراء كل عقار متميز واستثمار ناجح، فريق من الخبراء يعمل بشغف واحترافية لتلبية طموحاتك. تعرف على وكلائنا.
        </p>
      </div>

      {/* ── 2. شبكة أعضاء الفريق (Team Grid) ── */}
      {team.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member) => (
            <div 
              key={member.id} 
              className="group bg-current bg-opacity-5 rounded-[2.5rem] border border-current border-opacity-10 overflow-hidden hover:border-opacity-30 hover:-translate-y-2 transition-all duration-300 flex flex-col"
            >
              {/* صورة العضو */}
              <div className="relative h-72 overflow-hidden bg-current bg-opacity-10">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out grayscale group-hover:grayscale-0"
                />
              </div>
              
              {/* بيانات العضو */}
              <div className="p-6 flex flex-col flex-1 text-center">
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-sm font-bold opacity-60 mb-4">{member.role}</p>
                <p className="opacity-80 text-sm leading-relaxed mb-6 flex-1">
                  {member.bio}
                </p>
                
                {/* زر التواصل */}
                <a 
                  href={`mailto:${member.email}`}
                  className="inline-block w-full py-2.5 rounded-xl text-sm font-bold border border-current border-opacity-20 hover:bg-current hover:text-white dark:hover:text-slate-900 transition-colors"
                >
                  تواصل معي ✉️
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center bg-current bg-opacity-5 rounded-3xl py-16 border border-current border-opacity-10 border-dashed max-w-2xl mx-auto">
          <div className="text-5xl mb-4 opacity-50">👥</div>
          <h3 className="text-xl font-bold mb-2">جاري تحديث بيانات الفريق</h3>
          <p className="opacity-70">لم تقم الشركة بإضافة أعضاء فريق العمل حتى الآن.</p>
        </div>
      )}

      {/* ── 3. دعوة للتوظيف أو التواصل (Call to Action) ── */}
      <div className="mt-16 bg-current bg-opacity-5 rounded-[3rem] border border-current border-opacity-10 p-10 md:p-12 text-center max-w-4xl mx-auto">
        <h3 className="text-3xl font-black mb-4">تود الانضمام إلينا؟</h3>
        <p className="opacity-70 text-lg mb-8 max-w-xl mx-auto">
          نحن نبحث دائماً عن المواهب العقارية المتميزة. إذا كنت تملك الشغف والخبرة، يسعدنا أن تكون جزءاً من عائلتنا.
        </p>
        <Link 
          href={`/company/${companyId}/contact`}
          className="inline-block bg-current text-white dark:text-slate-900 invert dark:invert-0 px-10 py-3.5 rounded-xl font-bold hover:opacity-80 transition-opacity shadow-lg"
        >
          أرسل سيرتك الذاتية
        </Link>
      </div>

    </div>
  );
}