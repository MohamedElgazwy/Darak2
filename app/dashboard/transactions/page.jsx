"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { ProtectedRoute } from "@/app/lib/guards";

export default function TransactionsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("purchases"); // purchases | rentals

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المعاملات السابقة</h1>
          <p className="mt-1 text-sm text-slate-500">
            تتبع العقارات التي قمت بطلب شرائها أو استئجارها عبر منصة دارك.
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("purchases")}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "purchases"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            طلبات الشراء
          </button>
          <button
            onClick={() => setActiveTab("rentals")}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "rentals"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            طلبات الإيجار
          </button>
        </div>

        {/* ── Empty State (لأن الـ API غير جاهز بعد) ── */}
        <div className="surface-card flex flex-col items-center justify-center py-20 px-4 text-center border-dashed border-2">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            لا توجد {activeTab === "purchases" ? "طلبات شراء" : "طلبات إيجار"} مسجلة
          </h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            لم تقم بإجراء أي معاملات {activeTab === "purchases" ? "شراء" : "إيجار"} حتى الآن. استكشف العقارات المتاحة وابدأ رحلتك.
          </p>
          <Link href="/search" className="btn-primary px-8">
            تصفح العقارات
          </Link>
        </div>

      </div>
    </ProtectedRoute>
  );
}