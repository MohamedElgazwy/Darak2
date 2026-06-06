import api from "./api";

export const notificationService = {
  // 1. جلب قائمة الإشعارات
  getAll: async () => {
    const res = await api.get("/Notifications/List");
    return res.data;
  },

  // 2. تحديد الإشعار كمقروء
  markAsRead: async (id) => {
    const res = await api.put(`/Notifications/mark-as-read/${id}`);
    return res.data;
  }
};