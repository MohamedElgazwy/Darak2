"use client";

import { api } from "@/app/services";
import { useEffect, useState } from "react";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.get("/Templates/List");
        setTemplates(res?.data || res || []);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <div className="container-shell section-padding">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">القوالب المتاحة</h1>
        <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
          تصفح القوالب والاشتراكات التي نقدمها لتعزيز إعلاناتك والوصول إلى عدد أكبر من العملاء.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 surface-card border-dashed">
          <p className="text-slate-500">لا توجد قوالب متاحة في الوقت الحالي.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <div key={template.id || template.name} className="surface-card p-6 flex flex-col hover:shadow-md transition">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{template.name || "قالب إعلان"}</h3>
              <p className="text-slate-600 flex-1 mb-6 text-sm leading-relaxed">
                {template.description || "وصف القالب غير متوفر حالياً. تواصل معنا لمعرفة المزيد."}
              </p>
              <div className="border-t border-slate-100 pt-4 mt-auto">
                <button className="btn-primary w-full text-sm py-2.5">
                  اختيار القالب
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}