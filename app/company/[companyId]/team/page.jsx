"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { companyTeamService } from "@/app/services/company-team.service";

export default function CompanyTeamPage() {
  const params = useParams();
  const companyId = params?.companyId;

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;

    const fetchTeam = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await companyTeamService.getByCompany(companyId);
        if (cancelled) return;
        const data = res?.data ?? res ?? [];
        setTeam(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load company team:", err);
        setError("حدث خطأ أثناء جلب بيانات فريق العمل.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTeam();

    return () => { cancelled = true; };
  }, [companyId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-4 p-6 bg-current bg-opacity-5 rounded-[2.5rem] border border-current border-opacity-5 h-96" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 font-bold mb-4">{error}</div>
        <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-xl bg-indigo-600 text-white">أعد المحاولة</button>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm">فريق العمل</h1>
        <div className="w-24 h-1.5 bg-current opacity-20 mx-auto rounded-full" />
        <p className="opacity-70 text-lg md:text-xl leading-relaxed">وراء كل عقار متميز واستثمار ناجح، فريق من الخبراء يعمل بشغف واحترافية لتلبية طموحاتك. تعرف على وكلائنا.</p>
      </div>

      {team && team.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member) => (
            <div key={member.id || member.Id} className="group bg-current bg-opacity-5 rounded-[2.5rem] border border-current border-opacity-10 overflow-hidden hover:border-opacity-30 hover:-translate-y-2 transition-all duration-300 flex flex-col">
              <div className="relative h-72 overflow-hidden bg-current bg-opacity-10">
                <img
                  src={member.image || member.Image || member.avatar || member.photo}
                  alt={member.name || member.Name || "عضو الفريق"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out grayscale group-hover:grayscale-0"
                  onError={(e) => { e.target.src = "/images/avatar-placeholder.png"; }}
                />
              </div>
              <div className="p-6 flex flex-col flex-1 text-center">
                <h3 className="text-xl font-bold mb-1">{member.name || member.Name}</h3>
                <p className="text-sm font-bold opacity-60 mb-4">{member.role || member.Role}</p>
                <p className="opacity-80 text-sm leading-relaxed mb-6 flex-1">{member.bio || member.Bio || member.description}</p>
                <a href={`mailto:${member.email || member.Email || ''}`} className="inline-block w-full py-2.5 rounded-xl text-sm font-bold border border-current border-opacity-20 hover:bg-current hover:text-white dark:hover:text-slate-900 transition-colors">تواصل معي ✉️</a>
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

      <div className="mt-16 bg-current bg-opacity-5 rounded-[3rem] border border-current border-opacity-10 p-10 md:p-12 text-center max-w-4xl mx-auto">
        <h3 className="text-3xl font-black mb-4">تود الانضمام إلينا؟</h3>
        <p className="opacity-70 text-lg mb-8 max-w-xl mx-auto">نحن نبحث دائماً عن المواهب العقارية المتميزة. إذا كنت تملك الشغف والخبرة، يسعدنا أن تكون جزءاً من عائلتنا.</p>
        <Link href={`/company/${companyId}/contact`} className="inline-block bg-current text-white dark:text-slate-900 invert dark:invert-0 px-10 py-3.5 rounded-xl font-bold hover:opacity-80 transition-opacity shadow-lg">أرسل سيرتك الذاتية</Link>
      </div>
    </div>
  );
}