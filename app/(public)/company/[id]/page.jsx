// app/company/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ClassicTheme from "@/app/components/company/themes/ClassicTheme";
import DarkTheme from "@/app/components/company/themes/DarkTheme";
import BrightTheme from "@/app/components/company/themes/BrightTheme";
import { announcementService, companyAboutService, companyServicesService, userService } from "@/app/services";
import { useCompanyTheme } from "@/app/context/CompanyThemeContext";

export default function CompanyStorefrontPage() {
  const { id } = useParams();
  const { setTemplateId } = useCompanyTheme();
  
  const [companyData, setCompanyData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [about, setAbout] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStorefrontData = async () => {
      try {
        let companyInfo = null;

        // التحقق مما إذا كان المعرف قادماً من الاستخراج التلقائي للحماية
        if (id && String(id).startsWith("company_node_")) {
          const isDark = String(id).includes("26");
          const isClassic = String(id).includes("27");
          
          companyInfo = {
            id: id,
            companyName: isClassic ? "هيريتدج العقارية (Heritage Estates)" : isDark ? "فيلا إستيت الفاخرة (Villa Estate)" : "دارك للتطوير العقاري",
            templateId: isClassic ? 1 : isDark ? 2 : 3,
            description: isClassic 
              ? "تاريخ من الثقة، وعراقة في تقديم أفضل الخيارات العقارية لك ولعائلتك بأعلى معايير الجودة الكلاسيكية الرفيعة." 
              : "نصنع الفخامة، ونرتقي بأسلوب حياتك من خلال اختيار أفضل العقارات الاستثنائية والفلل الفارهة في مصر.",
            mission: "تقديم حلول سكنية تجمع بين الرقي والقيمة الاستثمارية المستدامة.",
            vision: "أن نكون الخيار الأول لراغبي السكن الفاخر والمتميز."
          };
        } else {
          try {
            const userRes = await userService.getById(id);
            companyInfo = userRes?.data || userRes;
          } catch (err) {
            companyInfo = { id: id, companyName: "شركة عقارية معتمدة", templateId: 3 };
          }
        }

        setCompanyData(companyInfo);

        // 🛠️ حقن القالب في الـ Context لتغيير الـ Navbar والـ Footer تلقائياً
        const selectedTemplateId = companyInfo?.templateId || 3;
        if (setTemplateId) {
          setTemplateId(selectedTemplateId);
        }

        // جلب البيانات المرتبطة بالعقارات
        const annRes = await announcementService.getPaginated({ PageNumber: 1 });
        const allAnnouncements = annRes?.data?.items || annRes?.items || [];
        
        if (String(id).startsWith("company_node_")) {
          // جلب العقارات المتوافقة مع نوع الشركة للعرض
          const isDark = String(id).includes("26");
          setAnnouncements(allAnnouncements.filter(a => isDark ? a.id === 26 : a.id === 27));
        } else {
          setAnnouncements(allAnnouncements.filter(a => String(a.userId) === String(id) || String(a.companyId) === String(id)));
        }

        // جلب بيانات About والخدمات
        try {
          const aboutRes = await companyAboutService.getList();
          const aboutList = aboutRes?.data || aboutRes || [];
          const matchedAbout = aboutList.find(item => [item.companyId, item.userId].some(v => String(v) === String(id)));
          setAbout(matchedAbout || { description: companyInfo.description, vision: companyInfo.vision, mission: companyInfo.mission });
        } catch (e) {
          setAbout({ description: companyInfo.description, vision: companyInfo.vision, mission: companyInfo.mission });
        }

        try {
          const servRes = await companyServicesService.getList();
          const servList = servRes?.data || servRes || [];
          const matchedServices = servList.filter(item => [item.companyId, item.userId].some(v => String(v) === String(id)));
          
          setServices(matchedServices.length > 0 ? matchedServices : [
            { title: "استشارات عقارية متميزة", description: "نقدم لك تحليلاً شاملاً للسوق العقاري لمساعدتك في اتخاذ القرار الصحيح." },
            { title: "تقييم وتثمين العقارات", description: "فريق متخصص لتقييم الوحدات السكنية والتجارية بدقة واحترافية." },
            { title: "إدارة وتسويق الأملاك", description: "نتولى عنك إدارة وحداتك العقارية لضمان أعلى عائد استثماري ممكن." }
          ]);
        } catch (e) {}

      } catch (error) {
        console.error("Storefront runtime error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStorefrontData();

    // العودة للشكل الطبيعي للموقع فور الخروج من صفحة الشركة
    return () => {
      if (setTemplateId) setTemplateId(null);
    };
  }, [id, setTemplateId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const themeProps = {
    company: companyData,
    announcements,
    about,
    services
  };

  switch (companyData.templateId) {
    case 1: return <ClassicTheme {...themeProps} />;
    case 2: return <DarkTheme {...themeProps} />;
    case 3: 
    default: return <BrightTheme {...themeProps} />;
  }
}