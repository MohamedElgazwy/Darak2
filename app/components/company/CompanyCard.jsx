"use client";

import Link from "next/link";

export default function CompanyCard({ company, announcementsCount = 0 }) {
  const title = company.companyName || `${company.firstName || ''} ${company.lastName || ''}`.trim();
  const desc = company.description || company.about || company.bio || '';

  return (
    <Link href={`/company/${company.id}`} className="block">
      <div className="surface-card p-4 rounded-xl border hover:shadow-lg transition flex flex-col h-full text-right">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`data:image/jpeg;base64,${company.logo}`} alt={title} className="w-full h-full object-cover" />
            ) : (
              <span className="font-semibold text-slate-700">{title?.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 truncate">{title}</h3>
            <p className="text-sm text-slate-500 line-clamp-2 mt-1">{desc}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <div className="flex flex-col">
            {company.email && <span>البريد: <span className="text-slate-700">{company.email}</span></span>}
            {company.phoneNumber && <span>الهاتف: <span className="text-slate-700">{company.phoneNumber}</span></span>}
          </div>
          <div className="text-right">
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded">{announcementsCount} إعلان</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
