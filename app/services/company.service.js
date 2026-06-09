import api from "./api";

export const companyService = {
  // جلب قائمة الشركات المعتمدة لعرضها في الصفحة الرئيسية
  getAll: async () => {
    try {
      const res = await api.get("/Companies");
      return res.data;
    } catch (err) {
      if (err?.response?.status === 404) {
        return [];
      }
      throw err;
    }
  },
  
  // جلب الشركات بنمط Paginated (دعم للحصول على صفحات من الـ API)
  getPaginated: async (params) => {
    const res = await api.get("/Companies/Paginated", { params });
    return res.data;
  },

  // جلب البيانات التعريفية (About) لشركة معينة مباشرة
  getCompanyAbout: async (companyId) => {
    const res = await api.get(`/companies/${companyId}/about`);
    return res.data;
  }
};