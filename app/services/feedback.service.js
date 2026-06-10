import api from "./api";

export const feedbackService = {
  create: async (data) => {
    const res = await api.post("/Feedback/Create", data);
    return res?.data || res;
  },
  // 💡 تمت إضافة دالة التعديل
  update: async (data) => {
    const res = await api.put("/Feedback/Update", data);
    return res?.data || res;
  },
  // 💡 تمت إضافة دالة الحذف
  delete: async (id) => {
    const res = await api.delete(`/Feedback/${id}`);
    return res?.data || res;
  },
  getCompanyTestimonials: async (companyId) => {
    const res = await api.get(`/Feedback/Company/${companyId}/testimonials`);
    return res?.data || res;
  },
  getAnnouncementFeedbacks: async (announcementId) => {
    const res = await api.get(`/Feedback/announcement/${announcementId}`);
    return res?.data || res;
  }
};