import api from "./api";

export const companyAboutService = {
  getList: async () => {
    try {
      const res = await api.get("/CompanyAbouts/List");
      return res.data;
    } catch (err) {
      // If endpoint is not present or no data yet, return empty array instead of throwing
      if (err?.response?.status === 404) return [];
      throw err;
    }
  },
  create: async (aboutData) => {
    const res = await api.post("/CompanyAbouts/Create", aboutData);
    return res.data;
  },
  update: async (aboutData) => {
    const res = await api.put("/CompanyAbouts/Update", aboutData);
    return res.data;
  }
};