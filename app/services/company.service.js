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

  // جلب البيانات التعريفية (About) لشركة معينة مباشرة
  getCompanyAbout: async (companyId) => {
    const res = await api.get(`/companies/${companyId}/about`);
    return res.data;
  }
};