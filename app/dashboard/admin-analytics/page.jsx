"use client";

import { ProtectedRoute } from "@/app/lib/guards";

export default function AdminDashboardAnalytics() {
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto space-y-8 pb-16 text-right animate-in fade-in duration-300" dir="rtl">
        
        {/* ── 1. رأس الصفحة ── */}
        <div className="border-b border-slate-200/60 pb-5">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-lg shadow-inner">📊</span>
            لوحة الإحصائيات التفاعلية (Power BI)
          </h1>
          <p className="text-slate-400 text-sm font-semibold mt-2">
            نظرة عامة ومتقدمة على أداء المنصة، الاشتراكات، حركة السيولة، وتفاعل المستخدمين.
          </p>
        </div>

        {/* ── 2. حاوية Power BI (Iframe Wrapper) ── */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
          <div className="relative bg-white/90 backdrop-blur-md p-3 md:p-5 rounded-[2rem] border border-slate-200 shadow-xl">
            <div className="relative w-full h-[600px] md:h-[750px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
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

      </div>
    </ProtectedRoute>
  );
}