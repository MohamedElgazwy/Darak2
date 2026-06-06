"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/app/services/api"; 
import { announcementService } from "../../services";
import { ProtectedRoute } from "../../lib/guards";

const PURPOSE_MAP = { "للبيع": "Sale", "للإيجار": "Rent" };
const PROPERTY_TYPE_MAP = { "شقة": "Apartment", "فيلا": "Villa", "كمبوند": "Compound", "شاليه": "Chalet", "مكتب": "Office", "محل": "Shop" };
const CITY_MAP = {
  "القاهرة": "Cairo", "الإسكندرية": "Alexandria", "الجيزة": "Giza", "بورسعيد": "PortSaid", "السويس": "Suez",
  "الدقهلية": "Dakahlia", "البحر الأحمر": "RedSea", "البحيرة": "Beheira", "الفيوم": "Fayoum", "الغربية": "Gharbia",
  "الإسماعيلية": "Ismailia", "المنوفية": "Monufia", "المنيا": "Minya", "القليوبية": "Qalyubia", "الوادي الجديد": "NewValley",
  "الشرقية": "Sharqia", "جنوب سيناء": "SouthSinai", "كفر الشيخ": "KafrElSheikh", "مطروح": "Matrouh", "الأقصر": "Luxor",
  "قنا": "Qena", "شمال سيناء": "NorthSinai", "سوهاج": "Sohag", "أسوان": "Aswan", "أسيوط": "Assiut", "بني سويف": "BeniSuef", "دمياط": "Damietta"
};

