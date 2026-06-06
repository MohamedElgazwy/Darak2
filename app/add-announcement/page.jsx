"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { announcementService } from "../services";
import { ProtectedRoute } from "../lib/guards";

const PURPOSE_MAP = { "للبيع": "Sale", "للإيجار": "Rent" };
const PROPERTY_TYPE_MAP = { "شقة": "Apartment", "فيلا": "Villa", "كمبوند": "Compound", "شاليه": "Chalet", "مكتب": "Office", "محل": "Shop" };
const CITY_MAP = {
  "القاهرة": "Cairo", "الإسكندرية": "Alexandria", "الجيزة": "Giza", "بورسعيد": "PortSaid", "السويس": "Suez",
  "الدقهلية": "Dakahlia", "البحر الأحمر": "RedSea", "البحيرة": "Beheira", "الفيوم": "Fayoum", "الغربية": "Gharbia",
  "الإسماعلية": "Ismailia", "المنوفية": "Monufia", "المنيا": "Minya", "القليوبية": "Qalyubia", "الوادي الجديد": "NewValley",
  "الشرقية": "Sharqia", "جنوب سيناء": "SouthSinai", "كفر الشيخ": "KafrElSheikh", "مطروح": "Matrouh", "الأقصر": "Luxor",
  "قنا": "Qena", "شمال سيناء": "NorthSinai", "سوهاج": "Sohag", "أسوان": "Aswan", "أسيوط": "Assiut", "بني سويف": "BeniSuef", "دمياط": "Damietta"
};

