"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { announcementService } from "../services";
import PropertyCard from "../components/shared/PropertyCard";

// خرائط التحويل لمتطلبات الباك إند
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

  const [formFilters, setFormFilters] = useState({
    SearchTerm: searchParams.get("SearchTerm") || "",
    Purpose: searchParams.get("Purpose") || "",
    PropertyType: searchParams.get("PropertyType") || "",
    City: searchParams.get("City") || "",
    MinPrice: searchParams.get("MinPrice") || "",
    MaxPrice: searchParams.get("MaxPrice") || "",
  });

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

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const rawSearchTerm = searchParams.get("SearchTerm") || "";
        const rawPurpose = searchParams.get("Purpose") || "";
        const rawPropertyType = searchParams.get("PropertyType") || "";
        const rawCity = searchParams.get("City") || "";
        const rawMinPrice = searchParams.get("MinPrice") || "";
        const rawMaxPrice = searchParams.get("MaxPrice") || "";

        setFormFilters({
          SearchTerm: rawSearchTerm,
          Purpose: rawPurpose,
          PropertyType: rawPropertyType,
          City: rawCity,
          MinPrice: rawMinPrice,
          MaxPrice: rawMaxPrice,
        });

        const apiParams = {
          PageNumber: parseInt(searchParams.get("PageNumber")) || 1,
        };

        if (rawSearchTerm) apiParams.SearchTerm = rawSearchTerm;
        if (rawPurpose) apiParams.Purpose = PURPOSE_MAP[rawPurpose] || rawPurpose;
        if (rawPropertyType) apiParams.PropertyType = PROPERTY_TYPE_MAP[rawPropertyType] || rawPropertyType;
        if (rawCity) apiParams.City = CITY_MAP[rawCity] || rawCity;
        if (rawMinPrice) apiParams.MinPrice = Number(rawMinPrice);
        if (rawMaxPrice) apiParams.MaxPrice = Number(rawMaxPrice);

        const res = await announcementService.getPaginated(apiParams);
        setResults(res?.data?.items || res?.items || res?.data || []);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    Object.entries(formFilters).forEach(([key, value]) => {
      if (value !== "" && value !== null) {
        params.append(key, value);
      }
    });

    params.append("PageNumber", "1");
    router.push(`/search?${params.toString()}`);
    setShowMobileFilters(false);
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] overflow-hidden text-right pb-24" dir="rtl">
      {/* ── Background Blurred Mesh Art ── */}
      <div className="absolute top-10 right-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-blue-200/25 rounded-full filter blur-[100px] pointer-events-none" />

      {/* ── Banner Content Title ── */}
      <div className="relative z-10 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white py-16 px-4 mb-12 shadow-md">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1200')" }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 relative z-10">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">محرك المحفظة العقارية الحصري</h1>
          <p className="text-sm md:text-base text-slate-300 font-medium max-w-xl leading-relaxed">اكتشف أرقى الفيلات، الشقق والمقرات الإدارية بأفضل الأسعار وبطرق مراجعة وتصفية ذكية متقدمة.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col gap-8 lg:flex-row items-start">
          
          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full lg:hidden flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg transition transform active:scale-[0.99] mb-2"
          >
            <span>{showMobileFilters ? "❌ إغلاق لوحة الفرز" : "🔍 فرز وتصفية الوحدات"}</span>
          </button>

          {/* Sidebar Card Filters Container */}
          <aside className={`w-full lg:w-[28%] lg:shrink-0 sticky top-24 ${showMobileFilters ? "block" : "hidden lg:block animate-in fade-in duration-300"}`}>
            <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 backdrop-blur-md p-6 md:p-8 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-4">
                <span className="text-xl">⚙️</span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">معايير التصفية</h2>
              </div>
              
              {optionsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm" />
                  <p className="text-xs font-bold text-slate-400 animate-pulse">جاري تحضير خيارات الفرز...</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 mr-1">كلمة المفتاح للبحث</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 right-4 flex items-center opacity-40">🔍</span>
                      <input
                        name="SearchTerm"
                        type="text"
                        placeholder="المدينة، الكمبوند، المطور..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pr-11 pl-4 py-3 text-sm font-medium text-slate-900 transition-all focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400"
                        value={formFilters.SearchTerm}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 mr-1">الغرض التعاقدي</label>
                    <select
                      name="Purpose"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 cursor-pointer appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2523475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "left 1rem top 50%", backgroundSize: "0.65rem auto" }}
                      value={formFilters.Purpose}
                      onChange={handleInputChange}
                    >
                      {dropdowns.purposes.map((p) => (
                        <option key={p.value} value={p.value} className="text-slate-900 font-medium">{p.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 mr-1">بنية ونوع الوحدة</label>
                    <select
                      name="PropertyType"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 cursor-pointer appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2523475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "left 1rem top 50%", backgroundSize: "0.65rem auto" }}
                      value={formFilters.PropertyType}
                      onChange={handleInputChange}
                    >
                      {dropdowns.propertyTypes.map((t) => (
                        <option key={t.value} value={t.value} className="text-slate-900 font-medium">{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 mr-1">الموقع / المحافظة</label>
                    <select
                      name="City"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 cursor-pointer appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2523475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "left 1rem top 50%", backgroundSize: "0.65rem auto" }}
                      value={formFilters.City}
                      onChange={handleInputChange}
                    >
                      {dropdowns.cities.map((c) => (
                        <option key={c.value} value={c.value} className="text-slate-900 font-medium">{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 mr-1">السعر الأدنى</label>
                      <input
                        name="MinPrice"
                        type="number"
                        min="0"
                        placeholder="0"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-center font-bold text-slate-800 transition-all focus:bg-white focus:border-indigo-600 focus:outline-none"
                        value={formFilters.MinPrice}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 mr-1">السعر الأقصى</label>
                      <input
                        name="MaxPrice"
                        type="number"
                        min="0"
                        placeholder="بلا حدود"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-center font-bold text-slate-800 transition-all focus:bg-white focus:border-indigo-600 focus:outline-none"
                        value={formFilters.MaxPrice}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 transition transform active:scale-[0.99] text-sm mt-3">
                    تطبيق فلاتر البحث 🚀
                  </button>
                </form>
              )}
            </div>
          </aside>

          {/* Results Grid Dashboard */}
          <main className="flex-1 w-full">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">🏘️ كشاف الوحدات المتاحة</h1>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  {loading ? "جاري قنص وتحليل الفرص المتطابقة..." : `تم العثور على ${results.length} عقار موثوق جاهز للمعاينة`}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white border border-slate-200/60 h-[400px] animate-pulse rounded-3xl p-5 space-y-5">
                    <div className="aspect-[4/3] w-full rounded-2xl bg-slate-100" />
                    <div className="h-5 w-1/3 rounded bg-slate-100" />
                    <div className="h-4 w-3/4 rounded bg-slate-100 space-y-2">
                      <div className="h-3 w-full bg-slate-100 rounded" />
                    </div>
                    <div className="h-10 w-full rounded-xl bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 animate-in fade-in duration-500">
                {results.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-300 bg-white p-8 text-center animate-in zoom-in-95">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-3xl shadow-inner mb-4">
                  🔍
                </div>
                <h3 className="text-xl font-black text-slate-900">عفواً، لا توجد نتائج مطابقة</h3>
                <p className="text-slate-400 text-sm font-semibold mt-2 max-w-sm leading-relaxed">
                  لم نجد وحدات عقارية تطابق الفلاتر المحددة حالياً. جرب توسيع نطاق السعر أو تغيير المدينة المراد البحث بداخلها.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-md" /></div>}>
      <SearchContent />
    </Suspense>
  );
}