export default function EditAnnouncementPage() {
  return (
    <ProtectedRoute>
      <div className="container-shell py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">تعديل الإعلان</h1>
            <p className="mt-2 text-slate-500">قم بتحديث تفاصيل عقارك المعروض.</p>
          </div>
          <EditAnnouncementForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}

function EditAnnouncementForm() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [dropdowns, setDropdowns] = useState({ cities: [], propertyTypes: [], purposes: [] });
  const [formData, setFormData] = useState({
    Title: "", Description: "", Price: "", Purpose: "", Area: "",
    Rooms: "", Bathrooms: "", Floor: "", City: "", Country: "Egypt",
    Latitude: "0", Longitude: "0", Address: "", PropertyType: ""
  });

  const [oldImages, setOldImages] = useState([]);
  const [primaryImage, setPrimaryImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    const initPageData = async () => {
      try {
        // 1. جلب خيارات القوائم من السيرفر
        const [citiesRes, typesRes, purposesRes] = await Promise.all([
          announcementService.getGovernorates(),
          announcementService.getPropertyTypes(),
          announcementService.getPurposes()
        ]);

        const cities = citiesRes?.data || citiesRes || [];
        const types = typesRes?.data || typesRes || [];
        const purposes = purposesRes?.data || purposesRes || [];
        setDropdowns({ cities, propertyTypes: types, purposes });

        // 2. جلب بيانات العقار الحالي وتعبئتها
        const res = await announcementService.getById(id);
        const currentData = res?.data ?? res;

        setFormData({
          Title: currentData.title || "",
          Description: currentData.description || "",
          Price: currentData.price || "",
          Purpose: currentData.purpose || "",
          Area: currentData.area || "",
          Rooms: currentData.rooms || "",
          Bathrooms: currentData.bathrooms || "",
          Floor: currentData.floor || "",
          City: currentData.city || "",
          Country: currentData.country || "Egypt",
          Latitude: currentData.latitude || "0",
          Longitude: currentData.longitude || "0",
          Address: currentData.address || "",
          PropertyType: currentData.propertyType || ""
        });

        if (currentData.images) {
          setOldImages(currentData.images);
        }

      } catch (err) {
        console.error("Initialization Error:", err);
        setError("حدث خطأ أثناء تحميل بيانات الإعلان أو الخيارات المتاحة.");
      } finally {
        setPageLoading(false);
      }
    };

    if (id) initPageData();
  }, [id]);

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = new FormData();
    
    // 1. تأمين تحويل الـ Id لرقم صريح صلب وتنظيفه
    const cleanId = parseInt(id, 10);
    if (isNaN(cleanId)) {
      setError("معرف العقار غير صالح.");
      setLoading(false);
      return;
    }
    payload.append("Id", cleanId); 

    // 2. إرسال الـ IDs للصور الحالية دائماً للمحافظة عليها في السيرفر
    if (oldImages && oldImages.length > 0) {
      oldImages.forEach((img) => {
        const imgId = img.id || img.ImageId || img.imageId;
        if (imgId) {
          payload.append("KeepImageIds", Number(imgId));
        }
      });
    }

    // 3. تمرير باقي الحقول مع حماية الفلاتر وتحويل الإحداثيات لأرقام
    Object.keys(formData).forEach((key) => {
      let valueToSend = formData[key];
      
      if (key === "Purpose" && PURPOSE_MAP[valueToSend]) valueToSend = PURPOSE_MAP[valueToSend];
      else if (key === "PropertyType" && PROPERTY_TYPE_MAP[valueToSend]) valueToSend = PROPERTY_TYPE_MAP[valueToSend];
      else if (key === "City" && CITY_MAP[valueToSend]) valueToSend = CITY_MAP[valueToSend];

      // تحويل الإحداثيات والحقول الرقمية إلى Numbers صريحة لمنع الـ BadRequest من دوت نت
      if (["Price", "Area", "Rooms", "Bathrooms", "Floor", "Latitude", "Longitude"].includes(key)) {
        valueToSend = Number(valueToSend) || 0;
      }

      if (!["PrimaryImage", "Images", "KeepImageIds", "NewPrimary", "NewImages", "Id"].includes(key)) {
        payload.append(key, valueToSend);
      }
    });

    // 4. إرفاق الملفات الجديدة إذا تم اختيارها
    if (primaryImage && primaryImage instanceof File) {
      payload.append("NewPrimary", primaryImage);
    }
    
    if (galleryImages && galleryImages.length > 0) {
      galleryImages.forEach((img) => {
        if (img instanceof File) {
          payload.append("NewImages", img);
        }
      });
    }

    try {
      await api.put("/Announcement/Update", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      router.push("/dashboard/announcements"); 
    } catch (err) {
      console.error("PUT Update Error Context:", err.response);
      const responseData = err.response?.data;
      if (responseData?.errors) {
        setError(`خطأ من السيرفر: ${Object.values(responseData.errors).flat().join(" | ")}`);
      } else {
        setError(responseData?.message || "فشلت عملية التعديل. يرجى التحقق من المدخلات الرقمية وإحداثيات الموقع.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderOptions = (list) => {
    if (!list) return null;
    return list.map((item, index) => {
      const value = typeof item === "object" ? (item.name || item.value || item.id || "") : item;
      const label = typeof item === "object" ? (item.name || item.label || item.value || "") : item;
      return (
        <option key={index} value={value}>
          {label}
        </option>
      );
    });
  };

  if (pageLoading) {
    return (
      <div className="surface-card p-10 flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-4" />
        <p className="text-slate-500 font-medium">جاري قراءة وتجهيز بيانات العقار...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="surface-card space-y-8 p-6 sm:p-10 text-right" dir="rtl">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
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
        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">تحديث الصور (اختياري)</h3>
        <p className="text-xs text-slate-400 mb-2">اترك الحقول فارغة إذا كنت لا ترغب في تغيير الصور الحالية للعقار.</p>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">الصورة الرئيسية الجديدة</label>
            <input type="file" accept="image/*" onChange={(e) => setPrimaryImage(e.target.files[0])} className="w-full text-sm text-slate-500 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-700 font-semibold" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">صور المعرض الإضافية الجديدة</label>
            <input type="file" accept="image/*" multiple onChange={(e) => setGalleryImages(Array.from(e.target.files))} className="w-full text-sm text-slate-500 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-700 font-semibold" />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button disabled={loading} type="submit" className="btn-primary w-full py-4 text-lg bg-indigo-600 hover:bg-indigo-700">
          {loading ? "جاري حفظ التعديلات..." : "تحديث ونشر الإعلان"}
        </button>
      </div>
    </form>
  );
}