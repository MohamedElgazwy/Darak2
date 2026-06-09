"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { announcementService, companyAboutService, companyServicesService, userService, feedbackService } from "@/app/services";
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
  const [testimonials, setTestimonials] = useState([]); // 👈 إضافة State للشهادات والتقييمات
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStorefrontData = async () => {
      let companyInfo = null;
      
      try {
        if (companyId && String(companyId).startsWith("company_node_")) {
          throw new Error("Synthetic ID detected.");
        }
        const profileRes = await userService.getProfile(companyId);
        companyInfo = profileRes;

        if (!companyInfo.companyName) {
          companyInfo.companyName = `${companyInfo.firstName || ""} ${companyInfo.lastName || ""}`.trim() || "";
        }
        if (companyInfo.userType === "User") {
          companyInfo.templateId = 3;
        }
      } catch (err) {
        // لا تُنشئ بيانات اصطناعية عند فشل الجلب — نعيد كائن بسيط يشير إلى أن البيانات غير متاحة
        companyInfo = {
          id: companyId,
          companyName: "",
          templateId: 3,
          description: ""
        };
      }

      setCompanyData(companyInfo);
      const targetTemplateId = companyInfo?.templateId || 3;
          if (setTemplateId) setTemplateId(targetTemplateId);
          if (typeof setCompanyName === 'function') setCompanyName(companyInfo?.companyName || companyInfo?.firstName || "شركة دارك العقارية");

      // 1. جلب العقارات المرتبطة بالحساب
      try {
        const annRes = await announcementService.getPaginated({ PageNumber: 1, PageSize: 50 });
        const allItems = annRes?.data?.items || annRes?.items || [];
        setAnnouncements(allItems.filter(a => 
          String(a.userId) === String(companyId) || 
          String(a.companyId) === String(companyId) || 
          (companyInfo.templateId === 2 && a.id === 26) || 
          (companyInfo.templateId === 1 && a.id === 27)
        ));
      } catch (e) {}

      // 2. جلب بيانات "عن الشركة" (CompanyAbouts)
      try {
        const aboutRes = await companyAboutService.getList();
        const aboutList = aboutRes?.data || aboutRes || [];
        const matched = aboutList.find(item => [item.companyId, item.userId].some(v => String(v) === String(companyId)));
        setAbout(matched || { description: companyInfo.description || "نقدم خدمات عقارية متكاملة تلبي تطلعاتكم السكنية والاستثمارية." });
      } catch (e) {
        setAbout({ description: companyInfo.description });
      }

      // 3. جلب خدمات الشركة (CompanyServices)
      try {
        const servRes = await companyServicesService.getList();
        const servList = servRes?.data || servRes || [];
        const matchedServices = servList.filter(item => [item.companyId, item.userId].some(v => String(v) === String(companyId)));
        setServices(matchedServices.length > 0 ? matchedServices : [
          { title: "إدارة وتسويق الوحدات", description: "نضمن تسويق عقارك بأسرع وقت ولأفضل فئة مستهدفة." },
          { title: "استشارات عقارية مجانية", description: "نقدم دراسات جدوى شاملة وتحليل دقيق لاتجاهات أسواق العقار." }
        ]);
      } catch (e) {}

      // 4. ⚡ جلب تقييمات وآراء العملاء الحقيقية للشركة (Testimonials)
      try {
        if (!String(companyId).startsWith("company_node_")) {
          const testRes = await feedbackService.getCompanyTestimonials(companyId);
          setTestimonials(testRes?.data || testRes || []);
        } else {
          // لا نعرض بيانات تجريبية افتراضية — اترك القائمة فارغة عند عدم توافر تقييمات حقيقية
          setTestimonials([]);
        }
      } catch (e) {
        setTestimonials([]);
      }

      setLoading(false);
    };

    if (companyId) fetchStorefrontData();

    return () => {
      if (setTemplateId) setTemplateId(null);
    };
  }, [companyId, setTemplateId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // تضمين الـ testimonials داخل الخصائص الممررة للقوالب
  const themeProps = { company: companyData, announcements, about, services, testimonials };

  // Map templates: 1 (Modern) -> Bright, 2 (Classic) -> Classic, 3 (Luxury) -> Dark
  switch (companyData?.templateId) {
    case 3:
      return <DarkTheme {...themeProps} />;
    case 2:
      return <ClassicTheme {...themeProps} />;
    case 1:
    default:
      return <BrightTheme {...themeProps} />;
  }
}