"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { announcementService } from "@/app/services";
import FeedbackSection from "@/app/components/shared/FeedbackSection";

export default function AnnouncementDetailsPage() {
  const params = useParams();
  const companyId = params?.companyId;
  const announcementId = params?.announcementId;

  const [loading, setLoading] = useState(true);
  const [estate, setEstate] = useState(null);
  
  // Feedback handled by shared FeedbackSection component

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await announcementService.getById(announcementId);
        // API may return object directly or wrapped in { data: ... }
        const data = res?.data || res || null;

        if (data) {
          // normalize images: check common fields
          let images = data.images || data.Images || data.photos || data.Photos || [];
          if (!images || images.length === 0) {
            // some APIs return attachments array
            const attachments = data.attachments || data.Attachments || data.media || data.Media || [];
            images = attachments.map(a => a.url || a.path || a.file) .filter(Boolean);
          }

          // normalize phone: try several possible property names
          const phone = data.phone || data.mobile || data.phoneNumber || data.contactPhone || data.ownerPhone || data.userPhone || data.contactNumber || null;

          setEstate({
            ...data,
            images: images || [],
            contactPhone: phone,
          });
          // feedbacks are loaded by the shared FeedbackSection component
        } else {
          setEstate(null);
        }
      } catch (err) {
        console.error("Failed to fetch announcement:", err);
        setEstate(null);
      } finally {
        setLoading(false);
      }
    };

    if (announcementId) fetch();
  }, [announcementId]);

  // feedback create/update/delete handled by FeedbackSection component

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent opacity-50"></div>
      </div>
    );
  }

  if (!estate) return <div className="text-center py-20">لم يتم العثور على الإعلان.</div>;

  const BASE_API = process.env.NEXT_PUBLIC_API_URL || "https://darak.runasp.net/API";
  const API_ROOT = BASE_API.replace(/\/API$/i, "");
  const resolveImage = (src) => {
    if (!src) return null;
    if (String(src).startsWith("data:") || String(src).startsWith("http")) return src;
    // prefix relative paths with API root
    return `${API_ROOT}${src.startsWith("/") ? "" : "/"}${src}`;
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* ── 1. زر العودة ── */}
      <div>
        <Link href={`/company/${companyId}/announcements`} className="inline-flex items-center gap-2 font-bold opacity-70 hover:opacity-100 transition-opacity">
          <span>&rarr;</span> العودة للإعلانات
        </Link>
      </div>

      {/* ── 2. معرض الصور (Hero Image) ── */}
      <div className="relative h-[50vh] min-h-[400px] rounded-[2.5rem] overflow-hidden shadow-xl border border-current border-opacity-10">
        <img src={resolveImage(estate.images && estate.images[0])} alt={estate.title} className="w-full h-full object-cover" />
        <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md text-white text-sm font-bold px-5 py-2 rounded-full">
          {estate.status}
        </div>
        <div className="absolute top-6 left-6 bg-amber-500 text-slate-900 text-sm font-bold px-5 py-2 rounded-full shadow-lg">
          {estate.type}
        </div>
      </div>

      {/* Thumbnails */}
      {estate.images && estate.images.length > 1 && (
        <div className="grid grid-cols-4 gap-3 mt-4">
          {estate.images.slice(1, 9).map((img, idx) => (
            <img key={idx} src={resolveImage(img)} alt={`${estate.title} ${idx+1}`} className="h-28 w-full object-cover rounded-xl border border-current border-opacity-10" />
          ))}
        </div>
      )}

      {/* ── 3. تفاصيل العقار ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* العمود الأيمن (البيانات الرئيسية) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* العنوان والسعر */}
          <div className="space-y-4 border-b border-current border-opacity-10 pb-8">
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">{estate.title}</h1>
            <p className="opacity-70 text-lg flex items-center gap-2">
              <span>📍</span> {estate.location}
            </p>
            <div className="text-4xl font-black mt-4">
              {estate.price} <span className="text-xl opacity-70 font-normal">ج.م</span>
            </div>
          </div>

          {/* الإحصائيات السريعة */}
          <div className="flex flex-wrap gap-4 md:gap-8 bg-current bg-opacity-5 p-6 rounded-3xl border border-current border-opacity-10">
            <div className="flex flex-col gap-1">
              <span className="opacity-60 text-sm font-bold">غرف النوم</span>
              <span className="text-xl font-black flex items-center gap-2">🛏️ {estate.beds}</span>
            </div>
            <div className="w-px bg-current opacity-10 hidden md:block"></div>
            <div className="flex flex-col gap-1">
              <span className="opacity-60 text-sm font-bold">الحمامات</span>
              <span className="text-xl font-black flex items-center gap-2">🛁 {estate.baths}</span>
            </div>
            <div className="w-px bg-current opacity-10 hidden md:block"></div>
            <div className="flex flex-col gap-1">
              <span className="opacity-60 text-sm font-bold">المساحة</span>
              <span className="text-xl font-black flex items-center gap-2">📐 {estate.area} م²</span>
            </div>
          </div>

          {/* الوصف */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">وصف العقار</h2>
            <p className="opacity-80 leading-relaxed text-lg text-justify">
              {estate.description}
            </p>
          </div>

          {/* المميزات (Features) */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">المميزات والمرافق</h2>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {estate.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 opacity-80 font-medium">
                  <span className="text-emerald-500">✔</span> {feature}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* العمود الأيسر (كرت التواصل السريع) */}
        <div className="space-y-6">
          <div className="sticky top-28 bg-current bg-opacity-5 p-8 rounded-[2rem] border border-current border-opacity-10 shadow-lg text-center">
            <div className="w-20 h-20 bg-current bg-opacity-10 rounded-full mx-auto flex items-center justify-center text-3xl mb-4">
              🏢
            </div>
            <h3 className="text-xl font-bold mb-2">هل أعجبك هذا العقار؟</h3>
            <p className="opacity-70 text-sm mb-8">تواصل معنا الآن لتحديد موعد للمعاينة أو لمعرفة المزيد من التفاصيل.</p>
            
            {estate.contactPhone ? (
              <a
                href={`tel:${estate.contactPhone}`}
                className="w-full inline-block bg-amber-500 text-slate-900 font-bold py-4 rounded-xl hover:bg-amber-400 transition-colors shadow-md mb-4"
              >
                عرض رقم الهاتف: {estate.contactPhone}
              </a>
            ) : (
              <Link 
                href={`/company/${companyId}/contact`}
                className="w-full inline-block bg-amber-500 text-slate-900 font-bold py-4 rounded-xl hover:bg-amber-400 transition-colors shadow-md mb-4"
              >
                تواصل معنا
              </Link>
            )}

            <button className="w-full inline-block bg-transparent border-2 border-current border-opacity-20 font-bold py-3.5 rounded-xl hover:border-opacity-100 transition-colors">
              مشاركة الإعلان 🔗
            </button>
          </div>
        </div>

      </div>

      {/* ── 4. قسم التقييمات (Feedback Section) ── */}
      <div className="mt-16 pt-12 border-t border-current border-opacity-10 max-w-4xl">
        <FeedbackSection announcementId={announcementId} />
      </div>

    </div>
  );
}