export default function AddAnnouncementPage() {
  return (
    <ProtectedRoute>
      <div className="container-shell py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">إضافة إعلان جديد</h1>
            <p className="mt-2 text-slate-500">أدخل تفاصيل العقار الخاص بك بوضوح لجذب المهتمين.</p>
          </div>
          <AnnouncementForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}

function AnnouncementForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(true);
  
  const [dropdowns, setDropdowns] = useState({ cities: [], propertyTypes: [], purposes: [] });
  const [formData, setFormData] = useState({
    Title: "", Description: "", Price: "", Purpose: "", Area: "",
    Rooms: "", Bathrooms: "", Floor: "", City: "", Country: "Egypt",
    Latitude: "0", Longitude: "0", Address: "", PropertyType: ""
  });

  const [primaryImage, setPrimaryImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const [citiesRes, typesRes, purposesRes] = await Promise.all([
          announcementService.getGovernorates(),
          announcementService.getPropertyTypes(),
          announcementService.getPurposes()
        ]);

        const cities = citiesRes?.data || citiesRes || [];
        const types = typesRes?.data || typesRes || [];
        const purposes = purposesRes?.data || purposesRes || [];

        setDropdowns({ cities, propertyTypes: types, purposes });

        // التقاط القيمة النصية الابتدائية الأولى بشكل آمن لمنع تعيين كائن كامل بالخطأ
        const getFirstValue = (list) => {
          if (!list || list.length === 0) return "";
          return typeof list[0] === "object" 
            ? (list[0].name || list[0].label || list[0].value || "") 
            : list[0];
        };

        setFormData((prev) => ({
          ...prev,
          City: getFirstValue(cities),
          PropertyType: getFirstValue(types),
          Purpose: getFirstValue(purposes),
        }));
      } catch (err) {
        setError("حدث خطأ أثناء تحميل الخيارات. يرجى تحديث الصفحة.");
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchDropdownOptions();
  }, []);

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!primaryImage) {
      setError("يجب إرفاق صورة رئيسية للعقار.");
      setLoading(false);
      return;
    }

    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
      let valueToSend = formData[key];
      if (key === "Purpose") valueToSend = PURPOSE_MAP[valueToSend] || valueToSend;
      else if (key === "PropertyType") valueToSend = PROPERTY_TYPE_MAP[valueToSend] || valueToSend;
      else if (key === "City") valueToSend = CITY_MAP[valueToSend] || valueToSend;

      payload.append(key, valueToSend);
    });

    payload.append("PrimaryImage", primaryImage);
    galleryImages.forEach((img) => payload.append("Images", img));

    try {
      await announcementService.create(payload);
      router.push("/dashboard/announcements"); 
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.errors) {
        setError(`خطأ في البيانات: ${Object.values(responseData.errors).flat().join(" | ")}`);
      } else {
        setError(responseData?.message || "حدث خطأ أثناء رفع الإعلان.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── الدالة الذكية الموحدة لتفكيك خيارات القوائم ورندرتها بأمان دون انهيار ───
  const renderOptions = (list) => {
    if (!list) return null;
    return list.map((item, index) => {
      // استخراج الاسم والقيمة النصية من الكائن بناءً على مواصفات الباك إند
      const value = typeof item === "object" ? (item.name || item.value || item.id || "") : item;
      const label = typeof item === "object" ? (item.name || item.label || item.value || "") : item;
      
      return (
        <option key={index} value={value}>
          {label}
        </option>
      );
    });
  };

  if (optionsLoading) {
    return (
      <div className="surface-card p-10 flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-4" />
        <p className="text-slate-500 font-medium">جاري تجهيز الاستمارة...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="surface-card space-y-8 p-6 sm:p-10 text-right" dir="rtl">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex flex-col gap-2">
          <span>{error}</span>
          {error.includes("اشتراك") && (
            <Link href="/dashboard/subscriptions" className="font-bold text-red-800 underline">الذهاب لتفعيل باقتك &larr;</Link>
          )}
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">معلومات أساسية</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">عنوان الإعلان *</label>
            <input required type="text" name="Title" value={formData.Title} onChange={handleTextChange} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-indigo-600 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">الغرض *</label>
            <select required name="Purpose" value={formData.Purpose} onChange={handleTextChange} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 bg-white focus:outline-none">
              {renderOptions(dropdowns.purposes)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">نوع العقار *</label>
            <select required name="PropertyType" value={formData.PropertyType} onChange={handleTextChange} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 bg-white focus:outline-none">
              {renderOptions(dropdowns.propertyTypes)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">السعر (ج.م) *</label>
            <input min="0" required type="number" name="Price" value={formData.Price} onChange={handleTextChange} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">المساحة (م²) *</label>
            <input min="1" required type="number" name="Area" value={formData.Area} onChange={handleTextChange} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">تفاصيل إضافية</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">الغرف *</label>
            <input min="0" required type="number" name="Rooms" value={formData.Rooms} onChange={handleTextChange} className="w-full rounded-xl border border-slate-300 px-4 py-2.5" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">الحمامات *</label>
            <input min="0" required type="number" name="Bathrooms" value={formData.Bathrooms} onChange={handleTextChange} className="w-full rounded-xl border border-slate-300 px-4 py-2.5" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">الطابق *</label>
            <input min="0" required type="number" name="Floor" value={formData.Floor} onChange={handleTextChange} className="w-full rounded-xl border border-slate-300 px-4 py-2.5" />
          </div>
          <div className="sm:col-span-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">الوصف التفصيلي *</label>
            <textarea required name="Description" rows="4" value={formData.Description} onChange={handleTextChange} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none"></textarea>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">الموقع</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">المدينة *</label>
            <select required name="City" value={formData.City} onChange={handleTextChange} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 bg-white">
              {renderOptions(dropdowns.cities)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">العنوان بالتفصيل *</label>
            <input required type="text" name="Address" value={formData.Address} onChange={handleTextChange} className="w-full rounded-xl border border-slate-300 px-4 py-2.5" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">الصور</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">الصورة الرئيسية *</label>
            <input required type="file" accept="image/*" onChange={(e) => setPrimaryImage(e.target.files[0])} className="w-full text-sm text-slate-500 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-700 font-semibold" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">صور المعرض الإضافية (اختياري)</label>
            <input type="file" accept="image/*" multiple onChange={(e) => setGalleryImages(Array.from(e.target.files))} className="w-full text-sm text-slate-500 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-700 font-semibold" />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button disabled={loading} type="submit" className="btn-primary w-full py-4 text-lg bg-indigo-600 hover:bg-indigo-700">
          {loading ? "جاري النشر..." : "نشر الإعلان"}
        </button>
      </div>
    </form>
  );
}