import api from "./api";

export const feedbackService = {
  // جلب تقييمات شركة معينة (شهادات العملاء للصفحة العامة)
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
    // feedbackData = { comment: "string", rating: 0, announcementId: 0 }
    const res = await api.post("/Feedback/Create", feedbackData);
    return res.data;
  },

  // تعديل تقييم حالي
  update: async (feedbackData) => {
    // feedbackData = { id: 0, comment: "string", rating: 0 }
    const res = await api.put("/Feedback/Update", feedbackData);
    return res.data;
  },

  // حذف تقييم
  delete: async (id) => {
    const res = await api.delete(`/Feedback/${id}`);
    return res.data;
  }
};