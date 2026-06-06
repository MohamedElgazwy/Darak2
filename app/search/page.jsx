// app/search/page.jsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { announcementService } from "../services";
import PropertyCard from "../components/shared/PropertyCard";

// خرائط التحويل من العربي للإنجليزي لمتطلبات الباك إند (المطابقة لـ Swagger)
const PURPOSE_MAP = { "للبيع": "Sale", "للإيجار": "Rent" };
const PROPERTY_TYPE_MAP = { "شقة": "Apartment", "فيلا": "Villa", "كمبوند": "Compound", "شاليه": "Chalet", "مكتب": "Office", "محل": "Shop" };
const CITY_MAP = {
  "القاهرة": "Cairo", "الإسكندرية": "Alexandria", "الجيزة": "Giza", "بورسعيد": "PortSaid", "السويس": "Suez",
  "الدقهلية": "Dakahlia", "البحر الأحمر": "RedSea", "البحيرة": "Beheira", "الفيوم": "Fayoum", "الغربية": "Gharbia",
  "الإسماعيلية": "Ismailia", "المنوفية": "Monufia", "المنيا": "Minya", "القليوبية": "Qalyubia", "الوادي الجديد": "NewValley",
  "الشرقية": "Sharqia", "جنوب سيناء": "SouthSinai", "كفر الشيخ": "KafrElSheikh", "مطروح": "Matrouh", "الأقصر": "Luxor",
  "قنا": "Qena", "شمال سيناء": "NorthSinai", "سوهاج": "Sohag", "أسوان": "Aswan", "أسيوط": "Assiut", "بني سويف": "BeniSuef", "دمياط": "Damietta"
};

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  
  const [dropdowns, setDropdowns] = useState({
    cities: [{ value: "", label: "جميع المدن" }],
    propertyTypes: [{ value: "", label: "الكل" }],
    purposes: [{ value: "", label: "الكل" }]
  });

  // 1. الفلاتر في الـ State هي مجرد انعكاس لما هو مكتوب في الاستمارة (Form)
  const [formFilters, setFormFilters] = useState({
    SearchTerm: searchParams.get("SearchTerm") || "",
    Purpose: searchParams.get("Purpose") || "",
    PropertyType: searchParams.get("PropertyType") || "",
    City: searchParams.get("City") || "",
    MinPrice: searchParams.get("MinPrice") || "",
    MaxPrice: searchParams.get("MaxPrice") || "",
  });

  // 2. جلب خيارات الفلاتر الديناميكية عند فتح الصفحة أول مرة
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const [citiesRes, typesRes, purposesRes] = await Promise.all([
          announcementService.getGovernorates(),
          announcementService.getPropertyTypes(),
          announcementService.getPurposes()
        ]);

        const formatOptions = (data, defaultLabel) => {
          const list = data?.data || data || [];
          const formattedList = list.map(item => {
            if (typeof item === 'object') {
              return { value: item.value || item.name || item.id, label: item.label || item.name || item.value };
            }
            return { value: item, label: item };
          });
          return [{ value: "", label: defaultLabel }, ...formattedList];
        };

        setDropdowns({
          cities: formatOptions(citiesRes, "جميع المدن"),
          propertyTypes: formatOptions(typesRes, "الكل"),
          purposes: formatOptions(purposesRes, "الكل")
        });
      } catch (error) {
        console.error("Failed to load filter options", error);
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchDropdownOptions();
  }, []);

  // 3. 🛠️ جوهر الحل: جلب البيانات يعتمد على الـ [searchParams] (الـ URL) وليس الـ State
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        // قراءة الفلاتر الحالية مباشرة من الـ URL
        const rawSearchTerm = searchParams.get("SearchTerm") || "";
        const rawPurpose = searchParams.get("Purpose") || "";
        const rawPropertyType = searchParams.get("PropertyType") || "";
        const rawCity = searchParams.get("City") || "";
        const rawMinPrice = searchParams.get("MinPrice") || "";
        const rawMaxPrice = searchParams.get("MaxPrice") || "";

        // مزامنة الاستمارة مع الـ URL (في حال ضغط المستخدم على زر العودة أو تقدم)
        setFormFilters({
          SearchTerm: rawSearchTerm,
          Purpose: rawPurpose,
          PropertyType: rawPropertyType,
          City: rawCity,
          MinPrice: rawMinPrice,
          MaxPrice: rawMaxPrice,
        });

        // تحضير الـ Parameters وترجمتها للباك إند
        const apiParams = {
          PageNumber: parseInt(searchParams.get("PageNumber")) || 1,
        };

        if (rawSearchTerm) apiParams.SearchTerm = rawSearchTerm;
        if (rawPurpose) apiParams.Purpose = PURPOSE_MAP[rawPurpose] || rawPurpose;
        if (rawPropertyType) apiParams.PropertyType = PROPERTY_TYPE_MAP[rawPropertyType] || rawPropertyType;
        if (rawCity) apiParams.City = CITY_MAP[rawCity] || rawCity;
        if (rawMinPrice) apiParams.MinPrice = Number(rawMinPrice);
        if (rawMaxPrice) apiParams.MaxPrice = Number(rawMaxPrice);

        // استدعاء الـ API بالـ Parameters النظيفة والإنجليزية
        const res = await announcementService.getPaginated(apiParams);
        setResults(res?.data?.items || res?.items || res?.data || []);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]); // تحديث تلقائي فور تغير الـ URL

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFilters(prev => ({ ...prev, [name]: value }));
  };

  // عند الضغط على "تطبيق الفلاتر" نقوم بدفع البيانات للرابط فقط والـ useEffect يتولى الباقي
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    Object.entries(formFilters).forEach(([key, value]) => {
      if (value !== "" && value !== null) {
        params.append(key, value);
      }
    });

    params.append("PageNumber", "1"); // العودة للصفحة الأولى عند الفلترة الجديدة
    router.push(`/search?${params.toString()}`);
    setShowMobileFilters(false);
  };

  return (
    <div className="container-shell section-padding text-right" dir="rtl">
      <div className="flex flex-col gap-8 lg:flex-row">
        
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="btn-secondary w-full lg:hidden mb-4"
        >
          {showMobileFilters ? "إخفاء الفلاتر" : "عرض الفلاتر والبحث"}
        </button>

        {/* Sidebar Filters */}
        <aside className={`w-full lg:w-1/4 lg:shrink-0 ${showMobileFilters ? "block" : "hidden lg:block"}`}>
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-slate-900">تصفية النتائج</h2>
            
            {optionsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">كلمة البحث</label>
                  <input
                    name="SearchTerm"
                    type="text"
                    placeholder="ابحث عن..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
                    value={formFilters.SearchTerm}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">الغرض</label>
                  <select
                    name="Purpose"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-600"
                    value={formFilters.Purpose}
                    onChange={handleInputChange}
                  >
                    {dropdowns.purposes.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">نوع العقار</label>
                  <select
                    name="PropertyType"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-600"
                    value={formFilters.PropertyType}
                    onChange={handleInputChange}
                  >
                    {dropdowns.propertyTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">المدينة</label>
                  <select
                    name="City"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-600"
                    value={formFilters.City}
                    onChange={handleInputChange}
                  >
                    {dropdowns.cities.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">السعر الأدنى</label>
                    <input
                      name="MinPrice"
                      type="number"
                      min="0"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
                      value={formFilters.MinPrice}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">السعر الأقصى</label>
                    <input
                      name="MaxPrice"
                      type="number"
                      min="0"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
                      value={formFilters.MaxPrice}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary mt-2 w-full py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-sm">
                  تطبيق الفلاتر
                </button>
              </form>
            )}
          </div>
        </aside>

        {/* Results Grid */}
        <main className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">نتائج البحث</h1>
            <p className="text-sm text-slate-500 mt-1">
              {loading ? "جاري البحث عن العقارات المتطابقة..." : `تم العثور على ${results.length} عقار موثوق`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="surface-card h-[380px] animate-pulse bg-white p-4 border rounded-2xl">
                  <div className="h-44 w-full rounded-xl bg-slate-100" />
                  <div className="mt-4 h-5 w-1/2 rounded bg-slate-100" />
                  <div className="mt-6 h-4 w-3/4 rounded bg-slate-100" />
                  <div className="mt-8 h-9 w-full rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <svg className="mb-4 h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-slate-900">لا توجد عقارات مطابقة</h3>
              <p className="text-slate-500 text-sm mt-1">جرب تغيير كلمات البحث أو إزالة معايير الفلترة المحددة.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>}>
      <SearchContent />
    </Suspense>
  );
}