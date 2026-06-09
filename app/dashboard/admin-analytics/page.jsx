"use client";

import { ProtectedRoute } from "@/app/lib/guards";


export default function AdminDashboardAnalytics() {
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto space-y-8 pb-16 text-right" dir="rtl">
        
        {/* ── 1. رأس الصفحة ── */}
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            📊 لوحة الإحصائيات التفاعلية (Power BI)
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            نظرة عامة على أداء المنصة، الاشتراكات، وتفاعل المستخدمين.
          </p>
        </div>

        {/* ── 2. حاوية Power BI (Iframe Wrapper) ── */}
        <div className="bg-white p-2 md:p-4 rounded-3xl border border-slate-200 shadow-sm">
          {/* استخدمنا h-[700px] أو ما شابه لضمان ارتفاع مناسب للوحة، 
            و w-full لتأخذ عرض الشاشة بالكامل وتكون متجاوبة (Responsive).
          */}
          <div className="relative w-full h-[600px] md:h-[700px] rounded-2xl overflow-hidden bg-slate-50">
            <iframe
              title="The Project"
              className="absolute top-0 left-0 w-full h-full"
              src="https://app.powerbi.com/reportEmbed?reportId=9a81aab7-73f6-4c17-a51d-9fc59d9f3b7a&autoAuth=true&ctid=dee1ed73-19ca-4ce0-8066-8261fbabbeaa"
              frameBorder={0}
              allowFullScreen={true}
            ></iframe>
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}