// app/company/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { announcementService, companyAboutService, companyServicesService, userService, feedbackService } from "@/app/services";
import ClassicTheme from "@/app/components/company/themes/ClassicTheme";
import DarkTheme from "@/app/components/company/themes/DarkTheme";
import BrightTheme from "@/app/components/company/themes/BrightTheme";
import { useCompanyTheme } from "@/app/context/CompanyThemeContext";


export default function CompanyStorefrontPage() {
  const { id } = useParams();
  const { setTemplateId } = useCompanyTheme();
  
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
        if (id && String(id).startsWith("company_node_")) {
          throw new Error("Synthetic ID detected.");
        }
        const profileRes = await userService.getProfile(id);
        companyInfo = profileRes;

        if (!companyInfo.companyName) {
          companyInfo.companyName = `${companyInfo.firstName || ""} ${companyInfo.lastName || ""}`.trim() || "مستشار عقاري معتمد";
        }
        if (companyInfo.userType === "User") {
          companyInfo.templateId = 3;
        }
      } catch (err) {
        const isDark = String(id).includes("26");
        const isClassic = String(id).includes("27");
        companyInfo = {
          id: id,
          companyName: isClassic ? "هيريتدج العقارية (Heritage)" : isDark ? "فيلا إستيت الفاخرة (Villa Estate)" : "شركة عقارية معتمدة",
          templateId: isClassic ? 1 : isDark ? 2 : 3,
          description: "عقارات استثنائية متكاملة تضمن لك الأمان والرفاهية العالية في أرقى المجمعات السكنية."
        };
      }

      setCompanyData(companyInfo);
      const targetTemplateId = companyInfo?.templateId || 3;
      if (setTemplateId) setTemplateId(targetTemplateId);

      // 1. جلب العقارات المرتبطة بالحساب
      try {
        const annRes = await announcementService.getPaginated({ PageNumber: 1, PageSize: 50 });
        const allItems = annRes?.data?.items || annRes?.items || [];
        setAnnouncements(allItems.filter(a => 
          String(a.userId) === String(id) || 
          String(a.companyId) === String(id) || 
          (companyInfo.templateId === 2 && a.id === 26) || 
          (companyInfo.templateId === 1 && a.id === 27)
        ));
      } catch (e) {}

      // 2. جلب بيانات "عن الشركة" (CompanyAbouts)
      try {
        const aboutRes = await companyAboutService.getList();
        const aboutList = aboutRes?.data || aboutRes || [];
        const matched = aboutList.find(item => [item.companyId, item.userId].some(v => String(v) === String(id)));
        setAbout(matched || { description: companyInfo.description || "نقدم خدمات عقارية متكاملة تلبي تطلعاتكم السكنية والاستثمارية." });
      } catch (e) {
        setAbout({ description: companyInfo.description });
      }

      // 3. جلب خدمات الشركة (CompanyServices)
      try {
        const servRes = await companyServicesService.getList();
        const servList = servRes?.data || servRes || [];
        const matchedServices = servList.filter(item => [item.companyId, item.userId].some(v => String(v) === String(id)));
        setServices(matchedServices.length > 0 ? matchedServices : [
          { title: "إدارة وتسويق الوحدات", description: "نضمن تسويق عقارك بأسرع وقت ولأفضل فئة مستهدفة." },
          { title: "استشارات عقارية مجانية", description: "نقدم دراسات جدوى شاملة وتحليل دقيق لاتجاهات أسواق العقار." }
        ]);
      } catch (e) {}

      // 4. ⚡ جلب تقييمات وآراء العملاء الحقيقية للشركة (Testimonials)
      try {
        if (!String(id).startsWith("company_node_")) {
          const testRes = await feedbackService.getCompanyTestimonials(id);
          setTestimonials(testRes?.data || testRes || []);
        } else {
          // بيانات تجريبية في حال استخدام المعرفات الوهمية لتعبئة الواجهة جمالياً
          setTestimonials([
            { id: 1, comment: "تجربة ممتازة وسرعة عالية في تلبية الطلبات العقارية واحترافية بالغة.", rating: 5, user: { firstName: "أحمد", lastName: "علي" } },
            { id: 2, comment: "خدمة تسويق ممتازة ساعدتني في إيجاد شقتي السكنية في وقت قياسي.", rating: 4, user: { firstName: "سارة", lastName: "محمود" } }
          ]);
        }
      } catch (e) {
        setTestimonials([]);
      }

      setLoading(false);
    };

    if (id) fetchStorefrontData();

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

  // تضمين الـ testimonials داخل الخصائص الممررة للقوالب
  const themeProps = { company: companyData, announcements, about, services, testimonials };

  switch (companyData?.templateId) {
    case 1: return <ClassicTheme {...themeProps} />;
    case 2: return <DarkTheme {...themeProps} />;
    case 3:
    default: return <BrightTheme {...themeProps} />;
  }
}