// app/services/feedback.service.js
import api from "./api";

export const feedbackService = {
  // جلب تقييمات شركة معينة (شهادات العملاء للـ Storefront)
  getCompanyTestimonials: async (companyId) => {
    const res = await api.get(`/Feedback/Company/${companyId}/testimonials`);
    return res.data;
  },

  // جلب تقييمات إعلان عقاري معين
  getAnnouncementFeedbacks: async (announcementId) => {
    const res = await api.get(`/Feedback/announcement/${announcementId}`);
    return res.data;
  },

  // إنشاء تقييم جديد
  create: async (feedbackData) => {
    const res = await api.post("/Feedback/Create", feedbackData);
    return res.data;
  },

  // تعديل تقييم الحالي
  update: async (feedbackData) => {
    const res = await api.post("/Feedback/Update", feedbackData); // الباك إند يستقبل بودي صريح هنا بدون ID بالمسار
    return res.data;
  },

  // حذف تقييم
  delete: async (id) => {
    const res = await api.delete(`/Feedback/${id}`);
    return res.data;
  }
};