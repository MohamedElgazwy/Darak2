"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  companyService, 
  companyServicesService, 
  userService, 
  feedbackService 
} from "@/app/services";
import ClassicTheme from "@/app/components/company/themes/ClassicTheme";
import DarkTheme from "@/app/components/company/themes/DarkTheme";
import BrightTheme from "@/app/components/company/themes/BrightTheme";
import { useCompanyTheme } from "@/app/context/CompanyThemeContext";

export default function CompanyStorefrontPage() {
  const { companyId } = useParams();
  const { setTemplateId, setCompanyName } = useCompanyTheme();
  
  const [companyData, setCompanyData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [about, setAbout] = useState(null);
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStorefrontData = async () => {
      let companyInfo = null;
      
      try {
        if (companyId && String(companyId).startsWith("company_node_")) {
          throw new Error("Synthetic ID detected.");
        }
        
        const profileRes = await userService.getProfile(companyId);
        companyInfo = profileRes?.data || profileRes?.value || profileRes;

        if (!companyInfo.companyName) {
          companyInfo.companyName = `${companyInfo.firstName || ""} ${companyInfo.lastName || ""}`.trim() || "وكالة عقارية";
        }
        
        // 🎯 سحب الإعلانات مباشرة من الـ Profile
        setAnnouncements(companyInfo.announcementResponses || companyInfo.AnnouncementResponses || []);

      } catch (err) {
        companyInfo = { id: companyId, companyName: "شركة عقارية", templateId: 1, description: "" };
        setAnnouncements([]);
      }

      setCompanyData(companyInfo);
      
      // 💡 التقاط رقم التمبلت من الباك إند (لو لم يرسله سيعتبره 1)
      const targetTemplateId = Number(companyInfo?.templateId || 1);
      if (setTemplateId) setTemplateId(targetTemplateId);
      if (typeof setCompanyName === 'function') {
        setCompanyName(companyInfo?.companyName || companyInfo?.firstName || "شركة دارك العقارية");
      }

      // جلب بيانات "عن الشركة" 
      try {
        const aboutRes = await companyService.getCompanyAbout(companyId);
        const aboutInfo = aboutRes?.data || aboutRes?.value || aboutRes;
        if (aboutInfo && (aboutInfo.description || aboutInfo.vision)) {
          setAbout(aboutInfo);
        } else {
          setAbout({ description: companyInfo?.description || "نقدم أفضل الخدمات العقارية التي تلبي طموحاتك للاستثمار والسكن المريح." });
        }
      } catch (e) {
        setAbout({ description: "نقدم أفضل الخدمات العقارية التي تلبي طموحاتك للاستثمار والسكن المريح." });
      }

      // جلب خدمات الشركة 
      try {
        const servRes = await companyServicesService.getCompanyServices(companyId);
        const matchedServices = servRes?.data || servRes?.value || servRes || [];
        setServices(matchedServices.length > 0 ? matchedServices : [
          { title: "إدارة وتسويق الوحدات", description: "نضمن تسويق عقارك بأسرع وقت ولأفضل فئة مستهدفة.", icon: "🏢" }
        ]);
      } catch (e) {
        setServices([]);
      }

      // جلب تقييمات العملاء
      try {
        const testRes = await feedbackService.getCompanyTestimonials(companyId);
        setTestimonials(testRes?.data || testRes?.value || testRes || []);
      } catch (e) {
        setTestimonials([]);
      }

      setLoading(false);
    };

    if (companyId) fetchStorefrontData();

    return () => {
      if (setTemplateId) setTemplateId(null);
    };
  }, [companyId, setTemplateId, setCompanyName]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-md" />
          <p className="text-sm font-bold text-slate-500 animate-pulse">جاري تحميل المعرض العقاري للشركة...</p>
        </div>
      </div>
    );
  }

  const themeProps = { company: companyData, announcements, about, services, testimonials };

  // توجيه التصميم بناء على اختيار الشركة (إذا لم يرسل الباك إند، سيتم عرض Bright)
  switch (Number(companyData?.templateId || 1)) {
    case 3: return <DarkTheme {...themeProps} />;
    case 2: return <ClassicTheme {...themeProps} />;
    case 1:
    default: return <BrightTheme {...themeProps} />;
  }
}