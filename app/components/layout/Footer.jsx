"use client";

import Link from "next/link";
import { useCompanyTheme } from "@/app/context/CompanyThemeContext";

const PROPERTY_TYPES = [
  { label: "شقق سكنية", href: "/search?PropertyType=Apartment" },
  { label: "فيلات حصرية", href: "/search?PropertyType=Villa" },
  { label: "مكاتب إدارية", href: "/search?PropertyType=Office" },
  { label: "محلات تجارية", href: "/search?PropertyType=Shop" },
  { label: "شاليهات مصيفية", href: "/search?PropertyType=Chalet" },
  { label: "كمبوندات مغلقة", href: "/search?PropertyType=Compound" },
];

const CITIES = [
  { label: "القاهرة الجديدة", href: "/search?City=Cairo" },
  { label: "الإسكندرية عروس البحر", href: "/search?City=Alexandria" },
  { label: "الجيزة والأهرامات", href: "/search?City=Giza" },
  { label: "الغردقة والبحر الأحمر", href: "/search?City=RedSea" },
  { label: "أسوان الساحرة", href: "/search?City=Aswan" },
];

const QUICK_LINKS = [
  { label: "من نحن", href: "/about" },
  { label: "إضافة إعلان عقاري", href: "/add-announcement" },
  { label: "باقات اشتراك الشركات", href: "/templates" },
  { label: "تواصل معنا مباشرة", href: "/contact" },
];

export default function Footer() {
  const { templateId } = useCompanyTheme() || {};
  const year = new Date().getFullYear();

  // ─── تجميل وتوزيع كتل الفوتر طبقا للمخططات العصرية ───
  let footerClass = "border-t transition-colors duration-500 ";
  let logoClass = "bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent";
  let headingClass = "text-slate-900 font-black";
  let textClass = "text-slate-500 hover:text-indigo-600 font-medium";
  let dividerClass = "border-slate-200/60";
  let bottomTextClass = "text-slate-400 font-medium";
  let iconClass = "border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 shadow-sm";

  switch (templateId) {
    case 2: // Classic Theme
      footerClass += "bg-[#F4EFE6] border-[#E6DFD3]";
      logoClass = "text-[#5A4634]";
      headingClass = "text-[#3B2F2F] font-bold";
      textClass = "text-[#8C7A6B] hover:text-[#3B2F2F] font-medium";
      dividerClass = "border-[#E6DFD3]";
      bottomTextClass = "text-[#8C7A6B]";
      iconClass = "border-[#D5C6B5] text-[#8C7A6B] hover:border-[#5A4634] hover:bg-[#EADDCD] hover:text-[#3B2F2F]";
      break;
    case 3: // Dark Theme (Luxury)
      footerClass += "bg-[#0c0c0c] border-[#1f1f1f]";
      logoClass = "text-[#D4AF37] font-bold";
      headingClass = "text-white font-bold";
      textClass = "text-slate-400 hover:text-[#D4AF37] font-medium";
      dividerClass = "border-[#1c1c1c]";
      bottomTextClass = "text-slate-600";
      iconClass = "border-[#222] text-slate-400 hover:border-[#D4AF37] hover:bg-[#111] hover:text-[#D4AF37]";
      break;
    default: // Bright & Default (Modern and fallback)
      footerClass += "bg-white border-slate-200/60";
      break;
  }

  return (
    <footer className={footerClass} dir="rtl">
      <div className="container-shell section-padding">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand block */}
          <div className="flex flex-col gap-4 text-right">
            <Link href="/" className={`text-2xl font-black ${logoClass}`}>
              دارك
            </Link>
            <p className={`text-sm leading-relaxed ${textClass} opacity-90`}>
              منصة دارك للعقارات — بوابتك الرقمية الذكية للبحث عن أرقى الوحدات والمقرات السكنية والتجارية في مصر بكل سهولة وأمان تام.
            </p>
            <div className="flex items-center gap-2.5 mt-2">
              <SocialLink href="#" label="فيسبوك" icon={<FacebookIcon />} className={iconClass} />
              <SocialLink href="#" label="انستجرام" icon={<InstagramIcon />} className={iconClass} />
              <SocialLink href="#" label="واتساب" icon={<WhatsappIcon />} className={iconClass} />
            </div>
          </div>

          {/* Links Grid columns */}
          <div className="text-right">
            <h3 className={`mb-4 text-sm tracking-wider uppercase ${headingClass}`}>أنواع الوحدات العقارية</h3>
            <ul className="flex flex-col gap-3">
              {PROPERTY_TYPES.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={`text-sm transition-colors duration-200 ${textClass}`}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-right">
            <h3 className={`mb-4 text-sm tracking-wider uppercase ${headingClass}`}>المدن والمحافظات</h3>
            <ul className="flex flex-col gap-3">
              {CITIES.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={`text-sm transition-colors duration-200 ${textClass}`}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-right">
            <h3 className={`mb-4 text-sm tracking-wider uppercase ${headingClass}`}>روابط سريعة للمنصة</h3>
            <ul className="flex flex-col gap-3">
              {QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={`text-sm transition-colors duration-200 ${textClass}`}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Underbar line */}
      <div className={`border-t ${dividerClass}`}>
        <div className="container-shell flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className={`text-xs ${bottomTextClass}`}>
            © {year} دارك العقارية. جميع الحقوق الفكرية وحقوق النشر محفوظة.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className={`text-xs transition-colors ${textClass}`}>سياسة الخصوصية السرية</Link>
            <Link href="/terms" className={`text-xs transition-colors ${textClass}`}>الشروط والأحكام العامة</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, icon, className }) {
  return (
    <a href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300 transform active:scale-95 ${className}`}>
      {icon}
    </a>
  );
}

function FacebookIcon() { return <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>; }
function InstagramIcon() { return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg>; }
function WhatsappIcon() { return <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.531 5.847L.057 23.882l6.198-1.448A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.001-1.366l-.359-.214-3.68.965.981-3.595-.234-.369A9.818 9.818 0 1112 21.818z" /></svg>; }